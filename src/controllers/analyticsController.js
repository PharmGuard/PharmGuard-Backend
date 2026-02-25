const axios = require('axios');
const Drug = require('../models/Drug');
const DrugBatch = require('../models/DrugBatch');
const { Op } = require('sequelize');

exports.getDrugForecast = async (req, res) => {
  try {
    const drugId = req.params.id;

    // 1. Fetch the Drug and its active Batches from your MySQL DB
    const drug = await Drug.findByPk(drugId);
    if (!drug) {
      return res.status(404).json({ success: false, message: 'Drug not found' });
    }

    const batches = await DrugBatch.findAll({
      where: { drugId: drugId, quantity: { [Op.gt]: 0 } },
      order: [['expiryDate', 'ASC']]
    });

    // 2. Calculate values for the Data Team
    const batchCount = batches.length;
    
    // Find days until the OLDEST batch expires (FEFO logic)
    let daysUntilExpiry = 180; // Safe default
    if (batches.length > 0) {
      const today = new Date();
      const oldestExpiry = new Date(batches[0].expiryDate);
      daysUntilExpiry = Math.ceil((oldestExpiry - today) / (1000 * 60 * 60 * 24));
    }

    // 3. Construct the exact payload the Data Team requested
    const payload = {
      quantity_current: Number(drug.stock),      
      weekly_avg: 55,                  // TODO: Query Transaction table for real avg
      monthly_avg_this_month: 220,     // TODO: Query Transaction table for real avg
      lead_time_days: 7,               // Standard restock time   
      days_until_expiry: Number(daysUntilExpiry),    
      batch_count: Number(batchCount),                        
      cost_per_unit: Number(drug.price || 15),       
      medicine_name: String(drug.name),              
      medicine_id: Number(drug.id)                   
    };

    console.log("🚀 Sending to Render AI:", payload);

    // 4. Ping the Data Team's API
    const dsResponse = await axios.post(process.env.DS_API_URL || 'https://pharmguard-api.onrender.com/predict', payload);

    // 5. Send the AI's response directly to your Frontend
    res.status(200).json({
      success: true,
      data: dsResponse.data // This contains the alert_level, recommendation, etc.
    });

  } catch (error) {
    console.error("AI Analytics API Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch prediction from AI server', 
      error: error.response ? error.response.data : error.message 
    });
  }
};
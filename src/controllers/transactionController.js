const sequelize = require('../config/database'); 
const Drug = require('../models/Drug');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const axios = require('axios'); //Import Axios!

// 1. DISPENSE (SELL) DRUG & PING DATA SCIENCE
exports.dispenseDrug = async (req, res) => {
  const t = await sequelize.transaction(); // Start a "Safety Box"

  try {
    const { drugId, quantity, notes } = req.body;
    const userId = req.user.id; 

    // A. Find the Drug
    const drug = await Drug.findByPk(drugId);

    if (!drug) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Drug not found' });
    }

    if (drug.stock < quantity) {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Not enough stock! Only ${drug.stock} left.` });
    }

    // B. Calculate new stock level
    const remainingStock = drug.stock - quantity;

    // C. Deduct Stock (Inventory Update)
    await drug.decrement('stock', { by: quantity, transaction: t });

    // D. Create Transaction Record
    const newTransaction = await Transaction.create({
      type: 'dispense',
      drugId,
      quantity,
      userId,
      notes
    }, { transaction: t });

    // E. Create Audit Log
    await AuditLog.create({
      userId,
      action: 'DISPENSE',
      entity: 'Drug',
      entityId: drugId,
      details: JSON.stringify({ medicationName: drug.name,       // Now the frontend will see the drug name!
        quantity: quantity, 
        remainingStock: remainingStock,
        notes: notes || 'None'           // Now the frontend will see the notes!
        
      }),
      ipAddress: req.ip
    }, { transaction: t });

    // F. Commit (Save Everything to the Database instantly!)
    await t.commit();

    // G. DATA SCIENCE INTEGRATION (Ping the Render URL)
    let aiAlert = null;
    
    try {
      if (process.env.DS_API_URL) {
        let daysUntilExpiry = 180; 
        if (drug.expiryDate) {
           const today = new Date();
           const expiryDate = new Date(drug.expiryDate);
           daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        }

        // 1. Store the payload in a variable so we can look at it
        const payload = {
          quantity_current: Number(remainingStock),      
          weekly_avg: 55,                        
          monthly_avg_this_month: 220,           
          lead_time_days: 7,                     
          days_until_expiry: Number(daysUntilExpiry),    
          batch_count: 1,                        
          cost_per_unit: Number(drug.price || 15),       
          medicine_name: String(drug.name),              
          medicine_id: Number(drug.id)                   
        };

        // 2. Print exactly what we are sending to the terminal
        console.log("SENDING TO AI:", payload);

        // 3. Send it
        const dsResponse = await axios.post(process.env.DS_API_URL, payload);
        aiAlert = dsResponse.data; 
      }
    } catch (dsError) {
      console.log("Data Science API failed:", dsError.message);
      
      // 4. PRINT THE EXACT REASON PYTHON REJECTED IT!
      if (dsError.response && dsError.response.data) {
        console.log("PYTHON REJECTION DETAILS:", JSON.stringify(dsError.response.data, null, 2));
      }

      aiAlert = { alert_level: "ERROR", recommendation: "AI Model Offline" };
    }

    // H. Final Response to the Frontend
    res.status(201).json({
      success: true,
      message: 'Drug dispensed successfully!',
      transaction: newTransaction,
      ai_prediction: aiAlert // Pass the ML team's alert to the user!
    });

  } catch (error) {
    await t.rollback(); // Undo everything if a major error happens
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 2. VIEW ALL TRANSACTIONS (Sales History)
exports.getTransactions = async (req, res) => {
  try {
    const history = await Transaction.findAll({
      include: ['drug', 'pharmacist'], // Join tables to show Drug Name & User Name
      order: [['createdAt', 'DESC']]   // Newest first
    });
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
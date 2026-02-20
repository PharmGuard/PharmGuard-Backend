const Drug = require('../models/Drug');

// 1. ADD A NEW DRUG
exports.addDrug = async (req, res) => {
  try {
    const { name, manufacturer, price, stock, expiryDate } = req.body;

    // Check if drug already exists
    const existingDrug = await Drug.findOne({ where: { name } });
    if (existingDrug) {
      return res.status(400).json({ success: false, message: 'Drug already exists' });
    }

    const newDrug = await Drug.create({
      name,
      manufacturer,
      price,
      stock,
      expiryDate
    });

    res.status(201).json({
      success: true,
      message: 'Drug added successfully!',
      drug: newDrug
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 2. GET ALL DRUGS (Inventory)
exports.getDrugs = async (req, res) => {
  try {
    const drugs = await Drug.findAll();
    res.status(200).json({ success: true, count: drugs.length, data: drugs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 3. UPDATE DRUG (Price or Stock)
exports.updateDrug = async (req, res) => {
  try {
    const { id } = req.params; // Get ID from URL (e.g., /api/drugs/5)
    
    const drug = await Drug.findByPk(id);
    if (!drug) {
      return res.status(404).json({ success: false, message: 'Drug not found' });
    }

    // Update the drug with new data
    await drug.update(req.body);

    res.status(200).json({ success: true, message: 'Drug updated!', drug });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 4. DELETE DRUG
exports.deleteDrug = async (req, res) => {
  try {
    const { id } = req.params;
    
    const drug = await Drug.findByPk(id);
    if (!drug) {
      return res.status(404).json({ success: false, message: 'Drug not found' });
    }

    await drug.destroy(); // Delete it

    res.status(200).json({ success: true, message: 'Drug deleted successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
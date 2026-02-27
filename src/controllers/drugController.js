const Drug = require('../models/Drug');

// 1. ADD A NEW DRUG
exports.addDrug = async (req, res) => {
  try {
    // 1. Extract exactly what matches your Drug.js model!
    const { name, category, unit, reorderLevel, stock, description } = req.body;

    // 2. Check if drug already exists
    const existingDrug = await Drug.findOne({ where: { name } });
    if (existingDrug) {
      return res.status(400).json({ success: false, message: 'Drug already exists in the master list.' });
    }

    // 3. Create the drug with all the correct fields
    const newDrug = await Drug.create({
      name,
      category,        // Now this will save!
      unit,            // Now this will save!
      reorderLevel,    // Now this will save!
      stock,
      description
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

    // Map the backend data to match exactly what the frontend table expects
    const formattedDrugs = drugs.map(drug => {
      return {
        ...drug.toJSON(),               // Keep all original properties just in case
        quantity: drug.stock,           // THE FIX: Map backend 'stock' to frontend 'quantity'
        
        // Provide fallbacks for the missing columns so the UI doesn't look broken
        category: drug.category || 'General', 
        unit: drug.unit || 'Box',             
        reorderLevel: drug.reorderLevel || 10,
        reorder_level: drug.reorderLevel || 10 // Adding snake_case just in case frontend prefers it
      };
    });

    // Send the mapped data back to the frontend
    res.status(200).json({ 
      success: true, 
      count: formattedDrugs.length, 
      data: formattedDrugs 
    });

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
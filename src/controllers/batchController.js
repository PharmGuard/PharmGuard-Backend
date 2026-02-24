const Drug = require('../models/Drug'); // Adjust the path/case to match your Drug model
const Batch = require('../models/DrugBatch'); // Adjust the path/case to match your Batch model
const sequelize = require('../config/database'); // We need this to run the transaction!

// ==========================================
// 1. ADD NEW BATCH & UPDATE TOTAL STOCK
// ==========================================
exports.addBatch = async (req, res) => {
  // Start a secure Database Transaction
  const t = await sequelize.transaction();

  try {
    const { drugId, batchNumber, quantity, expiryDate, supplier } = req.body;

    // 1. Verify the Drug actually exists before doing anything
    const drug = await Drug.findByPk(drugId, { transaction: t });
    
    if (!drug) {
      await t.rollback(); // Cancel the transaction
      return res.status(404).json({ success: false, message: 'Drug not found in the master inventory.' });
    }

    // 2. Create the new Batch record
    const newBatch = await Batch.create({
      drugId,
      batchNumber,
      quantity,
      expiryDate,
      supplier,
      receivedDate: new Date()
    }, { transaction: t });

    // 3. Update the Drug's total stock
    // Note: Using 'stock' since we fixed that exact column name earlier!
    await drug.increment('stock', { by: quantity, transaction: t });

    // 4. Commit the transaction (Permanently save both actions!)
    await t.commit();

    res.status(201).json({
      success: true,
      message: `Batch ${batchNumber} added! Total stock increased by ${quantity}.`,
      batch: newBatch
    });

  } catch (error) {
    // If literally anything fails, undo all database changes
    await t.rollback();
    console.error('Error adding batch:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
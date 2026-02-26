const Drug = require('../models/Drug'); 
const Batch = require('../models/DrugBatch'); 
const sequelize = require('../config/database');

// ==========================================
// 1. ADD NEW BATCH & UPDATE TOTAL STOCK
// ==========================================
exports.addBatch = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { drugId, batchNumber, quantity, expiryDate, supplier } = req.body;

    const drug = await Drug.findByPk(drugId, { transaction: t });
    if (!drug) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Drug not found.' });
    }

    const newBatch = await Batch.create({
      drugId, batchNumber, quantity, expiryDate, supplier, receivedDate: new Date()
    }, { transaction: t });

    // Update total stock
    await drug.increment('stock', { by: quantity, transaction: t });

    await t.commit();
    res.status(201).json({ success: true, message: `Batch ${batchNumber} added!`, batch: newBatch });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ==========================================
// 2. UPDATE BATCH & RE-SYNC TOTAL STOCK
// ==========================================
exports.updateBatch = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { quantity, expiryDate, batchNumber, supplier } = req.body;

    // 1. Find the batch and its associated Drug
    const batch = await Batch.findByPk(id, { transaction: t });
    if (!batch) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const drug = await Drug.findByPk(batch.drugId, { transaction: t });

    // 2. Calculate the difference if quantity changed
    if (quantity !== undefined) {
      const difference = quantity - batch.quantity; 
      // If new qty is 150 and old was 100, difference is +50
      // If new qty is 40 and old was 100, difference is -60
      
      await drug.increment('stock', { by: difference, transaction: t });
      batch.quantity = quantity;
    }

    // 3. Update other fields
    if (expiryDate) batch.expiryDate = expiryDate;
    if (batchNumber) batch.batchNumber = batchNumber;
    if (supplier) batch.supplier = supplier;

    await batch.save({ transaction: t });
    await t.commit();

    res.status(200).json({
      success: true,
      message: 'Batch and total stock updated successfully',
      data: batch
    });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: 'Error updating batch', error: error.message });
  }
};
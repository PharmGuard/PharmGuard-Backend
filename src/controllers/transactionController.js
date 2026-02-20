const sequelize = require('../config/database'); // We need this for "Transactions" (safety)
const Drug = require('../models/Drug');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

// 1. DISPENSE (SELL) DRUG
exports.dispenseDrug = async (req, res) => {
  const t = await sequelize.transaction(); // Start a "Safety Box" (Database Transaction)

  try {
    const { drugId, quantity, notes } = req.body;
    const userId = req.user.id; // Get Pharmacist ID from the Token

    // A. Find the Drug
    const drug = await Drug.findByPk(drugId);

    // B. Check if Drug exists
    if (!drug) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Drug not found' });
    }

    // C. Check Stock Level
    if (drug.stock < quantity) {
      await t.rollback();
      return res.status(400).json({ success: false, message: `Not enough stock! Only ${drug.stock} left.` });
    }

    // D. Deduct Stock (Inventory Update)
    await drug.decrement('stock', { by: quantity, transaction: t });

    // E. Create Transaction Record (The Receipt)
    const newTransaction = await Transaction.create({
      type: 'dispense',
      drugId,
      quantity,
      userId,
      notes
    }, { transaction: t });

    // F. Create Audit Log (Security Trace)
    await AuditLog.create({
      userId,
      action: 'DISPENSE',
      entity: 'Drug',
      entityId: drugId,
      details: JSON.stringify({ quantity, remainingStock: drug.stock - quantity }),
      ipAddress: req.ip
    }, { transaction: t });

    // G. Commit (Save Everything)
    await t.commit();

    res.status(201).json({
      success: true,
      message: 'Drug dispensed successfully!',
      transaction: newTransaction
    });

  } catch (error) {
    await t.rollback(); // Undo everything if error happens
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
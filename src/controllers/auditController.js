const AuditLog = require('../models/AuditLog'); // Assuming you have this model
const User = require('../models/user');

// GET ALL LOGS (Read-Only)
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, attributes: ['username', 'role'] }], // Show who did it
      order: [['createdAt', 'DESC']] // Newest first
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// There is NO 'updateLog' or 'deleteLog' function here.
// This makes the table strictly "Read Only" via the API.
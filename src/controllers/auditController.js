const AuditLog = require('../models/AuditLog'); // Assuming you have this model
const User = require('../models/user');

// GET ALL LOGS (Read-Only)
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, attributes: ['username', 'role'] }], // Show who did it
      order: [['createdAt', 'DESC']] // Newest first
    });

    // Flatten and format the data for the frontend
    const formattedLogs = logs.map(log => {
      // 1. Parse the details string back into a usable object
      let parsedDetails = {};
      if (log.details) {
        try {
          parsedDetails = JSON.parse(log.details);
        } catch (e) {
          console.error("Failed to parse audit log details for ID:", log.id);
        }
      }

      // 2. Build exactly what the frontend table is asking for
      return {
        id: log.id,
        timestamp: log.createdAt,
        action: log.action,
        // Extract the username safely so the frontend doesn't have to dig for it
        user: log.User ? log.User.username : 'Unknown',
        
        // Extract the specific fields from the parsed details
        // (Ensure these match exactly what you saved into the details JSON string during Dispense)
        medication: parsedDetails.medicationName || '-',
        batch: parsedDetails.batchNumber || '-',
        quantity: parsedDetails.quantity || '-',
        notes: parsedDetails.notes || '-'
      };
    });

    // Send the perfectly formatted array
    res.status(200).json(formattedLogs);

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
   


// There is NO 'updateLog' or 'deleteLog' function here.
// This makes the table strictly "Read Only" via the API.
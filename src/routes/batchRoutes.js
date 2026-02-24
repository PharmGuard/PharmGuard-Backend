const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware'); 

// POST /api/batches/add
// Protected: Only logged-in users who are 'admin' or 'storekeeper' can add stock
router.post(
  '/add', 
  authMiddleware, 
  authorizeRoles('admin', 'storekeeper'), 
  batchController.addBatch
);

module.exports = router;
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware);

// POST /api/transactions/dispense -> Sell a drug
router.post('/dispense', transactionController.dispenseDrug);

// GET /api/transactions -> See sales history
router.get('/', transactionController.getTransactions);

module.exports = router;
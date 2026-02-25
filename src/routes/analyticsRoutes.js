const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Destructure your middleware properly like we fixed earlier!
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all analytics routes (Must be logged in)
router.use(authMiddleware);

// 1. Forecast for a Specific Drug (The one we just built)
// URL: GET /api/analytics/drug/:id
router.get('/drug/:id', analyticsController.getDrugForecast);

// 2. AI Dashboard (Placeholder for the Admin-only dashboard)
// URL: GET /api/analytics/dashboard
router.get('/dashboard', authorizeRoles('admin'), (req, res) => {
    res.status(200).json({
        success: true,
        message: "Admin AI Dashboard data will go here."
    });
});

module.exports = router;
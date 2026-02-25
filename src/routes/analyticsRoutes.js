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

// 2. AI Dashboard (Admin-only overview)
// URL: GET /api/analytics/dashboard
router.get('/dashboard', authorizeRoles('admin'), analyticsController.getDashboardMetrics);

module.exports = router;
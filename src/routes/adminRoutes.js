const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware'); // Checks Login
const roleMiddleware = require('../middleware/roleMiddleware'); // Checks Role

// GLOBAL GATEKEEPER: All routes below require login + ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware(['admin'])); 

// 1. Add Employee Route
// URL: POST /api/admin/add-employee
router.post('/add-employee', adminController.addEmployee);

// 2. View Audit Logs
// URL: GET /api/admin/audit-logs
router.get('/audit-logs', auditController.getAuditLogs);

module.exports = router;
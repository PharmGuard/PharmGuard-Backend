const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route: /api/auth/register
//router.post('/register', authController.register);

router.post('/setup-password', authController.setupPassword);
// Route: /api/auth/login  
router.post('/login', authController.login);

router.post('/verify-email', authController.verifyEmail);

//Forgot and Reset Password Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
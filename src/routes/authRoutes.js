const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Route: /api/auth/register (Commented out for now)
//router.post('/register', authController.register);

router.post('/setup-password', authController.setupPassword);

// Route: /api/auth/login  
router.post('/login', authController.login);

router.post('/verify-email', authController.verifyEmail);

// The New OTP Flow 

router.post('/resend-otp', authController.resendOTP);

// Forgot and Reset Password Routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected Profile Route
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
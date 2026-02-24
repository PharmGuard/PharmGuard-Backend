const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//1. SETUP PASSWORD (For new employees)

exports.setupPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ 
      password: hashedPassword, 
      isVerified: true, 
      otp: null 
    });

    res.status(200).json({ success: true, message: 'Password set successfully! You can now log in.' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// 2. VERIFY OTP (Email only)
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP code' });

    await user.update({ isVerified: true, otp: null });
    res.status(200).json({ success: true, message: 'Account Verified! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// 3. LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
    if (!user.isVerified) return res.status(403).json({ success: false, message: "Please verify your email first." });
    if (user.isActive === false) return res.status(403).json({ success: false, message: "Account is disabled" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    await user.update({ lastLogin: new Date() });

    const token = jwt.sign(
      { id: user.id, role: user.role, pharmacyName: user.pharmacyName },
      process.env.JWT_SECRET || 'secret_key_fallback',
      { expiresIn: '1d' }
    );

    res.status(200).json({ success: true, message: "Login successful", token, user: { id: user.id, username: user.username, email: user.email, role: user.role, pharmacyName: user.pharmacyName } });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


// 4. GET PROFILE

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password', 'otp'] } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// 5. FORGOT PASSWORD 
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist.' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await user.update({ otp: otp });

    // LIVE EMAIL SENDING
    try {
      const emailMessage = `Hello,\n\nYou requested a password reset for your PharmGuard account.\n\nYour reset OTP is: ${otp}\n\nIf you did not request this, please ignore this email.`;
      
      await sendEmail({
        email: user.email,
        subject: 'PharmGuard - Password Reset OTP',
        message: emailMessage
      });
      
      res.status(200).json({ success: true, message: 'If the email exists, an OTP has been sent.' });

    } catch (emailError) {
      console.error("Email failed:", emailError);
      res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again later.' });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


// 6. RESET PASSWORD

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP code' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ password: hashedPassword, otp: null });

    res.status(200).json({ success: true, message: 'Password reset successfully! You can now log in.' });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
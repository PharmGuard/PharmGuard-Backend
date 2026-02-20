const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. SETUP PASSWORD (For new employees invited by Admin)
exports.setupPassword = async (req, res) => {
  try {
    // The employee provides their email, the OTP they got, and their chosen password
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if the OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Hash their new, private password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save it, unlock the account, and clear the OTP
    await user.update({ 
      password: hashedPassword, 
      isVerified: true, 
      otp: null 
    });

    res.status(200).json({ 
      success: true, 
      message: 'Password set successfully! You can now log in.' 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// 2. VERIFY OTP (Alternative way just to verify email without password change)
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });

    // Check the code
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Success! Unlock the account
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

    // A. Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // B. Check Verified Status 
    if (!user.isVerified) {
        return res.status(403).json({ success: false, message: "Please verify your email first." });
    }

    // C. Check Active Status
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "Account is disabled" });
    }

    // D. Compare Passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // E. Update Last Login
    await user.update({ lastLogin: new Date() });

    // F. Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_fallback',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        pharmacyName: user.pharmacyName
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


// 4. GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'otp'] } 
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 5. FORGOT PASSWORD (Request OTP)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist.' });
    }

    // 2. Generate a new 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Save the OTP to the database
    await user.update({ otp: otp });

    // 📩 Simulate sending an email
    console.log(`\n============================`);
    console.log(`🚨 PASSWORD RESET REQUEST 🚨`);
    console.log(`📧 EMAIL TO: ${email}`);
    console.log(`Your password reset OTP is: ${otp}`);
    console.log(`============================\n`);

    res.status(200).json({ 
      success: true, 
      message: 'If the email exists, an OTP has been sent.' 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// 6. RESET PASSWORD (Use OTP to set new password)
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if the OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save the new password and clear the OTP so it can't be reused
    await user.update({ 
      password: hashedPassword, 
      otp: null 
    });

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully! You can now log in with your new password.' 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
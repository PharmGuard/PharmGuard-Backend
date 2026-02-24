const User = require('../models/user');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

// 1. ADD EMPLOYEE (Admin Only)
exports.addEmployee = async (req, res) => {
  try {
    const { username, email, role, pharmacyName } = req.body;

    // A. Validate Role (Must be 'pharmacist' or 'storekeeper')
    if (role === 'admin') {
      return res.status(400).json({ message: 'Admins cannot create other Admins here.' });
    }

    // B. Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
// 1. Generate a 4-digit OTP for the employee
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 2. Generate a random "dummy" password just to keep the database happy 
    // (The database requires a password, but no one will ever know this one)
    const randomTempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(randomTempPassword, 10);


    // Create the Employee (Automatically Verified because Admin created them)
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role, 
      pharmacyName: req.user.pharmacyName, // Assign to Admin's pharmacy
      isVerified: true, // Skip OTP! Admin trusts them.
      otp: otp
    });

   // 2. ACTUAL LIVE EMAIL SENDING
    try {
      const emailMessage = `Hello ${username},\n\nYou have been invited to join PharmGuard as a ${role} for ${req.user.pharmacyName}.\n\nYour setup OTP is: ${otp}\n\nPlease use this to complete your account setup.`;
      
      await sendEmail({
        email: newUser.email,
        subject: 'Welcome to PharmGuard - Your Setup OTP',
        message: emailMessage
      });

      res.status(201).json({
        success: true,
        message: `Employee invited successfully! An OTP has been sent to their email.`,
        user: { id: newUser.id, name: newUser.username, email: newUser.email }
      });

    } catch (emailError) {
      console.error("Email failed to send:", emailError);
      
      // If the email fails, we still want the Admin to know the OTP!
      res.status(201).json({
        success: true,
        message: `Employee created, but the email failed to send. Please share this OTP manually: ${otp}`,
        user: { id: newUser.id, name: newUser.username, email: newUser.email }
      });
    }

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 2. DELETE EMPLOYEE (Admin Only)
exports.deleteEmployee = async (req, res) => {
  try {
    const userId = req.params.id; // We will pass the ID in the URL

    // 1. Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 2. Prevent the Admin from accidentally deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    // 3. Delete from database
    await user.destroy();

    res.status(200).json({ 
      success: true, 
      message: `Employee ${user.username} has been deleted successfully.` 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
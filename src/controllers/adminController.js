const User = require('../models/user');
const bcrypt = require('bcryptjs');

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
//Simulate sending an email to the employee
    console.log(`\n============================`);
    console.log(`EMAIL SENT TO: ${email}`);
    console.log(`Hello ${username}, you have been invited to join PharmGuard as a ${role}.`);
    console.log(`Your setup OTP is: ${otp}`);
    console.log(`============================\n`);

    res.status(201).json({
      success: true,
      message: `Employee invited successfully! An OTP has been sent to their email.`,
      user: { id: newUser.id, name: newUser.username, email: newUser.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
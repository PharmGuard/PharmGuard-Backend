const User = require('../models/user');
const bcrypt = require('bcryptjs'); // ✅ Uses the package you installed
const jwt = require('jsonwebtoken');

// ------------------------------------------
// 1. REGISTER USER
// ------------------------------------------
exports.register = async (req, res) => {
  try {
    // ✅ Uses 'username' to match your Database Model
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword, // Matches your model field
      role: role || 'pharmacist'
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      user: { id: newUser.id, username: newUser.username, email: newUser.email }
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// ------------------------------------------
// 2. LOGIN USER
// ------------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 2. Check if user is active (Optional, based on your model)
    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "Account is disabled" });
    }

    // 3. Compare Passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // 4. Update Last Login Date
    await user.update({ lastLogin: new Date() });

    // 5. Generate Token (The "ID Card")
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_key_fallback', // Safety fallback
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
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
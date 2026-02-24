const bcrypt = require('bcryptjs');
const User = require('./models/user'); 
const sequelize = require('./config/database');

const seedAdmin = async () => {
  try {
    await sequelize.sync(); // Ensure tables exist

    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);

    const [admin, created] = await User.findOrCreate({
      where: { email: 'admin@pharmguard.com' },
      defaults: {
        username: 'SuperAdmin',
        password: hashedPassword,
        role: 'admin',
        pharmacyName: 'PharmGuard Main',
        isVerified: true // Crucial: Your login blocks unverified users!
      }
    });

    if (created) {
      console.log('✅ Admin account created successfully!');
    } else {
      console.log('ℹ️ Admin already exists.');
    }
    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();
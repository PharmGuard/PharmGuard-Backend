const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Double check this path matches your folder structure
const sequelize = require('./config/database');

const seedAdmin = async () => {
  try {
    // 1. Connect to the DB
    await sequelize.authenticate();
    console.log('⏳ Connecting to database...');

    // 2. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('PharmGuard@2026', salt);

    // 3. Create the Admin
    const [user, created] = await User.findOrCreate({
      where: { email: 'admin@pharmguard.com' },
      defaults: {
        name: 'System Administrator',
        password: hashedPassword,
        role: 'admin'
      }
    });

    if (created) {
      console.log('✅ Admin user created: admin@pharmguard.com / PharmGuard@2026');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const envPath = path.resolve(__dirname, '../../.env');

console.log(`📂 Looking for .env file at: ${envPath}`);

// 2. Load the file from that specific path
const result = require('dotenv').config({ path: envPath });

if (result.error) {
    console.error("❌ ERROR Loading .env file:", result.error);
} else {
    console.log("✅ .env file found and loaded!");
}

// 3. Debug: Did the variables actually load?
console.log("-------------------------------------");
console.log("🔍 DB_NAME:", process.env.DB_NAME); 
console.log("🔍 DB_USER:", process.env.DB_USER);
console.log("-------------------------------------");

// 4. Create the Connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
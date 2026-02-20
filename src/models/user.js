const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define("User", {
  id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username:     { type: DataTypes.STRING(100), allowNull: false },
  email:    { type: DataTypes.STRING(150), allowNull: false, unique: true },
  pharmacyName: { type: DataTypes.STRING(150), allowNull: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role:     { type: DataTypes.ENUM('admin','pharmacist','storekeeper'), allowNull: false, defaultValue: 'pharmacist'},
  otp: { type: DataTypes.STRING, allowNull: true },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLogin: { type: DataTypes.DATE }
});

module.exports = User;
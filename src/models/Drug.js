const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); 

const Drug = sequelize.define("Drug", {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  category:    { type: DataTypes.STRING(100) },
  unit:        { type: DataTypes.STRING(50) },   // e.g., 'tablet', 'ml'
  reorderLevel: { type: DataTypes.INTEGER, defaultValue: 50 },
  Stock:  { type: DataTypes.INTEGER, defaultValue: 0 },
  description: { type: DataTypes.TEXT }
});
module.exports = Drug;
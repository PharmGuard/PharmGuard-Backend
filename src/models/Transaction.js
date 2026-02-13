const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Transaction = sequelize.define("Transaction", {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type:       { type: DataTypes.ENUM('dispense','restock'), allowNull: false },
  drugId:     { type: DataTypes.INTEGER, allowNull: false },
  batchId:    { type: DataTypes.INTEGER },
  quantity:   { type: DataTypes.INTEGER, allowNull: false },
  userId:     { type: DataTypes.INTEGER, allowNull: false },
  notes:      { type: DataTypes.TEXT }
});
module.exports = Transaction;
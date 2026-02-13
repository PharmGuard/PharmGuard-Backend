const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DrugBatch = sequelize.define("DrugBatch", {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  drugId:      { type: DataTypes.INTEGER, allowNull: false },   // FK to Drug
  batchNumber: { type: DataTypes.STRING(100), allowNull: false },
  quantity:    { type: DataTypes.INTEGER, allowNull: false },
  expiryDate:  { type: DataTypes.DATEONLY, allowNull: false },
  receivedDate:{ type: DataTypes.DATEONLY, allowNull: false },
  addedBy:     { type: DataTypes.INTEGER }   // FK to User (storekeeper)
});
module.exports = DrugBatch;

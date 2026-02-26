const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user"); 

const AuditLog = sequelize.define("AuditLog", {
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { 
    type: DataTypes.INTEGER,
    allowNull: true,  // still logs even if user is deleted
    references: {
      model: 'Users',  
      key: 'id'
    }
  },
  action:     { type: DataTypes.STRING(100), allowNull: false }, // e.g., 'DISPENSE'
  entity:     { type: DataTypes.STRING(100) },  // e.g., 'Drug'
  entityId:   { type: DataTypes.INTEGER },
  details:    { type: DataTypes.TEXT },  // JSON string of the action details
  ipAddress:  { type: DataTypes.STRING(45) }
}, {
  updatedAt: false   // audit logs should never be updated
});

AuditLog.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(AuditLog, { foreignKey: 'userId' });

module.exports = AuditLog;
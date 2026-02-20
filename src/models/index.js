const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = require('./user');
const Drug = require('./Drug');
const DrugBatch = require('./DrugBatch');
const Transaction = require('./Transaction');
const AuditLog = require('./AuditLog');
//const sequelize = require('../config/database');

// A Drug has many Batches
Drug.hasMany(DrugBatch, { foreignKey: 'drugId', as: 'batches' });
DrugBatch.belongsTo(Drug,  { foreignKey: 'drugId', as:'drug' });

// A User performs many Transactions
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transaction' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'pharmacist' });

// A Drug appears in many Transactions
Drug.hasMany(Transaction, { foreignKey: 'drugId', as: 'transactions' });
Transaction.belongsTo(Drug, { foreignKey: 'drugId', as: 'drug'  });

DrugBatch.hasMany(Transaction, { foreignKey: 'batchId', as: 'transactions' });
Transaction.belongsTo(DrugBatch, { foreignKey: 'batchId', as: 'batch' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'logs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    sequelize,
    User,
    Drug,
    DrugBatch,
    Transaction,
    AuditLog
};

console.log(User instanceof require('sequelize').Model);
console.log(Drug instanceof require('sequelize').Model);
console.log(DrugBatch instanceof require('sequelize').Model);
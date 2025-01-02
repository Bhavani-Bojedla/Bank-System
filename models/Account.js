// models/Account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactionHistory: { type: [String], default: [] }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
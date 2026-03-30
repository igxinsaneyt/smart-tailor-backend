const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: String,
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
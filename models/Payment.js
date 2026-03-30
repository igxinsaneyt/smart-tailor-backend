const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'], 
    default: 'Cash' 
  },
  paymentDate: { type: Date, default: Date.now },
  note: String,
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);

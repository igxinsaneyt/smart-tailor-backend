const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  measurement: { type: mongoose.Schema.Types.ObjectId, ref: 'Measurement' },
  garmentType: { 
    type: String, 
    enum: ['Shirt', 'Pant', 'Blouse', 'Kurta', 'Suit', 'Other'], 
    required: true 
  },
  deliveryDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Ready', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  fabricSource: { type: String, enum: ['Customer', 'Tailor'], default: 'Customer' },
  instructions: String,
  designImage: String,
  totalAmount: { type: Number, required: true },
  advanceAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['Fully Paid', 'Partially Paid', 'Unpaid'], 
    default: 'Unpaid' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
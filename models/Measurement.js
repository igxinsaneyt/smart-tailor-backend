const mongoose = require('mongoose');

const MeasurementSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  garmentType: { 
    type: String, 
    required: true
  },
  dimensions: {
    type: Map,
    of: Number,
    required: true
  },
  customNotes: String,
}, { timestamps: true });

module.exports = mongoose.model('Measurement', MeasurementSchema);
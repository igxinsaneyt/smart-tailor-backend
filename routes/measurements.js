// backend/routes/measurements.js
const express = require('express');
const auth = require('../middleware/auth');
const Measurement = require('../models/Measurement');
const Customer = require('../models/Customer');
const router = express.Router();

// Get all measurements for a specific customer
router.get('/:customerId', auth, async (req, res) => {
  try {
    const { customerId } = req.params;
    // Verify customer belongs to user
    const customer = await Customer.findOne({ _id: customerId, user: req.user.id });
    if (!customer) return res.status(403).json({ error: 'Unauthorized' });
    
    const measurements = await Measurement.find({ customer: customerId });
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update measurements for a customer
router.post('/', auth, async (req, res) => {
  try {
    const { customer, garmentType, customNotes, ...dimensions } = req.body;
    
    // Verify customer belongs to user
    const customerExists = await Customer.findOne({ _id: customer, user: req.user.id });
    if (!customerExists) return res.status(403).json({ error: 'Unauthorized' });
    
    // Check if measurement of this type already exists for the customer
    let measurement = await Measurement.findOne({ customer, garmentType });
    if (measurement) {
      // Update existing
      measurement.dimensions = dimensions;
      measurement.customNotes = customNotes;
      await measurement.save();
    } else {
      // Create new
      measurement = new Measurement({ customer, garmentType, dimensions, customNotes });
      await measurement.save();
    }
    res.json(measurement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a specific measurement
router.delete('/:id', auth, async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);
    if (!measurement) return res.status(404).json({ error: 'Measurement not found' });

    const customer = await Customer.findOne({ _id: measurement.customer, user: req.user.id });
    if (!customer) return res.status(403).json({ error: 'Unauthorized' });
    
    await Measurement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Measurement deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
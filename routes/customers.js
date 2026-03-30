const express = require('express');
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const router = express.Router();

// Get all customers for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user.id });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add customer
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;
    const customer = new Customer({ user: req.user.id, name, phone, address, notes });
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
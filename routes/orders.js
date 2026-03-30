const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const router = express.Router();

// Get all orders for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const customerIds = await Customer.find({ user: req.user.id }).distinct('_id');
    const orders = await Order.find({ customer: { $in: customerIds } })
      .populate('customer', 'name phone')
      .populate('measurement')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { 
      customer, 
      measurement, 
      garmentType, 
      deliveryDate, 
      status, 
      fabricSource, 
      instructions, 
      designImage, 
      totalAmount, 
      advanceAmount 
    } = req.body;
    
    // Verify customer belongs to user
    const customerExists = await Customer.findOne({ _id: customer, user: req.user.id });
    if (!customerExists) {
      return res.status(400).json({ error: 'Customer not found or not owned by you' });
    }
    
    // Calculate balance
    const balanceAmount = totalAmount - (advanceAmount || 0);
    const paymentStatus = balanceAmount <= 0 ? 'Fully Paid' : (advanceAmount > 0 ? 'Partially Paid' : 'Unpaid');

    const order = new Order({
      customer,
      measurement,
      garmentType,
      deliveryDate,
      status: status || 'Pending',
      fabricSource: fabricSource || 'Customer',
      instructions,
      designImage,
      totalAmount,
      advanceAmount: advanceAmount || 0,
      balanceAmount,
      paymentStatus
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update an order (including status and payments)
router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const customer = await Customer.findOne({ _id: order.customer, user: req.user.id });
    if (!customer) return res.status(403).json({ error: 'Unauthorized' });
    
    // If updating amounts, recalculate balance and status
    if (req.body.totalAmount !== undefined || req.body.advanceAmount !== undefined) {
      const total = req.body.totalAmount !== undefined ? req.body.totalAmount : order.totalAmount;
      const advance = req.body.advanceAmount !== undefined ? req.body.advanceAmount : order.advanceAmount;
      req.body.balanceAmount = total - advance;
      req.body.paymentStatus = req.body.balanceAmount <= 0 ? 'Fully Paid' : (advance > 0 ? 'Partially Paid' : 'Unpaid');
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an order
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const customer = await Customer.findOne({ _id: order.customer, user: req.user.id });
    if (!customer) return res.status(403).json({ error: 'Unauthorized' });
    
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const express = require('express');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const router = express.Router();

// Get all payments for a specific order
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const customer = await Customer.findOne({ _id: order.customer, user: req.user.id });
    if (!customer) return res.status(403).json({ error: 'Unauthorized' });

    const payments = await Payment.find({ order: orderId }).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record a new payment
router.post('/', auth, async (req, res) => {
  try {
    const { order, amount, paymentMethod, note } = req.body;
    
    // 1. Verify order ownership
    const orderDoc = await Order.findById(order);
    if (!orderDoc) return res.status(404).json({ error: 'Order not found' });

    const customer = await Customer.findOne({ _id: orderDoc.customer, user: req.user.id });
    if (!customer) return res.status(403).json({ error: 'Unauthorized' });

    // 2. Create payment record
    const payment = new Payment({
      order,
      customer: orderDoc.customer,
      amount,
      paymentMethod,
      note
    });
    await payment.save();

    // 3. Update Order financial status
    orderDoc.advanceAmount += amount;
    orderDoc.balanceAmount = orderDoc.totalAmount - orderDoc.advanceAmount;
    orderDoc.paymentStatus = orderDoc.balanceAmount <= 0 ? 'Fully Paid' : (orderDoc.advanceAmount > 0 ? 'Partially Paid' : 'Unpaid');
    
    await orderDoc.save();

    res.status(201).json({ payment, updatedOrder: orderDoc });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;

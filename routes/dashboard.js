const express = require('express');
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    const customerIds = await Customer.find({ user: req.user.id }).distinct('_id');
    const customers = await Customer.countDocuments({ user: req.user.id });
    
    // Core Counts
    const orders = await Order.countDocuments({ customer: { $in: customerIds } });
    const pending = await Order.countDocuments({ status: 'Pending', customer: { $in: customerIds } });
    const inProgress = await Order.countDocuments({ status: 'In Progress', customer: { $in: customerIds } });
    const ready = await Order.countDocuments({ status: 'Ready', customer: { $in: customerIds } });
    const delivered = await Order.countDocuments({ status: 'Delivered', customer: { $in: customerIds } });
    
    // Aggregate Financials
    const financials = await Order.aggregate([
      { $match: { customer: { $in: customerIds }, status: { $ne: 'Cancelled' } } },
      { $group: { 
        _id: null, 
        totalValue: { $sum: "$totalAmount" },
        totalPaid: { $sum: "$advanceAmount" },
        totalBalance: { $sum: "$balanceAmount" }
      } }
    ]);
    
    const revenue = financials.length > 0 ? financials[0].totalValue : 0;
    const collected = financials.length > 0 ? financials[0].totalPaid : 0;
    const outstanding = financials.length > 0 ? financials[0].totalBalance : 0;

    const upcoming = await Order.countDocuments({
      deliveryDate: { $gte: new Date() },
      status: { $nin: ['Delivered', 'Cancelled'] },
      customer: { $in: customerIds }
    });
    
    res.json({ 
      customers, 
      orders, 
      pending, 
      deliveries: upcoming, 
      revenue,
      collected,
      outstanding,
      statusBreakdown: {
        pending,
        inProgress,
        ready,
        delivered
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
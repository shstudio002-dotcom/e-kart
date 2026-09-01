const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// GET: Fast indexed lean query (Filters by phone query param if provided, otherwise returns all for Admin)
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;
    let query = {};
    if (phone) {
      query.mobile = phone; // Customer views only their own orders based on mobile number
    }
    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(50).lean();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve orders', details: err.message });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId }).lean();
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve order', details: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customerName, mobile, address, paymentMethod, items, totalAmount, orderId: clientOrderId } = req.body;
    
    // If the frontend already generated an orderId, check if it exists to prevent duplication
    let orderId = clientOrderId;
    if (orderId) {
      const existing = await Order.findOne({ orderId });
      if (existing) {
        return res.status(200).json(existing);
      }
    } else {
      orderId = 'MFD-' + Math.floor(10000 + Math.random() * 90000);
    }

    const newOrder = new Order({
      orderId,
      customerName,
      mobile,
      userPhone: mobile, // Saves user phone/mobile for secure filtering
      address,
      paymentMethod: paymentMethod || 'Pay in Home (Cash on Delivery)',
      items: items || [],
      totalAmount: Number(totalAmount) || 0,
      status: 'point_hub'
    });

    const saved = await newOrder.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Order creation failed', details: err.message });
  }
});

router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true, lean: true }
    );
    res.status(200).json(updated || { success: true });
  } catch (err) {
    res.status(400).json({ error: 'Status update failed', details: err.message });
  }
});

router.delete('/:orderId', async (req, res) => {
  try {
    await Order.findOneAndDelete({ orderId: req.params.orderId });
    res.status(200).json({ message: 'Order removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order', details: err.message });
  }
});

module.exports = router;
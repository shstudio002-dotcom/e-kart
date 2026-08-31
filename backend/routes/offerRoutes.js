const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');

// GET: Current active banner offer
router.get('/', async (req, res) => {
  try {
    let offer = await Offer.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (!offer) {
      offer = await Offer.create({
        tag: 'OFFER OF ANY',
        title: 'Flat 20% OFF Daily Groceries!',
        subtitle: 'Fresh farm staples, rice, dairy & organic produce delivered in 30-40 mins.',
        deliveryFee: '₹0',
        speed: '35m',
        isActive: true
      });
    }
    res.status(200).json(offer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch banner offer', details: err.message });
  }
});

// POST: Update banner offer
router.post('/', async (req, res) => {
  try {
    const { tag, title, subtitle, deliveryFee, speed } = req.body;

    const offer = await Offer.findOneAndUpdate(
      {},
      { tag, title, subtitle, deliveryFee, speed, isActive: true },
      { new: true, upsert: true }
    );

    res.status(200).json(offer);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update offer', details: err.message });
  }
});

module.exports = router;
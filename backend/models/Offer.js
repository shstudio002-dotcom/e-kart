const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  tag: { type: String, default: 'OFFER OF ANY' },
  title: { type: String, default: 'Flat 20% OFF Daily Groceries!' },
  subtitle: { type: String, default: 'Fresh farm staples, rice, dairy & organic produce delivered in 30-40 mins.' },
  deliveryFee: { type: String, default: '₹0' },
  speed: { type: String, default: '35m' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
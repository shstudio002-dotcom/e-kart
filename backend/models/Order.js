const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String },
  name: { type: String, required: true },
  unit: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  paymentMethod: { type: String, default: 'Pay in Home (Cash on Delivery)' },
  items: { type: [orderItemSchema], required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: [
      'Placed & Confirmed', 
      'Packing Groceries', 
      'Out for Delivery (30-40m)', 
      'Delivered',
      'point_hub',
      'point_packed',
      'point_nearby',
      'point_doorstep'
    ],
    default: 'point_hub'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
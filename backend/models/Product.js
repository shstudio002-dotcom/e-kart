const mongoose = require('mongoose');

const unitOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  multiplier: { type: Number, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  nameKan: { type: String, required: true, trim: true },
  nameEng: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['grains', 'dairy', 'staples'], 
    default: 'grains' 
  },
  basePriceKg: { type: Number, required: true, min: 1 },
  unitOptions: { type: [unitOptionSchema], default: [] },
  selectedUnitIndex: { type: Number, default: 1 },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
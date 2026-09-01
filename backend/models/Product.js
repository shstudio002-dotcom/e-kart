const mongoose = require('mongoose');

const unitOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  multiplier: { type: Number, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  nameKan: { type: String, required: true, trim: true },
  nameEng: { type: String, required: true, trim: true },
  category: { type: String, default: 'grains' },
  basePriceKg: { type: Number, required: true },
  image: { type: String, default: '' }, // Stores Cloudinary secure_url
  unitOptions: {
    type: [unitOptionSchema],
    default: [
      { label: '100 gm', multiplier: 0.1 },
      { label: '250 gm', multiplier: 0.25 },
      { label: '500 gm', multiplier: 0.5 },
      { label: '1 kg', multiplier: 1.0 },
      { label: '2 kg', multiplier: 2.0 },
      { label: '5 kg', multiplier: 5.0 },
      { label: '10 kg', multiplier: 10.0 }
    ]
  },
  selectedUnitIndex: { type: Number, default: 3 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
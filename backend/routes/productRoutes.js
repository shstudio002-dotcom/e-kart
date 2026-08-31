const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET: Fetch all active products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products', details: err.message });
  }
});

// POST: Add a new grocery product
router.post('/', async (req, res) => {
  try {
    const { nameKan, nameEng, category, basePriceKg } = req.body;

    if (!nameKan || !nameEng || !basePriceKg) {
      return res.status(400).json({ error: 'nameKan, nameEng, and basePriceKg are required fields.' });
    }

    const unitOptions = [
      { label: '500 gm', multiplier: 0.5 },
      { label: '1 kg', multiplier: 1.0 },
      { label: '2 kg', multiplier: 2.0 },
      { label: '5 kg', multiplier: 5.0 }
    ];

    const newProduct = new Product({
      nameKan,
      nameEng,
      category: category || 'grains',
      basePriceKg: Number(basePriceKg),
      unitOptions,
      selectedUnitIndex: 1
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product', details: err.message });
  }
});

// PATCH: Update product price
router.patch('/:id/price', async (req, res) => {
  try {
    const { basePriceKg } = req.body;
    if (!basePriceKg || isNaN(basePriceKg)) {
      return res.status(400).json({ error: 'Valid basePriceKg is required.' });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { basePriceKg: Number(basePriceKg) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update price', details: err.message });
  }
});

// DELETE: Remove product SKU
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.status(200).json({ message: 'Product removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// Multer memory storage (holds file in RAM buffer for direct streaming)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});

// GET: Fetch all active products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products', details: err.message });
  }
});

// POST: Add a new grocery product SKU with Cloudinary Image Upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { nameKan, nameEng, category, basePriceKg } = req.body;

    if (!nameKan || !nameEng || !basePriceKg) {
      return res.status(400).json({ error: 'nameKan, nameEng, and basePriceKg are required.' });
    }

    const cloudinaryReady = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME.toLowerCase() !== 'root' &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (!cloudinaryReady) {
      return res.status(500).json({
        error: 'Cloudinary is not configured. Set valid CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET values in backend/.env.'
      });
    }

    let imageUrl = '';
    const rawImageData = req.body?.imageData || req.body?.image || '';
    const hasImage = !!(req.file || rawImageData);

    if (hasImage) {
      try {
        if (req.file && req.file.buffer) {
          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: 'mf_dari_groceries',
                resource_type: 'image'
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(req.file.buffer);
          });
          imageUrl = uploadResult.secure_url;
        } else if (rawImageData) {
          const imageSource = rawImageData.startsWith('data:')
            ? rawImageData
            : `data:image/png;base64,${rawImageData}`;

          const uploadResult = await cloudinary.uploader.upload(imageSource, {
            folder: 'mf_dari_groceries',
            resource_type: 'image'
          });
          imageUrl = uploadResult.secure_url;
        }
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr);
        return res.status(400).json({
          error: uploadErr && uploadErr.message ? uploadErr.message : 'Cloudinary image upload failed.'
        });
      }
    }

    const unitOptions = [
      { label: '100 gm', multiplier: 0.1 },
      { label: '250 gm', multiplier: 0.25 },
      { label: '500 gm', multiplier: 0.5 },
      { label: '1 kg', multiplier: 1.0 },
      { label: '2 kg', multiplier: 2.0 },
      { label: '5 kg', multiplier: 5.0 },
      { label: '10 kg', multiplier: 10.0 }
    ];

    const newProduct = new Product({
      nameKan,
      nameEng,
      category: category || 'grains',
      basePriceKg: Number(basePriceKg),
      image: imageUrl,
      unitOptions,
      selectedUnitIndex: 3
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Cloudinary / Product Save Error:', err);
    res.status(500).json({ error: err && err.message ? err.message : 'Failed to create product' });
  }
});

// PATCH: Update product base price
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
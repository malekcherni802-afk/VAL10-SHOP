const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// GET /api/products — all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit = 50, skip = 0 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Product.countDocuments(filter);
    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id — single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products — create product (protected)
router.post('/', authMiddleware, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'model3D', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description, price, category, soldOut, featured, tags } = req.body;

    const images = req.files?.images?.map(f =>
      `/uploads/images/${path.basename(f.path)}`
    ) || [];

    const model3D = req.files?.model3D?.[0]
      ? `/uploads/models/${path.basename(req.files.model3D[0].path)}`
      : null;

    const product = new Product({
      name, description,
      price: parseFloat(price),
      category: category || 'clothing',
      images,
      model3D,
      soldOut: soldOut === 'true',
      featured: featured === 'true',
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/products/:id — update product (protected)
router.patch('/:id', authMiddleware, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'model3D', maxCount: 1 }
]), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { name, description, price, category, soldOut, featured, tags, removeImages } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (soldOut !== undefined) product.soldOut = soldOut === 'true';
    if (featured !== undefined) product.featured = featured === 'true';
    if (tags) product.tags = tags.split(',').map(t => t.trim());

    // Remove specific images
    if (removeImages) {
      const toRemove = JSON.parse(removeImages);
      product.images = product.images.filter(img => !toRemove.includes(img));
    }

    // Add new images
    if (req.files?.images) {
      const newImages = req.files.images.map(f => `/uploads/images/${path.basename(f.path)}`);
      product.images = [...product.images, ...newImages];
    }

    // Replace 3D model
    if (req.files?.model3D?.[0]) {
      product.model3D = `/uploads/models/${path.basename(req.files.model3D[0].path)}`;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id — delete product (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Cleanup files
    const cleanup = [...product.images];
    if (product.model3D) cleanup.push(product.model3D);
    cleanup.forEach(filePath => {
      const abs = path.join(__dirname, '..', filePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    });

    res.json({ message: 'Product deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router  = express.Router();
const Product = require('../models/Product');
const auth    = require('../middleware/auth');

/* ── GET /api/products ─────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { category, featured, visible, limit = 100, skip = 0, search } = req.query;

    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.featured = true;
    // By default, public API only shows visible products
    if (visible === 'false') {
      filter.visible = false;
    } else {
      filter.visible = { $ne: false };
    }
    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .limit(Math.min(parseInt(limit), 200))
        .skip(parseInt(skip))
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total });
  } catch (err) {
    console.error('[products GET]', err);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/products/all  — admin, includes hidden ────────── */
router.get('/all', auth, async (req, res) => {
  try {
    const { category, limit = 200, skip = 0 } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(parseInt(skip)).lean(),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/products/:id ─────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Invalid product ID' });
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/products ─────────────────────────────────────── */
router.post('/', auth, async (req, res) => {
  try {
    const {
      name, description, price, category,
      soldOut, featured, visible,
      tags, sizes, stock,
      imageUrls,   // JSON string array of Cloudinary URLs
    } = req.body;

    if (!name || !description || price == null) {
      return res.status(400).json({ error: 'name, description and price are required' });
    }

    // Parse imageUrls (sent as JSON string from form)
    let images = [];
    if (imageUrls) {
      try { images = JSON.parse(imageUrls); } catch { /* ignore */ }
    }

    const product = new Product({
      name:        name.trim(),
      description: description.trim(),
      price:       parseFloat(price),
      category:    category || 'other',
      images,
      soldOut:     soldOut  === 'true' || soldOut  === true,
      featured:    featured === 'true' || featured === true,
      visible:     visible  !== 'false' && visible !== false,
      tags:  tags  ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      sizes: sizes ? sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      stock: stock ? parseInt(stock) : null,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('[products POST]', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ── PATCH /api/products/:id ────────────────────────────────── */
router.patch('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const {
      name, description, price, category,
      soldOut, featured, visible,
      tags, sizes, stock,
      imageUrls,      // JSON string: complete replacement array of URLs
      addImageUrls,   // JSON string: URLs to append
      removeImageUrls,// JSON string: URLs to remove
    } = req.body;

    if (name        != null) product.name        = name.trim();
    if (description != null) product.description = description.trim();
    if (price       != null) product.price       = parseFloat(price);
    if (category    != null) product.category    = category;
    if (soldOut     != null) product.soldOut  = soldOut  === 'true' || soldOut  === true;
    if (featured    != null) product.featured = featured === 'true' || featured === true;
    if (visible     != null) product.visible  = visible  !== 'false' && visible  !== false;
    if (stock       != null) product.stock    = stock ? parseInt(stock) : null;
    if (tags        != null) product.tags     = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (sizes       != null) product.sizes    = sizes.split(',').map(s => s.trim()).filter(Boolean);

    // Full image replacement
    if (imageUrls != null) {
      try { product.images = JSON.parse(imageUrls); } catch { /* keep existing */ }
    }
    // Append new images
    if (addImageUrls) {
      try {
        const add = JSON.parse(addImageUrls);
        product.images = [...product.images, ...add];
      } catch { /* ignore */ }
    }
    // Remove specific images
    if (removeImageUrls) {
      try {
        const remove = JSON.parse(removeImageUrls);
        product.images = product.images.filter(u => !remove.includes(u));
      } catch { /* ignore */ }
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.error('[products PATCH]', err);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

/* ── DELETE /api/products/:id ───────────────────────────────── */
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    // Note: Cloudinary images are NOT auto-deleted here.
    // You can optionally call Cloudinary Admin API using product.images[].public_id if stored.
    res.json({ message: 'Product deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

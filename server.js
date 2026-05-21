require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Product = require('./models/Product');

const app = express();

// Middleware – large payload for Base64 images
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const DB_URL = process.env.MONGODB_URI;
if (!DB_URL) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}
mongoose.connect(DB_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });

// ========== API Routes ==========

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create product
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, description, colors, sizes, images } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const product = new Product({ name, price, description, colors, sizes, images });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Homepage Banner (single document)
const bannerSchema = new mongoose.Schema({
  title: { type: String, default: 'VAL10 Collection' },
  heroImage: { type: String, default: '' },
  secondaryImage: { type: String, default: '' }
});
const Banner = mongoose.model('Banner', bannerSchema);

app.get('/api/homepage-hero', async (req, res) => {
  try {
    let banner = await Banner.findOne();
    if (!banner) banner = await Banner.create({});
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/homepage-hero', async (req, res) => {
  try {
    let banner = await Banner.findOne();
    if (banner) {
      banner.title = req.body.title ?? banner.title;
      banner.heroImage = req.body.heroImage ?? banner.heroImage;
      banner.secondaryImage = req.body.secondaryImage ?? banner.secondaryImage;
      await banner.save();
    } else {
      banner = await Banner.create(req.body);
    }
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/product', (req, res) => res.sendFile(path.join(__dirname, 'public', 'product.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
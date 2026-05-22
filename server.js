require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DB_URL = process.env.MONGODB_URI;
if (!DB_URL) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}
mongoose.connect(DB_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('MongoDB error:', err); process.exit(1); });

// ==================== MODELS ====================
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  colors: [{
    name: { type: String, required: true },
    image: { type: String, required: true },   // Base64 image for this color
    stock: { type: Number, default: 0, min: 0 }
  }],
  sizes: [{
    size: { type: String, enum: ['S', 'M', 'L', 'XL'], required: true },
    stock: { type: Number, default: 0, min: 0 }
  }],
  // Legacy images array kept for backward compatibility (if any)
  images: [{ type: String }],
  isSoldOut: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Auto‑compute isSoldOut (if all sizes stock = 0 AND all colors stock = 0)
productSchema.pre('save', function(next) {
  const allSizesZero = this.sizes.every(s => s.stock === 0);
  const allColorsZero = this.colors.every(c => c.stock === 0);
  this.isSoldOut = allSizesZero && allColorsZero;
  next();
});

const Product = mongoose.model('Product', productSchema);

const bannerSchema = new mongoose.Schema({
  title: { type: String, default: 'VAL10 Collection' },
  heroImages: [{ type: String }],
  updatedAt: { type: Date, default: Date.now }
});
const Banner = mongoose.model('Banner', bannerSchema);

// ==================== API ROUTES ====================
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, description, colors, sizes, images } = req.body;
    if (!name || price === undefined) return res.status(400).json({ error: 'Name and price required' });
    const product = new Product({ name, price, description, colors, sizes, images });
    await product.save();
    res.status(201).json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/homepage-hero', async (req, res) => {
  try {
    let banner = await Banner.findOne();
    if (!banner) banner = await Banner.create({});
    res.json(banner);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/homepage-hero', async (req, res) => {
  try {
    let banner = await Banner.findOne();
    if (banner) {
      banner.title = req.body.title ?? banner.title;
      banner.heroImages = req.body.heroImages ?? banner.heroImages;
      banner.updatedAt = Date.now();
      await banner.save();
    } else {
      banner = await Banner.create(req.body);
    }
    res.json(banner);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Order routes (simple)
const orderSchema = new mongoose.Schema({
  customerName: String, customerPhone: String, customerAddress: String,
  productName: String, size: String, color: String, totalPrice: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/product', (req, res) => res.sendFile(path.join(__dirname, 'public', 'product.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
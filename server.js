require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware – large payload for Base64 images
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
    hex: { type: String, default: '#000000' },
    image: { type: String, required: true },
    stock: { type: Number, default: 0, min: 0 }
  }],
  sizes: [{
    size: { type: String, enum: ['S', 'M', 'L', 'XL'], required: true },
    stock: { type: Number, default: 0, min: 0 }
  }],
  images: [{ type: String }], // fallback gallery
  isSoldOut: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Auto‑compute isSoldOut: true if all color stocks === 0 AND all size stocks === 0
productSchema.pre('save', function(next) {
  const allColorsZero = this.colors.every(c => c.stock === 0);
  const allSizesZero = this.sizes.every(s => s.stock === 0);
  this.isSoldOut = allColorsZero && allSizesZero;
  next();
});

const Product = mongoose.model('Product', productSchema);

const bannerSchema = new mongoose.Schema({
  title: { type: String, default: 'VAL10 Collection' },
  heroImages: [{ type: String }],
  updatedAt: { type: Date, default: Date.now }
});
const Banner = mongoose.model('Banner', bannerSchema);

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  productName: String,
  color: String,
  size: String,
  totalPrice: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// ==================== API ROUTES ====================
// Products
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

// Homepage banner
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

// Orders with stock validation
app.post('/api/orders', async (req, res) => {
  try {
    const { productName, color, size, customerName, customerPhone, customerAddress, totalPrice } = req.body;
    
    // Find the product
    const product = await Product.findOne({ name: productName });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if product is fully sold out
    if (product.isSoldOut) {
      return res.status(400).json({ error: 'Product is sold out' });
    }
    
    // Validate color stock if color is provided
    if (color) {
      const colorObj = product.colors.find(c => c.name === color);
      if (!colorObj || colorObj.stock <= 0) {
        return res.status(400).json({ error: `Selected color "${color}" is out of stock` });
      }
    }
    
    // Validate size stock if size is provided
    if (size && size !== 'One Size') {
      const sizeObj = product.sizes.find(s => s.size === size);
      if (!sizeObj || sizeObj.stock <= 0) {
        return res.status(400).json({ error: `Selected size "${size}" is out of stock` });
      }
    }
    
    // All validations passed – create order
    const order = new Order({ customerName, customerPhone, customerAddress, productName, color, size, totalPrice });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Frontend routes
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
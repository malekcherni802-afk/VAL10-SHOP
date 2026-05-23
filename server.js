const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const DB_URL = process.env.MONGODB_URI;

if (!DB_URL) {
    console.error('❌ ERROR: MONGODB_URI is not defined!');
    console.log('💡 TIP: Add MONGODB_URI in Render Environment Variables');
    process.exit(1);
}

console.log('🔗 Connecting to MongoDB Atlas...');

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB Atlas: CONNECTED SUCCESSFULLY');
    console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch(err => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
});

// ─── Schemas ───────────────────────────────────────────────────────────────────

/**
 * ColorVariant sub-document
 * Each color holds its own image and live stock count.
 */
const colorVariantSchema = new mongoose.Schema({
    name:  { type: String, required: true, trim: true },
    hex:   { type: String, required: true, trim: true },
    image: { type: String, default: '' },   // base64 or URL
    stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: false });

/**
 * SizeStock sub-document
 * Each size tracks its own stock count.
 * Supports both new format { size, stock } and legacy plain strings.
 */
const sizeStockSchema = new mongoose.Schema({
    size:  { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    price:       { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    sizes:       { type: [sizeStockSchema], default: [] },
    category:    { type: String, default: 'Underground' },
    /**
     * colors replaces the old flat `images` array.
     * Each entry is a ColorVariant with its own image + stock.
     */
    colors:      { type: [colorVariantSchema], default: [] },
    /**
     * Legacy field kept for backwards-compat with old products.
     * New products use colors[n].image instead.
     */
    images:      { type: [String], default: [] },
    createdAt:   { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    customerName:    { type: String, required: true },
    customerPhone:   { type: String, required: true },
    customerAddress: { type: String, required: true },
    productName:     { type: String, required: true },
    size:            { type: String, required: true },
    colorName:       { type: String, default: '' },
    totalPrice:      { type: Number, required: true },
    status:          { type: String, default: 'Pending' },
    createdAt:       { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order   = mongoose.model('Order',   orderSchema);

// ─── Banner Schema ─────────────────────────────────────────────────────────────
// Stores the full slideshow config as a single document (upsert pattern).
// `slides` is an ordered array; the homepage cycles through them.

const slideSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    linkUrl:  { type: String, default: '/' },
    caption:  { type: String, default: '' }
}, { _id: false });

const bannerSchema = new mongoose.Schema({
    slides:    { type: [slideSchema], default: [] },
    updatedAt: { type: Date, default: Date.now }
});

const Banner = mongoose.model('Banner', bannerSchema);

// GET /api/banner — returns slides array (empty array if nothing saved yet)
app.get('/api/banner', async (req, res) => {
    try {
        const banner = await Banner.findOne().sort({ updatedAt: -1 });
        res.json(banner || { slides: [] });
    } catch (error) {
        console.error('GET /api/banner error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/banner — replace entire slides array (upsert)
// Body: { slides: [{ imageUrl, linkUrl, caption }, …] }
app.post('/api/banner', async (req, res) => {
    try {
        const { slides } = req.body;
        if (!Array.isArray(slides)) {
            return res.status(400).json({ error: '`slides` must be an array' });
        }
        const banner = await Banner.findOneAndUpdate(
            {},
            { slides, updatedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json(banner);
    } catch (error) {
        console.error('POST /api/banner error:', error);
        res.status(400).json({ error: error.message });
    }
});

// ─── Business Logic ────────────────────────────────────────────────────────────

/**
 * checkStockStatus(product)
 *
 * Decorates each color variant with a computed `availability` field:
 *   - 'In Stock'   if stock > 0
 *   - 'Sold Out'   if stock === 0
 *
 * Returns a plain object (not a Mongoose document) so it can be
 * safely serialised and sent to the client.
 */
function checkStockStatus(product) {
    const obj = product.toObject ? product.toObject() : { ...product };

    if (Array.isArray(obj.colors)) {
        obj.colors = obj.colors.map(color => ({
            ...color,
            availability: color.stock > 0 ? 'In Stock' : 'Sold Out'
        }));
    }

    // Migrate legacy sizes: plain strings -> { size, stock: 1 }
    if (Array.isArray(obj.sizes)) {
        obj.sizes = obj.sizes
            .map(s => (typeof s === 'string' && s.trim()) ? { size: s.trim(), stock: 1 } : s)
            .filter(s => s && s.size);
    }

    // Convenience top-level flag: product is available if any color has stock
    obj.hasStock = Array.isArray(obj.colors)
        ? obj.colors.some(c => c.stock > 0)
        : true;

    return obj;
}

// ─── Product Routes ────────────────────────────────────────────────────────────

// GET /api/products — returns all products with computed availability per color
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        // Decorate every product with live stock status before sending
        const decorated = products.map(checkStockStatus);
        res.json(decorated);
    } catch (error) {
        console.error('GET /api/products error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/products/:id — single product with availability
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(checkStockStatus(product));
    } catch (error) {
        console.error('GET /api/products/:id error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/products — create a new product (colors array in body)
app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(checkStockStatus(product));
    } catch (error) {
        console.error('POST /api/products error:', error);
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/products/:id — full update
app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(checkStockStatus(product));
    } catch (error) {
        console.error('PUT /api/products/:id error:', error);
        res.status(400).json({ error: error.message });
    }
});

// PATCH /api/products/:id/stock — atomic stock update for a single color
// Body: { colorIndex: 0, stock: 5 }
app.patch('/api/products/:id/stock', async (req, res) => {
    try {
        const { colorIndex, stock } = req.body;
        if (typeof colorIndex !== 'number' || typeof stock !== 'number') {
            return res.status(400).json({ error: 'colorIndex and stock are required numbers' });
        }
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (!product.colors[colorIndex]) {
            return res.status(400).json({ error: 'Color index out of range' });
        }
        product.colors[colorIndex].stock = Math.max(0, stock);
        await product.save();
        res.json(checkStockStatus(product));
    } catch (error) {
        console.error('PATCH /api/products/:id/stock error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/products/:id
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('DELETE /api/products/:id error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ─── Order Routes ──────────────────────────────────────────────────────────────

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── HTML Routes ───────────────────────────────────────────────────────────────

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 VAL10 STORE DEPLOYED SUCCESSFULLY`);
    console.log(`👉 PORT: ${PORT}`);
    console.log(`👉 URL: https://val10-store.onrender.com`);
    console.log(`👉 Admin Panel: /admin`);
    console.log('='.repeat(50));
});

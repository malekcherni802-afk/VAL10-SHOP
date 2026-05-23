const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Admin Basic Auth ──────────────────────────────────────────────────────────
// Set ADMIN_USER and ADMIN_PASS in your Render environment variables.
app.use('/admin', (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const b64        = authHeader.split(' ')[1] || '';
    const [user, pass] = Buffer.from(b64, 'base64').toString().split(':');

    const expectedUser = process.env.ADMIN_USER || 'val10admin';
    const expectedPass = process.env.ADMIN_PASS || 'changeme123';

    if (user === expectedUser && pass === expectedPass) return next();

    res.set('WWW-Authenticate', 'Basic realm="VAL10 Admin"');
    return res.status(401).send('Unauthorized — set ADMIN_USER and ADMIN_PASS in Render env vars.');
});

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
    useNewUrlParser:    true,
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

const colorVariantSchema = new mongoose.Schema({
    name:  { type: String, required: true, trim: true },
    // FIX: validate hex format — prevents broken swatches on the frontend
    hex: {
        type:     String,
        required: true,
        trim:     true,
        validate: {
            validator: v => /^#[0-9a-fA-F]{6}$/.test(v),
            message:   props => `"${props.value}" is not a valid hex color (use #RRGGBB)`
        }
    },
    image: { type: String, default: '' },
    stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: false });

const sizeStockSchema = new mongoose.Schema({
    size:  { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
    name:        { type: String, required: true, trim: true },
    // FIX: price min changed from 0 → 1 — prevents free/negative products
    price:       { type: Number, required: true, min: 1 },
    description: { type: String, default: '' },
    // FIX: sizes now use sizeStockSchema objects — matches what admin sends
    sizes:       { type: [sizeStockSchema], default: [] },
    category:    { type: String, default: 'Underground' },
    colors:      { type: [colorVariantSchema], default: [] },
    images:      { type: [String], default: [] },   // legacy compat
    createdAt:   { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    customerName:    { type: String, required: true },
    customerPhone:   { type: String, required: true },
    customerAddress: { type: String, required: true },
    productId:       { type: String, default: '' },
    colorIndex:      { type: Number, default: -1 },
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

// HTML escape utility — prevents XSS when data is reflected server-side
function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function checkStockStatus(product) {
    const obj = product.toObject ? product.toObject() : { ...product };

    if (Array.isArray(obj.colors)) {
        obj.colors = obj.colors.map(color => ({
            ...color,
            availability: color.stock > 0 ? 'In Stock' : 'Sold Out'
        }));
    }

    // Migrate legacy sizes: plain strings → { size, stock: 1 }
    if (Array.isArray(obj.sizes)) {
        obj.sizes = obj.sizes
            .map(s => (typeof s === 'string' && s.trim()) ? { size: s.trim(), stock: 1 } : s)
            .filter(s => s && s.size);
    }

    obj.hasStock = Array.isArray(obj.colors) && obj.colors.length > 0
        ? obj.colors.some(c => c.stock > 0)
        : true;

    return obj;
}

// ─── Banner Routes ─────────────────────────────────────────────────────────────
app.get('/api/banner', async (req, res) => {
    try {
        const banner = await Banner.findOne().sort({ updatedAt: -1 });
        res.json(banner || { slides: [] });
    } catch (error) {
        console.error('GET /api/banner error:', error);
        res.status(500).json({ error: error.message });
    }
});

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

// ─── Product Routes ────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
    try {
        // FIX: pagination support — ?page=1&limit=20 (defaults to all for homepage)
        const limit = parseInt(req.query.limit) || 0;
        const page  = Math.max(1, parseInt(req.query.page) || 1);
        const skip  = limit ? (page - 1) * limit : 0;

        const [products, total] = await Promise.all([
            Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Product.countDocuments()
        ]);

        const decorated = products.map(checkStockStatus);
        res.json({ products: decorated, total, page, limit: limit || total });
    } catch (error) {
        console.error('GET /api/products error:', error);
        res.status(500).json({ error: error.message });
    }
});

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
        // FIX: pagination — ?page=1&limit=50
        const limit = parseInt(req.query.limit) || 0;
        const page  = Math.max(1, parseInt(req.query.page) || 1);
        const skip  = limit ? (page - 1) * limit : 0;

        const [orders, total] = await Promise.all([
            Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments()
        ]);

        res.json({ orders, total, page, limit: limit || total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// FIX: atomic stock decrement — prevents overselling on simultaneous orders
app.post('/api/orders', async (req, res) => {
    try {
        const { productId, colorIndex, size } = req.body;

        // If a productId and colorIndex are provided, atomically decrement stock
        if (productId && typeof colorIndex === 'number' && colorIndex >= 0) {
            const stockField = `colors.${colorIndex}.stock`;

            // Atomic: only updates if stock > 0, returns null if sold out
            const updated = await Product.findOneAndUpdate(
                { _id: productId, [stockField]: { $gt: 0 } },
                { $inc: { [stockField]: -1 } },
                { new: true }
            );

            if (!updated) {
                return res.status(409).json({
                    error: 'This color is sold out. Please refresh and choose another.'
                });
            }
        }

        // Validate phone — Tunisian format (8 digits, optional +216/00216 prefix)
        const rawPhone = (req.body.customerPhone || '').replace(/\s/g, '');
        const phoneRe  = /^(\+?216|00216)?[2-9]\d{7}$/;
        if (!phoneRe.test(rawPhone)) {
            return res.status(400).json({ error: 'Invalid phone number (8-digit Tunisian number required)' });
        }

        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/orders/:id — used by confirmation page
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
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

// FIX: inject Open Graph meta tags per product for social sharing previews
app.get('/product', async (req, res) => {
    const { id } = req.query;
    let ogTitle = 'VAL10 | Archive Piece';
    let ogDesc  = 'Underground luxury streetwear — VAL10 Store';
    let ogImage = '';

    if (id) {
        try {
            const p = await Product.findById(id).lean();
            if (p) {
                ogTitle = `VAL10 | ${escHtml(p.name)}`;
                ogDesc  = escHtml(p.description || 'Underground luxury streetwear — VAL10 Store');
                ogImage = p.colors?.[0]?.image || p.images?.[0] || '';
            }
        } catch (_) { /* invalid id — use defaults */ }
    }

    const html = require('fs')
        .readFileSync(path.join(__dirname, 'public', 'product.html'), 'utf8')
        .replace('<!-- OG_PLACEHOLDER -->',
            `<meta property="og:title"       content="${ogTitle}" />
             <meta property="og:description" content="${ogDesc}" />
             <meta property="og:type"        content="product" />
             ${ogImage ? `<meta property="og:image" content="${ogImage}" />` : ''}
             <meta name="description"        content="${ogDesc}" />`
        );
    res.send(html);
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'confirmation.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 VAL10 STORE DEPLOYED SUCCESSFULLY');
    console.log(`👉 PORT: ${PORT}`);
    console.log(`👉 URL: https://val10-store.onrender.com`);
    console.log(`👉 Admin Panel: /admin  (password protected)`);
    console.log('='.repeat(50));
});

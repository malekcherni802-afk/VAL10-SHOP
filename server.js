const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const DB_URL = process.env.MONGODB_URI;
if (!DB_URL) {
    console.error('❌ ERROR: MONGODB_URI is not defined!');
    process.exit(1);
}

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB Atlas connected'))
    .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

// Cloudinary config (add your credentials in .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'val10_products', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] }
});
const upload = multer({ storage: storage });

// ==================== MODELS ====================
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    availability: { type: String, enum: ['In-Stock', 'Sold-Out'], default: 'In-Stock' },
    colors: [{ type: String }],
    description: { type: String, default: '' },
    sizes: [{ type: String }],
    images: [{ type: String }], // Cloudinary URLs
    createdAt: { type: Date, default: Date.now }
});

const homepageBannerSchema = new mongoose.Schema({
    title: { type: String, default: 'Define Your Ego' },
    heroImages: [{ type: String }], // array of Cloudinary URLs for hero slider
    updatedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    customerName: String, customerPhone: String, customerAddress: String,
    productName: String, size: String, totalPrice: Number,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const HomepageBanner = mongoose.model('HomepageBanner', homepageBannerSchema);
const Order = mongoose.model('Order', orderSchema);

// Init default banner with two hero images
(async () => {
    const count = await HomepageBanner.countDocuments();
    if (count === 0) {
        await HomepageBanner.create({
            title: 'Define Your Ego',
            heroImages: [
                'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop'
            ]
        });
        console.log('✅ Default homepage banner created');
    }
})();

// ==================== API ROUTES ====================
// Product CRUD
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Not found' });
        res.json(product);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ error: 'Not found' });
        res.json(product);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Cloudinary multi‑image upload for products
app.post('/api/upload-images', upload.array('productImages', 20), async (req, res) => {
    try {
        const urls = req.files.map(file => file.path);
        res.json({ urls });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Cloudinary upload for hero images
app.post('/api/upload-hero-images', upload.array('heroImages', 10), async (req, res) => {
    try {
        const urls = req.files.map(file => file.path);
        res.json({ urls });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Homepage banner (hero slider)
app.get('/api/homepage-hero', async (req, res) => {
    try {
        let banner = await HomepageBanner.findOne();
        if (!banner) banner = await HomepageBanner.create({});
        res.json(banner);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/homepage-hero', async (req, res) => {
    try {
        const { title, heroImages } = req.body;
        let banner = await HomepageBanner.findOne();
        if (banner) {
            if (title !== undefined) banner.title = title;
            if (heroImages) banner.heroImages = heroImages;
            banner.updatedAt = Date.now();
            await banner.save();
        } else {
            banner = await HomepageBanner.create({ title, heroImages: heroImages || [] });
        }
        res.json(banner);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

// Orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: 'Completed' }, { new: true });
        res.json(order);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Frontend routes
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/product', (req, res) => res.sendFile(path.join(__dirname, 'public', 'product.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
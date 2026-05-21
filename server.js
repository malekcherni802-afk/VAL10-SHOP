const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

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
    console.log('🚨 Shutting down due to database connection error');
    process.exit(1);
});

// ==================== MODELS ====================
// Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    availability: { type: String, enum: ['In-Stock', 'Sold-Out'], default: 'In-Stock' },
    colors: [{ type: String }],
    description: { type: String, default: '' },
    sizes: [{ type: String }],
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

// Homepage Banner Schema (Singleton)
const homepageBannerSchema = new mongoose.Schema({
    title: { type: String, default: 'VAL10 Collection' },
    heroMain: { type: String, default: '' },
    heroSecondary: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const HomepageBanner = mongoose.model('HomepageBanner', homepageBannerSchema);
const Order = mongoose.model('Order', orderSchema);

// Initialize default homepage banner if not exists
const initHomepageBanner = async () => {
    const count = await HomepageBanner.countDocuments();
    if (count === 0) {
        await HomepageBanner.create({
            title: 'Define Your Ego',
            heroMain: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
            heroSecondary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop'
        });
        console.log('📝 Default homepage banner created');
    }
};
initHomepageBanner();

// ==================== PRODUCT ROUTES ====================
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const productData = {
            name: req.body.name,
            price: req.body.price,
            availability: req.body.availability || 'In-Stock',
            colors: req.body.colors || [],
            description: req.body.description || '',
            sizes: req.body.sizes || ['One Size'],
            images: req.body.images || []
        };
        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            price: req.body.price,
            availability: req.body.availability,
            colors: req.body.colors,
            description: req.body.description,
            sizes: req.body.sizes,
            images: req.body.images
        };
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== HOMEPAGE BANNER ROUTES ====================
app.get('/api/homepage-hero', async (req, res) => {
    try {
        let banner = await HomepageBanner.findOne();
        if (!banner) {
            banner = await HomepageBanner.create({
                title: 'Define Your Ego',
                heroMain: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop',
                heroSecondary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop'
            });
        }
        res.json(banner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/homepage-hero', async (req, res) => {
    try {
        const { title, heroMain, heroSecondary } = req.body;
        let banner = await HomepageBanner.findOne();
        if (banner) {
            banner.title = title || banner.title;
            banner.heroMain = heroMain || banner.heroMain;
            banner.heroSecondary = heroSecondary || banner.heroSecondary;
            banner.updatedAt = Date.now();
            await banner.save();
        } else {
            banner = await HomepageBanner.create({
                title: title || 'Define Your Ego',
                heroMain: heroMain || '',
                heroSecondary: heroSecondary || ''
            });
        }
        res.json(banner);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==================== ORDER ROUTES ====================
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
            { status: req.body.status || 'Completed' },
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

// ==================== FRONTEND ROUTES ====================
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 VAL10 STORE DEPLOYED SUCCESSFULLY`);
    console.log(`👉 PORT: ${PORT}`);
    console.log(`👉 URL: https://val10-store.onrender.com`);
    console.log(`👉 Admin Panel: /admin`);
    console.log('='.repeat(50));
});
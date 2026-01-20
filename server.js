const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const DB_URL = process.env.MONGODB_URI || "mongodb://localhost:27017/val10";
console.log('🔗 Connecting to MongoDB...');

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB: CONNECTED'))
.catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    console.log('⚠️ Using in-memory database');
});

// Models
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    images: [String], // Can store URLs or base64
    sizes: [String],
    category: { type: String, default: 'Underground' },
    createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// ==================== API ROUTES ====================

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create product
app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create order
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ success: true, order });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Delete order
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==================== IMAGE UPLOAD ROUTE ====================
app.post('/api/upload-image', async (req, res) => {
    try {
        const { image, name } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Simple image handling - in production use Cloudinary, S3, etc.
        // For now, we'll just return the base64 string
        // You can save it to disk or use a cloud service
        
        // If it's already a URL, return it
        if (image.startsWith('http')) {
            return res.json({ url: image });
        }
        
        // If it's base64, we'll store it as is in MongoDB
        // In production, convert base64 to file and upload to cloud storage
        console.log(`📸 Image uploaded: ${name} (${image.length} chars)`);
        
        res.json({ 
            url: image, // Store as base64 in database
            message: 'Image saved as base64'
        });
        
    } catch (e) {
        console.error('Upload error:', e);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// ==================== HTML ROUTES ====================
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`👉 Store: http://localhost:${PORT}`);
    console.log(`👉 Admin: http://localhost:${PORT}/admin`);
});
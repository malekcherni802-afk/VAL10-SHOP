const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARES ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (Images, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// --- 2. DATABASE CONNECTION (FIXED) ---
// El-code hadha yaqra MONGOURI wala MONGO_URI bech ma3dech ya3tik "undefined"
const DB_URL = process.env.MONGO_URI || process.env.MONGOURI;

mongoose.connect(DB_URL)
    .then(() => console.log('✅ VAL10 DATABASE: CONNECTED SUCCESSFULLY'))
    .catch(err => console.error('❌ DATABASE ERROR:', err));

// --- 3. MODELS (The Heart of VAL10) ---
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    images: [String], // Array for multiple images
    sizes: [String],  // Array for sizes (S, M, L, XL)
    category: { type: String, default: 'Underground' },
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
    customerName: String,
    customerPhone: String,
    customerAddress: String,
    productName: String,
    size: String,
    totalPrice: Number,
    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// --- 4. API ROUTES ---

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Add new product (From Admin)
app.post('/api/products', async (req, res) => {
    try {
        const newP = new Product(req.body);
        await newP.save();
        res.status(201).json(newP);
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product Deleted" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Submit Order (From Client)
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ success: true, order });
    } catch (e) { res.status(400).json({ error: e.message }); }
});

// Get all orders (For Admin)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- 5. PAGE ROUTING (The Fix) ---

// Route l'admin (Bech ma3dech t-hezzek lel index)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Route el-client (Fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- 6. START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 VAL10 SERVER RUNNING ON PORT ${PORT}`);
});
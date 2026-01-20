const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// --- CONFIGURATION ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE CONNECTION ---
// Lezem el-key esmha MONGO_URI kima rigelnaha fi Render
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ VAL10 DATABASE CONNECTED'))
    .catch(err => console.error('❌ CONNECTION ERROR:', err));

// --- SCHEMAS ---
const Product = mongoose.model('Product', new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    images: [String],
    sizes: [String],
    createdAt: { type: Date, default: Date.now }
}));

const Order = mongoose.model('Order', new mongoose.Schema({
    customerName: String,
    customerPhone: String,
    customerAddress: String,
    productName: String,
    size: String,
    totalPrice: Number,
    createdAt: { type: Date, default: Date.now }
}));

// --- API ROUTES ---
app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (e) { res.status(404).json({msg: "Not found"}); }
});

app.post('/api/products', async (req, res) => {
    const newP = new Product(req.body);
    await newP.save();
    res.status(201).json(newP);
});

app.put('/api/products/:id', async (req, res) => {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.post('/api/orders', async (req, res) => {
    const order = new Order(req.body);
    await order.save();
    res.json(order);
});

app.get('/api/orders', async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
});

app.delete('/api/orders/:id', async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Done" });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
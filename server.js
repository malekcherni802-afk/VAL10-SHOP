require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// --- CONFIGURATION ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. EL-FIX EL-ASLI: Bech ya9ra el-tsawer wel-fichiét mel-dossier public
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE (MONGODB) ---
const MONGOURI = process.env.MONGOURI || "mongodb+srv://placeholder:placeholder@cluster.mongodb.net/val10?retryWrites=true&w=majority";

mongoose.connect(MONGOURI)
    .then(() => console.log('✅ MongoDB Connecté'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

// --- SCHEMAS (L-DATABASE) ---
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
    image: { type: String, required: true },
    description: String,
    sizes: [String],
    date: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    productName: String,
    size: String,
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// --- ROUTES PAGES (Customer & Admin) ---

// El-Index (Klayen)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// El-Product (Swipe page)
app.get('/product.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

// El-Admin (Direct access)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// --- API ROUTES (EL-MOKH MTE3 EL-SITE) ---

// Jib el-sela el-kol
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ date: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Erreur fetch" });
    }
});

// Jib meryoul wahed (Lel-Swipe)
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(404).json({ error: "Meryoul mouch mawjoud" });
    }
});

// Zid meryoul jdid (Mel-Admin)
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: "Ghalta f-el-zid" });
    }
});

// Ab3ath commande jdid
app.post('/api/order', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.json({ message: "Order Success" });
    } catch (e) {
        res.status(500).json({ error: "Ghalta f-el-commande" });
    }
});

// Fassakh sela
app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Supprimé" });
});

// Fassakh commande
app.delete('/api/orders/:id', async (req, res) => {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order Supprimé" });
});

// --- START SERVER ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`
    🚀 VAL10 SERVER IS LIVE
    -----------------------
    Index:  http://localhost:${PORT}/
    Admin:  http://localhost:${PORT}/admin
    `);
});
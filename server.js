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

// 1. SERVIR LES FICHIERS DEPUIS "PUBLIC"
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE (MONGODB) ---
const MONGOURI = process.env.MONGOURI || "mongodb+srv://placeholder:placeholder@cluster.mongodb.net/val10?retryWrites=true&w=majority";

mongoose.connect(MONGOURI)
    .then(() => console.log('✅ MongoDB Connecté'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

// --- SCHEMAS ---
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

// --- ROUTES POUR LES PAGES (FIX "NOT FOUND") ---

// Vitrine
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fix "View Details" -> Product Page
app.get('/product.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

// Admin Panel Secure
const ADMIN_PASSWORD = process.env.ADMIN_PASS || "val10boss";
app.get('/admin', (req, res) => {
    const auth = { login: 'admin', password: ADMIN_PASSWORD };
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login && password && login === auth.login && password === auth.password) {
        return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    }
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Athentication required.');
});

// --- API ROUTES ---

// Jib el-sela el-kol
app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ date: -1 });
    res.json(products);
});

// Jib meryoul wahed b-el-ID (Lel-Swipe Page)
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) return res.status(404).json({message: "Not Found"});
        res.json(product);
    } catch (err) {
        res.status(400).json({message: "Invalid ID"});
    }
});

// Ajouter produit
app.post('/api/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
});

// Passer commande
app.post('/api/order', async (req, res) => {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.json({ message: "Success" });
});

// Supprimer produit
app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// --- START ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 VAL10 SERVER LIVE ON PORT ${PORT}`));
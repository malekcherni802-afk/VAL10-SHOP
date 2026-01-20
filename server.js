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

// 1. EL-FIX EL-MUHEMM: Bech ma3adech y9ollek "Cannot GET /"
// Hatha ykhalii el-backend ychouf el-fichiét index.html, product.html, etc.
app.use(express.static(path.join(__dirname)));

// --- DATABASE (MONGODB) ---
const MONGOURI = process.env.MONGOURI || "mongodb+srv://placeholder:placeholder@cluster.mongodb.net/val10?retryWrites=true&w=majority";

mongoose.connect(MONGOURI)
    .then(() => console.log('✅ MongoDB Connecté'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

// --- SCHEMAS (Moudifiés pour le nouveau site) ---
const ProductSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String, // Zidna hadhi lel-Swipe page
    sizes: [String],     // Zidna hadhi lel-Selection
    date: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    productName: String,
    size: String,        // Zidna el-size fel-commande
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// --- ROUTES POUR SERVIR LES PAGES HTML ---

// Route lel-index (Customer)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route lel-product detail (Swipe page)
app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'product.html'));
});

// Route lel-admin (Bech todkhel wa7dek)
app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- API ROUTES ---

// 1. Jib Produits el-kol (Lel-Index)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ date: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Erreur fetch" });
    }
});

// 2. Jib produit wahed b-el-ID (Lel-Product Page)
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Produit introuvable" });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: "ID invalide" });
    }
});

// 3. A3mel Commande (Post Order)
app.post('/api/order', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.json({ message: "Success" });
    } catch (e) {
        res.status(500).json({ error: "Erreur commande" });
    }
});

// 4. Ajouter un produit (Depuis l'Admin)
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: "Erreur ajout" });
    }
});

// 5. Supprimer un produit (Depuis l'Admin)
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Produit supprimé" });
    } catch (err) {
        res.status(500).json({ error: "Erreur suppression" });
    }
});

// 6. Supprimer une commande
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id); 
        res.status(200).json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ error: "Error" });
    }
});

// --- ADMIN DASHBOARD (Code el-9dim mte3ek m-sala7) ---
const ADMIN_PASSWORD = process.env.ADMIN_PASS || "val10boss";

app.get('/admin', async (req, res) => {
    const auth = { login: 'admin', password: ADMIN_PASSWORD };
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login && password && login === auth.login && password === auth.password) {
        // Option 1: Ken t-heb testa3mel el-Dashboard mte3ek el-9dim (HTML f-west el-JS)
        // Option 2 (Affdhal): Ken creeit admin.html, na3mlou res.sendFile(path.join(__dirname, 'admin.html'))
        res.sendFile(path.join(__dirname, 'admin.html')); 
        return;
    }

    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
});

// START
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
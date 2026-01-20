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

// Bechi yemchiou el-fichiét el-kol (index, product, admin)
app.use(express.static(__dirname)); 

// --- DATABASE (MONGODB) ---
const MONGOURI = process.env.MONGOURI || "mongodb+srv://placeholder:placeholder@cluster.mongodb.net/val10?retryWrites=true&w=majority";

mongoose.connect(MONGOURI)
    .then(() => console.log('✅ MongoDB Connecté'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

// --- SCHEMAS (Moudifié) ---
const ProductSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String, // Zidna hadhi
    sizes: [String],     // Zidna hadhi
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

// --- API ROUTES ---

// 1. Jib el-sela el-kol (Lel-Index)
app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ date: -1 });
    res.json(products);
});

// 2. Jib meryoul wahed b-el-ID (Lel-Product Page) - MUHEMMA BARCHA
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("Produit introuvable");
        res.json(product);
    } catch (err) {
        res.status(500).send("Erreur ID");
    }
});

// 3. A3mel Commande
app.post('/api/order', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.json({ message: "Success" });
    } catch (e) {
        res.status(500).json({ error: "Erreur" });
    }
});

// 4. Route bech tfassakh commande
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id); 
        res.status(200).json({ message: "OK" });
    } catch (err) {
        res.status(500).json({ error: "Error" });
    }
});

// --- PAGES ROUTING ---

// Page el-Meryoul
app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'product.html'));
});

// Page el-Admin (Itheb testa3mel el-fichié admin.html f-blasit el-code mte3ek el-9dim)
app.get('/val10-admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- ADMIN DASHBOARD (El-code el-9dim mte3ek m-sala7) ---
const ADMIN_PASSWORD = process.env.ADMIN_PASS || "val10boss";

app.get('/admin', async (req, res) => {
    const auth = { login: 'admin', password: ADMIN_PASSWORD };
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login && password && login === auth.login && password === auth.password) {
        const products = await Product.find().sort({ date: -1 });
        const orders = await Order.find().sort({ date: -1 });

        // Hna el-HTML mte3 el-dashboard... (khallih kima howa wala badlou b-sendFile admin.html)
        // Nans-hak testa3mel res.sendFile(path.join(__dirname, 'admin.html')) bech ykoun design a7sen
        res.sendFile(path.join(__dirname, 'admin.html')); 
        return;
    }

    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
});

// ACTIONS ADMIN
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json({ message: "Added" });
    } catch (err) {
        res.status(500).send("Error");
    }
});

app.post('/admin/delete', async (req, res) => {
    await Product.findByIdAndDelete(req.body.id);
    res.redirect('/admin');
});

// START
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
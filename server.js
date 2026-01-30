const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- 1. MIDDLEWARES ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir les fichiers statiques (CSS, JS, Images) du dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// --- 2. CONNEXION MONGODB ---
const DB_URL = process.env.MONGODB_URI;

if (!DB_URL) {
    console.error('❌ ERROR: MONGODB_URI n\'est pas définie dans Render !');
    process.exit(1);
}

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB Atlas : CONNECTÉ AVEC SUCCÈS');
    console.log(`📊 Base de données : ${mongoose.connection.name}`);
})
.catch(err => {
    console.error('❌ Erreur de connexion MongoDB :', err.message);
});

// --- 3. MODÈLES DE DONNÉES ---
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    images: [String],
    sizes: [String],
    category: String,
    createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    customerName: String,
    customerPhone: String,
    customerAddress: String,
    productName: String,
    size: String,
    totalPrice: Number,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

// --- 4. ROUTES API (PRODUITS) ---

// Récupérer tous les produits
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ajouter un produit
app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 5. ROUTES API (COMMANDES / ORDERS) ---

// Récupérer toutes les commandes (pour l'admin)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Créer une commande
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Supprimer une commande
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Commande supprimée' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- 6. ROUTES POUR LES PAGES HTML ---

// Route pour la page d'accueil (Crucial pour Render)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route Admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Route Produit (Détails)
app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

// --- 7. DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur VAL10 lancé sur le port ${PORT}`);
});
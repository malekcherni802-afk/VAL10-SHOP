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
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE (MONGODB) ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://placeholder:placeholder@cluster.mongodb.net/val10?retryWrites=true&w=majority";
// NOTE: Itha ma7attitch MONGO_URI, el code bech yeplanté. Lazem database.

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connecté'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

// --- SCHEMAS (Forme mte3 Data) ---
const ProductSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    date: { type: Date, default: Date.now }
});
const OrderSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    productName: String,
    status: { type: String, default: 'Pending' }, // Pending, Confirmed
    date: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// --- API ROUTES (Site yetkallem m3ahom) ---

// 1. Jib Produits
app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ date: -1 });
    res.json(products);
});

// 2. A3mel Commande
app.post('/api/order', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.json({ message: "Success" });
    } catch (e) {
        res.status(500).json({ error: "Erreur" });
    }
});

// --- ADMIN PANEL (Server Side Rendering) ---
const ADMIN_PASSWORD = process.env.ADMIN_PASS || "val10boss"; // Mot de passe par défaut

app.get('/admin', async (req, res) => {
    // Basic Auth Check
    const auth = { login: 'admin', password: ADMIN_PASSWORD };
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login && password && login === auth.login && password === auth.password) {
        // Si Login s7i7, affichi Dashboard
        const products = await Product.find().sort({ date: -1 });
        const orders = await Order.find().sort({ date: -1 });

        let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>VAL10 ADMIN</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-900 text-white min-h-screen p-6 font-sans">
            <div class="max-w-6xl mx-auto">
                <div class="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                    <h1 class="text-3xl font-bold tracking-widest">VAL10 CONTROL</h1>
                    <span class="bg-green-600 px-3 py-1 rounded text-xs font-bold">ONLINE</span>
                </div>

                <div class="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg border border-gray-700">
                    <h2 class="text-xl font-bold mb-4 text-gray-300">NOUVEAU DROP</h2>
                    <form action="/admin/add" method="POST" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input type="text" name="name" placeholder="Nom du Produit" class="bg-gray-900 border border-gray-600 p-3 rounded text-white focus:border-white outline-none" required>
                        <input type="text" name="price" placeholder="Prix (ex: 120 TND)" class="bg-gray-900 border border-gray-600 p-3 rounded text-white focus:border-white outline-none" required>
                        <input type="text" name="image" placeholder="Lien Image (URL)" class="bg-gray-900 border border-gray-600 p-3 rounded text-white focus:border-white outline-none" required>
                        <button type="submit" class="bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition">Ajouter</button>
                    </form>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 class="text-xl font-bold mb-4 text-yellow-500 flex justify-between">
                            COMMANDES RÉCENTES
                            <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">${orders.length} TOTAL</span>
                        </h2>
                        <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            ${orders.map(o => `
                                <div class="bg-gray-800 p-4 rounded border-l-4 border-yellow-500 shadow-md">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <p class="font-bold text-lg">${o.fullName}</p>
                                            <p class="text-gray-400 text-sm font-mono">${o.phone}</p>
                                        </div>
                                        <span class="text-xs text-gray-500">${new Date(o.date).toLocaleDateString()}</span>
                                    </div>
                                    <div class="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center">
                                        <p class="text-white font-medium">${o.productName}</p>
                                        <a href="https://wa.me/216${o.phone}?text=Bonjour ${o.fullName}, confirmation commande ${o.productName}..." target="_blank" class="text-green-400 text-xs hover:underline">WHATSAPP ↗</a>
                                    </div>
                                </div>
                            `).join('')}
                            ${orders.length === 0 ? '<p class="text-gray-600 italic">Aucune commande pour le moment.</p>' : ''}
                        </div>
                    </div>

                    <div>
                        <h2 class="text-xl font-bold mb-4 text-blue-500">STOCK EN LIGNE</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            ${products.map(p => `
                                <div class="bg-gray-800 p-3 rounded border border-gray-700 relative group">
                                    <div class="h-40 overflow-hidden rounded mb-2 bg-black">
                                        <img src="${p.image}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition">
                                    </div>
                                    <h3 class="font-bold text-sm truncate">${p.name}</h3>
                                    <p class="text-gray-400 text-xs mb-2">${p.price}</p>
                                    <form action="/admin/delete" method="POST" class="absolute top-2 right-2">
                                        <input type="hidden" name="id" value="${p._id}">
                                        <button type="submit" class="bg-red-500/80 hover:bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs shadow-lg">✕</button>
                                    </form>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
        res.send(html);
        return;
    }

    // Si Login Ghalet, otlob Mot de passe
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
});

// ACTIONS ADMIN
app.post('/admin/add', async (req, res) => {
    await new Product({
        name: req.body.name,
        price: req.body.price,
        image: req.body.image
    }).save();
    res.redirect('/admin');
});

app.post('/admin/delete', async (req, res) => {
    await Product.findByIdAndDelete(req.body.id);
    res.redirect('/admin');
});

// START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
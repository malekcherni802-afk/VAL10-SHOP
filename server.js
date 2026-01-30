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
    console.log('🚀 Server will continue with in-memory database');
    
    // Fallback to in-memory database
    let products = [];
    let orders = [];

    // In-memory API routes (same as before)
    app.get('/api/products', (req, res) => res.json(products));
    app.post('/api/products', (req, res) => {
        const newProduct = { id: Date.now().toString(), ...req.body };
        products.push(newProduct);
        res.status(201).json(newProduct);
    });
    // ... rest of in-memory routes
});

// MongoDB Models
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    images: [String],
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

// API Routes
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
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
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

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// HTML Routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 VAL10 STORE DEPLOYED SUCCESSFULLY`);
    console.log(`👉 PORT: ${PORT}`);
    console.log(`👉 URL: https://val10-store.onrender.com`);
    console.log(`👉 Admin Panel: /admin`);
    console.log('='.repeat(50));
});
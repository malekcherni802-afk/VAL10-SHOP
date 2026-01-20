const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// --- INITIALIZATION ---
dotenv.config();
const app = express();

// --- MIDDLEWARES (Security & Parsing) ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.set('strictQuery', false);
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('--------------------------------------------');
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
    console.log('📡 SERVER READY FOR VAL10 OPERATIONS');
    console.log('--------------------------------------------');
})
.catch(err => {
    console.error('❌ DATABASE CONNECTION ERROR:', err);
});

// --- SCHEMAS & MODELS ---

// 1. Product Schema
const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Product name is required'],
        trim: true
    },
    price: { 
        type: Number, 
        required: [true, 'Price is required'] 
    },
    description: { 
        type: String, 
        default: 'No description provided' 
    },
    image: { 
        type: String, 
        default: '' 
    },
    images: { 
        type: [String], 
        default: [] 
    },
    sizes: { 
        type: [String], 
        default: ['S', 'M', 'L', 'XL'] 
    },
    category: { 
        type: String, 
        default: 'Archive' 
    },
    inStock: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// 2. Order Schema
const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending' 
    },
    orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// --- API ROUTES ---

// --- [PRODUCTS SECTION] ---

// GET: All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching products' });
    }
});

// GET: Single Product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Invalid ID format' });
    }
});

// POST: Add New Product
app.post('/api/products', async (req, res) => {
    try {
        console.log('Attempting to save product:', req.body.name);
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error('Error saving product:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT: Update Product (The Edit Route)
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedProduct) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE: Remove Product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ success: false, message: 'Product not found' });
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete operation failed' });
    }
});

// --- [ORDERS SECTION] ---

// POST: Submit New Order
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json({ success: true, data: savedOrder });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Order submission failed' });
    }
});

// GET: All Orders (Admin Panel)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Could not retrieve orders' });
    }
});

// DELETE: Remove Order (When Done)
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Order archived/deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete operation failed' });
    }
});

// --- FALLBACK FOR FRONTEND ---
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 VAL10 SERVER RUNNING ON PORT: ${PORT}`);
    console.log(`🌐 NODE_ENV: ${process.env.NODE_ENV || 'production'}`);
});
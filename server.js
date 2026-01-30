const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const app = express();

/**
 * MIDDLEWARE CONFIGURATION
 * Handles CORS, JSON limits for images, and static files
 */
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * CLOUDINARY CONFIGURATION
 * Direct access using your specific credentials
 */
cloudinary.config({
    cloud_name: 'dcdgsmiyy',
    api_key: '266384214227742',
    api_secret: 'R-N0hD_lD1G2NqLqQ_lH0hD_lD1' 
});

/**
 * IN-MEMORY DATABASE FALLBACK
 * Keeps the site running if MongoDB Atlas connection drops
 */
let products = [];
let orders = [];

/**
 * MONGODB ATLAS CONNECTION
 */
const DB_URL = process.env.MONGODB_URI || "mongodb+srv://vallo:vallo10@vallo.mongodb.net/val10?retryWrites=true&w=majority";

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('--------------------------------------');
    console.log('✅ DATABASE: MONGODB ATLAS CONNECTED');
    console.log('--------------------------------------');
})
.catch(err => {
    console.error('❌ DATABASE: CONNECTION FAILED');
    console.log('🚀 STATUS: RUNNING ON IN-MEMORY BACKUP');
});

/**
 * DATA MODELS (SCHEMAS)
 */
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

// ==========================================
// API ROUTES - PRODUCTS
// ==========================================

// GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
    try {
        const dbProducts = await Product.find().sort({ createdAt: -1 });
        if (dbProducts && dbProducts.length > 0) {
            return res.json(dbProducts);
        }
        res.json(products);
    } catch (error) {
        console.error('API Error:', error);
        res.json(products);
    }
});

// POST NEW PRODUCT (WITH CLOUDINARY UPLOAD LOGIC)
app.post('/api/products', async (req, res) => {
    try {
        const { name, price, description, images, sizes, category } = req.body;
        
        // Cloudinary Image Processing
        const uploadedImagesUrls = await Promise.all(
            images.map(async (image) => {
                if (image.startsWith('data:image')) {
                    const uploadResponse = await cloudinary.uploader.upload(image, {
                        folder: 'val10_archive'
                    });
                    return uploadResponse.secure_url;
                }
                return image;
            })
        );

        const newProduct = new Product({
            name,
            price,
            description,
            images: uploadedImagesUrls,
            sizes,
            category
        });

        await newProduct.save();
        res.status(201).json(newProduct);

    } catch (error) {
        console.error('Creation Failed:', error);
        const fallbackProduct = { ...req.body, _id: Date.now().toString(), createdAt: new Date() };
        products.push(fallbackProduct);
        res.status(201).json(fallbackProduct);
    }
});

// DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Deleted from Atlas' });
    } catch (error) {
        products = products.filter(p => p._id !== req.params.id);
        res.json({ success: true, message: 'Deleted from local memory' });
    }
});

// ==========================================
// API ROUTES - ORDERS
// ==========================================

// GET ALL ORDERS
app.get('/api/orders', async (req, res) => {
    try {
        const dbOrders = await Order.find().sort({ createdAt: -1 });
        if (dbOrders && dbOrders.length > 0) {
            return res.json(dbOrders);
        }
        res.json(orders);
    } catch (error) {
        res.json(orders);
    }
});

// POST NEW ORDER
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        const memoryOrder = { ...req.body, _id: Date.now().toString(), createdAt: new Date() };
        orders.push(memoryOrder);
        res.status(201).json(memoryOrder);
    }
});

// DELETE ORDER
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order removed from database' });
    } catch (error) {
        orders = orders.filter(o => o._id !== req.params.id);
        res.json({ message: 'Order removed from memory' });
    }
});

// ==========================================
// STATIC NAVIGATION ROUTES
// ==========================================

// HOME PAGE (FIX FOR RENDER BLANK PAGE)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ADMIN PANEL
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// PRODUCT DETAIL PAGE
app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

// GLOBAL REDIRECT (CATCH-ALL)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * SERVER DEPLOYMENT
 */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`🚀 VAL10 SERVER: http://localhost:${PORT}`);
    console.log(`📡 STATUS: ACTIVE`);
    console.log(`======================================\n`);
});
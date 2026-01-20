const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ==================== MONGODB CONNECTION ====================
console.log('🔍 Checking environment variables...');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

// استخدام ANY URI متوفر
const DB_URL = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!DB_URL) {
    console.error('❌ CRITICAL: No MongoDB connection string found!');
    console.log('📝 Using fallback local database...');
    
    // قاعدة بيانات مؤقتة في الذاكرة
    let productsDB = [];
    let ordersDB = [];
    
    // ============ MOCK API ROUTES ============
    app.get('/api/products', (req, res) => {
        console.log('📦 Returning', productsDB.length, 'products');
        res.json(productsDB);
    });
    
    app.get('/api/products/:id', (req, res) => {
        const product = productsDB.find(p => p.id === req.params.id);
        res.json(product || { error: 'Not found' });
    });
    
    app.post('/api/products', (req, res) => {
        const newProduct = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date()
        };
        productsDB.push(newProduct);
        console.log('✅ Product added:', newProduct.name);
        res.status(201).json(newProduct);
    });
    
    app.put('/api/products/:id', (req, res) => {
        const index = productsDB.findIndex(p => p.id === req.params.id);
        if (index > -1) {
            productsDB[index] = { ...productsDB[index], ...req.body };
            res.json(productsDB[index]);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    });
    
    app.delete('/api/products/:id', (req, res) => {
        productsDB = productsDB.filter(p => p.id !== req.params.id);
        res.json({ message: 'Deleted' });
    });
    
    app.get('/api/orders', (req, res) => {
        res.json(ordersDB);
    });
    
    app.post('/api/orders', (req, res) => {
        const newOrder = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date()
        };
        ordersDB.push(newOrder);
        console.log('🛒 Order received:', newOrder.customerName);
        res.status(201).json({ success: true, order: newOrder });
    });
    
    app.delete('/api/orders/:id', (req, res) => {
        ordersDB = ordersDB.filter(o => o.id !== req.params.id);
        res.json({ message: 'Deleted' });
    });
    
    console.log('✅ Using in-memory database (fallback mode)');
    
} else {
    // ============ REAL MONGODB CONNECTION ============
    console.log('🔗 Connecting to MongoDB...');
    console.log('Connection string (first 60 chars):', DB_URL.substring(0, 60) + '...');
    
    // تحسين إعدادات الاتصال
    const mongooseOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // 10 ثواني
        socketTimeoutMS: 45000, // 45 ثانية
        family: 4 // استخدام IPv4 فقط
    };
    
    mongoose.connect(DB_URL, mongooseOptions)
    .then(() => {
        console.log('✅ MongoDB: CONNECTED SUCCESSFULLY');
        console.log('📊 Database:', mongoose.connection.name);
        console.log('🏠 Host:', mongoose.connection.host);
    })
    .catch(err => {
        console.error('❌ MONGODB CONNECTION ERROR:', err.message);
        console.log('⚠️ Server will run in fallback mode');
    });
    
    // ============ MONGOOSE MODELS ============
    const productSchema = new mongoose.Schema({
        name: { type: String, required: true },
        price: { type: Number, required: true },
        description: String,
        images: [String],
        sizes: [String],
        category: { type: String, default: 'Underground' },
        createdAt: { type: Date, default: Date.now }
    }, { timestamps: true });
    
    const orderSchema = new mongoose.Schema({
        customerName: { type: String, required: true },
        customerPhone: { type: String, required: true },
        customerAddress: { type: String, required: true },
        productName: { type: String, required: true },
        size: { type: String, required: true },
        totalPrice: { type: Number, required: true },
        status: { type: String, default: 'Pending' },
        createdAt: { type: Date, default: Date.now }
    }, { timestamps: true });
    
    const Product = mongoose.model('Product', productSchema);
    const Order = mongoose.model('Order', orderSchema);
    
    // ============ REAL API ROUTES ============
    // Get all products
    app.get('/api/products', async (req, res) => {
        try {
            const products = await Product.find().sort({ createdAt: -1 });
            console.log(`📦 Sending ${products.length} products`);
            res.json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    });
    
    // Get single product
    app.get('/api/products/:id', async (req, res) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({ error: 'Failed to fetch product' });
        }
    });
    
    // Create product
    app.post('/api/products', async (req, res) => {
        try {
            const product = new Product(req.body);
            await product.save();
            console.log('✅ Product created:', product.name);
            res.status(201).json(product);
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(400).json({ error: 'Failed to create product' });
        }
    });
    
    // Update product
    app.put('/api/products/:id', async (req, res) => {
        try {
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            console.log('✏️ Product updated:', product.name);
            res.json(product);
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(400).json({ error: 'Failed to update product' });
        }
    });
    
    // Delete product
    app.delete('/api/products/:id', async (req, res) => {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            console.log('🗑️ Product deleted:', req.params.id);
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    });
    
    // Get all orders
    app.get('/api/orders', async (req, res) => {
        try {
            const orders = await Order.find().sort({ createdAt: -1 });
            console.log(`🛒 Sending ${orders.length} orders`);
            res.json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    });
    
    // Create order
    app.post('/api/orders', async (req, res) => {
        try {
            const order = new Order(req.body);
            await order.save();
            console.log('🛍️ Order created for:', order.customerName);
            res.status(201).json({ success: true, order });
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(400).json({ error: 'Failed to create order' });
        }
    });
    
    // Delete order
    app.delete('/api/orders/:id', async (req, res) => {
        try {
            const order = await Order.findByIdAndDelete(req.params.id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            console.log('🗑️ Order deleted:', req.params.id);
            res.json({ message: 'Order deleted successfully' });
        } catch (error) {
            console.error('Error deleting order:', error);
            res.status(500).json({ error: 'Failed to delete order' });
        }
    });
}

// ==================== HTML ROUTES ====================
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 VAL10 SERVER RUNNING ON PORT ${PORT}`);
    console.log(`👉 Store: http://localhost:${PORT}`);
    console.log(`👉 Admin: http://localhost:${PORT}/admin`);
    console.log('='.repeat(50));
    console.log('📊 Status:', DB_URL ? 'Using MongoDB' : 'Using in-memory DB');
    console.log('='.repeat(50));
});
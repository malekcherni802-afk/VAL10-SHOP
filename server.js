require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const app = express();

// --- CONFIG CLOUDINARY ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'val10_products', allowed_formats: ['jpg', 'png', 'jpeg'] }
});
const upload = multer({ storage: storage });

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- DATABASE ---
const MONGOURI = process.env.MONGOURI || "mongodb+srv://val10:val10@cluster.mongodb.net/val10";
mongoose.connect(MONGOURI).then(() => console.log('✅ VAL10 DB Connected'));

// --- SCHEMAS ---
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, price: String, image: String, size: String, date: { type: Date, default: Date.now }
}));
const Order = mongoose.model('Order', new mongoose.Schema({
    fullName: String, phone: String, productName: String, date: { type: Date, default: Date.now }
}));

// --- 1. PUBLIC SITE (SWIPE) ---
app.get('/', async (req, res) => {
    const products = await Product.find().sort({ date: -1 });
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>VAL10 STORE</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .swipe { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 10px; padding: 20px; scrollbar-width: none; }
            .card { min-width: 85vw; scroll-snap-align: center; background: #0a0a0a; border-radius: 20px; overflow: hidden; border: 1px solid #1a1a1a; }
        </style>
    </head>
    <body class="bg-black text-white">
        <header class="p-8 text-center"><h1 class="text-5xl font-black italic text-yellow-500 tracking-tighter">VAL10</h1></header>
        <div class="swipe">
            ${products.map(p => `
                <div class="card shadow-2xl">
                    <img src="${p.image}" class="w-full h-[400px] object-cover">
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-2">
                            <h2 class="text-2xl font-bold uppercase">${p.name}</h2>
                            <span class="bg-yellow-500 text-black px-2 py-1 rounded text-[10px] font-black">${p.size}</span>
                        </div>
                        <p class="text-3xl font-black text-gray-200">${p.price} <span class="text-sm font-normal">DT</span></p>
                        <button onclick="order('${p.name}')" class="w-full mt-6 bg-white text-black font-black py-4 rounded-xl active:scale-95 transition">BUY NOW</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <script>
            function order(n){
                let u=prompt("Full Name:"), p=prompt("Phone:");
                if(u && p) fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fullName:u,phone:p,productName:n})}).then(()=>alert("✅ Done!"));
            }
        </script>
    </body>
    </html>`;
    res.send(html);
});

// --- 2. ADMIN PANEL (WITH UPLOAD) ---
app.get('/admin', async (req, res) => {
    const auth = { user: 'admin', pass: process.env.ADMIN_PASS || 'val10boss' };
    const b64 = (req.headers.authorization || '').split(' ')[1] || '';
    const [u, p] = Buffer.from(b64, 'base64').toString().split(':');

    if (u === auth.user && p === auth.pass) {
        const prods = await Product.find().sort({ date: -1 });
        const ords = await Order.find().sort({ date: -1 });

        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.tailwindcss.com"></script>
            <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body class="bg-gray-950 text-white p-4">
            <h1 class="text-yellow-500 font-black text-2xl mb-6">VAL10 DASHBOARD</h1>

            <div class="bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-8">
                <h2 class="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Add New Drop</h2>
                <form action="/admin/add" method="POST" enctype="multipart/form-data" class="grid gap-4">
                    <input name="name" placeholder="Product Name" class="bg-black p-3 rounded-lg border border-gray-700" required>
                    <div class="grid grid-cols-2 gap-4">
                        <input name="price" placeholder="Price (ex: 85)" class="bg-black p-3 rounded-lg border border-gray-700" required>
                        <input name="size" placeholder="Size (ex: S,M,L)" class="bg-black p-3 rounded-lg border border-gray-700" required>
                    </div>
                    <label class="bg-gray-800 border-2 border-dashed border-gray-700 p-4 rounded-lg text-center cursor-pointer hover:border-yellow-500">
                        <span class="text-gray-400">Click to Upload Photo</span>
                        <input type="file" name="image" class="hidden" required>
                    </label>
                    <button class="bg-yellow-500 text-black font-black py-4 rounded-xl uppercase">Publish Product</button>
                </form>
            </div>

            <div class="grid gap-8">
                <div>
                    <h3 class="text-blue-500 font-bold mb-4 uppercase text-xs">Orders (${ords.length})</h3>
                    <div class="grid gap-2">
                        ${ords.map(o => `<div class="bg-black p-4 rounded-lg flex justify-between items-center border border-gray-900">
                            <div><p class="font-bold text-sm">${o.fullName}</p><p class="text-yellow-500 text-xs">${o.phone}</p></div>
                            <button onclick="delO('${o._id}')" class="text-red-500 text-xs">✕</button>
                        </div>`).join('')}
                    </div>
                </div>
            </div>
            <script>
                async function delO(id){ if(confirm('Delete?')){ await fetch('/api/orders/'+id,{method:'DELETE'}); location.reload(); }}
            </script>
        </body>
        </html>`;
        res.send(html);
        return;
    }
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Admin Access Only');
});

// --- API & ACTIONS ---
app.post('/admin/add', upload.single('image'), async (req, res) => {
    try {
        await new Product({
            name: req.body.name,
            price: req.body.price,
            size: req.body.size,
            image: req.file.path // URL mta3 Cloudinary
        }).save();
        res.redirect('/admin');
    } catch(e) { res.send("Error: " + e.message); }
});

app.post('/api/order', async (req, res) => { await new Order(req.body).save(); res.json({ok:true}); });
app.delete('/api/orders/:id', async (req, res) => { await Order.findByIdAndDelete(req.params.id); res.json({ok:true}); });

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('🚀 VAL10 CLOUD READY'));
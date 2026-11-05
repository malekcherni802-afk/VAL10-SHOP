'use strict';

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const webpush = require('web-push');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Render terminates TLS at its edge.

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 10000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_BODY_SIZE = '15mb';
const MAX_IMAGE_LENGTH = 10 * 1024 * 1024;
const ORDER_RATE_WINDOW_MS = 10 * 60 * 1000;
const ORDER_RATE_MAX = 10;
const orderRateBuckets = new Map();

// Basic security headers. A strict CSP is intentionally not imposed because
// the current storefront uses inline scripts/styles and trusted CDNs.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  if (req.path === '/admin' || req.path.startsWith('/admin/') || req.path === '/admin.html') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
  }
  if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(express.json({ limit: MAX_BODY_SIZE, strict: true }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function requireAdminAuth(req, res, next) {
  const configuredUser = process.env.ADMIN_USER;
  const configuredPass = process.env.ADMIN_PASS;
  const header = req.get('authorization') || '';

  if (!configuredUser || !configuredPass || !header.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="VAL10 Admin", charset="UTF-8"');
    return res.status(401).send('Authentication required.');
  }

  let decoded = '';
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch (_) {
    decoded = '';
  }
  const separator = decoded.indexOf(':');
  if (separator < 1) {
    res.set('WWW-Authenticate', 'Basic realm="VAL10 Admin", charset="UTF-8"');
    return res.status(401).send('Authentication required.');
  }

  const user = decoded.slice(0, separator);
  const pass = decoded.slice(separator + 1);
  if (safeEqual(user, configuredUser) && safeEqual(pass, configuredPass)) return next();

  res.set('WWW-Authenticate', 'Basic realm="VAL10 Admin", charset="UTF-8"');
  return res.status(401).send('Invalid credentials.');
}

// Mutating admin calls are same-origin only. This blocks browser-based CSRF
// attempts against the Basic-Auth protected endpoints.
function requireSameOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin) return res.status(403).json({ error: 'Origin check failed.' });
  try {
    const parsed = new URL(origin);
    if (parsed.host !== req.get('host')) return res.status(403).json({ error: 'Cross-origin request blocked.' });
    if (IS_PRODUCTION && parsed.protocol !== 'https:') return res.status(403).json({ error: 'HTTPS is required.' });
    return next();
  } catch (_) {
    return res.status(403).json({ error: 'Invalid request origin.' });
  }
}

function requireValidObjectId(id, res) {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid record ID.' });
    return false;
  }
  return true;
}

function escHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanText(value, field, maxLength, required = false) {
  if (typeof value !== 'string') throw new Error(`${field} must be text.`);
  const cleaned = value.trim();
  if (required && !cleaned) throw new Error(`${field} is required.`);
  if (cleaned.length > maxLength) throw new Error(`${field} is too long.`);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(cleaned)) throw new Error(`${field} contains invalid characters.`);
  return cleaned;
}

function cleanImageSource(value, field = 'Image') {
  if (value == null || value === '') return '';
  if (typeof value !== 'string' || value.length > MAX_IMAGE_LENGTH) throw new Error(`${field} is too large or invalid.`);
  const trimmed = value.trim();
  const validDataImage = /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(trimmed);
  let validHttps = false;
  if (/^https:\/\//i.test(trimmed)) {
    try { validHttps = new URL(trimmed).protocol === 'https:'; } catch (_) { validHttps = false; }
  }
  const validLocal = trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\') && !/[\"'<>\s]/.test(trimmed);
  if (!validDataImage && !validHttps && !validLocal) throw new Error(`${field} must be an HTTPS URL, a local path, or a supported image data URL.`);
  return validHttps ? new URL(trimmed).toString() : trimmed;
}

function cleanLink(value) {
  if (value == null || value === '') return '/';
  const link = cleanText(String(value), 'Banner link', 1000, false);
  if (link.startsWith('/') && !link.startsWith('//') && !link.includes('\\')) return link;
  if (link.startsWith('#')) return link;
  try {
    const parsed = new URL(link);
    if (parsed.protocol === 'https:') return parsed.toString();
  } catch (_) { /* invalid URL */ }
  throw new Error('Banner links must be local paths, page anchors, or HTTPS URLs.');
}

function normalizeSizes(sizes) {
  if (!Array.isArray(sizes)) return [];
  return sizes.map((item) => {
    if (typeof item === 'string') return { size: item.trim(), stock: 1 };
    if (!item || typeof item !== 'object') return null;
    return { size: String(item.size || '').trim(), stock: Number(item.stock) || 0 };
  }).filter((item) => item && item.size);
}

function sanitizeProductPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid product payload.');
  const name = cleanText(body.name, 'Product name', 120, true);
  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0 || price > 10000000) throw new Error('Price must be a positive valid amount.');

  const sizesInput = body.sizes == null ? [] : body.sizes;
  const colorsInput = body.colors == null ? [] : body.colors;
  const imagesInput = body.images == null ? [] : body.images;
  if (!Array.isArray(sizesInput) || sizesInput.length > 40) throw new Error('Invalid product sizes.');
  if (!Array.isArray(colorsInput) || colorsInput.length > 30) throw new Error('Invalid product colors.');
  if (!Array.isArray(imagesInput) || imagesInput.length > 30) throw new Error('Invalid product images.');

  const sizes = normalizeSizes(sizesInput).map((item) => {
    const size = cleanText(item.size, 'Size', 24, true);
    const stock = Number(item.stock);
    if (!Number.isInteger(stock) || stock < 0 || stock > 100000) throw new Error(`Invalid stock for size ${size}.`);
    return { size, stock };
  });

  const colors = colorsInput.map((color, index) => {
    if (!color || typeof color !== 'object') throw new Error(`Invalid color variant #${index + 1}.`);
    const colorName = cleanText(color.name, `Color #${index + 1} name`, 50, true);
    const hex = cleanText(color.hex, `Color #${index + 1} hex`, 7, true);
    const stock = Number(color.stock);
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`Color #${index + 1} has an invalid hex code.`);
    if (!Number.isInteger(stock) || stock < 0 || stock > 100000) throw new Error(`Color #${index + 1} has invalid stock.`);
    return { name: colorName, hex, image: cleanImageSource(color.image, `Color #${index + 1} image`), stock };
  });

  const images = imagesInput.map((image, index) => cleanImageSource(image, `Product image #${index + 1}`)).filter(Boolean);
  return {
    name,
    price,
    category: cleanText(body.category == null ? 'Underground' : String(body.category), 'Category', 80, false) || 'Underground',
    description: cleanText(body.description == null ? '' : String(body.description), 'Description', 5000, false),
    sizes,
    colors,
    images
  };
}

function productToPublic(product) {
  const obj = product.toObject ? product.toObject() : { ...product };
  obj.sizes = normalizeSizes(obj.sizes);
  obj.images = Array.isArray(obj.images) ? obj.images.map((image) => {
    try { return cleanImageSource(image, 'Product image'); } catch (_) { return ''; }
  }).filter(Boolean) : [];
  obj.colors = Array.isArray(obj.colors) ? obj.colors.map((color) => {
    let safeImage = '';
    try { safeImage = cleanImageSource(color.image, 'Color image'); } catch (_) { /* hide invalid legacy image URLs */ }
    return { ...color, image: safeImage, availability: Number(color.stock) > 0 ? 'In Stock' : 'Sold Out' };
  }) : [];
  const sizeAvailable = obj.sizes.length ? obj.sizes.some((size) => size.stock > 0) : true;
  const colorAvailable = obj.colors.length ? obj.colors.some((color) => color.stock > 0) : true;
  obj.hasStock = sizeAvailable && colorAvailable;
  return obj;
}

function parsePagination(query, defaultLimit) {
  const rawPage = Number.parseInt(query.page, 10);
  const rawLimit = Number.parseInt(query.limit, 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 100000) : 1;
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : defaultLimit;
  return { page, limit, skip: (page - 1) * limit };
}

function rateLimitOrders(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  let bucket = orderRateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + ORDER_RATE_WINDOW_MS };
    orderRateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > ORDER_RATE_MAX) {
    res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Too many order attempts. Please try again shortly.' });
  }
  return next();
}
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of orderRateBuckets) if (now >= bucket.resetAt) orderRateBuckets.delete(key);
}, 5 * 60 * 1000).unref();

// Admin pages and all /admin/* endpoints share this authentication boundary.
app.use('/admin', requireAdminAuth);
app.get('/admin.html', requireAdminAuth, (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});
app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin.html')));

// ─── MongoDB ────────────────────────────────────────────────────────────────────
const DB_URL = process.env.MONGODB_URI;
if (!DB_URL) {
  console.error('MONGODB_URI is missing. Add it in Render → Environment.');
  process.exit(1);
}
if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS || process.env.ADMIN_PASS.length < 16) {
  console.error('ADMIN_USER and a strong ADMIN_PASS (at least 16 characters) are required.');
  process.exit(1);
}

mongoose.connect(DB_URL, { serverSelectionTimeoutMS: 15000 })
  .then(async () => {
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    try {
      // Convert historical size strings (e.g. ["S", "M"]) to stock records.
      const legacyDocs = await Product.find({ sizes: { $elemMatch: { $type: 'string' } } });
      for (const doc of legacyDocs) {
        doc.sizes = normalizeSizes(doc.sizes);
        await doc.save();
      }
      if (legacyDocs.length) console.log(`Migrated legacy sizes on ${legacyDocs.length} product(s).`);
    } catch (migrationError) {
      console.error('Legacy size migration failed:', migrationError.message);
    }
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`VAL10 storefront listening on port ${PORT}.`);
      console.log('Admin panel: /admin (HTTP Basic Auth protected).');
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });

// ─── Schemas ────────────────────────────────────────────────────────────────────
const colorVariantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  hex: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
  image: { type: String, default: '' },
  stock: { type: Number, required: true, min: 0, max: 100000, default: 0 }
}, { _id: false, strict: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  price: { type: Number, required: true, min: 0.001, max: 10000000 },
  description: { type: String, default: '', maxlength: 5000 },
  // Mixed retains compatibility with old string-size records during migration.
  sizes: { type: [mongoose.Schema.Types.Mixed], default: [] },
  category: { type: String, default: 'Underground', maxlength: 80 },
  colors: { type: [colorVariantSchema], default: [] },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
}, { strict: true, versionKey: false });

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, maxlength: 100 },
  customerPhone: { type: String, required: true, trim: true, maxlength: 16 },
  customerAddress: { type: String, required: true, trim: true, maxlength: 500 },
  productId: { type: String, required: true },
  colorIndex: { type: Number, default: -1 },
  productName: { type: String, required: true, maxlength: 120 },
  size: { type: String, required: true, maxlength: 24 },
  colorName: { type: String, default: '', maxlength: 50 },
  totalPrice: { type: Number, required: true, min: 0.001 },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  stockTracked: { type: Boolean, default: false },
  stockReserved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { strict: true, versionKey: false });

const slideSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: '/' },
  caption: { type: String, default: '', maxlength: 240 }
}, { _id: false, strict: true });
const bannerSchema = new mongoose.Schema({
  slides: { type: [slideSchema], default: [] },
  updatedAt: { type: Date, default: Date.now }
}, { strict: true, versionKey: false });

const pushSubscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },
  userAgent: { type: String, default: '', maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: true, versionKey: false });

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Banner = mongoose.model('Banner', bannerSchema);
const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);

// Move stock for an order inside the caller's MongoDB transaction.
// direction = -1 reserves stock; direction = +1 releases a reservation.
async function adjustInventoryForOrder(order, direction, session) {
  if (!order.stockTracked) return true;
  const product = await Product.findById(order.productId).session(session);
  if (!product) return false;

  const sizes = normalizeSizes(product.sizes);
  const colors = product.colors || [];
  let sizeIndex = -1;
  const colorIndex = Number(order.colorIndex);

  if (sizes.length) {
    sizeIndex = sizes.findIndex((item) => item.size === order.size);
    if (sizeIndex < 0) return false;
    if (direction < 0 && sizes[sizeIndex].stock <= 0) {
      const error = new Error('There is no remaining stock for this size.');
      error.statusCode = 409;
      throw error;
    }
  }

  let currentColorStock = 0;
  if (colorIndex >= 0) {
    if (!colors[colorIndex] || (order.colorName && colors[colorIndex].name !== order.colorName)) return false;
    currentColorStock = Number(colors[colorIndex].stock) || 0;
    if (direction < 0 && currentColorStock <= 0) {
      const error = new Error('There is no remaining stock for this colour.');
      error.statusCode = 409;
      throw error;
    }
  }

  if (sizeIndex >= 0) {
    sizes[sizeIndex].stock += direction;
    product.sizes = sizes;
    product.markModified('sizes');
  }
  if (colorIndex >= 0) colors[colorIndex].stock = currentColorStock + direction;
  await product.save({ session });
  return true;
}

// ─── Web Push ────────────────────────────────────────────────────────────────────
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || '';
let pushConfigured = false;
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT.startsWith('mailto:')) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    pushConfigured = true;
    console.log('Web Push configured.');
  } catch (error) {
    console.error('Web Push configuration error:', error.message);
  }
} else {
  console.log('Web Push not configured; add VAPID keys and a mailto: subject to Render.');
}

async function sendNewOrderPush(order) {
  if (!pushConfigured) return;
  try {
    const subscriptions = await PushSubscription.find().lean();
    if (!subscriptions.length) return;
    const orderId = String(order._id);
    const shortId = orderId.slice(-6).toUpperCase();
    const payload = JSON.stringify({
      title: 'VAL10 — New Order',
      body: `Order #${shortId} · ${order.productName} · ${order.totalPrice} TND`,
      icon: '/icons/valio-192.png',
      badge: '/icons/valio-96.png',
      tag: `val10-order-${orderId}`,
      orderId,
      url: `/admin?section=orders&orderId=${encodeURIComponent(orderId)}`
    });
    const results = await Promise.allSettled(subscriptions.map(async (saved) => {
      try {
        await webpush.sendNotification({ endpoint: saved.endpoint, keys: saved.keys }, payload, { TTL: 86400, urgency: 'high' });
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) await PushSubscription.deleteOne({ _id: saved._id });
        throw error;
      }
    }));
    const failed = results.filter((result) => result.status === 'rejected').length;
    if (failed) console.warn(`Web Push delivery failed for ${failed}/${subscriptions.length} device(s).`);
  } catch (error) {
    // The saved order is never rolled back because a push provider is unavailable.
    console.error('Web Push delivery error:', error.message);
  }
}

// ─── Public storefront API ──────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 100);
    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments()
    ]);
    res.json({ products: products.map(productToPublic), total, page, limit });
  } catch (error) {
    console.error('GET /api/products failed:', error.message);
    res.status(500).json({ error: 'Unable to load products.' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  if (!requireValidObjectId(req.params.id, res)) return;
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(productToPublic(product));
  } catch (error) {
    console.error('GET product failed:', error.message);
    res.status(500).json({ error: 'Unable to load this product.' });
  }
});

app.get('/api/banner', async (req, res) => {
  try {
    const banner = await Banner.findOne().sort({ updatedAt: -1 }).lean();
    const slides = (banner && Array.isArray(banner.slides) ? banner.slides : []).flatMap((slide) => {
      try {
        return [{
          imageUrl: cleanImageSource(slide.imageUrl, 'Banner image'),
          linkUrl: cleanLink(slide.linkUrl),
          caption: String(slide.caption || '').slice(0, 240)
        }];
      } catch (_) { return []; }
    });
    res.json({ slides });
  } catch (error) {
    console.error('GET banner failed:', error.message);
    res.status(500).json({ error: 'Unable to load the storefront banner.' });
  }
});

// The public confirmation endpoint intentionally returns no customer PII.
app.get('/api/storefront-settings', (req, res) => {
  const externalUrl = (value) => {
    try { const url = new URL(String(value || '')); return url.protocol === 'https:' ? url.toString() : ''; }
    catch (_) { return ''; }
  };
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.STORE_CONTACT_EMAIL || '')
    ? process.env.STORE_CONTACT_EMAIL : '';
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.json({
    instagram: externalUrl(process.env.STORE_INSTAGRAM_URL),
    tiktok: externalUrl(process.env.STORE_TIKTOK_URL),
    contactEmail: email
  });
});

app.get('/api/orders/:id', async (req, res) => {
  if (!requireValidObjectId(req.params.id, res)) return;
  try {
    const order = await Order.findById(req.params.id)
      .select('_id productName size colorName totalPrice createdAt')
      .lean();
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json(order);
  } catch (error) {
    console.error('GET confirmation order failed:', error.message);
    res.status(500).json({ error: 'Unable to load order confirmation.' });
  }
});

// ─── Admin API (all endpoints are under authenticated /admin) ───────────────────
app.get('/admin/api/products', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 200);
    const [products, total] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments()
    ]);
    res.json({ products: products.map(productToPublic), total, page, limit });
  } catch (error) {
    console.error('Admin GET products failed:', error.message);
    res.status(500).json({ error: 'Unable to load products.' });
  }
});

app.post('/admin/api/products', requireSameOrigin, async (req, res) => {
  try {
    const product = new Product(sanitizeProductPayload(req.body));
    await product.save();
    res.status(201).json(productToPublic(product));
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to save product.' });
  }
});

app.put('/admin/api/products/:id', requireSameOrigin, async (req, res) => {
  if (!requireValidObjectId(req.params.id, res)) return;
  try {
    const payload = sanitizeProductPayload(req.body);
    const activeOrders = await Order.find({
      productId: req.params.id,
      status: { $in: ['Pending', 'Confirmed'] },
      stockTracked: true,
      stockReserved: true
    }).select('size colorIndex colorName').lean();

    for (const order of activeOrders) {
      if (order.size && order.size !== 'One Size' && !payload.sizes.some((variant) => variant.size === order.size)) {
        const error = new Error(`Cannot remove size ${order.size} while an active order is using it.`);
        error.statusCode = 409;
        throw error;
      }
      if (Number(order.colorIndex) >= 0) {
        const variant = payload.colors[Number(order.colorIndex)];
        if (!variant || (order.colorName && variant.name !== order.colorName)) {
          const error = new Error(`Cannot remove or reorder colour ${order.colorName || ''} while an active order is using it.`);
          error.statusCode = 409;
          throw error;
        }
      }
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true, overwrite: false }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found.' });
    res.json(productToPublic(updated));
  } catch (error) {
    const code = Number.isInteger(error.statusCode) ? error.statusCode : 400;
    res.status(code).json({ error: error.message || 'Unable to update product.' });
  }
});

app.delete('/admin/api/products/:id', requireSameOrigin, async (req, res) => {
  if (!requireValidObjectId(req.params.id, res)) return;
  try {
    const activeOrders = await Order.countDocuments({
      productId: req.params.id,
      status: { $in: ['Pending', 'Confirmed'] }
    });
    if (activeOrders > 0) {
      return res.status(409).json({ error: 'This product has pending or confirmed orders. Cancel or complete those orders before deleting the product.' });
    }
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (error) {
    console.error('Admin delete product failed:', error.message);
    res.status(500).json({ error: 'Unable to delete product.' });
  }
});

app.patch('/admin/api/products/:id/stock', requireSameOrigin, async (req, res) => {
  if (!requireValidObjectId(req.params.id, res)) return;
  const { colorIndex, stock, size } = req.body || {};
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) return res.status(400).json({ error: 'Stock must be a whole number between 0 and 100000.' });
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    if (Number.isInteger(colorIndex)) {
      if (!product.colors[colorIndex]) return res.status(400).json({ error: 'Color index is out of range.' });
      product.colors[colorIndex].stock = stock;
    } else if (typeof size === 'string') {
      const entry = normalizeSizes(product.sizes).find((item) => item.size === size);
      if (!entry) return res.status(404).json({ error: 'Size not found.' });
      product.sizes = normalizeSizes(product.sizes).map((item) => item.size === size ? { size, stock } : item);
    } else {
      return res.status(400).json({ error: 'Provide a colorIndex or size.' });
    }
    await product.save();
    res.json(productToPublic(product));
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to update stock.' });
  }
});

app.get('/admin/api/orders', async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 500);
    const [orders, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments()
    ]);
    res.json({ orders, total, page, limit });
  } catch (error) {
    console.error('Admin GET orders failed:', error.message);
    res.status(500).json({ error: 'Unable to load orders.' });
  }
});

app.put('/admin/api/orders/:id', requireSameOrigin, async (req, res) => {
  if (!requireValidObjectId(req.params.id, res)) return;
  const status = req.body && req.body.status;
  const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  if (!statuses.includes(status)) return res.status(400).json({ error: 'Invalid order status.' });

  let session;
  let updatedOrder;
  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);
      if (!order) {
        const error = new Error('Order not found.'); error.statusCode = 404; throw error;
      }
      if (order.status === status) { updatedOrder = order; return; }

      if (status === 'Cancelled' && ['Shipped', 'Delivered'].includes(order.status)) {
        const error = new Error('A shipped or delivered order cannot be cancelled here. Handle the return separately.');
        error.statusCode = 409;
        throw error;
      }

      if (order.stockTracked && status === 'Cancelled' && order.stockReserved) {
        const restored = await adjustInventoryForOrder(order, +1, session);
        if (!restored) console.warn(`Could not restore stock for cancelled order ${order._id}; its original variant was changed or deleted.`);
        order.stockReserved = false;
      } else if (order.stockTracked && order.status === 'Cancelled' && status !== 'Cancelled' && !order.stockReserved) {
        const reserved = await adjustInventoryForOrder(order, -1, session);
        if (!reserved) {
          const error = new Error('The original product or variant is no longer available. Update the product before reactivating this order.');
          error.statusCode = 409;
          throw error;
        }
        order.stockReserved = true;
      }

      order.status = status;
      await order.save({ session });
      updatedOrder = order;
    });
    res.json(updatedOrder);
  } catch (error) {
    const code = Number.isInteger(error.statusCode) ? error.statusCode : 400;
    console.error('Admin update order failed:', error.message);
    res.status(code).json({ error: error.statusCode ? error.message : 'Unable to update order status.' });
  } finally {
    if (session) await session.endSession();
  }
});

app.delete('/admin/api/orders/:id', requireSameOrigin, async (req, res) => {
  if (!requireValidObjectId(req.params.id, res)) return;
  let session;
  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);
      if (!order) {
        const error = new Error('Order not found.'); error.statusCode = 404; throw error;
      }
      if (order.stockTracked && order.stockReserved && ['Pending', 'Confirmed'].includes(order.status)) {
        const restored = await adjustInventoryForOrder(order, +1, session);
        if (!restored) console.warn(`Could not restore stock before deleting order ${order._id}; original variant is missing.`);
      }
      await Order.deleteOne({ _id: order._id }).session(session);
    });
    res.json({ message: 'Order deleted.' });
  } catch (error) {
    const code = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    console.error('Admin delete order failed:', error.message);
    res.status(code).json({ error: error.statusCode ? error.message : 'Unable to delete order.' });
  } finally {
    if (session) await session.endSession();
  }
});

app.get('/admin/api/banner', async (req, res) => {
  try {
    const banner = await Banner.findOne().sort({ updatedAt: -1 }).lean();
    res.json(banner || { slides: [] });
  } catch (error) {
    res.status(500).json({ error: 'Unable to load banner settings.' });
  }
});

app.post('/admin/api/banner', requireSameOrigin, async (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body.slides) || req.body.slides.length > 12) {
      return res.status(400).json({ error: 'Banner must contain an array of at most 12 slides.' });
    }
    const slides = req.body.slides.map((slide, index) => {
      if (!slide || typeof slide !== 'object') throw new Error(`Invalid banner slide #${index + 1}.`);
      return {
        imageUrl: cleanImageSource(slide.imageUrl, `Banner image #${index + 1}`),
        linkUrl: cleanLink(slide.linkUrl),
        caption: cleanText(slide.caption == null ? '' : String(slide.caption), `Banner caption #${index + 1}`, 240, false)
      };
    });
    if (slides.some((slide) => !slide.imageUrl)) return res.status(400).json({ error: 'Every banner slide needs an image.' });
    const banner = await Banner.findOneAndUpdate({}, { $set: { slides, updatedAt: new Date() } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json(banner);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to save banner.' });
  }
});

app.get('/admin/api/push/config', async (req, res) => {
  try {
    const subscriptionCount = await PushSubscription.countDocuments();
    res.json({ configured: pushConfigured, publicKey: pushConfigured ? VAPID_PUBLIC_KEY : null, subscriptionCount });
  } catch (_) {
    res.status(500).json({ error: 'Unable to read notification settings.' });
  }
});

app.post('/admin/api/push/subscriptions', requireSameOrigin, async (req, res) => {
  try {
    if (!pushConfigured) return res.status(503).json({ error: 'Web Push is not configured on the server yet.' });
    const subscription = req.body && req.body.subscription;
    const endpoint = subscription && subscription.endpoint;
    const keys = subscription && subscription.keys;
    if (typeof endpoint !== 'string' || endpoint.length > 3000 || !/^https:\/\//i.test(endpoint) ||
        !keys || typeof keys.p256dh !== 'string' || typeof keys.auth !== 'string' || keys.p256dh.length > 200 || keys.auth.length > 200) {
      return res.status(400).json({ error: 'Invalid browser push subscription.' });
    }
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { $set: { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth }, userAgent: String(req.body.userAgent || '').slice(0, 500), updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Save push subscription failed:', error.message);
    res.status(500).json({ error: 'Could not save notification subscription.' });
  }
});

app.delete('/admin/api/push/subscriptions', requireSameOrigin, async (req, res) => {
  try {
    const endpoint = req.body && req.body.endpoint;
    if (typeof endpoint !== 'string' || endpoint.length > 3000 || !/^https:\/\//i.test(endpoint)) {
      return res.status(400).json({ error: 'A valid subscription endpoint is required.' });
    }
    await PushSubscription.deleteOne({ endpoint });
    res.json({ ok: true });
  } catch (_) {
    res.status(500).json({ error: 'Could not remove notification subscription.' });
  }
});

// ─── Order creation ────────────────────────────────────────────────────────────
app.post('/api/orders', rateLimitOrders, async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Orders must be submitted as JSON.' });
  const body = req.body || {};
  let customerName, customerPhone, customerAddress;
  try {
    customerName = cleanText(body.customerName, 'Name', 100, true);
    customerAddress = cleanText(body.customerAddress, 'Address', 500, true);
    customerPhone = cleanText(body.customerPhone, 'Phone', 20, true).replace(/[\s-]/g, '');
    if (!/^(?:\+?216|00216)?[2-9]\d{7}$/.test(customerPhone)) return res.status(400).json({ error: 'Enter a valid Tunisian phone number (8 digits, optionally prefixed by +216).' });
    if (!mongoose.isValidObjectId(body.productId)) return res.status(400).json({ error: 'Invalid product.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Invalid order details.' });
  }

  const colorIndex = body.colorIndex == null ? -1 : Number(body.colorIndex);
  if (!Number.isInteger(colorIndex) || colorIndex < -1 || colorIndex > 29) return res.status(400).json({ error: 'Invalid color selection.' });
  const requestedSize = typeof body.size === 'string' ? body.size.trim() : '';

  let session;
  let order;
  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const product = await Product.findById(body.productId).session(session);
      if (!product) {
        const error = new Error('This product is no longer available.');
        error.statusCode = 404;
        throw error;
      }

      if (Array.isArray(product.sizes) && product.sizes.some((item) => typeof item === 'string')) {
        product.sizes = normalizeSizes(product.sizes);
        await product.save({ session });
      }
      const sizes = normalizeSizes(product.sizes);
      const colors = product.colors || [];
      let selectedSize = 'One Size';
      let selectedColor = null;

      if (sizes.length) {
        if (!requestedSize || requestedSize.length > 24) {
          const error = new Error('Please choose a size.'); error.statusCode = 400; throw error;
        }
        selectedSize = requestedSize;
        const sizeVariant = sizes.find((item) => item.size === selectedSize);
        if (!sizeVariant) { const error = new Error('Selected size is not valid.'); error.statusCode = 400; throw error; }
        if (sizeVariant.stock <= 0) { const error = new Error('Selected size is sold out.'); error.statusCode = 409; throw error; }
      }

      if (colors.length) {
        if (colorIndex < 0 || !colors[colorIndex]) { const error = new Error('Please choose a color.'); error.statusCode = 400; throw error; }
        selectedColor = colors[colorIndex];
        if (selectedColor.stock <= 0) { const error = new Error('Selected color is sold out.'); error.statusCode = 409; throw error; }
      }

      const filter = { _id: product._id };
      const update = { $inc: {} };
      const arrayFilters = [];
      if (colors.length) {
        filter[`colors.${colorIndex}.stock`] = { $gt: 0 };
        update.$inc[`colors.${colorIndex}.stock`] = -1;
      }
      if (sizes.length) {
        filter.sizes = { $elemMatch: { size: selectedSize, stock: { $gt: 0 } } };
        update.$inc['sizes.$[selectedSize].stock'] = -1;
        arrayFilters.push({ 'selectedSize.size': selectedSize, 'selectedSize.stock': { $gt: 0 } });
      }

      if (Object.keys(update.$inc).length) {
        const options = { new: true, session };
        if (arrayFilters.length) options.arrayFilters = arrayFilters;
        const updated = await Product.findOneAndUpdate(filter, update, options);
        if (!updated) { const error = new Error('This variant just sold out. Please refresh and choose another.'); error.statusCode = 409; throw error; }
      }

      order = new Order({
        customerName,
        customerPhone,
        customerAddress,
        productId: String(product._id),
        colorIndex: selectedColor ? colorIndex : -1,
        productName: product.name,
        size: selectedSize,
        colorName: selectedColor ? selectedColor.name : '',
        totalPrice: product.price,
        status: 'Pending',
        stockTracked: Boolean(colors.length || sizes.length),
        stockReserved: Boolean(colors.length || sizes.length)
      });
      await order.save({ session });
    });
  } catch (error) {
    const status = Number.isInteger(error.statusCode) ? error.statusCode : 400;
    console.error('Order creation failed:', error.message);
    const publicMessage = Number.isInteger(error.statusCode)
      ? error.message
      : 'Unable to place this order right now. Please try again.';
    return res.status(status).json({ error: publicMessage });
  } finally {
    if (session) await session.endSession();
  }

  // Send after the transaction committed; provider failure must not affect checkout.
  sendNewOrderPush(order).catch((error) => console.error('Unexpected push error:', error.message));
  return res.status(201).json({ _id: order._id, status: order.status, productName: order.productName, totalPrice: order.totalPrice });
});

// ─── HTML routes / static assets ────────────────────────────────────────────────
app.get('/product', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  let ogTitle = 'VAL10 | Archive Piece';
  let ogDesc = 'Underground luxury streetwear — VAL10 Store';
  let ogImage = '';
  const id = req.query.id;

  if (id && mongoose.isValidObjectId(id)) {
    try {
      const product = await Product.findById(id).lean();
      if (product) {
        ogTitle = `VAL10 | ${product.name}`;
        ogDesc = product.description || ogDesc;
        ogImage = product.colors?.[0]?.image || product.images?.[0] || '';
      }
    } catch (_) { /* render the standard product shell */ }
  }

  const fs = require('fs');
  const html = fs.readFileSync(path.join(PUBLIC_DIR, 'product.html'), 'utf8');
  const safeTitle = escHtml(ogTitle);
  const safeDesc = escHtml(ogDesc);
  const safeImage = ogImage ? escHtml(ogImage) : '';
  const ogTags = `<meta property="og:title" content="${safeTitle}" />\n` +
    `<meta property="og:description" content="${safeDesc}" />\n` +
    '<meta property="og:type" content="product" />\n' +
    (safeImage ? `<meta property="og:image" content="${safeImage}" />\n` : '') +
    `<meta name="description" content="${safeDesc}" />`;
  res.type('html').send(html.replace('<!-- OG_PLACEHOLDER -->', ogTags));
});

app.get('/confirmation', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'confirmation.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'terms.html')));
app.get('/shipping', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'shipping.html')));
app.use(express.static(PUBLIC_DIR, {
  index: 'index.html',
  dotfiles: 'ignore',
  etag: true,
  maxAge: IS_PRODUCTION ? '1h' : 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html') || filePath.endsWith('service-worker.js') || filePath.endsWith('manifest.webmanifest')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.use((req, res) => res.status(404).send('Not found.'));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error && error.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large. Please use smaller images.' });
  console.error('Unhandled server error:', error && error.message ? error.message : error);
  return res.status(500).json({ error: 'Unexpected server error.' });
});


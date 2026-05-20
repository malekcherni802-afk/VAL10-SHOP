require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const mongoose     = require('mongoose');
const rateLimit    = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ─── Security headers ──────────────────────────────────────── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

/* ─── CORS ──────────────────────────────────────────────────── */
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow no-origin requests (server-to-server, curl, Vercel SSR)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error('CORS: origin not allowed — ' + origin));
  },
  credentials: true,
}));

/* ─── Body parsers ──────────────────────────────────────────── */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ─── Rate limiting ─────────────────────────────────────────── */
// General API limiter
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Strict limiter for auth
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts.' },
}));

/* ─── MongoDB ───────────────────────────────────────────────── */
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/valio';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    // Don't crash — let health check report the issue
  });

mongoose.connection.on('error', err => {
  console.error('MongoDB runtime error:', err.message);
});

/* ─── Routes ────────────────────────────────────────────────── */
app.use('/api/products',    require('./routes/products'));
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/settings',    require('./routes/settings'));
app.use('/api/backgrounds', require('./routes/backgrounds'));
app.use('/api/orders',      require('./routes/orders'));

/* ─── Health check ──────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    db: dbState[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
    version: '4.0.0',
  });
});

/* ─── 404 ───────────────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ─── Error handler ─────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  if (err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('[server error]', err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🖤  VALIO backend v4 running on port ${PORT}`);
});

module.exports = app;

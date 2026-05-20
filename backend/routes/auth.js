const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const auth    = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'valio_secret_dev_only_change_in_production';

/* ── Lazily hash admin password once at startup ──────────────── */
let _adminHash = null;
function getAdminHash() {
  if (!_adminHash) {
    const plain = process.env.ADMIN_PASSWORD || 'valio_admin_2024';
    _adminHash = bcrypt.hashSync(plain, 10);
  }
  return _adminHash;
}

/* POST /api/auth/login ──────────────────────────────────────── */
router.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    const valid = await bcrypt.compare(password, getAdminHash());

    if (!valid) {
      // Uniform timing to prevent timing attacks
      await bcrypt.compare('dummy', getAdminHash()).catch(() => {});
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { role: 'admin', iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token, message: 'Welcome to VALIO Admin' });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Auth error' });
  }
});

/* POST /api/auth/verify — check token still valid ──────────── */
router.post('/verify', (req, res) => {
  const { token } = req.body;
  if (!token) return res.json({ valid: false });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, decoded });
  } catch {
    res.json({ valid: false });
  }
});

/* POST /api/auth/refresh — extend token life ───────────────── */
router.post('/refresh', auth, (req, res) => {
  const newToken = jwt.sign(
    { role: 'admin', iat: Math.floor(Date.now() / 1000) },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
  res.json({ token: newToken });
});

module.exports = router;

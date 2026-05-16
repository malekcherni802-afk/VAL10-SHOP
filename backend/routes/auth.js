const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin password stored as bcrypt hash
// Default: valio_admin_2024
// To generate new hash: bcrypt.hashSync('your_password', 10)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ||
  bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'valio_admin_2024', 10);

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { role: 'admin', timestamp: Date.now() },
    process.env.JWT_SECRET || 'valio_secret_2024',
    { expiresIn: '24h' }
  );

  res.json({ token, message: 'Welcome to VALIO Admin' });
});

// POST /api/auth/verify
router.post('/verify', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'valio_secret_2024');
    res.json({ valid: true, decoded });
  } catch {
    res.json({ valid: false });
  }
});

module.exports = router;

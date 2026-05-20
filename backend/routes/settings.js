const express  = require('express');
const router   = express.Router();
const Settings = require('../models/Settings');
const auth     = require('../middleware/auth');

/* ── GET /api/settings — public ─────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const rows = await Settings.find().lean();
    const obj  = {};
    rows.forEach(s => { obj[s.key] = s.value; });
    res.json(obj);
  } catch (err) {
    console.error('[settings GET]', err);
    res.status(500).json({ error: err.message });
  }
});

/* ── PUT /api/settings — protected ──────────────────────────── */
router.put('/', auth, async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ error: 'Body must be a plain JSON object' });
    }

    const ALLOWED_KEYS = [
      'introOpacity',
      'introImgWidth',
      'introImgHeight',
      'introEnabled',
      'siteName',
      'tagline',
      'contactEmail',
      'shippingNote',
      'announcementBar',
      'announcementEnabled',
      'maintenanceMode',
    ];

    const ops = [];
    for (const [key, value] of Object.entries(updates)) {
      if (!ALLOWED_KEYS.includes(key)) continue; // silently skip unknown keys
      ops.push(
        Settings.findOneAndUpdate(
          { key },
          { key, value },
          { upsert: true, new: true }
        )
      );
    }
    await Promise.all(ops);
    res.json({ message: 'Settings saved' });
  } catch (err) {
    console.error('[settings PUT]', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

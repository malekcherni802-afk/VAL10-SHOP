const express        = require('express');
const router         = express.Router();
const Settings       = require('../models/Settings');
const authMiddleware = require('../middleware/auth');

// GET /api/settings — public
router.get('/', async (req, res) => {
  try {
    const rows = await Settings.find();
    const obj  = {};
    rows.forEach(s => { obj[s.key] = s.value; });
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings — protected, upsert any key-value pairs
router.put('/', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Body must be a JSON object' });
    }
    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
    }
    res.json({ message: 'Settings saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

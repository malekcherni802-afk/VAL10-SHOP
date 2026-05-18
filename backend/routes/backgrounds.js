const express        = require('express');
const router         = express.Router();
const Background     = require('../models/Background');
const authMiddleware = require('../middleware/auth');

// GET /api/backgrounds — public, returns all active backgrounds
router.get('/', async (req, res) => {
  try {
    const items = await Background.find({ active: true }).sort({ order: 1, createdAt: 1 });
    res.json({ backgrounds: items });
  } catch (err) {
    console.error('[backgrounds GET]', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/backgrounds/all — admin: returns all (including inactive)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const items = await Background.find().sort({ order: 1, createdAt: 1 });
    res.json({ backgrounds: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/backgrounds — admin: add a new background
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { url, public_id, label, order } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });

    const bg = new Background({
      url,
      public_id: public_id || null,
      label:     label     || '',
      order:     order != null ? Number(order) : 0,
      active:    true,
    });
    await bg.save();
    res.status(201).json(bg);
  } catch (err) {
    console.error('[backgrounds POST]', err);
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/backgrounds/:id — admin: update label, order, active
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = {};
    if (req.body.label  !== undefined) updates.label  = req.body.label;
    if (req.body.order  !== undefined) updates.order  = Number(req.body.order);
    if (req.body.active !== undefined) updates.active = Boolean(req.body.active);

    const bg = await Background.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!bg) return res.status(404).json({ error: 'Background not found' });
    res.json(bg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/backgrounds/:id — admin: remove background
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bg = await Background.findByIdAndDelete(req.params.id);
    if (!bg) return res.status(404).json({ error: 'Background not found' });
    res.json({ message: 'Deleted', id: req.params.id, public_id: bg.public_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express    = require('express');
const router     = express.Router();
const Background = require('../models/Background');
const auth       = require('../middleware/auth');

/* ── GET /api/backgrounds — public, active only ─────────────── */
router.get('/', async (req, res) => {
  try {
    const items = await Background.find({ active: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ backgrounds: items });
  } catch (err) {
    console.error('[backgrounds GET /]', err);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/backgrounds/all — admin, all records ──────────── */
router.get('/all', auth, async (req, res) => {
  try {
    const items = await Background.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ backgrounds: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/backgrounds — admin, add new ─────────────────── */
router.post('/', auth, async (req, res) => {
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

/* ── PATCH /api/backgrounds/:id — admin, toggle/label/order ─── */
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = {};
    if (req.body.label  !== undefined) updates.label  = req.body.label;
    if (req.body.order  !== undefined) updates.order  = Number(req.body.order);
    if (req.body.active !== undefined) updates.active = Boolean(req.body.active);

    const bg = await Background.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!bg) return res.status(404).json({ error: 'Background not found' });
    res.json(bg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ── DELETE /api/backgrounds/:id — admin ────────────────────── */
router.delete('/:id', auth, async (req, res) => {
  try {
    const bg = await Background.findByIdAndDelete(req.params.id);
    if (!bg) return res.status(404).json({ error: 'Background not found' });
    res.json({ message: 'Deleted', id: req.params.id, public_id: bg.public_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

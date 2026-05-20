const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const Product = require('../models/Product');
const auth    = require('../middleware/auth');

/* ── POST /api/orders — public, place an order ──────────────── */
router.post('/', async (req, res) => {
  try {
    const { customer, items, notes } = req.body;

    if (!customer?.name || !customer?.email) {
      return res.status(400).json({ error: 'customer.name and customer.email are required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required and must not be empty' });
    }

    // Validate and snapshot each line item from DB
    const lineItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.product) return res.status(400).json({ error: 'Each item needs a product ID' });

      const product = await Product.findById(item.product).lean();
      if (!product) return res.status(400).json({ error: `Product ${item.product} not found` });
      if (product.soldOut) return res.status(400).json({ error: `"${product.name}" is sold out` });

      const qty = Math.max(1, parseInt(item.quantity) || 1);
      subtotal += product.price * qty;

      lineItems.push({
        product:  product._id,
        name:     product.name,
        image:    product.images?.[0] || '',
        price:    product.price,
        size:     item.size || '',
        quantity: qty,
      });
    }

    const order = new Order({
      customer: {
        name:    customer.name.trim(),
        email:   customer.email.trim().toLowerCase(),
        phone:   customer.phone  || '',
        address: customer.address || '',
        wilaya:  customer.wilaya  || '',
      },
      items:    lineItems,
      subtotal,
      total:    subtotal,   // shipping / discount logic can be added here
      notes:    notes || '',
      status:   'pending',
    });

    await order.save();
    res.status(201).json({ message: 'Order placed', ref: order.ref, id: order._id });
  } catch (err) {
    console.error('[orders POST]', err);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/orders — admin, all orders ────────────────────── */
router.get('/', auth, async (req, res) => {
  try {
    const { status, limit = 100, skip = 0, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { ref:              { $regex: search, $options: 'i' } },
        { 'customer.name':  { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .limit(Math.min(parseInt(limit), 500))
        .skip(parseInt(skip))
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/orders/stats — admin dashboard counters ───────── */
router.get('/stats', auth, async (req, res) => {
  try {
    const [pending, confirmed, shipped, delivered, cancelled, total] = await Promise.all([
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments(),
    ]);

    // Revenue from delivered orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'shipped', 'delivered'] } } },
      { $group: { _id: null, revenue: { $sum: '$total' } } },
    ]);
    const revenue = revenueAgg[0]?.revenue || 0;

    res.json({ pending, confirmed, shipped, delivered, cancelled, total, revenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/orders/:id — admin, single order ──────────────── */
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: 'Invalid order ID' });
    res.status(500).json({ error: err.message });
  }
});

/* ── PATCH /api/orders/:id — admin, update status/notes ─────── */
router.patch('/:id', auth, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const VALID = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    const updates = {};
    if (status && VALID.includes(status)) updates.status = status;
    if (adminNote !== undefined) updates.adminNote = adminNote;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nothing to update (allowed: status, adminNote)' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ── DELETE /api/orders/:id — admin, hard delete ────────────── */
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

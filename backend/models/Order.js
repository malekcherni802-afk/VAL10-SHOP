const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    /* ── Customer info ── */
    customer: {
      name:    { type: String, required: true, trim: true },
      email:   { type: String, required: true, trim: true, lowercase: true },
      phone:   { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
      wilaya:  { type: String, trim: true, default: '' },
    },

    /* ── Line items ── */
    items: [
      {
        product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name:      { type: String },        // snapshot of name at order time
        image:     { type: String },        // snapshot of image URL
        price:     { type: Number },        // snapshot of price
        size:      { type: String, default: '' },
        quantity:  { type: Number, default: 1 },
      },
    ],

    /* ── Totals ── */
    subtotal: { type: Number, required: true },
    total:    { type: Number, required: true },

    /* ── Status ── */
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    /* ── Notes ── */
    notes:     { type: String, default: '' },
    adminNote: { type: String, default: '' },

    /* ── Reference code ── */
    ref: { type: String, unique: true },
  },
  { timestamps: true }
);

/* ─── Auto-generate a short human-readable reference ─── */
orderSchema.pre('save', function (next) {
  if (!this.ref) {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.ref = `VL-${Date.now().toString(36).toUpperCase()}-${rand}`;
  }
  next();
});

orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customer.email': 1 });

module.exports = mongoose.model('Order', orderSchema);

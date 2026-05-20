const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Name too long'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description too long'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be ≥ 0'],
    },
    /* ── Categories aligned with admin panel ── */
    category: {
      type: String,
      enum: {
        values: ['hoodies', 't-shirts', 'compression', 'outerwear', 'accessories', 'other'],
        message: '{VALUE} is not a valid category',
      },
      default: 'other',
    },
    /* ── Images — array of full URLs (Cloudinary secure_url) ── */
    images: [{ type: String }],

    /* ── Status ── */
    soldOut:  { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    visible:  { type: Boolean, default: true },

    /* ── SEO / filtering ── */
    tags: [{ type: String, trim: true }],

    /* ── Sizes in stock (optional) ── */
    sizes: [{ type: String }],

    /* ── Stock count (optional) ── */
    stock: { type: Number, default: null },
  },
  {
    timestamps: true,  // adds createdAt + updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ─── Indexes ───────────────────────────────────────────────── */
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ visible: 1 });
productSchema.index({ createdAt: -1 });

/* ─── Virtual: primaryImage ─────────────────────────────────── */
productSchema.virtual('primaryImage').get(function () {
  return this.images?.[0] || null;
});

module.exports = mongoose.model('Product', productSchema);

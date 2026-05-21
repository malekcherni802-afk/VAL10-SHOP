const mongoose = require('mongoose');

const sizeStockSchema = new mongoose.Schema({
  size: { type: String, enum: ['S', 'M', 'L', 'XL'], required: true },
  stock: { type: Number, default: 0, min: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  colors: [{ type: String }],
  sizes: [sizeStockSchema],
  images: [{ type: String }],          // Base64 strings (after client compression)
  isSoldOut: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Auto‑compute isSoldOut before saving
productSchema.pre('save', function(next) {
  const allZero = this.sizes.every(s => s.stock === 0);
  this.isSoldOut = allZero;
  next();
});

module.exports = mongoose.model('Product', productSchema);
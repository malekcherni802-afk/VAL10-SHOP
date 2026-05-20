const mongoose = require('mongoose');

const backgroundSchema = new mongoose.Schema(
  {
    url:       { type: String, required: true },
    public_id: { type: String, default: null },   // Cloudinary public_id
    label:     { type: String, default: '' },
    order:     { type: Number, default: 0 },
    active:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

backgroundSchema.index({ active: 1, order: 1 });

module.exports = mongoose.model('Background', backgroundSchema);

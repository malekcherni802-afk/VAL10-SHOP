const mongoose = require('mongoose');

const backgroundSchema = new mongoose.Schema({
  url:        { type: String, required: true },
  public_id:  { type: String, default: null },  // Cloudinary public_id for deletion
  label:      { type: String, default: '' },
  order:      { type: Number, default: 0 },
  active:     { type: Boolean, default: true },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Background', backgroundSchema);

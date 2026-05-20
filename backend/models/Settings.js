const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key:   { type: String, unique: true, required: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed },
});

settingsSchema.index({ key: 1 });

module.exports = mongoose.model('Settings', settingsSchema);

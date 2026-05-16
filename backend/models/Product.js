const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: String,
    enum: ['clothing', 'accessories', 'jewelry', 'footwear', 'other'],
    default: 'clothing'
  },
  images: [{
    type: String
  }],
  model3D: {
    type: String,
    default: null
  },
  soldOut: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Product', productSchema);

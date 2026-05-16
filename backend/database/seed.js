require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/valio';

const products = [
  {
    name: 'Void Cloak',
    description: 'A dramatic floor-length cloak crafted from obsidian velvet. Draped shadows incarnate. Perfect for those who command silence upon entering a room.',
    price: 890,
    category: 'clothing',
    images: [],
    soldOut: false,
    featured: true,
    tags: ['velvet', 'cloak', 'featured']
  },
  {
    name: 'Eclipse Corset',
    description: 'Hand-stitched brocade corset with silver moonstone accents. Structure meets darkness in this signature silhouette piece.',
    price: 645,
    category: 'clothing',
    images: [],
    soldOut: false,
    featured: true,
    tags: ['corset', 'brocade', 'silver']
  },
  {
    name: 'Raven Ring Set',
    description: 'Sterling silver stacking rings featuring obsidian stones and hand-etched gothic motifs. Set of three.',
    price: 280,
    category: 'jewelry',
    images: [],
    soldOut: false,
    featured: false,
    tags: ['silver', 'rings', 'obsidian']
  },
  {
    name: 'Nightfall Boots',
    description: 'Knee-high leather boots with silver buckle detailing and a 3-inch block heel. Walk with intention.',
    price: 720,
    category: 'footwear',
    images: [],
    soldOut: true,
    featured: false,
    tags: ['leather', 'boots', 'silver']
  },
  {
    name: 'Shadow Veil',
    description: 'Sheer black silk veil with hand-embroidered silver thread border. A statement piece for the modern dark romantic.',
    price: 195,
    category: 'accessories',
    images: [],
    soldOut: false,
    featured: false,
    tags: ['silk', 'veil', 'embroidered']
  },
  {
    name: 'Mourning Coat',
    description: 'Victorian-inspired wool coat with structured shoulders and silk lining. The architecture of grief made wearable.',
    price: 1200,
    category: 'clothing',
    images: [],
    soldOut: false,
    featured: true,
    tags: ['wool', 'coat', 'victorian']
  }
];

const defaultSettings = [
  { key: 'accentColor', value: '#c0a060' },
  { key: 'animationsEnabled', value: true },
  { key: 'smokeEnabled', value: true },
  { key: 'siteName', value: 'VALIO' },
  { key: 'heroTagline', value: 'Wear the Darkness' }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared products');

    const inserted = await Product.insertMany(products);
    console.log(`Seeded ${inserted.length} products`);

    for (const s of defaultSettings) {
      await Settings.findOneAndUpdate({ key: s.key }, s, { upsert: true });
    }
    console.log('Seeded settings');

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();

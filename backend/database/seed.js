require('dotenv').config({ path: '../.env' });
const mongoose   = require('mongoose');
const Background = require('../models/Background');
const Settings   = require('../models/Settings');

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/valio';

const defaultSettings = [
  { key: 'introOpacity',   value: 0.6 },
  { key: 'introImgWidth',  value: '100%' },
  { key: 'introImgHeight', value: '100%' },
  { key: 'introEnabled',   value: true },
];

async function seed() {
  await mongoose.connect(URI);
  console.log('Connected');

  // Seed default settings
  for (const s of defaultSettings) {
    await Settings.findOneAndUpdate({ key: s.key }, s, { upsert: true });
  }
  console.log('✅ Default settings seeded');

  // Check if backgrounds exist already
  const count = await Background.countDocuments();
  if (count === 0) {
    console.log('No backgrounds in DB — add them via Admin → Shop Backgrounds');
  } else {
    console.log(`${count} backgrounds already in DB`);
  }

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

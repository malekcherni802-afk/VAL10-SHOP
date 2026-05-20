/**
 * VALIO v4 — Database Seed
 * Run from the backend/ directory:  node database/seed.js
 */
require('dotenv').config();   // looks for .env in cwd (backend/)
const mongoose   = require('mongoose');
const Background = require('../models/Background');
const Settings   = require('../models/Settings');

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/valio';

const DEFAULT_SETTINGS = [
  { key: 'introOpacity',        value: 0.6 },
  { key: 'introImgWidth',       value: '100%' },
  { key: 'introImgHeight',      value: '100%' },
  { key: 'introEnabled',        value: true },
  { key: 'siteName',            value: 'VALIO' },
  { key: 'tagline',             value: 'Made for Legacy' },
  { key: 'contactEmail',        value: 'contact@valio.dz' },
  { key: 'shippingNote',        value: 'Worldwide Shipping Available' },
  { key: 'announcementBar',     value: 'FREE SHIPPING ON ORDERS OVER 5000 DZD' },
  { key: 'announcementEnabled', value: false },
  { key: 'maintenanceMode',     value: false },
];

async function seed() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅  Connected');

  let seeded = 0;
  for (const s of DEFAULT_SETTINGS) {
    const result = await Settings.findOneAndUpdate(
      { key: s.key },
      { $setOnInsert: { key: s.key, value: s.value } },
      { upsert: true, new: true }
    );
    if (result._id) seeded++;
  }
  console.log(`✅  Settings: ${seeded}/${DEFAULT_SETTINGS.length} upserted`);

  const bgCount = await Background.countDocuments();
  if (bgCount === 0) {
    console.log('ℹ️   No backgrounds in DB — add them via Admin → Shop Backgrounds');
  } else {
    console.log(`ℹ️   ${bgCount} background(s) already in DB`);
  }

  console.log('\n🖤  Seed complete. Run the dev server:  npm run dev');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

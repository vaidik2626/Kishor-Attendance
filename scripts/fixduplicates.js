const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Sabha = require('../models/Sabha');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const sabhas = await Sabha.find({});

  for (const sabha of sabhas) {
    const seen = new Map();
    sabha.attendance.forEach(a => {
      const key = a.user.toString();
      if (!seen.has(key)) seen.set(key, a);
    });

    const deduped = Array.from(seen.values());
    if (deduped.length !== sabha.attendance.length) {
      console.log(`Fixing ${sabha._id}: ${sabha.attendance.length} → ${deduped.length}`);
      sabha.attendance = deduped;
      await sabha.save();
    }
  }

  console.log('Done');
  mongoose.disconnect();
}

fix();
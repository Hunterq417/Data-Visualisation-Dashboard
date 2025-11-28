const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Record = require('../src/models/Record');

(async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  const argPath = process.argv[2];
  const envPath = process.env.DATA_FILE;
  const defaultPath = path.join(__dirname, '..', 'data', 'jsondata.json');
  const resolvedPath = (() => {
    const p = argPath || envPath || defaultPath;
    return path.isAbsolute(p) ? p : path.resolve(p);
  })();

  if (!fs.existsSync(resolvedPath)) {
    console.error('Data file not found at', resolvedPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(resolvedPath, 'utf-8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON format:', e.message);
    process.exit(1);
  }

  if (!Array.isArray(json)) {
    console.error('Expected top-level JSON array of records.');
    process.exit(1);
  }

  const toNum = (v) => {
    if (v === '' || v == null) return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const docs = json.map((r) => ({
    ...r,
    intensity: toNum(r.intensity),
    likelihood: toNum(r.likelihood),
    relevance: toNum(r.relevance),
    year: toNum(r.year),
    start_year: toNum(r.start_year),
    end_year: toNum(r.end_year)
  }));

  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await Record.deleteMany({});
    await Record.insertMany(docs, { ordered: false });
    console.log(`Inserted ${docs.length} documents from ${resolvedPath}.`);
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();

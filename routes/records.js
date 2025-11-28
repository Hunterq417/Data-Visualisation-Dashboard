const express = require('express');
const router = express.Router();
const Record = require('../models/Record');

function parseMulti(value) {
  if (value == null || value === '') return undefined;
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildQuery(q) {
  const query = {};
  const eqFields = {
    end_year: 'end_year',
    topic: 'topic',
    sector: 'sector',
    region: 'region',
    pestle: 'pestle',
    source: 'source',
    swot: 'swot',
    country: 'country',
    city: 'city',
    year: 'year'
  };

  for (const [param, field] of Object.entries(eqFields)) {
    const vals = parseMulti(q[param]);
    if (vals && vals.length) {
      if (['end_year', 'year'].includes(param)) {
        const nums = vals.map((v) => (v === '' ? null : Number(v))).filter((v) => v !== null && !Number.isNaN(v));
        if (nums.length) query[field] = { $in: nums };
      } else {
        query[field] = { $in: vals };
      }
    }
  }

  ['intensity', 'likelihood', 'relevance'].forEach((f) => {
    const min = q[`${f}_min`] != null ? Number(q[`${f}_min`]) : undefined;
    const max = q[`${f}_max`] != null ? Number(q[`${f}_max`]) : undefined;
    if ((min != null && !Number.isNaN(min)) || (max != null && !Number.isNaN(max))) {
      query[f] = {};
      if (min != null && !Number.isNaN(min)) query[f].$gte = min;
      if (max != null && !Number.isNaN(max)) query[f].$lte = max;
    }
  });

  return query;
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '100', 10), 1), 1000);
    const skip = (page - 1) * limit;

    const query = buildQuery(req.query);

    const [items, total] = await Promise.all([
      Record.find(query).skip(skip).limit(limit).lean(),
      Record.countDocuments(query)
    ]);

    res.json({ page, limit, total, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/meta', async (req, res) => {
  try {
    const fields = ['end_year', 'topic', 'sector', 'region', 'pestle', 'source', 'swot', 'country', 'city', 'year'];
    const result = {};
    await Promise.all(
      fields.map(async (f) => {
        result[f] = (await Record.distinct(f)).filter((v) => v !== '' && v != null).sort((a, b) => {
          if (typeof a === 'number' && typeof b === 'number') return a - b;
          return String(a).localeCompare(String(b));
        });
      })
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

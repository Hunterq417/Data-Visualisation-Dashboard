const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema(
  {
    intensity: { type: Number, default: null },
    likelihood: { type: Number, default: null },
    relevance: { type: Number, default: null },
    year: { type: Number, default: null },
    start_year: { type: Number, default: null },
    end_year: { type: Number, default: null },
    country: { type: String, trim: true },
    topic: { type: String, trim: true },
    sector: { type: String, trim: true },
    region: { type: String, trim: true },
    city: { type: String, trim: true },
    pestle: { type: String, trim: true },
    source: { type: String, trim: true },
    swot: { type: String, trim: true },
    insight: { type: String },
    url: { type: String },
    added: { type: String },
    published: { type: String },
    title: { type: String }
  },
  { timestamps: false, strict: false }
);

module.exports = mongoose.model('Record', RecordSchema);

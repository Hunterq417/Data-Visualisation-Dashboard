const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    picture: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

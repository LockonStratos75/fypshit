// backend/models/AdminProfile.js
const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  settings: {
    notifications: { type: Boolean, default: true },
    theme:         { type: String, default: 'light' },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdminProfile', adminProfileSchema);

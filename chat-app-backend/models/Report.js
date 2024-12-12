// backend/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateName: { type: String, default: 'default_template' },
  pdfPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for optimization
reportSchema.index({ user: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);

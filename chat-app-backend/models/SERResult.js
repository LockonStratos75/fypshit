// backend/models/SERResult.js
const mongoose = require('mongoose');

const serResultSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:          { type: Date, default: Date.now },
  highestEmotion: {
    label: { type: String },
    score: { type: Number },
  },
  emotions: [{
    label:      { type: String },
    score:      { type: Number },
    percentage: { type: String },
  }],
});

module.exports = mongoose.model('SERResult', serResultSchema);

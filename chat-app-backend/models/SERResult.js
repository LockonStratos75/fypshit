// backend/models/SERResult.js
const mongoose = require('mongoose');

const serResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    highestEmotion: { label: String, score: Number },
    emotions: [{ label: String, score: Number, percentage: String }],
});

module.exports = mongoose.model('SERResult', serResultSchema);

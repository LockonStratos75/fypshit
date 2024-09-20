// backend/models/SentimentScore.js
const mongoose = require('mongoose');

const sentimentScoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    sessionName: { type: String, required: true },
    averageSentiment: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SentimentScore', sentimentScoreSchema);

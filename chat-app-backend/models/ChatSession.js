// backend/models/ChatSession.js
const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    messages: { type: Array, required: true },
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);

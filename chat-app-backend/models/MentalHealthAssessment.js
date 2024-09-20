// backend/models/MentalHealthAssessment.js
const mongoose = require('mongoose');

const mentalHealthAssessmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assessmentType: { type: String, required: true },
    responses: { type: Array, required: true },
    score: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MentalHealthAssessment', mentalHealthAssessmentSchema);

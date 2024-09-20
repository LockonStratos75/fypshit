// backend/models/MentalHealthAssessment.js
const mongoose = require('mongoose');

const mentalHealthAssessmentSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentType: { type: String, required: true },
  responses:      { type: [Number], default: [] },
  score:          { type: Number, default: 0 },
  status:         { type: String, enum: ['scheduled', 'completed', 'missed'], default: 'scheduled' },
  scheduledDate:  { type: Date },
  createdAt:      { type: Date, default: Date.now },
});

module.exports = mongoose.model('MentalHealthAssessment', mentalHealthAssessmentSchema);

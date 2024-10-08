// backend/models/PsychologistProfile.js
const mongoose = require('mongoose');

const psychologistProfileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    qualifications: { type: String, required: true },
    experience: { type: Number, required: true },
    specialization: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    documents: { type: Array, required: true },
    privacySettings: {
        visibleToUsers: { type: Boolean, default: true },
        notifications: { type: Boolean, default: true },
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PsychologistProfile', psychologistProfileSchema);

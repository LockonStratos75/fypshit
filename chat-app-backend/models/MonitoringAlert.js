// backend/models/MonitoringAlert.js
const mongoose = require('mongoose');

const monitoringAlertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alertType: { type: String, required: true }, // e.g. "high_sanity_level"
    alertMessage: { type: String, required: true },
    triggeredBy: { type: String, enum: ['psychologist', 'system'], default: 'psychologist' },
    status: { type: String, enum: ['new', 'viewed', 'resolved'], default: 'new' },
    adminResponse: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for optimization
monitoringAlertSchema.index({ userId: 1, alertType: 1 });
monitoringAlertSchema.index({ status: 1 });
monitoringAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MonitoringAlert', monitoringAlertSchema);

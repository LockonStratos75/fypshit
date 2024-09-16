// backend/models/MonitoringAlert.js
const mongoose = require('mongoose');

const monitoringAlertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    alertType: { type: String, required: true },
    alertMessage: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MonitoringAlert', monitoringAlertSchema);

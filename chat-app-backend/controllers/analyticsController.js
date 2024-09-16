// backend/controllers/analyticsController.js
const { getSystemMetrics, getUserActions } = require('../services/analyticsService');

// Access System Analytics
exports.accessSystemAnalytics = async (req, res) => {
    try {
        const metrics = await getSystemMetrics();
        res.status(200).json(metrics);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Monitor System Metrics and Events
exports.monitorSystemMetrics = async (req, res) => {
    try {
        const userActions = await getUserActions();
        res.status(200).json(userActions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

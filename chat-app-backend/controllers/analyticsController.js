// backend/controllers/analyticsController.js
const { getSystemMetrics } = require('../services/analyticsService');

exports.getSystemMetrics = async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
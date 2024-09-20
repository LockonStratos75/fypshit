// backend/services/analyticsService.js
const User = require('../models/User');
const Log = require('../models/Log');

const getSystemMetrics = async () => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTherapists = await User.countDocuments({ role: 'psychologist' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const systemHealth = 'Good'; // Placeholder for actual system health metrics

    return {
      totalUsers,
      totalTherapists,
      totalAdmins,
      systemHealth,
    };
  } catch (err) {
    throw new Error(err.message);
  }
};

const getUserActions = async () => {
  try {
    const userActions = await Log.find().sort({ timestamp: -1 }).limit(100).populate('userId', 'username email');
    return userActions;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { getSystemMetrics, getUserActions };

// backend/services/analyticsService.js

const User = require('../models/User');
const Log = require('../models/Log');
const os = require('os-utils');

const getSystemMetrics = async () => {
  try {
    // Fetch total number of users
    const totalUsers = await User.countDocuments();

    // Fetch number of active users (e.g., users who logged in within the last 24 hours)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Users who logged in within the last 24 hours
    });

    // Fetch system health metrics
    const systemHealth = await getSystemHealth();

    const metrics = {
      totalUsers,
      activeUsers,
      systemHealth,
    };

    return metrics;
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    throw error;
  }
};

const getUserActions = async () => {
  try {
    // Fetch recent user actions from the Log model
    const userActions = await Log.find()
      .sort({ timestamp: -1 })
      .limit(50) // Limit to the most recent 50 actions
      .populate('userId', 'username email') // Include user details
      .lean();

    return userActions;
  } catch (error) {
    console.error('Error fetching user actions:', error);
    throw error;
  }
};

// Helper function to get system health
const getSystemHealth = async () => {
  return new Promise((resolve) => {
    os.cpuUsage((cpuUsage) => {
      const cpuUsagePercent = cpuUsage * 100;
      const freeMemoryMB = os.freemem();
      const totalMemoryMB = os.totalmem();
      const memoryUsagePercent =
        ((totalMemoryMB - freeMemoryMB) / totalMemoryMB) * 100;

      // Define thresholds
      const cpuThreshold = 90; // 80%
      const memoryThreshold = 90; // 80%

      let systemHealth = 'Good';

      if (
        cpuUsagePercent > cpuThreshold ||
        memoryUsagePercent > memoryThreshold
      ) {
        systemHealth = 'Warning';
      }

      if (
        cpuUsagePercent > cpuThreshold + 10 ||
        memoryUsagePercent > memoryThreshold + 10
      ) {
        systemHealth = 'Critical';
      }

      resolve(systemHealth);
    });
  });
};

module.exports = { getSystemMetrics, getUserActions };

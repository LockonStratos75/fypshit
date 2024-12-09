const express = require('express');
const { getSystemMetrics, getUserBehaviorAnalytics } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

/**
 * @route   GET /api/analytics/system-metrics
 * @desc    Get system-level metrics
 * @access  Private (Admin)
 */
router.get('/system-metrics', getSystemMetrics);

/**
 * @route   GET /api/analytics/user-behavior
 * @desc    Get user behavior analytics
 * @access  Private (Admin)
 */
router.get('/user-behavior', getUserBehaviorAnalytics);

module.exports = router;

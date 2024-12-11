// backend/routes/analyticsRoutes.js

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');

/**
 * @route   GET /analytics/system-metrics
 * @desc    Fetch system metrics
 * @access  Private (Admin)
 */
router.get('/system-metrics', analyticsController.getSystemMetrics);

/**
 * @route   GET /analytics/user-actions
 * @desc    Fetch recent user actions
 * @access  Private (Admin)
 */
router.get('/user-behavior-analytics', analyticsController.getUserBehaviorAnalytics);

module.exports = router;

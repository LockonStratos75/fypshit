const express = require('express');
const { accessSystemAnalytics, monitorSystemMetrics } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/system-metrics', authenticateToken, monitorSystemMetrics);

module.exports = router;

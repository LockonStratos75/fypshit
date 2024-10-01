const express = require('express');
const { getSystemMetrics } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/system-metrics', authenticateToken, getSystemMetrics);

module.exports = router;

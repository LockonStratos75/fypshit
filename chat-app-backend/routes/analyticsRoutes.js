// backend/routes/analyticsRoutes.js
const express = require('express');
const { accessSystemAnalytics, monitorSystemMetrics } = require('../controllers/analyticsController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/system', authenticateToken, accessSystemAnalytics);
router.get('/metrics', authenticateToken, monitorSystemMetrics);

module.exports = router;

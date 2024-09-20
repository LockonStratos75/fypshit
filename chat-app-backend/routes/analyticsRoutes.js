// backend/routes/analyticsRoutes.js
const express = require('express');
const { accessSystemAnalytics, monitorSystemMetrics } = require('../controllers/analyticsController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/system', authorizeRoles('admin'), accessSystemAnalytics);
router.get('/metrics', authorizeRoles('admin'), monitorSystemMetrics);

module.exports = router;

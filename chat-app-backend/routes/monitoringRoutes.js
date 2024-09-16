// backend/routes/monitoringRoutes.js
const express = require('express');
const { createAlert, getAlerts } = require('../controllers/monitoringController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, createAlert);
router.get('/', authenticateToken, getAlerts);

module.exports = router;

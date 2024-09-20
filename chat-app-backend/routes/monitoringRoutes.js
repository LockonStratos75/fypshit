// backend/routes/monitoringRoutes.js
const express = require('express');
const { monitorUserInteractions, getAlerts } = require('../controllers/monitoringController');

const router = express.Router();

router.post('/interactions', monitorUserInteractions);
router.get('/alerts', getAlerts);

module.exports = router;

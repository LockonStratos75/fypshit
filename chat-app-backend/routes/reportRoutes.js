// backend/routes/reportRoutes.js

const express = require('express');
const { generateUserReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Route to generate user report
router.get('/user/:userId', generateUserReport);

module.exports = router;

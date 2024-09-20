// backend/routes/assessmentRoutes.js
const express = require('express');
const { createAssessment, getAssessments } = require('../controllers/assessmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, createAssessment);
router.get('/', authenticateToken, getAssessments);

module.exports = router;

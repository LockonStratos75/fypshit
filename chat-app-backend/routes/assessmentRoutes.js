// backend/routes/assessmentRoutes.js
const express = require('express');
const { createAssessment, getAssessmentsByUser, getAssessments, getTotalAssessments } = require('../controllers/assessmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, createAssessment);
router.get('/user/:userId', getAssessmentsByUser); 
router.get('/', authenticateToken, getAssessments);
router.get('/total', getTotalAssessments); 

module.exports = router;

// backend/routes/assessmentRoutes.js
const express = require('express');
const {
  scheduleAssessment,
  submitAssessment,
  getAssessments,
  generateReport,
} = require('../controllers/assessmentController');
const { authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Users can access their assessments
router.get('/', getAssessments);
router.post('/submit', submitAssessment);
router.get('/report/:userId', generateReport);

// Psychologists and admins can schedule assessments
router.post('/schedule', authorizeRoles('psychologist', 'admin'), scheduleAssessment);

module.exports = router;

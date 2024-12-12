// backend/routes/psychologistRoutes.js

const express = require('express');
const psychologistController = require('../controllers/psychologistController');
const crisisController = require('../controllers/crisisController');
const { authenticateToken: authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// ========================
// Psychologist Profile Routes
// ========================

/**
 * @route   GET /psychologist/profile/me
 * @desc    Get current psychologist's profile
 * @access  Private (Authenticated Psychologist)
 */
router.get(
  '/me',
  authenticate,
  psychologistController.getPsychologistProfile
);

/**
 * @route   GET /psychologist/users
 * @desc    Get all users (patients)
 * @access  Private (Authenticated Psychologist)
 */
router.get('/users', authenticate, psychologistController.getAllUsers);

/**
 * @route   POST /psychologist/crisis/check
 * @desc    Check and handle crisis alerts for a user
 * @access  Private (Authenticated Psychologist)
 */
router.post('/crisis/check', authenticate, crisisController.checkAndHandleCrisis);

router.get('/assessments', authenticate, psychologistController.getAllAssessments);

// Export the router
module.exports = router;
// backend/routes/psychologistRoutes.js

const express = require('express');
const psychologistController = require('../controllers/psychologistController');
const monitoringController = require('../controllers/monitoringController');
const crisisController = require('../controllers/crisisController');
const reportController = require('../controllers/reportController'); 
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
  '/profile/me',
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

/**
 * @route   GET /psychologist/assessments
 * @desc    Get all assessments for psychologists' patients
 * @access  Private (Authenticated Psychologist)
 */
router.get('/assessments', authenticate, psychologistController.getAllAssessments);

// ========================
// New Routes
// ========================

/**
 * @route   GET /psychologist/alerts
 * @desc    Get alerts specific to the psychologist
 * @access  Private (Authenticated Psychologist)
 */
router.get('/alerts', authenticate, monitoringController.getAllAlertsForPsychologist);

router.get('/logs', authenticate, psychologistController.getLogs);

router.get('/users/:id/complete', authenticate, psychologistController.getUserCompleteData);

router.get('/reports', authenticate, reportController.getAllReportsForPsychologist);

router.get('/all-sanity-levels', authenticate, psychologistController.getAllUserSanityLevels);

// ========================
// Export the router
// ========================
module.exports = router;

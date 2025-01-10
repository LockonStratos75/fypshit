// backend/routes/monitoringRoutes.js
const express = require('express');
const { createAlert, getAlerts, getAllAlertsForAdmin, updateAlertByAdmin, addPsychologistInsight } = require('../controllers/monitoringController');
const { authenticateToken, authorizeAdmin, authorizePsychologist } = require('../middlewares/authMiddleware');
const { body, query, param } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');

const router = express.Router();

// ========================
// Public: None
// All routes require authentication
// ========================

router.use(authenticateToken);

// ========================
// Psychologist Routes
// ========================

/**
 * @route   POST /monitoring/alerts
 * @desc    Psychologist (or system) creates an alert for a user
 * @access  Private (Psychologist)
 */
router.post(
  '/alerts',
  authorizePsychologist,
  [
    body('userId').isMongoId().withMessage('Valid userId required.'),
    body('alertType').notEmpty().withMessage('alertType is required.'),
    body('alertMessage').notEmpty().withMessage('alertMessage is required.')
  ],
  validateRequest,
  createAlert
);

/**
 * @route   GET /monitoring/alerts
 * @desc    Psychologist or User can view alerts
 * @access  Private (User/Psychologist)
 */
router.get(
  '/alerts',
  // Users and psychologists differ in logic within controller
  // No extra authorization needed; authenticateToken ensures presence of userType
  [
    query('userId').optional().isMongoId().withMessage('Invalid userId in query.')
  ],
  validateRequest,
  getAlerts
);

router.post(
  '/psychologist/alerts/:id/insight',
  authorizePsychologist,
  [
    param('id').isMongoId().withMessage('Invalid alert ID.'),
    body('insight').notEmpty().withMessage('Insight text is required.')
  ],
  validateRequest,
  addPsychologistInsight
);

// ========================
// Admin Routes
// ========================

/**
 * @route   GET /monitoring/admin/alerts
 * @desc    Admin view all alerts (optional filters by status, userId)
 * @access  Private (Admin)
 */
router.get(
  '/admin/alerts',
  authorizeAdmin,
  [
    query('status').optional().isString().withMessage('status must be string'),
    query('userId').optional().isMongoId().withMessage('Invalid userId in query.')
  ],
  validateRequest,
  getAllAlertsForAdmin
);

/**
 * @route   PATCH /monitoring/admin/alerts/:id
 * @desc    Admin update an alert
 * @access  Private (Admin)
 */
router.patch(
  '/admin/alerts/:id',
  authorizeAdmin,
  [
    param('id').isMongoId().withMessage('Invalid alert ID.'),
    body('status').optional().isIn(['new', 'viewed', 'resolved']).withMessage('Invalid status.'),
    body('adminResponse').optional().isString().withMessage('adminResponse must be a string.')
  ],
  validateRequest,
  updateAlertByAdmin
);

module.exports = router;

// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');

// =======================
// Protected Admin Routes
// =======================


// Apply authentication middleware to all routes below
router.use(authenticateToken);

/**
 * @route   GET /admin/users
 * @desc    Fetch all users
 * @access  Private (Admin)
 */
router.get('/users', adminController.getAllUsers);


router.get('/sanity-levels', adminController.getAllSanityLevels);

/**
 * @route   PUT /admin/users/:userId
 * @desc    Modify a user's data
 * @access  Private (Admin)
 */
router.put(
  '/users/:userId',
  [
    param('userId').isMongoId().withMessage('Invalid User ID format.'),
    body('email').optional().isEmail().withMessage('Valid email is required.'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('gender').optional().isIn(['Male', 'Female', 'Other', 'Prefer not to say']).withMessage('Invalid gender option.'),
    body('age').optional().isInt({ min: 0, max: 120 }).withMessage('Age must be a number between 0 and 120.'),
    body('location').optional().isString().withMessage('Location must be a string.').trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters.'),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please enter a valid phone number in E.164 format.'),
    body('guardianPhoneNumber')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please enter a valid guardian phone number in E.164 format.'),
  ],
  validateRequest,
  adminController.modifyUser
);

/**
 * @route   DELETE /admin/users/:userId
 * @desc    Delete a user
 * @access  Private (Admin)
 */
router.delete(
  '/users/:userId',
  [
    param('userId').isMongoId().withMessage('Invalid User ID format.'),
  ],
  validateRequest,
  adminController.deleteUser
);

/**
 * @route   GET /admin/psychologists
 * @desc    Fetch all psychologists
 * @access  Private (Admin)
 */
router.get('/psychologists', adminController.getAllPsychologists);

/**
 * @route   PUT /admin/psychologists/:psychologistId
 * @desc    Modify a psychologist's data
 * @access  Private (Admin)
 */
router.put(
  '/psychologists/:psychologistId',
  [
    param('psychologistId').isMongoId().withMessage('Invalid Psychologist ID format.'),
    body('email').optional().isEmail().withMessage('Valid email is required.'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    body('specialization').optional().isString().withMessage('Specialization must be a string.').trim().isLength({ max: 100 }).withMessage('Specialization cannot exceed 100 characters.'),
    body('yearsOfExperience').optional().isInt({ min: 0, max: 100 }).withMessage('Years of experience must be between 0 and 100.'),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please enter a valid phone number in E.164 format.'),
    // Add more fields as necessary
  ],
  validateRequest,
  adminController.modifyPsychologistProfile
);

/**
 * @route   GET /admin/logs
 * @desc    Fetch all logs
 * @access  Private (Admin)
 */
router.get('/logs', adminController.getLogs);

module.exports = router;

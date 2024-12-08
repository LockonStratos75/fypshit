// backend/routes/psychologistRoutes.js

const express = require('express');
const psychologistController = require('../controllers/psychologistController');
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');

const authRouter = express.Router();
const profileRouter = express.Router();

// ========================
// Psychologist Authentication Routes
// ========================

/**
 * @route   POST /psychologist/auth/register
 * @desc    Register a new psychologist
 * @access  Public
 */
authRouter.post(
  '/register',
  [
    body('username')
      .notEmpty()
      .withMessage('Username is required.')
      .isLength({ max: 50 })
      .withMessage('Username cannot exceed 50 characters.'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters.'),
    body('confirmPassword')
      .notEmpty()
      .withMessage('Confirm Password is required.')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match.'),
  ],
  validateRequest,
  psychologistController.registerPsychologist
);

/**
 * @route   POST /psychologist/auth/login
 * @desc    Login psychologist and return JWT token
 * @access  Public
 */
authRouter.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required.')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required.'),
  ],
  validateRequest,
  psychologistController.loginPsychologist
);

// ========================
// Psychologist Profile Routes
// ========================

/**
 * @route   POST /psychologist/profile/complete
 * @desc    Complete or update psychologist profile
 * @access  Private (Authenticated Psychologist)
 */
profileRouter.post(
  '/complete',
  [
    body('specialization')
      .notEmpty()
      .withMessage('Specialization is required.')
      .isLength({ max: 100 })
      .withMessage('Specialization cannot exceed 100 characters.'),
    body('yearsOfExperience')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Years of experience must be between 0 and 100.'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required.')
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please enter a valid phone number in E.164 format.'),
  ],
  validateRequest,
  psychologistController.completePsychologistProfile
);

/**
 * @route   GET /psychologist/profile/me
 * @desc    Get current psychologist's profile
 * @access  Private (Authenticated Psychologist)
 */
profileRouter.get(
  '/me',
  psychologistController.getPsychologistProfile
);

// Export both routers
module.exports = {
  authRouter,
  profileRouter,
};

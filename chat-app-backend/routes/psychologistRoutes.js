// backend/routes/psychologistRoutes.js

const express = require('express');
const psychologistController = require('../controllers/psychologistController');
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');
const multer = require('multer');
const path = require('path');
const { authenticateToken: authenticate } = require('../middlewares/authMiddleware');

// Routers
const authRouter = express.Router();
const profileRouter = express.Router();

// ========================
// Psychologist Authentication Routes
// ========================

/**
 * @route   POST /psychologist/auth/register
 * @desc    Register a new psychologist (status = pending)
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
 * 
 * If the psychologist has not completed the profile, the middleware will only allow them 
 * to access the /profile/complete route. If the profile is completed but not approved, 
 * they cannot access admin functionalities. They can login and check their profile status 
 * (e.g., via /profile/me) but cannot access other protected routes until approved.
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
 * 
 * This route allows the psychologist to provide their specialization, 
 * yearsOfExperience, and phoneNumber. Once completed, the profile status remains 'pending' 
 * until admin approval. The psychologist can now be recognized as having a completed profile 
 * but still not have full access until the admin approves them.
 */
profileRouter.post(
  '/complete',
  authenticate,
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
 *
 * The psychologist can check their status here. If status = 'pending', 
 * they know they must wait for admin approval. If status = 'rejected', 
 * they know they've been denied. If 'approved', they can access the admin web app functionalities.
 */
profileRouter.get(
  '/me',
  authenticate,
  psychologistController.getPsychologistProfile
);


// Export both routers
module.exports = {
  authRouter,
  profileRouter,
};

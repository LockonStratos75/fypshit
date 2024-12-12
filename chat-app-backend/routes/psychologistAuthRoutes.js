// backend/routes/psychologistAuthRoutes.js

const express = require('express');
const psychologistController = require('../controllers/psychologistController');
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');

const router = express.Router();

/**
 * @route   POST /psychologist/auth/register
 * @desc    Register a new psychologist with complete profile
 * @access  Public
 */
router.post(
  '/register',
  [
    body('username')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('specialization')
      .notEmpty()
      .withMessage('Specialization is required')
      .isLength({ max: 100 })
      .withMessage('Specialization cannot exceed 100 characters'),
    body('yearsOfExperience')
      .isInt({ min: 0, max: 100 })
      .withMessage('Years of experience must be between 0 and 100'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Please enter a valid phone number in E.164 format.'),
  ],
  validateRequest,
  psychologistController.registerPsychologist
);

router.options('/register', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.status(204).json({});
});

/**
 * @route   POST /psychologist/auth/login
 * @desc    Login psychologist and return JWT token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .exists()
      .withMessage('Password is required'),
  ],
  validateRequest,
  psychologistController.loginPsychologist
);

module.exports = router;

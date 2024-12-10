// backend/routes/authRoutes.js

const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController'); // Updated import names
const { body } = require('express-validator');

const router = express.Router();

// User Registration Route with Validation
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register', // Changed from '/signup' to '/register' for consistency
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
  ],
  registerUser // Updated function name
);

// User Login Route with Validation
/**
 * @route   POST /api/auth/login
 * @desc    Login a user and return a JWT
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
  loginUser // Updated function name
);

module.exports = router;

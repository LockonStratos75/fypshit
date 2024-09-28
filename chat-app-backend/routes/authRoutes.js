const express = require('express');
const { signup, login } = require('../controllers/authController');
const { body } = require('express-validator');

const router = express.Router();

// Signup Route with Validation
router.post('/signup', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'psychologist', 'user']).withMessage('Invalid role'),
], signup);

// Login Route with Validation
router.post('/login', [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').exists().withMessage('Password is required'),
], login);

module.exports = router;

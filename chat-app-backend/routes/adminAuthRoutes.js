// backend/routes/adminAuthRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');

/**
 * @route   POST /admin/auth/login
 * @desc    Login admin and return JWT token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validateRequest,
  adminController.adminLogin
);

module.exports = router;

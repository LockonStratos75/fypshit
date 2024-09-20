// backend/routes/sanityLevelRoutes.js

const express = require('express');
const { getSanityLevel, updateSanityLevel } = require('../controllers/sanityLevelController');
const authenticateToken = require('../middlewares/authMiddleware'); // Authentication middleware

const router = express.Router();

// Protect all routes below with authentication middleware
router.use(authenticateToken);

/**
 * @route   GET /sanity
 * @desc    Get current sanity level
 * @access  Private
 */
router.get('/', getSanityLevel);

/**
 * @route   POST /sanity
 * @desc    Create or update sanity level
 * @access  Private
 */
router.post('/', updateSanityLevel);

module.exports = router;

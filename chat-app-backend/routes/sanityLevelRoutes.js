// backend/routes/sanityLevelRoutes.js
const express = require('express');
const { getSanityLevels, getSanityLevelByUser, updateSanityLevel, getSanityLevelForCurrentUser } = require('../controllers/sanityLevelController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSanityLevels);  // Get all sanity levels and calculate average
router.get('/user/:userId', getSanityLevelByUser);  // Get sanity level by user ID
router.get('/user', getSanityLevelForCurrentUser); // Get sanity level for current user
router.post('/', updateSanityLevel);  // Update sanity level

module.exports = router;

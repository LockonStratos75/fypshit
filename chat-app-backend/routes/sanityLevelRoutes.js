// backend/routes/sanityLevelRoutes.js
const express = require('express');
const { getSanityLevel, updateSanityLevel } = require('../controllers/sanityLevelController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Fixed import

const router = express.Router();

router.use(authenticateToken);

router.get('/', getSanityLevel);
router.post('/', updateSanityLevel);

module.exports = router;

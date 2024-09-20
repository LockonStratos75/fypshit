// backend/routes/profileRoutes.js
const express = require('express');
const {
  manageProfiles,
  updateUserProfile,
  updatePsychologistProfile,
  reviewPsychologistApplication,
} = require('../controllers/profileController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Fixed import

const router = express.Router();

router.get('/', authenticateToken, manageProfiles);
router.post('/updateUser', authenticateToken, updateUserProfile);
router.post('/updatePsychologist', authenticateToken, updatePsychologistProfile);
router.post('/reviewApplication', authenticateToken, reviewPsychologistApplication);

module.exports = router;

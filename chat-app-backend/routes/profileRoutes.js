// backend/routes/profileRoutes.js
const express = require('express');
const {
  manageProfiles,
  updateUserProfile,
  updatePsychologistProfile,
} = require('../controllers/profileController');

const router = express.Router();

router.get('/', manageProfiles);
router.post('/updateUser', updateUserProfile);
router.post('/updatePsychologist', updatePsychologistProfile);

module.exports = router;

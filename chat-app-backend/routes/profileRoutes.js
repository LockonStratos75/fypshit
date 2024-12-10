

// backend/routes/profileRoutes.js
const express = require('express');
const { completeUserProfile } = require('../controllers/profileController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

const {
  manageProfiles,
  updateUserProfile,
  updatePsychologistProfile,
  reviewPsychologistApplication,
} = require('../controllers/profileController');

const router = express.Router();

// Complete Profile Endpoint
router.post(
    '/complete',
    authenticateToken,
    [
      body('gender')
          .optional()
          .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
          .withMessage('Invalid gender.'),
      body('age')
          .optional()
          .isInt({ min: 0, max: 120 })
          .withMessage('Age must be between 0 and 120.'),
      body('location')
          .optional()
          .isString()
          .trim()
          .isLength({ max: 100 })
          .withMessage('Location cannot exceed 100 characters.'),
      body('phoneNumber')
          .optional()
          .matches(/^\+?[1-9]\d{1,14}$/)
          .withMessage('Invalid phone number format.'),
      body('guardianPhoneNumber')
          .optional()
          .matches(/^\+?[1-9]\d{1,14}$/)
          .withMessage('Invalid guardian phone number format.'),
    ],
    completeUserProfile
);
router.get('/', authenticateToken, manageProfiles);
router.post('/updateUser', authenticateToken, updateUserProfile);
router.post('/updatePsychologist', authenticateToken, updatePsychologistProfile);
router.post('/reviewApplication', authenticateToken, reviewPsychologistApplication);

module.exports = router;




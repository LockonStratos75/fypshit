// backend/routes/profileRoutes.js
const express = require('express');
const { completeUserProfile, manageProfiles, updateUserProfile, updatePsychologistProfile, reviewPsychologistApplication } = require('../controllers/profileController');
const { authenticateToken, authorizeAdmin } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

// Complete Profile Endpoint for Users
// Users who have not completed their profile can only access this route
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

// The following routes are admin functionalities
router.get('/', authenticateToken, authorizeAdmin, manageProfiles);
router.post('/updateUser', authenticateToken, authorizeAdmin, updateUserProfile);
router.post('/updatePsychologist', authenticateToken, authorizeAdmin, updatePsychologistProfile);
router.post('/reviewApplication', authenticateToken, authorizeAdmin, reviewPsychologistApplication);

module.exports = router;

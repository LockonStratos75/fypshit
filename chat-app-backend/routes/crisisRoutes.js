// backend/routes/crisisRoutes.js

const express = require('express');
const { checkAndHandleCrisis } = require('../controllers/crisisController');
const { authenticateToken, authorizeAdmin, authorizePsychologist } = require('../middlewares/authMiddleware');

const router = express.Router();

// Only authenticated admin or psychologist can manually trigger the crisis check for a user
router.post(
  '/check',
  authenticateToken,
  (req, res, next) => {
    // Authorization: Ensure the user is Admin or Psychologist
    if (req.userType !== 'AdminProfile' && req.userType !== 'PsychologistProfile') {
      return res.status(403).json({ message: 'Access restricted to Admin or Psychologist.' });
    }
    checkAndHandleCrisis(req, res, next);
  }
);

module.exports = router;

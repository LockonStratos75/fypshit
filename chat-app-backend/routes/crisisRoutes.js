const express = require('express');
const { checkAndHandleCrisis } = require('../controllers/crisisController');
const { authenticateToken, authorizeAdmin, authorizePsychologist } = require('../middlewares/authMiddleware');

// Depending on your logic, maybe admin or psychologist triggers the crisis check
// For demonstration, let's say admin triggers it:
const router = express.Router();

// Only authenticated admin or psychologist can manually trigger the crisis check for a user
router.post('/check', authenticateToken, (req, res, next) => {
  // You can decide who can trigger this:
  // If only admin: use authorizeAdmin
  // If psychologist or admin can trigger: either use authorizePsychologist or both
  // For now, let's allow admin and psychologist:
  if (req.userType !== 'AdminProfile' && req.userType !== 'PsychologistProfile') {
    return res.status(403).json({ message: 'Access restricted to Admin or Psychologist.' });
  }
  checkAndHandleCrisis(req, res, next);
});

module.exports = router;

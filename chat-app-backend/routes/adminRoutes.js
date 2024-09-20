// backend/routes/adminRoutes.js

const express = require('express');
const {
  manageUserAccounts,
  reviewPsychologistRegistrations,
  approvePsychologist,
  rejectPsychologist,
  sendAnnouncement,
  getLogs,
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware'); // Correct import

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Apply authorization middleware for admin role
router.use(authorizeRoles('admin')); // This line requires authorizeRoles to be a function

// User account management
router.post('/users/manage', manageUserAccounts);

// Review psychologist registrations
router.get('/psychologists/pending', reviewPsychologistRegistrations);
router.post('/psychologists/approve', approvePsychologist);
router.post('/psychologists/reject', rejectPsychologist);

// Send announcements
router.post('/announcements', sendAnnouncement);

// Access logs
router.get('/logs', getLogs);

module.exports = router;

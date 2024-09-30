const express = require('express');
const {
  manageUserAccounts,
  reviewPsychologistRegistrations,
  approvePsychologist,
  rejectPsychologist,
  sendAnnouncement,
  getLogs,
  getAllUsers, // New controller function to get users by role
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// User account management
router.post('/users/manage', manageUserAccounts);

// Get users by role
router.get('/users', getAllUsers); // New endpoint to fetch users with a specific role

// Review psychologist registrations
router.get('/psychologists/pending', reviewPsychologistRegistrations);
router.post('/psychologists/approve', approvePsychologist);
router.post('/psychologists/reject', rejectPsychologist);

// Send announcements
router.post('/announcements', sendAnnouncement);

// Access logs
router.get('/logs', getLogs);

module.exports = router;

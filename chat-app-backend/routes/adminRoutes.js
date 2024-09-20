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
const { authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authorizeRoles('admin'));

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

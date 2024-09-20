// backend/routes/chatSessionRoutes.js
const express = require('express');
const { getUserSessions, getSessionById, createSession, deleteSession } = require('../controllers/chatSessionController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Fixed import

const router = express.Router();

router.get('/', authenticateToken, getUserSessions);
router.get('/:id', authenticateToken, getSessionById);
router.post('/', authenticateToken, createSession);
router.delete('/:id', authenticateToken, deleteSession);

module.exports = router;

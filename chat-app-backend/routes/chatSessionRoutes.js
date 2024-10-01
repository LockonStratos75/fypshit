// backend/routes/chatSessionRoutes.js
const express = require('express');
const { getRecentSessions, getUserSessions, getSessionById, createSession, deleteSession } = require('../controllers/chatSessionController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Fixed import

const router = express.Router();

router.get('/recent', authenticateToken, getRecentSessions);  
router.get('/:id', authenticateToken, getSessionById);        
router.get('/', authenticateToken, getUserSessions);          
router.post('/', authenticateToken, createSession);           
router.delete('/:id', authenticateToken, deleteSession);      

module.exports = router;

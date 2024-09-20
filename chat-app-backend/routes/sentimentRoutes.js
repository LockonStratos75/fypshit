// backend/routes/sentimentRoutes.js
const express = require('express');
const { saveSentimentScore, getSentimentScores } = require('../controllers/sentimentScoreController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Fixed import

const router = express.Router();

router.post('/', authenticateToken, saveSentimentScore);
router.get('/', authenticateToken, getSentimentScores);

module.exports = router;

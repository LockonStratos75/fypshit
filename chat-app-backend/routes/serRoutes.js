// backend/routes/serRoutes.js
const express = require('express');
const { getSERResults, saveSERResult } = require('../controllers/serController');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Fixed import

const router = express.Router();

router.get('/', authenticateToken, getSERResults);
router.post('/', authenticateToken, saveSERResult);

module.exports = router;

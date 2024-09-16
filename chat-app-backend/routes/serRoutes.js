const express = require('express');
const { getSERResults, saveSERResult } = require('../controllers/serController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Define the routes for SER results
router.get('/', authenticateToken, getSERResults);  // Route to get SER results
router.post('/', authenticateToken, saveSERResult); // Route to save a new SER result

module.exports = router;

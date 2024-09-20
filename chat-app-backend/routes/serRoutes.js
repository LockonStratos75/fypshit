const express = require('express');
const { getSERResults, saveSERResult } = require('../controllers/serController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Define the routes for SER results
router.get('/', authenticateToken, getSERResults);  
router.post('/', authenticateToken, saveSERResult); 

module.exports = router;
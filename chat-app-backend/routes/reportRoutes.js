// backend/routes/reportRoutes.js
const express = require('express');
const { generateUserReport, getUserReports, downloadReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/authMiddleware'); 
const { body, param } = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');

const router = express.Router();

router.post(
  '/generate',
  authenticateToken,
  [
    body('userId').isMongoId().withMessage('Valid userId required.'),
    body('templateName').notEmpty().withMessage('templateName is required.')
  ],
  validateRequest,
  generateUserReport
);

router.get(
  '/user/:userId',
  authenticateToken,
  [param('userId').isMongoId().withMessage('Invalid User ID.')],
  validateRequest,
  getUserReports
);

router.get(
  '/:reportId/download',
  authenticateToken,
  [param('reportId').isMongoId().withMessage('Invalid Report ID.')],
  validateRequest,
  downloadReport
);

module.exports = router;

// backend/middlewares/logMiddleware.js

const fs = require('fs');
const path = require('path');

// Middleware to log user actions
const logAction = (req, res, next) => {
  const logFilePath = path.join(__dirname, '../logs/actions.log');

  // Create the logs directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, '../logs'))) {
    fs.mkdirSync(path.join(__dirname, '../logs'));
  }

  const logEntry = `${new Date().toISOString()} - ${req.user.email} - ${req.method} ${req.originalUrl}\n`;

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Logging Error:', err);
    }
  });

  next();
};

module.exports = logAction;

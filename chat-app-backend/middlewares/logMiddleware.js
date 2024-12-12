const fs = require('fs');
const path = require('path');

// Middleware to log user actions
const logAction = (req, res, next) => {
  const logFilePath = path.join(__dirname, '../logs/actions.log');

  // Create the logs directory if it doesn't exist
  if (!fs.existsSync(path.join(__dirname, '../logs'))) {
    fs.mkdirSync(path.join(__dirname, '../logs'));
  }

  // Get user identifier safely
  const userIdentifier = req.user 
    ? req.user.email || req.user.id || 'unknown-user'
    : 'unauthenticated';

  // Create log entry with more robust error handling
  const logEntry = `${new Date().toISOString()} - ${userIdentifier} - ${req.method} ${req.originalUrl}\n`;

  // Use try-catch for additional error handling
  try {
    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) {
        console.error('Logging Error:', err);
      }
    });
  } catch (error) {
    console.error('Failed to write log entry:', error);
  }

  next();
};

module.exports = logAction;
// backend/middlewares/errorHandler.js

// Global Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Global Error Handler:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Duplicate key error (e.g., unique fields)
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue);
    return res.status(409).json({ message: `Duplicate value entered for ${field}` });
  }

  // Default to 500 server error
  res.status(500).json({ message: 'Server Error' });
};

module.exports = errorHandler;

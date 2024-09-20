// backend/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  };
  
  module.exports = errorHandler;
  
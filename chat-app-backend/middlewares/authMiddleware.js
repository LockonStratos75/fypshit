// backend/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  if (req.path.startsWith('/auth')) return next(); // Skip authentication for auth routes

  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(403).json({ message: 'Invalid token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden: Insufficient rights' });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles, 
};

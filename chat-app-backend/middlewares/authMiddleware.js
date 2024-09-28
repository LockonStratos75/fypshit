// backend/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token after 'Bearer '
  console.log('Token received:', token);

  if (!token) {
    console.error('No token provided');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Find the user associated with the token
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// module.exports = { authenticateToken };


const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden: Insufficient rights' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };

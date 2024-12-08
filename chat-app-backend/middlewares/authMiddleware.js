// backend/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const AdminProfile = require('../models/AdminProfile');
const PsychologistProfile = require('../models/PsychologistProfile');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT tokens for Admins, Psychologists, and Users.
 */
exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Check if the authorization header is present
  if (!authHeader) {
    return res.status(401).json({ message: 'Access Token Required' });
  }

  const token = authHeader.split(' ')[1]; // Expecting 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ message: 'Access Token Required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { id, userType } = decoded;

    if (!id || !userType) {
      return res.status(401).json({ message: 'Invalid Token Payload' });
    }

    let user;

    if (userType === 'AdminProfile') {
      user = await AdminProfile.findOne({ adminId: id });
    } else if (userType === 'PsychologistProfile') {
      user = await PsychologistProfile.findOne({ psychologistId: id });
    } else if (userType === 'User') {
      user = await User.findOne({ userId: id });
    } else {
      return res.status(401).json({ message: 'Invalid User Type' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User Not Found' });
    }

    // For Psychologists and Users, check if profile is approved
    if (userType === 'PsychologistProfile' && user.status !== 'approved') {
      return res.status(403).json({ message: 'Your profile is not approved yet.' });
    }

    if (userType === 'User' && !user.profileCompleted) {
      return res.status(403).json({ message: 'Please complete your profile to access this resource.' });
    }

    // Attach user information and userType to the request object
    req.user = user;
    req.userType = userType;

    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

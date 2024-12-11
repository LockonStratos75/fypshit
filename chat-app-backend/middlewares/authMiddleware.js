// backend/middlewares/authMiddleware.js


const jwt = require('jsonwebtoken');
const AdminProfile = require('../models/AdminProfile');
const PsychologistProfile = require('../models/PsychologistProfile');
const User = require('../models/User');

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization Header:', authHeader); // Debugging

  if (!authHeader) {
    console.log('No Authorization Header');
    return res.status(401).json({ message: 'Access Token Required' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token); // Debugging

  if (!token) {
    console.log('No Token Provided');
    return res.status(401).json({ message: 'Access Token Required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); // Debugging
    const { id, userType } = decoded;

    if (!id || !userType) {
      console.log('Invalid Token Payload');
      return res.status(401).json({ message: 'Invalid Token Payload' });
    }

    let user;

    if (userType === 'AdminProfile') {
      user = await AdminProfile.findById(id); // Use findById with _id
    } else if (userType === 'PsychologistProfile') {
      user = await PsychologistProfile.findById(id); // Use findById with _id
    } else if (userType === 'User') {
      user = await User.findById(id); // Using findById
    } else {
      console.log('Invalid User Type:', userType);
      return res.status(401).json({ message: 'Invalid User Type' });
    }

    if (!user) {
      console.log('User Not Found');
      return res.status(401).json({ message: 'User Not Found' });
    }

    // If psychologist, ensure they are approved
    if (userType === 'PsychologistProfile' && user.status !== 'approved') {
      console.log('Psychologist Profile Not Approved');
      return res.status(403).json({ message: 'Your profile is not approved yet.' });
    }

    // If user is a normal user and has not completed profile
    if (userType === 'User' && !user.profileCompleted) {
      if (!req.originalUrl.includes('/profiles/complete')) {
        console.log('User Profile Not Completed');
        return res.status(403).json({ message: 'Please complete your profile to access this resource.' });
      }
    }

    req.user = user;
    req.userType = userType;

    console.log('Authentication Successful for User:', user.username || user._id);
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

// Additional helper middlewares
exports.authorizeAdmin = (req, res, next) => {
  if (req.userType !== 'AdminProfile') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

exports.authorizePsychologist = (req, res, next) => {
  if (req.userType !== 'PsychologistProfile') {
    return res.status(403).json({ message: 'Psychologist access required.' });
  }
  next();
};

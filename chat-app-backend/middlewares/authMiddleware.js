// backend/middlewares/authMiddleware.js


const jwt = require('jsonwebtoken');
const AdminProfile = require('../models/AdminProfile');
const PsychologistProfile = require('../models/PsychologistProfile');
const User = require('../models/User');

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Access Token Required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Token Required' });
  }

  try {
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
      user = await User.findById(id); // Using findById instead of findOne
    } else {
      return res.status(401).json({ message: 'Invalid User Type' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User Not Found' });
    }

    if (userType === 'PsychologistProfile' && user.status !== 'approved') {
      return res.status(403).json({ message: 'Your profile is not approved yet.' });
    }

    // If user is a normal user and has not completed profile
    // Allow only access to /api/profiles/complete endpoint
    if (userType === 'User' && !user.profileCompleted) {
      if (!req.originalUrl.includes('/profiles/complete')) {
        return res.status(403).json({ message: 'Please complete your profile to access this resource.' });
      }
    }

    req.user = user;
    req.userType = userType;

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

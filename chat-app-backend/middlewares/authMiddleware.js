// backend/middlewares/authMiddleware.js


const jwt = require('jsonwebtoken');
const AdminProfile = require('../models/AdminProfile');
const PsychologistProfile = require('../models/PsychologistProfile');
const User = require('../models/User');

exports.authenticateToken = async (req, res, next) => {
  // Skip authentication for specific registration routes
  const publicRoutes = [
    '/psychologist/auth/register',
    '/admin/auth/register',
    '/auth/register'
  ];

  if (publicRoutes.some(route => req.path.includes(route))) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  console.log('Authorization Header:', authHeader);

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
    switch (userType) {
      case 'AdminProfile':
        user = await AdminProfile.findById(id);
        break;
      case 'PsychologistProfile':
        user = await PsychologistProfile.findById(id);
        break;
      case 'User':
        user = await User.findById(id);
        break;
      default:
        return res.status(401).json({ message: 'Invalid User Type' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User Not Found' });
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

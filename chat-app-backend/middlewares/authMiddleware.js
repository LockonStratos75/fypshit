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
      user = await User.findById(id); // Using findById for User
    } else {
      return res.status(401).json({ message: 'Invalid User Type' });
    }

    if (!user) {
      return res.status(401).json({ message: 'User Not Found' });
    }

    // Handle Psychologist access restrictions based on status
    if (userType === 'PsychologistProfile') {
      // If psychologist has not completed profile (In this scenario, "completion" means filling required fields. 
      // After register, they have minimal data but must call /complete route.)
      // The initial register sets them as 'pending' but minimal data means they haven't completed their profile fields yet.
      // Actually, on register, the minimal fields are set, but they must call /complete to fill in specialization, phoneNumber, etc.
      // After calling /complete, they're still 'pending' but fully filled. They must wait for admin approval for 'approved' status.

      if (user.status === 'pending') {
        // Only allow /api/psychologist/profile/complete and /api/psychologist/profile/me routes
        // to let them complete or view their profile. They cannot access main functionalities until 'approved'.
        if (
          !req.originalUrl.includes('/api/psychologist/profile/complete') &&
          !req.originalUrl.includes('/api/psychologist/profile/me')
        ) {
          return res.status(403).json({ message: 'Your profile is not approved yet. Please complete your profile and wait for admin approval.' });
        }
      } else if (user.status === 'rejected') {
        // If rejected, they can't access any protected resource
        return res.status(403).json({ message: 'Your application has been rejected by the admin.' });
      }
      // If approved, no special restriction needed, proceed normally.
    }

    // If user is a normal user and has not completed profile
    if (userType === 'User' && !user.profileCompleted) {
      if (!req.originalUrl.includes('/api/profiles/complete')) {
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

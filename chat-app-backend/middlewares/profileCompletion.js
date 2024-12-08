// backend/middlewares/profileCompletionMiddleware.js

/**
 * Middleware to check if user's profile is completed or approved.
 * Applies differently based on userType.
 */
exports.checkProfileCompletion = (req, res, next) => {
  if (req.userType === 'User') {
    if (!req.user.profileCompleted) {
      return res.status(403).json({ message: 'Please complete your profile to access this resource.' });
    }
  } else if (req.userType === 'PsychologistProfile') {
    if (req.user.status !== 'approved') {
      return res.status(403).json({ message: 'Your profile is not approved yet.' });
    }
  }
  // For AdminProfile or if profile conditions are met, proceed
  next();
};

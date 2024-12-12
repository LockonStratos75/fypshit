// backend/middlewares/profileCompletionMiddleware.js

/**
 * Middleware to check if user's profile is completed or approved.
 * Applies differently based on userType.
 */
exports.checkProfileCompletion = (req, res, next) => {
  if (req.userType === 'User') {
    if (!req.user.profileCompleted && !req.originalUrl.includes('/profiles/complete')) {
      return res.status(403).json({ message: 'Please complete your profile to access this resource.' });
    }
  }
  // For AdminProfile or if profile conditions are met, proceed
  next();
};

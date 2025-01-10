// backend/controllers/psychologistController.js

const PsychologistProfile = require('../models/PsychologistProfile');
const MentalHealthAssessment = require('../models/MentalHealthAssessment'); 
const SanityLevel = require('../models/SanityLevel');
const SentimentScore = require('../models/SentimentScore');
const SERResult = require('../models/SERResult');
const ChatSession = require('../models/ChatSession');
const Report = require('../models/Report');
const User = require('../models/User');
const Log = require('../models/Log');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords
    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
/**
 * Register a new psychologist with complete profile
 * POST /psychologist/auth/register
 */
exports.registerPsychologist = async (req, res) => {
  try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
      }

      const { username, email, password, specialization, yearsOfExperience, phoneNumber } = req.body;

      // Check if psychologist already exists
      const existingPsychologist = await PsychologistProfile.findOne({ email });
      if (existingPsychologist) {
          return res.status(400).json({ message: 'Psychologist with this email already exists.' });
      }

      // Create psychologist profile with all required data and 'approved' status
      const newPsychologist = await PsychologistProfile.create({
          username,
          email,
          password, // Password will be hashed by pre-save middleware
          specialization,
          yearsOfExperience,
          phoneNumber,
      });

      // Log the action
      await Log.create({
          userId: newPsychologist._id, // Use _id instead of psychologistId
          userType: 'PsychologistProfile',
          action: 'Register',
          details: `Psychologist registered with email: ${email}`,
      });

      // Generate JWT token
      const token = jwt.sign(
          { id: newPsychologist._id.toString(), userType: 'PsychologistProfile' }, // Use _id for consistency
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      res.status(201).json({
          token,
          message: 'Registration successful.',
      });
  } catch (err) {
      console.error('Error during psychologist registration:', err.message);
      res.status(500).json({ message: 'Server Error' });
  }
};


/**
 * Login psychologist and return JWT token
 * POST /psychologist/auth/login
 */
exports.loginPsychologist = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if psychologist exists
    const psychologist = await PsychologistProfile.findOne({ email }).select('+password');
    if (!psychologist) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, psychologist.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: psychologist._id.toString(), userType: 'PsychologistProfile' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Log the action
    await Log.create({
      userId: psychologist._id,
      userType: 'PsychologistProfile',
      action: 'Login',
      details: `Psychologist with email ${email} logged in.`,
    });

    res.status(200).json({ token, message: 'Login successful.' });
  } catch (err) {
    console.error('Error during psychologist login:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


/**
 * Get Current Psychologist Profile
 * GET /psychologist/profile/me
 */
exports.getPsychologistProfile = async (req, res) => {
  try {
    res.status(200).json({ profile: req.user });
  } catch (err) {
    console.error('Error fetching psychologist profile:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await MentalHealthAssessment.find().populate('userId', 'username email'); // Populate userId to get user details
    if (!assessments || assessments.length === 0) {
      return res.status(404).json({ message: 'No assessments found.' });
    }
    res.status(200).json({ assessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserCompleteData = async (req, res) => {
  try {
    // 1) Validate user param
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'Missing user ID in params.' });
    }

    // 2) Basic user info
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 3) Current sanity level
    const sanityLevel = await SanityLevel.findOne({ user: userId }).lean();

    // 4) All mental health assessments for that user
    const assessments = await MentalHealthAssessment.find({ userId }).sort({ createdAt: -1 }).lean();

    // 5) SER results
    //    In your existing code, SER results are typically found by userId
    const serResults = await SERResult.find({ userId }).sort({ date: -1 }).lean();

    // 6) Sentiment scores
    const sentimentScores = await SentimentScore.find({ userId }).sort({ date: -1 }).lean();

    // 7) Chat sessions 
    //    If you only want "recent" or "all", up to you; here we fetch them all
    const chatSessions = await ChatSession.find({ userId }).sort({ date: -1 }).lean();

    // 8) Reports
    //    This uses the /report logic referencing user = userId
    const reports = await Report.find({ user: userId }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      user,
      sanityLevel,
      assessments,
      serResults,
      sentimentScores,
      chatSessions,
      reports,
    });
  } catch (error) {
    console.error('Error in getUserCompleteData:', error);
    return res.status(500).json({ message: 'Server Error fetching user complete data.' });
  }
};


exports.getLogs = async (req, res) => {
  try {
    // 1) Read page & limit from query; fallback to page=1, limit=10
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // 2) Build query: only logs of the current Psychologist
    const query = {
      userId: req.user._id,
      userType: 'PsychologistProfile'
    };

    // 3) Count total logs
    const totalCount = await Log.countDocuments(query);

    // 4) Retrieve logs with pagination
    const logs = await Log.find(query)
      .populate('userId', 'username email') // If needed
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)  // skip docs for previous pages
      .limit(limit);             // limit to 'limit' docs

    // 5) Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // 6) Return pagination info + docs
    return res.status(200).json({
      logs,
      totalCount,
      currentPage: page,
      totalPages
    });
  } catch (err) {
    console.error('Error fetching psychologist logs with pagination:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAllUserSanityLevels = async (req, res) => {
  try {
    // If a psychologist can see *all* users, remove the filter by assignedUsers, 
    // or if you only want them to see assigned patients, filter accordingly.

    const allSanityLevels = await SanityLevel.find({}).populate('user', 'username email');
    // Or if you want them only to see assigned users, 
    // you'd do some logic to gather psychologistId => assigned users => filter.

    if (!allSanityLevels) {
      return res.status(404).json({ message: 'No sanity levels found.' });
    }

    res.status(200).json({ sanityLevels: allSanityLevels });
  } catch (error) {
    console.error('Error fetching sanity levels:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
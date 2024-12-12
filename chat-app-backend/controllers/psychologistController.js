// backend/controllers/psychologistController.js

const PsychologistProfile = require('../models/PsychologistProfile');
const MentalHealthAssessment = require('../models/MentalHealthAssessment'); 
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
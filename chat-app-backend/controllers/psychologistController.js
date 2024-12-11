// backend/controllers/psychologistController.js

const PsychologistProfile = require('../models/PsychologistProfile');
const Log = require('../models/Log');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

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

    // Create psychologist profile with all required data
    const newPsychologist = await PsychologistProfile.create({
      username,
      email,
      password, // Password will be hashed by pre-save middleware
      specialization,
      yearsOfExperience,
      phoneNumber,
      // status is 'pending' by default
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
      message: 'Registration successful. Your application is pending admin approval.',
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

    // Check if profile is approved
    if (psychologist.status !== 'approved') {
      return res.status(403).json({ message: 'Your profile is not approved yet.' });
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
 * Complete or Update Psychologist Profile
 * (Optional: If you decide to allow post-registration updates)
 * POST /psychologist/profile/update
 */
exports.updatePsychologistProfile = async (req, res) => {
  try {
    const updates = req.body;
    const psychologistId = req.user._id;

    // Prevent status changes via profile updates
    if (updates.status) {
      delete updates.status;
    }

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Update psychologist profile
    const updatedProfile = await PsychologistProfile.findByIdAndUpdate(psychologistId, updates, {
      new: true,
      runValidators: true,
    }).select('-password'); // Exclude password

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Psychologist profile not found.' });
    }

    // Log the action
    await Log.create({
      userId: psychologistId,
      userType: 'PsychologistProfile',
      action: 'Update Profile',
      details: `Psychologist updated their profile.`,
    });

    res.status(200).json({ message: 'Profile updated successfully.', profile: updatedProfile });
  } catch (err) {
    console.error('Error updating psychologist profile:', err.message);
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

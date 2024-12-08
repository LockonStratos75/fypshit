// backend/controllers/psychologistController.js

const path = require('path');
const PsychologistProfile = require('../models/PsychologistProfile');
const Log = require('../models/Log');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * =======================
 * Psychologist Controller
 * =======================
 */

/**
 * Register a new psychologist
 * POST /api/psychologist/auth/register
 */
exports.registerPsychologist = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { username, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Check if psychologist already exists
    const existingPsychologist = await PsychologistProfile.findOne({ email });
    if (existingPsychologist) {
      return res.status(400).json({ message: 'Psychologist with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create psychologist profile with minimal data
    const newPsychologist = await PsychologistProfile.create({
      username,
      email,
      password: hashedPassword,
      // status is 'pending' by default
    });

    // Log the action
    await Log.create({
      userId: newPsychologist.psychologistId,
      userType: 'PsychologistProfile',
      action: 'Register',
      details: `Psychologist registered with email: ${email}`,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newPsychologist.psychologistId, userType: 'PsychologistProfile' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token, message: 'Registration successful. Please complete your profile.' });
  } catch (err) {
    console.error('Error during psychologist registration:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Login psychologist and return JWT token
 * POST /api/psychologist/auth/login
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
      { id: psychologist.psychologistId, userType: 'PsychologistProfile' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Log the action
    await Log.create({
      userId: psychologist.psychologistId,
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
 * POST /api/psychologist/profile/complete
 */
exports.completePsychologistProfile = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { specialization, yearsOfExperience, phoneNumber } = req.body;

    // Update psychologist's profile and set status to 'pending' for approval
    const updatedProfile = await PsychologistProfile.findOneAndUpdate(
      { psychologistId: req.user.id },
      { 
        specialization, 
        yearsOfExperience, 
        phoneNumber, 
        status: 'pending' // Reset status to 'pending' after profile completion
      },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Psychologist profile not found.' });
    }

    // Log the action
    await Log.create({
      userId: updatedProfile.psychologistId,
      userType: 'PsychologistProfile',
      action: 'Complete Profile',
      details: `Psychologist completed their profile.`,
    });

    res.status(200).json({ message: 'Profile completed successfully and submitted for approval.', profile: updatedProfile });
  } catch (err) {
    console.error('Error completing psychologist profile:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Get Current Psychologist Profile
 * GET /api/psychologist/profile/me
 */
exports.getPsychologistProfile = async (req, res) => {
  try {
    res.status(200).json({ profile: req.user });
  } catch (err) {
    console.error('Error fetching psychologist profile:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Upload Profile Picture
 * POST /api/psychologist/:id/profile-picture
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    const psychologistId = req.params.id;

    // Ensure the authenticated user is the same as the psychologist being updated
    if (req.user.id !== psychologistId) {
      return res.status(403).json({ message: 'Unauthorized to upload profile picture for this account.' });
    }

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Construct the file path (relative to the public directory)
    const profilePicturePath = `/uploads/profile_pictures/${req.file.filename}`;

    // Update psychologist's profile with the profile picture path
    const updatedProfile = await PsychologistProfile.findOneAndUpdate(
      { psychologistId },
      { profilePicture: profilePicturePath },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from the response

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: 'Psychologist not found.' });
    }

    // Log the action
    await Log.create({
      userId: updatedProfile.psychologistId,
      userType: 'PsychologistProfile',
      action: 'Upload Profile Picture',
      details: `Psychologist uploaded a new profile picture.`,
    });

    res.status(200).json({ success: true, data: updatedProfile, message: 'Profile picture uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading profile picture:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get Psychologist's Profile Picture
 * GET /api/psychologist/:id/profile-picture
 */
exports.getProfilePicture = async (req, res) => {
  try {
    const psychologistId = req.params.id;

    const psychologist = await PsychologistProfile.findOne({ psychologistId }).select('profilePicture');

    if (!psychologist) {
      return res.status(404).json({ success: false, message: 'Psychologist not found.' });
    }

    const profilePicturePath = path.join(__dirname, '../public', psychologist.profilePicture);

    res.sendFile(profilePicturePath);
  } catch (error) {
    console.error('Error retrieving profile picture:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// backend/controllers/psychologistController.js

const path = require('path');
const PsychologistProfile = require('../models/PsychologistProfile');
const Log = require('../models/Log');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * Psychologist registers with minimal data: username, email, password => status: 'pending'.
 * They now must call /profile/complete to fill in required fields (specialization, phoneNumber, etc.).
 * After completion, status remains 'pending' until admin approves.
 */

/**
 * Register a new psychologist
 * POST /psychologist/auth/register
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
    // specialization, phoneNumber, etc. are not set yet.
    // status = 'pending' by default, they must call /complete
    const newPsychologist = await PsychologistProfile.create({
      username,
      email,
      password: hashedPassword,
      // Initially no specialization, phoneNumber, yearsOfExperience set.
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

    // They must now call /psychologist/profile/complete to fill in details
    // and remain pending until admin approves.
    res.status(201).json({ token, message: 'Registration successful. Please complete your profile.' });
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

    // If they haven't completed their profile (missing specialization or phoneNumber?), 
    // We rely on authMiddleware to restrict them to profile completion routes only.
    // If profile is incomplete: They have minimal fields but no specialization/phoneNumber set.
    // The `authMiddleware` checks `status`. If they are still 'pending' and haven't completed their profile,
    // they can only access /complete route. 
    // If they have completed profile but admin hasn't approved yet, still 'pending' means no main access.

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

    // If status is approved, they'll get full access.
    // If status is pending, only profile completion routes are accessible.
    // If status is rejected, no access.
    res.status(200).json({ token, message: 'Login successful.' });
  } catch (err) {
    console.error('Error during psychologist login:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Complete or Update Psychologist Profile
 * POST /psychologist/profile/complete
 */
exports.completePsychologistProfile = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { specialization, yearsOfExperience, phoneNumber } = req.body;

    // Update psychologist's profile and keep status as 'pending' (application needs admin approval)
    const updatedProfile = await PsychologistProfile.findOneAndUpdate(
      { psychologistId: req.user.id },
      { 
        specialization, 
        yearsOfExperience, 
        phoneNumber, 
        // status remains 'pending' even after completion
        // They must wait for admin approval to become 'approved'
      },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Psychologist profile not found.' });
    }

    await Log.create({
      userId: updatedProfile.psychologistId,
      userType: 'PsychologistProfile',
      action: 'Complete Profile',
      details: `Psychologist completed their profile.`,
    });

    res.status(200).json({ message: 'Profile completed successfully and is pending admin approval.', profile: updatedProfile });
  } catch (err) {
    console.error('Error completing psychologist profile:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * Get Current Psychologist Profile
 * GET /psychologist/profile/me
 */
exports.getPsychologistProfile = async (req, res) => {
  try {
    // The psychologist can view their profile to see if they're pending or approved.
    // If pending, they know they must wait for admin approval.
    res.status(200).json({ profile: req.user });
  } catch (err) {
    console.error('Error fetching psychologist profile:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


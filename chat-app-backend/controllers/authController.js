// backend/controllers/authController.js

const User = require('../models/User');
const Log = require('../models/Log');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

/**
 * User Registration
 * POST /api/auth/register
 */
exports.registerUser = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Create user
    const newUser = await User.create({
      username,
      email,
      password,
      // profileCompleted is false by default
    });

    // Log the action
    await Log.create({
      userId: newUser._id, // Changed from userId to _id
      userType: 'User',
      action: 'Register',
      details: `User registered with email: ${email}`,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, userType: 'User' }, // Changed from userId to _id
      process.env.JWT_SECRET, // Ensure this is set in .env
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
  } catch (err) {
    console.error('Error during user registration:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * User Login
 * POST /api/auth/login
 */
exports.loginUser = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, userType: 'User' }, // Changed from userId to _id
      process.env.JWT_SECRET, // Ensure this is set in .env
      { expiresIn: '1h' }
    );

    // Log the action
    await Log.create({
      userId: user._id, // Changed from userId to _id
      userType: 'User',
      action: 'Login',
      details: `User with email ${email} logged in.`,
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Error during user login:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT token
const generateToken = (user) => {
  const payload = {
    userId: user._id,
    role: user.role, // Include role in payload
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Signup Function
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Create new user with default role 'user' if role is not provided
    const newUser = new User({ username, email, password, role: role || 'user' });
    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({ message: 'Signup successful.', token });
  } catch (error) {
    console.error('Signup Error:', error);
    next(error);
  }
};

// Login Function
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({ message: 'Login successful.', token });
  } catch (error) {
    console.error('Login Error:', error);
    next(error);
  }
};

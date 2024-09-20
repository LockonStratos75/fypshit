// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: "User created successfully", token });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: "Email or username already in use." });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(404).json({ message: 'User not found' });
  
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password
      );
      if (!isPasswordValid)
        return res.status(401).json({ message: 'Invalid credentials' });
  
      // Update lastLogin field
      user.lastLogin = new Date();
      await user.save();
  
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
          maxAge: 3600000, // 1 hour
        })
        .status(200)
        .json({ message: 'Login successful' });
  
      await Log.create({
        userId: user._id,
        action: 'User Logged In',
        details: `Email: ${email}`,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

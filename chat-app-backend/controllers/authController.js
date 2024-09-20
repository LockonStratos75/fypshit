// backend/controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Log = require('../models/Log'); // Ensure Log model is imported

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        // Generate JWT token
        let token;
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not defined');
            }
            token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('Generated token:', token);
        } catch (tokenError) {
            console.error('Error generating token:', tokenError);
            return res.status(500).json({ message: 'Internal server error' });
        }

        // Send the response
        res.status(201).json({ message: "User created successfully", token });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: "Email or username already in use." });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
};

// backend/controllers/authController.js

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log('Attempting to find user with email:', email);
        const user = await User.findOne({ email });
        if (!user) {
            console.error('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Comparing passwords');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.error('Invalid credentials');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update lastLogin field
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        let token;
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not defined');
            }
            token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log('Generated token:', token);
        } catch (tokenError) {
            console.error('Error generating token:', tokenError);
            return res.status(500).json({ message: 'Internal server error' });
        }

        // Send the response with token
        res
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 3600000, // 1 hour
            })
            .status(200)
            .json({ message: 'Login successful', token }); // <-- Include token here

        // Log the action
        Log.create({
            userId: user._id,
            action: 'User Logged In',
            details: `Email: ${email}`,
        }).catch((err) => {
            console.error('Error logging action:', err);
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

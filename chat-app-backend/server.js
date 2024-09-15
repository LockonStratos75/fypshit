const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For JWT handling

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const uri = 'mongodb+srv://hrana988:K1onIgvERqGBx3gP@cluster0.xpxxo.mongodb.net/chatApp'; // Ensure this matches your MongoDB configuration
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);

// Chat session schema and model
const chatSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Link sessions to specific users
    date: String,
    messages: Array,
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

// Sentiment score schema and model
const sentimentScoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Link to specific user
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true },  // Link to specific session
    sessionName: { type: String, required: true },
    averageSentiment: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const SentimentScore = mongoose.model('SentimentScore', sentimentScoreSchema);

// SER Result schema and model
const serResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Link to specific user
    date: { type: Date, default: Date.now },
    highestEmotion: { label: String, score: Number },
    emotions: [{ label: String, score: Number, percentage: String }],
});

const SERResult = mongoose.model('SERResult', serResultSchema);






// Signup route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(201).json({ message: "User created successfully", token });  // Properly return the token
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error
            res.status(400).json({ message: "Email or username already in use." });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({ token });  // Properly return the token
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to verify JWT and extract user ID
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  // Extract token from 'Bearer <token>'

    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.userId = user.userId;  // Attach the user ID to the request object
        next();
    });
};

// Fetch user-specific sessions
app.get('/sessions', authenticateToken, async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.userId });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fetch a single session by ID for the authenticated user
app.get('/sessions/:id', authenticateToken, async (req, res) => {
    try {
        const session = await ChatSession.findOne({ _id: req.params.id, userId: req.userId });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new session for the authenticated user
app.post('/sessions', authenticateToken, async (req, res) => {
    const newSession = new ChatSession({ ...req.body, userId: req.userId });
    try {
        await newSession.save();
        res.status(201).json(newSession);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a user-specific session
app.delete('/sessions/:id', authenticateToken, async (req, res) => {
    try {
        const session = await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Save sentiment score
app.post('/sentiment', authenticateToken, async (req, res) => {
    const { sessionId, sessionName, averageSentiment } = req.body;  // Get data from request body

    try {
        // Create a new sentiment score entry
        const sentimentScore = new SentimentScore({
            userId: req.userId,  // From the authenticated token
            sessionId: sessionId,
            sessionName: sessionName,
            averageSentiment: averageSentiment,
            date: new Date()
        });

        await sentimentScore.save();  // Save to the database
        res.status(201).json(sentimentScore);  // Return the saved sentiment score
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Save SER results
app.post('/ser', authenticateToken, async (req, res) => {
    const { highestEmotion, emotions } = req.body;  // Get data from request body

    try {
        // Create a new SER result entry
        const serResult = new SERResult({
            userId: req.userId,  // From the authenticated token
            highestEmotion,
            emotions,
            date: new Date()
        });

        await serResult.save();  // Save to the database
        res.status(201).json(serResult);  // Return the saved SER result
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fetch sentiment scores for the authenticated user
app.get('/sentiment', authenticateToken, async (req, res) => {
    try {
        const sentimentScores = await SentimentScore.find({ userId: req.userId });
        res.json(sentimentScores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fetch SER results for the authenticated user
app.get('/ser', authenticateToken, async (req, res) => {
    try {
        const serResults = await SERResult.find({ userId: req.userId });
        res.json(serResults);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

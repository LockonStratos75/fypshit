const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const uri = 'mongodb+srv://hrana988:K1onIgvERqGBx3gP@cluster0.xpxxo.mongodb.net/chatApp';  // Ensure this matches your MongoDB configuration
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Chat session schema and model
const chatSessionSchema = new mongoose.Schema({
    id: String,
    date: String,
    messages: Array,
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

// Routes
app.get('/sessions', async (req, res) => {
    try {
        const sessions = await ChatSession.find();
        res.json(sessions);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/sessions/:id', async (req, res) => {
    try {
        const session = await ChatSession.findById(req.params.id);
        res.json(session);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/sessions', async (req, res) => {
    const newSession = new ChatSession(req.body);
    try {
        await newSession.save();
        res.status(201).send(newSession);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.delete('/sessions/:id', async (req, res) => {
    try {
        await ChatSession.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: 'Session deleted successfully' });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

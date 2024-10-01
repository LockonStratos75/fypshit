// backend/controllers/chatSessionController.js
const ChatSession = require('../models/ChatSession');

// Fetch recent sessions (limit to 5 most recent)
exports.getRecentSessions = async (req, res) => {
  try {
    const recentSessions = await ChatSession.find().sort({ date: -1 }).limit(10);  
    res.status(200).json({ sessions: recentSessions });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching recent sessions.' });
  }
};

exports.getUserSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSession = async (req, res) => {
  const newSession = new ChatSession({ ...req.body, userId: req.user._id });
  try {
    await newSession.save();
    res.status(201).json(newSession);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

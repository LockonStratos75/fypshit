// backend/controllers/sentimentScoreController.js
const SentimentScore = require('../models/SentimentScore');

exports.saveSentimentScore = async (req, res) => {
  const { sessionId, sessionName, averageSentiment } = req.body;

  try {
    const sentimentScore = new SentimentScore({
      userId: req.user._id,
      sessionId,
      sessionName,
      averageSentiment,
      date: new Date(),
    });

    await sentimentScore.save();
    res.status(201).json(sentimentScore);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSentimentScores = async (req, res) => {
  try {
    const sentimentScores = await SentimentScore.find({ userId: req.user._id });
    res.json(sentimentScores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

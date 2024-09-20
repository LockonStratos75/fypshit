// backend/controllers/serController.js
const SERResult = require('../models/SERResult');

exports.getSERResults = async (req, res) => {
  try {
    const serResults = await SERResult.find({ userId: req.user._id });
    res.json(serResults);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.saveSERResult = async (req, res) => {
  const { highestEmotion, emotions } = req.body;

  try {
    const serResult = new SERResult({
      userId: req.user._id,
      highestEmotion,
      emotions,
      date: new Date(),
    });

    await serResult.save();
    res.status(201).json(serResult);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

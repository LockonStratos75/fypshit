// backend/controllers/sanityLevelController.js
const SanityLevel = require('../models/SanityLevel');

exports.getSanityLevel = async (req, res) => {
  try {
    const sanityLevel = await SanityLevel.findOne({ user: req.user._id });

    if (!sanityLevel) {
      return res.status(404).json({ message: 'Sanity level not found. Please calculate it first.' });
    }

    res.status(200).json({ sanityPercentage: sanityLevel.sanityPercentage });
  } catch (err) {
    console.error('Error in getSanityLevel:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateSanityLevel = async (req, res) => {
  const { sanityPercentage } = req.body;

  if (
    sanityPercentage === undefined ||
    typeof sanityPercentage !== 'number' ||
    sanityPercentage < 0 ||
    sanityPercentage > 100
  ) {
    return res.status(400).json({ message: 'Invalid sanity percentage. It must be a number between 0 and 100.' });
  }

  try {
    let sanityLevel = await SanityLevel.findOne({ user: req.user._id });

    if (sanityLevel) {
      sanityLevel.sanityPercentage = sanityPercentage;
      await sanityLevel.save();
      return res.status(200).json({
        message: 'Sanity level updated successfully.',
        sanityPercentage: sanityLevel.sanityPercentage,
      });
    } else {
      sanityLevel = new SanityLevel({
        user: req.user._id,
        sanityPercentage,
      });
      await sanityLevel.save();
      return res.status(201).json({
        message: 'Sanity level created successfully.',
        sanityPercentage: sanityLevel.sanityPercentage,
      });
    }
  } catch (err) {
    console.error('Error in updateSanityLevel:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({
        message: 'Sanity level already exists for this user. Please try updating instead.',
      });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

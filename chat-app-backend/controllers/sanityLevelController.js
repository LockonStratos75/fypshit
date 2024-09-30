const SanityLevel = require('../models/SanityLevel');
const User = require('../models/User');

// Get all sanity levels and calculate average
exports.getSanityLevels = async (req, res) => {
  try {
    const sanityLevels = await SanityLevel.find().populate('user', 'username role');
    if (!sanityLevels || sanityLevels.length === 0) {
      return res.status(404).json({ message: 'No sanity levels found.' });
    }

    const averageSanityLevel = sanityLevels.reduce((acc, sanity) => acc + sanity.sanityPercentage, 0) / sanityLevels.length;

    res.status(200).json({
      sanityLevels,
      averageSanityLevel: averageSanityLevel.toFixed(2), // Round to 2 decimal places
    });
  } catch (err) {
    console.error('Error in getSanityLevels:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get sanity level by user ID
exports.getSanityLevelByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const sanityLevel = await SanityLevel.findOne({ user: userId }).populate('user', 'username role');
    if (!sanityLevel) {
      return res.status(404).json({ message: 'Sanity level not found for the user.' });
    }

    res.status(200).json(sanityLevel);
  } catch (err) {
    console.error('Error in getSanityLevelByUser:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update sanity level
exports.updateSanityLevel = async (req, res) => {
  const { sanityPercentage } = req.body;
  const userId = req.user._id;

  if (sanityPercentage === undefined || typeof sanityPercentage !== 'number' || sanityPercentage < 0 || sanityPercentage > 100) {
    return res.status(400).json({ message: 'Invalid sanity percentage. It must be a number between 0 and 100.' });
  }

  try {
    let sanityLevel = await SanityLevel.findOne({ user: userId });

    if (sanityLevel) {
      sanityLevel.sanityPercentage = sanityPercentage;
      await sanityLevel.save();
      return res.status(200).json({
        message: 'Sanity level updated successfully.',
        sanityPercentage: sanityLevel.sanityPercentage,
      });
    } else {
      sanityLevel = new SanityLevel({
        user: userId,
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
      return res.status(400).json({ message: 'Sanity level already exists for this user.' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

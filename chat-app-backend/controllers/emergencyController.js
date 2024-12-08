// backend/controllers/emergencyController.js

const Emergency = require('../models/Emergency');
const Log = require('../models/Log');

// @desc    Get all emergencies
// @route   GET /api/emergencies
// @access  Private (Admins)
exports.getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find().populate('reportedBy', 'username email');
    res.status(200).json({ success: true, data: emergencies });
  } catch (error) {
    console.error('Error fetching emergencies:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new emergency
// @route   POST /api/emergencies
// @access  Private (Admins and Psychologists)
exports.createEmergency = async (req, res) => {
  try {
    const { type, description } = req.body;

    const newEmergency = await Emergency.create({
      type,
      description,
      reportedBy: req.user._id,
    });

    // Log the creation
    await Log.create({
      userId: req.user._id,
      action: 'Report Emergency',
      details: `Emergency ID: ${newEmergency._id}`,
    });

    res.status(201).json({ success: true, data: newEmergency });
  } catch (error) {
    console.error('Error reporting emergency:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an emergency
// @route   PUT /api/emergencies/:id
// @access  Private (Admins)
exports.updateEmergency = async (req, res) => {
  try {
    const emergencyId = req.params.id;
    const updates = req.body;

    let emergency = await Emergency.findById(emergencyId);

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    // Only Admins can update emergencies
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update emergencies' });
    }

    emergency = await Emergency.findByIdAndUpdate(emergencyId, updates, {
      new: true,
      runValidators: true,
    }).populate('reportedBy', 'username email');

    // Log the update
    await Log.create({
      userId: req.user._id,
      action: 'Update Emergency',
      details: `Emergency ID: ${emergency._id}`,
    });

    res.status(200).json({ success: true, data: emergency });
  } catch (error) {
    console.error('Error updating emergency:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an emergency
// @route   DELETE /api/emergencies/:id
// @access  Private (Admins)
exports.deleteEmergency = async (req, res) => {
  try {
    const emergencyId = req.params.id;

    const emergency = await Emergency.findById(emergencyId);

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    // Only Admins can delete emergencies
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete emergencies' });
    }

    await emergency.remove();

    // Log the deletion
    await Log.create({
      userId: req.user._id,
      action: 'Delete Emergency',
      details: `Emergency ID: ${emergencyId}`,
    });

    res.status(200).json({ success: true, message: 'Emergency removed' });
  } catch (error) {
    console.error('Error deleting emergency:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

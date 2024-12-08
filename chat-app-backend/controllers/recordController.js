// backend/controllers/recordController.js

const Record = require('../models/Record');
const Log = require('../models/Log');

// @desc    Get all records
// @route   GET /api/records
// @access  Private (Admins and Psychologists)
exports.getRecords = async (req, res) => {
  try {
    const records = await Record.find().populate('createdBy', 'username email');
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error('Error fetching records:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new record
// @route   POST /api/records
// @access  Private (Admins and Psychologists)
exports.createRecord = async (req, res) => {
  try {
    const { title, description } = req.body;

    const newRecord = await Record.create({
      title,
      description,
      createdBy: req.user._id, // Assuming authMiddleware attaches user to req
    });

    // Log the creation
    await Log.create({
      userId: req.user._id,
      action: 'Create Record',
      details: `Record ID: ${newRecord._id}`,
    });

    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    console.error('Error creating record:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Private (Admins and Psychologists)
exports.updateRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    const updates = req.body;

    let record = await Record.findById(recordId);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Optionally, verify if the user is authorized to update the record
    // For example, only the creator or admin can update

    record = await Record.findByIdAndUpdate(recordId, updates, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'username email');

    // Log the update
    await Log.create({
      userId: req.user._id,
      action: 'Update Record',
      details: `Record ID: ${record._id}`,
    });

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error('Error updating record:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Private (Admins and Psychologists)
exports.deleteRecord = async (req, res) => {
  try {
    const recordId = req.params.id;

    const record = await Record.findById(recordId);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Optionally, verify if the user is authorized to delete the record

    await record.remove();

    // Log the deletion
    await Log.create({
      userId: req.user._id,
      action: 'Delete Record',
      details: `Record ID: ${recordId}`,
    });

    res.status(200).json({ success: true, message: 'Record removed' });
  } catch (error) {
    console.error('Error deleting record:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

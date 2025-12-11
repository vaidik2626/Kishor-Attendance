const Saint = require('../models/Saint');

// Create Saint
const createSaint = async (req, res) => {
  try {
    const saint = new Saint(req.body);
    await saint.save();
    res.status(201).json({ success: true, data: saint });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all Saints
const getAllSaints = async (req, res) => {
  try {
    const saints = await Saint.find().sort({ tag: 1, name: 1 });
    res.status(200).json({ success: true, data: saints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching saints', error: error.message });
  }
};

// Get Saint by ID
const getSaintById = async (req, res) => {
  try {
    const saint = await Saint.findById(req.params.id);
    if (!saint) return res.status(404).json({ success: false, message: 'Saint not found' });
    res.status(200).json({ success: true, data: saint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Saint
const updateSaint = async (req, res) => {
  try {
    const saint = await Saint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!saint) return res.status(404).json({ success: false, message: 'Saint not found' });
    res.status(200).json({ success: true, data: saint });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete Saint
const deleteSaint = async (req, res) => {
  try {
    const saint = await Saint.findByIdAndDelete(req.params.id);
    if (!saint) return res.status(404).json({ success: false, message: 'Saint not found' });
    res.status(200).json({ success: true, message: 'Saint deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createSaint, getAllSaints, getSaintById, updateSaint, deleteSaint };

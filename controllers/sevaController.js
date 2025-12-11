const Seva = require('../models/Seva');

// Create Seva
exports.createSeva = async (req, res) => {
  try {
    const seva = new Seva(req.body);
    await seva.save();
    res.status(201).json({ success: true, data: seva });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all Sevas
exports.getAllSevas = async (req, res) => {
  try {
    const sevas = await Seva.find();
    res.status(200).json({ success: true, data: sevas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Seva by ID
exports.getSevaById = async (req, res) => {
  try {
    const seva = await Seva.findById(req.params.id);
    if (!seva) return res.status(404).json({ success: false, message: 'Seva not found' });
    res.status(200).json({ success: true, data: seva });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Seva
exports.updateSeva = async (req, res) => {
  try {
    const seva = await Seva.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!seva) return res.status(404).json({ success: false, message: 'Seva not found' });
    res.status(200).json({ success: true, data: seva });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete Seva
exports.deleteSeva = async (req, res) => {
  try {
    const seva = await Seva.findByIdAndDelete(req.params.id);
    if (!seva) return res.status(404).json({ success: false, message: 'Seva not found' });
    res.status(200).json({ success: true, message: 'Seva deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

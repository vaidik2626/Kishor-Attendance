const Saint = require('../models/Saint');

// Get all saints
const getAllSaints = async (req, res) => {
  try {
    const saints = await Saint.find().sort({ tag: 1, name: 1 });
    res.status(200).json({ success: true, data: saints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching saints', error: error.message });
  }
};

module.exports = { getAllSaints };

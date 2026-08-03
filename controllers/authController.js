const Admin = require('../models/Admin');
const { Member } = require('../models/Member');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your_jwt_secret_key', {
    expiresIn: '30d'
  });
};

// Register admin
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const adminExists = await Admin.findOne({ username });
    
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Create new admin
    const admin = await Admin.create({
      username,
      password
    });

    // Generate token
    const token = generateToken(admin._id, 'ADMIN');

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        id: admin._id,
        username: admin.username,
        role: 'ADMIN',
        token
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error registering admin',
      error: error.message
    });
  }
};

// Login admin
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Find admin
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Check password
    const isPasswordCorrect = await admin.comparePassword(password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate token
    const token = generateToken(admin._id, 'ADMIN');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: admin._id,
        username: admin.username,
        role: 'ADMIN',
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Login Poshak Leader (a Member with role POSHAK_LEADER and a password set).
// Accepts either `id` (the login page's name dropdown submits this) or
// `smkNo` (kept for any other caller / backward compatibility).
const leaderLogin = async (req, res) => {
  try {
    const { id, smkNo, password } = req.body;

    if ((!id && !smkNo) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please select your name and enter your password'
      });
    }

    const query = id
      ? { _id: id, role: 'POSHAK_LEADER' }
      : { smkNo, role: 'POSHAK_LEADER' };
    const leader = await Member.findOne(query).select('+password');

    if (!leader) {
      return res.status(401).json({
        success: false,
        message: 'Invalid selection or password'
      });
    }

    const isPasswordCorrect = await leader.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid selection or password'
      });
    }

    const token = generateToken(leader._id, 'POSHAK_LEADER');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: leader._id,
        name: `${leader.firstName || ''}${leader.lastName ? ' ' + leader.lastName : ''}`.trim(),
        smkNo: leader.smkNo,
        role: 'POSHAK_LEADER',
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Public: list of Poshak Leaders who have a login provisioned, for the
// login page's name dropdown. No auth required (it's shown before login),
// so only non-sensitive identifying fields are returned — no contact info.
const getLeaderOptions = async (req, res) => {
  try {
    const leaders = await Member.find(
      { role: 'POSHAK_LEADER', password: { $exists: true, $ne: null } },
      'firstName lastName smkNo sabhaType'
    ).sort({ firstName: 1 }).lean();

    res.status(200).json({ success: true, data: leaders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leader list',
      error: error.message
    });
  }
};

// Get current admin profile
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    
    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  leaderLogin,
  getLeaderOptions,
  getProfile
};

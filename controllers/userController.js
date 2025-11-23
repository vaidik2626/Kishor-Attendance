const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// Create a new user
const createUser = async (req, res) => {
  try {
    const userData = { ...req.body };
    
    // Handle photo upload if exists (Cloudinary URL)
    if (req.file) {
      userData.photo = req.file.path; // Cloudinary URL
      userData.photoPublicId = req.file.filename; // Cloudinary public_id for deletion
    }

    // Parse arrays if they come as strings
    if (typeof userData.skills === 'string') {
      userData.skills = JSON.parse(userData.skills);
    }
    if (typeof userData.hobbies === 'string') {
      userData.hobbies = JSON.parse(userData.hobbies);
    }
    if (typeof userData.assemblySaintsKnown === 'string') {
      userData.assemblySaintsKnown = JSON.parse(userData.assemblySaintsKnown);
    }
    if (typeof userData.hariDevoteesKnown === 'string') {
      userData.hariDevoteesKnown = JSON.parse(userData.hariDevoteesKnown);
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Update a user
const updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Handle new photo upload
    if (req.file) {
      // Delete old photo from Cloudinary if exists
      const user = await User.findById(req.params.id);
      if (user && user.photoPublicId) {
        try {
          await cloudinary.uploader.destroy(user.photoPublicId);
        } catch (error) {
          console.error('Error deleting old photo from Cloudinary:', error);
        }
      }
      updateData.photo = req.file.path; // Cloudinary URL
      updateData.photoPublicId = req.file.filename; // Cloudinary public_id
    }

    // Parse arrays if they come as strings
    if (typeof updateData.skills === 'string') {
      updateData.skills = JSON.parse(updateData.skills);
    }
    if (typeof updateData.hobbies === 'string') {
      updateData.hobbies = JSON.parse(updateData.hobbies);
    }
    if (typeof updateData.assemblySaintsKnown === 'string') {
      updateData.assemblySaintsKnown = JSON.parse(updateData.assemblySaintsKnown);
    }
    if (typeof updateData.hariDevoteesKnown === 'string') {
      updateData.hariDevoteesKnown = JSON.parse(updateData.hariDevoteesKnown);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete photo from Cloudinary if exists
    if (user.photoPublicId) {
      try {
        await cloudinary.uploader.destroy(user.photoPublicId);
      } catch (error) {
        console.error('Error deleting photo from Cloudinary:', error);
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};

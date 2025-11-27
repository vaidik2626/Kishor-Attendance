const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const csv = require('csvtojson');
const fs = require('fs');


// Bulk import users from JSON
const importUsersFromJSON = async (req, res) => {
  try {
    const usersArray = req.body;
    if (!Array.isArray(usersArray)) {
      return res.status(400).json({ success: false, message: 'Request body must be an array of user objects' });
    }
    const mappedUsers = usersArray.map(row => ({
      teenStatus: row.teenStatus || '',
      photoPublicId: row.photoPublicId || '',
      smkNo: row.smkNo || '',
      attendanceNumber: row.attendanceNumber || '',
      firstName: row.FirstName || row.firstName || '',
      lastName: row.lastName || '',
      middleName: row.middleName || '',
      address: row.address || '',
      nativeVillage: row.nativeVillage || '',
      personalMobile: row.personalMobile || '',
      homeMobile: String(row.homeMobile || ''),
      fatherMobile: String(row.fatherMobile || ''),
      fatherOccupation: row.fatherOccupation || '',
      dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
      Age: row.Age || '',
      satsangDay: row.satsangDay || '',
      bloodGroup: row.bloodGroup || '',
      education: String(row.education || ''),
      currentSchool: row.currentSchool || '',
      futureGoal: row.futureGoal || '',
      skills: Array.isArray(row.skills) ? row.skills : [],
      hobbies: Array.isArray(row.hobbies) ? row.hobbies : [],
      doWorship: row.doWorship === 'Yes' || row.doWorship === true,
      haveFriendsOutside: row.haveFriedsOutside === 'Yes' || row.haveFriendsOutside === true,
      satsangAtHome: row.satsangAtHome === 'Yes' || row.satsangAtHome === true,
      childrensAssembly: row.childrensAssembly || '',
      poshakLeaderSelection: Array.isArray(row.poshakLeaderSelection) ? row.poshakLeaderSelection : [],
      assemblyType: row.assemblyType || '',
      familyLeaderSelection: Array.isArray(row.familyLeaderSelection) ? row.familyLeaderSelection : [],
      sevaRole: row.sevaRole || '',
      whatsappGroupAdded: row.whatsappGroupAdded === 'Yes' || row.whatsappGroupAdded === true,
      familyTeen: row.familyTeen || ''
    }));
    const result = await User.insertMany(mappedUsers);
    res.status(201).json({ success: true, message: 'Users imported successfully', count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error importing users', error: error.message });
  }
};

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
    if (typeof userData.familyLeaderSelection === 'string') {
      userData.familyLeaderSelection = JSON.parse(userData.familyLeaderSelection);
    }
    if (typeof userData.userTag === 'string') {
      userData.userTag = userData.userTag;
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
    if (typeof updateData.familyLeaderSelection === 'string') {
      updateData.familyLeaderSelection = JSON.parse(updateData.familyLeaderSelection);
    }
    if (typeof updateData.userTag === 'string') {
      updateData.userTag = updateData.userTag;
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
  deleteUser,
  importUsersFromJSON
};

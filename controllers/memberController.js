const { Member, ROLES } = require("../models/Member");
const cloudinary = require("../config/cloudinary");
const generateHajriNumber = require("../utils/generateHajri");

// ✅ CREATE MEMBER
const createMember = async (req, res) => {
  try {
    const data = { ...req.body };

    // ✅ AUTO HAJRI NUMBER FOR KISHOR
    if (data.role === ROLES.KISHOR) {
      data.hajriNumber = await generateHajriNumber();
    }

    // ✅ HANDLE PHOTO UPLOAD
    if (req.file) {
      data.photoUrl = req.file.path;
      data.photoPublicId = req.file.filename;
    }

    // ✅ PARSE ARRAY FIELDS
    if (typeof data.skills === "string") data.skills = JSON.parse(data.skills);
    if (typeof data.hobbies === "string") data.hobbies = JSON.parse(data.hobbies);
    if (typeof data.sevaRoles === "string") data.sevaRoles = JSON.parse(data.sevaRoles);

    const member = await Member.create(data);

    res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: member
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating member",
      error: error.message
    });
  }
};




// ✅ GET ALL MEMBERS
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching members",
      error: error.message
    });
  }
};




// ✅ GET SINGLE MEMBER
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    res.status(200).json({ success: true, data: member });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// ✅ UPDATE MEMBER
const updateMember = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // ✅ UPDATE PHOTO
    if (req.file) {
      const oldMember = await Member.findById(req.params.id);

      if (oldMember?.photoPublicId) {
        await cloudinary.uploader.destroy(oldMember.photoPublicId);
      }

      updateData.photoUrl = req.file.path;
      updateData.photoPublicId = req.file.filename;
    }

    if (typeof updateData.skills === "string") updateData.skills = JSON.parse(updateData.skills);
    if (typeof updateData.hobbies === "string") updateData.hobbies = JSON.parse(updateData.hobbies);
    if (typeof updateData.sevaRoles === "string") updateData.sevaRoles = JSON.parse(updateData.sevaRoles);

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!member) return res.status(404).json({ success: false, message: "Member not found" });

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: member
    });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};




// ✅ DELETE MEMBER
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });

    if (member.photoPublicId) {
      await cloudinary.uploader.destroy(member.photoPublicId);
    }

    await Member.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Member deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// ✅ BULK IMPORT MEMBERS
const importMembersFromJSON = async (req, res) => {
  try {
    const membersArray = req.body;
    if (!Array.isArray(membersArray)) {
      return res.status(400).json({ success: false, message: "Body must be array" });
    }

    for (let row of membersArray) {
      if (row.role === ROLES.KISHOR && !row.hajriNumber) {
        row.hajriNumber = await generateHajriNumber();
      }
    }

    const result = await Member.insertMany(membersArray);

    res.status(201).json({
      success: true,
      message: "Members imported successfully",
      count: result.length,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error importing members",
      error: error.message
    });
  }
};




module.exports = {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  importMembersFromJSON
};

const { Member, ROLES } = require("../models/Member");
const cloudinary = require("../config/cloudinary");
const generateHajriNumber = require("../utils/generateHajri");
const generateRandomPassword = require("../utils/generatePassword");
const { normalizeMemberBody, applyPhotoReplacement, maybeHashPassword } = require("../utils/memberUpdate");

// ✅ CREATE MEMBER
const createMember = async (req, res) => {
  try {
    const data = normalizeMemberBody(req.body);
    // Login passwords are always system-generated, never admin-typed.
    delete data.password;

    // ✅ AUTO HAJRI NUMBER FOR KISHOR
    if (data.role === ROLES.KISHOR || data.role === ROLES.YUVAN) {
      data.hajriNumber = await generateHajriNumber();
    }

    // ✅ HANDLE PHOTO UPLOAD
    if (req.file) {
      data.photoUrl = req.file.path;
      data.photoPublicId = req.file.filename;
    }

    // ✅ AUTO-GENERATE LOGIN PASSWORD FOR POSHAK LEADER
    let generatedPassword;
    if (data.role === ROLES.POSHAK_LEADER) {
      generatedPassword = generateRandomPassword();
      data.password = generatedPassword;
    }

    const member = await Member.create(data);

    res.status(201).json({
      success: true,
      message: "Member created successfully",
      data: member,
      // Only ever returned once, right after generation — not retrievable later.
      generatedPassword
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
    const members = await Member.find().sort({ createdAt: -1 }).lean();

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

    // If this request identified as a Poshak Leader (via the optional
    // `identify` middleware), they may only view their own members.
    if (req.leader && String(member.poshakLeaderId) !== String(req.leader._id)) {
      return res.status(403).json({ success: false, message: "Not authorized to view this member" });
    }

    res.status(200).json({ success: true, data: member });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// ✅ UPDATE MEMBER
const updateMember = async (req, res) => {
  try {
    if (req.leader) {
      const existing = await Member.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: "Member not found" });
      if (String(existing.poshakLeaderId) !== String(req.leader._id)) {
        return res.status(403).json({ success: false, message: "Not authorized to edit this member" });
      }
    }

    let updateData = normalizeMemberBody(req.body);
    // Passwords are never admin-typed — only ever (re)generated via the
    // explicit regeneratePassword flag below, so drop anything else supplied.
    delete updateData.password;

    let generatedPassword;
    const wantsRegenerate = req.body.regeneratePassword === true || req.body.regeneratePassword === "true";
    if (wantsRegenerate) {
      generatedPassword = generateRandomPassword();
      updateData.password = generatedPassword;
    }
    updateData = await maybeHashPassword(updateData);

    updateData = await applyPhotoReplacement(req.params.id, updateData, req.file);

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!member) return res.status(404).json({ success: false, message: "Member not found" });

    res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: member,
      generatedPassword
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
      if ((row.role === ROLES.KISHOR || row.role === ROLES.YUVAN) && !row.hajriNumber) {
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

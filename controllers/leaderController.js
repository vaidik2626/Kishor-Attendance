const { Member } = require("../models/Member");
const Sabha = require("../models/Sabha");
const { normalizeMemberBody, applyPhotoReplacement, pickAllowedFields } = require("../utils/memberUpdate");

// Fields a Poshak Leader may edit on one of their own members. Deliberately
// excludes identity/administrative fields (smkNo, role, sabhaType,
// poshakLeaderId, familyLeaderId, kishorStatus, hajriNumber, password) —
// those stay admin-only.
const LEADER_EDITABLE_FIELDS = [
  "firstName", "middleName", "lastName",
  "mobileNumber", "personalMobile", "homeMobile", "fatherMobile",
  "address", "pincode", "nativePlace", "fatherOccupation",
  "dateOfBirth", "satsangDay", "bloodGroup",
  "currentStandard", "schoolName",
  "skills", "hobbies",
  "doesPooja", "hasOutsideFriends", "satsangAtHome",
  "balSabhaName", "balSabhaCoordinatorName",
  "sant1Name", "sant2Name",
  "haribhakta1Name", "haribhakta1Smk", "haribhakta1Mobile",
  "haribhakta2Name", "haribhakta2Smk", "haribhakta2Mobile",
  "sevaRoles", "whatsappGroupAdded"
];

// GET /api/leader/me
const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: req.leader });
};

// GET /api/leader/members
const getMyMembers = async (req, res) => {
  try {
    const members = await Member.find({ poshakLeaderId: req.leader._id })
      .sort({ firstName: 1 })
      .lean();
    res.status(200).json({ success: true, count: members.length, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching members", error: error.message });
  }
};

// GET /api/leader/members/:id
const getMyMemberById = async (req, res) => {
  try {
    const member = await Member.findOne({ _id: req.params.id, poshakLeaderId: req.leader._id });
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leader/members/:id
const updateMyMember = async (req, res) => {
  try {
    const existing = await Member.findOne({ _id: req.params.id, poshakLeaderId: req.leader._id });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const normalized = normalizeMemberBody(req.body);
    let updateData = pickAllowedFields(normalized, LEADER_EDITABLE_FIELDS);
    updateData = await applyPhotoReplacement(req.params.id, updateData, req.file);

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Member updated successfully", data: member });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/leader/sabha-report?startDate&endDate
// Same shape as the admin getAllSabhas(includeAttendance) response, except
// each sabha's attendance array is filtered down to only this leader's own
// members server-side, so no other leader's data is ever transmitted.
const getMySabhaReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.sabhaDate = {};
      if (startDate) filter.sabhaDate.$gte = new Date(startDate);
      if (endDate) filter.sabhaDate.$lte = new Date(endDate);
    }

    const myMembers = await Member.find({ poshakLeaderId: req.leader._id }, "_id").lean();
    const myMemberIds = new Set(myMembers.map((m) => String(m._id)));

    const sabhas = await Sabha.find(filter)
      .sort({ sabhaDate: -1 })
      .populate("attendance.user", "firstName lastName smkNo personalMobile")
      .lean();

    const scoped = sabhas.map((s) => ({
      _id: s._id,
      sabhaNo: s.sabhaNo,
      sabhaType: s.sabhaType,
      sabhaDate: s.sabhaDate,
      sabhaStartTime: s.sabhaStartTime,
      sabhaEndTime: s.sabhaEndTime,
      area: s.area,
      attendance: (s.attendance || []).filter((a) => a.user && myMemberIds.has(String(a.user._id)))
    }));

    res.status(200).json({ success: true, count: scoped.length, data: scoped });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching report", error: error.message });
  }
};

module.exports = { getMe, getMyMembers, getMyMemberById, updateMyMember, getMySabhaReport };

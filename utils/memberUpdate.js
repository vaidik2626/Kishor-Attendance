const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const { Member } = require("../models/Member");

function safeParseArrayField(field) {
  if (typeof field === "string" && field.trim() !== "") {
    try {
      return JSON.parse(field);
    } catch {
      return [];
    }
  }
  return Array.isArray(field) ? field : [];
}

// Shared body normalization used by both the admin member controller and the
// leader-scoped member controller: cleans up optional ObjectId fields sent as
// empty strings, and safely parses the comma/JSON array fields.
function normalizeMemberBody(rawBody) {
  const data = { ...rawBody };

  if (data.poshakLeaderId === "") data.poshakLeaderId = undefined;

  data.skills = safeParseArrayField(data.skills);
  data.hobbies = safeParseArrayField(data.hobbies);
  data.sevaRoles = safeParseArrayField(data.sevaRoles);

  return data;
}

// If a new photo was uploaded, deletes the member's old Cloudinary asset (if
// any) and returns the updateData with the new photo fields set.
async function applyPhotoReplacement(memberId, updateData, file) {
  if (!file) return updateData;

  const oldMember = await Member.findById(memberId);
  if (oldMember?.photoPublicId) {
    await cloudinary.uploader.destroy(oldMember.photoPublicId);
  }

  return { ...updateData, photoUrl: file.path, photoPublicId: file.filename };
}

// findByIdAndUpdate bypasses Mongoose's pre('save') hook (which only runs on
// .save()/.create()), so a plain-text password in an update payload must be
// hashed here explicitly before it's ever written.
async function maybeHashPassword(updateData) {
  if (!updateData.password) return updateData;
  const salt = await bcrypt.genSalt(10);
  return { ...updateData, password: await bcrypt.hash(updateData.password, salt) };
}

// Restricts an update payload to an explicit allow-list of fields — used when
// a lower-trust caller (a Poshak Leader editing one of their own members)
// should not be able to touch fields like role, poshakLeaderId, or password.
function pickAllowedFields(data, allowedFields) {
  const picked = {};
  for (const key of allowedFields) {
    if (key in data) picked[key] = data[key];
  }
  return picked;
}

module.exports = { normalizeMemberBody, applyPhotoReplacement, maybeHashPassword, pickAllowedFields };

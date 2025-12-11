const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");

const {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  importMembersFromJSON
} = require("../controllers/memberController");

// ✅ CREATE MEMBER
router.post("/", upload.single("photo"), createMember);

// ✅ BULK IMPORT
router.post("/bulk", importMembersFromJSON);

// ✅ GET ALL
router.get("/", getAllMembers);

// ✅ GET ONE
router.get("/:id", getMemberById);

// ✅ UPDATE
router.put("/:id", upload.single("photo"), updateMember);

// ✅ DELETE
router.delete("/:id", deleteMember);

module.exports = router;

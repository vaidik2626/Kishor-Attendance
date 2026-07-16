const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { identify } = require("../middleware/authMiddleware");

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

// ✅ GET ONE (identify: scopes Poshak Leader callers to their own members;
// no-op for today's unauthenticated/admin usage)
router.get("/:id", identify, getMemberById);

// ✅ UPDATE (identify: same ownership scoping as above)
router.put("/:id", identify, upload.single("photo"), updateMember);

// ✅ DELETE
router.delete("/:id", deleteMember);

module.exports = router;

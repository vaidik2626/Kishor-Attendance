const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { protectLeader } = require("../middleware/authMiddleware");
const {
  getMe,
  getMyMembers,
  getMyMemberById,
  updateMyMember,
  getMySabhaReport
} = require("../controllers/leaderController");

// Every route here requires a valid Poshak Leader token.
router.use(protectLeader);

router.get("/me", getMe);
router.get("/members", getMyMembers);
router.get("/members/:id", getMyMemberById);
router.put("/members/:id", upload.single("photo"), updateMyMember);
router.get("/sabha-report", getMySabhaReport);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  leaderLogin,
  getLeaderOptions,
  getProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/leader-login', leaderLogin);
router.get('/leaders', getLeaderOptions);

// Protected route
router.get('/profile', protect, getProfile);

module.exports = router;

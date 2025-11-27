const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  importUsersFromJSON
} = require('../controllers/userController');
const { storage } = require('../config/cloudinary');

// Configure multer with Cloudinary storage
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Routes
router.post('/users', upload.single('photo'), createUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', upload.single('photo'), updateUser);
router.delete('/users/:id', deleteUser);

// Bulk import users from JSON
router.post('/users/import-json', importUsersFromJSON);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createSabha,
  getAllSabhas,
  getSabhaById,
  updateSabha,
  deleteSabha,
  markAttendance,
  markBulkAttendance,
  getSabhaAttendanceReport,
  getUserAttendanceHistory
} = require('../controllers/sabhaController');

// Sabha CRUD routes
router.post('/sabhas', createSabha);
router.get('/sabhas', getAllSabhas);
router.get('/sabhas/:id', getSabhaById);
router.put('/sabhas/:id', updateSabha);
router.delete('/sabhas/:id', deleteSabha);

// Attendance routes
router.post('/sabhas/:sabhaId/attendance', markAttendance);
router.post('/sabhas/:sabhaId/attendance/bulk', markBulkAttendance);
router.get('/sabhas/:sabhaId/attendance/report', getSabhaAttendanceReport);
router.get('/users/:userId/attendance/history', getUserAttendanceHistory);

module.exports = router;

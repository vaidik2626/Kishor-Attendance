// routes/sabhaRoutes.js
const express = require('express');
const router = express.Router();

const sabhaController = require('../controllers/sabhaController');

// OPTIONAL: if you have auth middleware, require it and use where needed
// const { authenticate, authorize } = require('../middleware/auth');

/**
 * Routes:
 *
 * POST   /api/sabhas                     -> createSabha
 * GET    /api/sabhas                     -> getAllSabhas (filters: sabhaType, startDate, endDate, isCancelled, area, page, limit)
 * GET    /api/sabhas/:id                 -> getSabhaById
 * PUT    /api/sabhas/:id                 -> updateSabha
 * DELETE /api/sabhas/:id                 -> deleteSabha
 *
 * POST   /api/sabhas/bulk                -> importSabhasFromJSON
 *
 * POST   /api/sabhas/:sabhaId/attendance          -> markAttendance  (body: { userId, isPresent })
 * POST   /api/sabhas/:sabhaId/attendance/bulk     -> markBulkAttendance (body: { attendanceList: [{ userId, isPresent }, ...] })
 *
 * GET    /api/sabhas/:sabhaId/report     -> getSabhaAttendanceReport
 * GET    /api/sabhas/user/:userId/history-> getUserAttendanceHistory
 */

// Create sabha
router.post(
  '/',
  // authenticate, // optional: protect endpoint
  sabhaController.createSabha
);


router.post(
  '/add',
  sabhaController.createEvent
);

router.get(
  '/events',
  sabhaController.getAllEvents
);

router.get(
  '/events/:id',
  sabhaController.getEventById
);

// List sabhas (with query params)
router.get(
  '/',
  // authenticate, // optional
  sabhaController.getAllSabhas
);

// Get one sabha
router.get(
  '/:id',
  // authenticate, // optional (you may want to check visibility inside controller)
  sabhaController.getSabhaById
);

// Update sabha
router.put(
  '/:id',
  // authenticate, // optional
  sabhaController.updateSabha
);

// Delete sabha
router.delete(
  '/:id',
  // authenticate, // optional
  sabhaController.deleteSabha
);

// Mark single attendance
router.post(
  '/:sabhaId/attendance',
  // authenticate, // optional
  sabhaController.markAttendance
);

// Mark bulk attendance
router.post(
  '/:sabhaId/attendance/bulk',
  // authenticate, // optional
  sabhaController.markBulkAttendance
);

// Sabha attendance report
router.get(
  '/:sabhaId/report',
  // authenticate, // optional
  sabhaController.getSabhaAttendanceReport
);

// User attendance history across sabhas
router.get(
  '/user/:userId/history',
  // authenticate, // optional
  sabhaController.getUserAttendanceHistory
);

module.exports = router;

const Sabha = require('../models/Sabha');
const { Member } = require('../models/Member'); // Member model from your Member.js
const Event = require('../models/Event');

// Helpers
function parseMaybeDate(value) {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function recalcAttendanceStats(sabhaDoc) {
  if (!Array.isArray(sabhaDoc.attendance)) {
    sabhaDoc.totalPresent = 0;
    sabhaDoc.totalAbsent = 0;
    return;
  }
  sabhaDoc.totalPresent = sabhaDoc.attendance.filter(a => a.isPresent).length;
  sabhaDoc.totalAbsent = sabhaDoc.attendance.filter(a => !a.isPresent).length;
}


// Create or return existing event for a sabha
async function getOrCreateEvent({ sabhaId, name, date }) {
  const sabha = await Sabha.findById(sabhaId);
  if (!sabha) {
    throw new Error('Sabha not found');
  }

  const eventDate = parseMaybeDate(date);
  if (!eventDate) {
    throw new Error('Invalid event date');
  }

  const existing = await Event.findOne({ sabhaId, name, date: eventDate });
  if (existing) return existing;

  const ev = new Event({ sabhaId, name, date: eventDate });
  await ev.save();
  return ev;
}



/**
 * Create a new sabha
 * - accepts attendance as JSON array (or array object)
 * - accepts sabhaStartTime / sabhaEndTime as ISO string or date string
 */
const createSabha = async (req, res) => {
  try {
    const body = { ...req.body };

    // parse attendance if stringified
    if (typeof body.attendance === 'string') {
      try { body.attendance = JSON.parse(body.attendance); } catch (e) { body.attendance = []; }
    }

    // parse date/time fields
    if (body.sabhaDate) body.sabhaDate = parseMaybeDate(body.sabhaDate);
    if (body.sabhaStartTime) body.sabhaStartTime = parseMaybeDate(body.sabhaStartTime);
    if (body.sabhaEndTime) body.sabhaEndTime = parseMaybeDate(body.sabhaEndTime);

    // create and save (pre save hook in model will compute sabhaNo and attendance totals)
    const sabha = new Sabha(body);
    await sabha.save();

    const populated = await sabha.populate('attendance.user', 'firstName lastName smkNo personalMobile');

    res.status(201).json({ success: true, message: 'Sabha created', data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error creating sabha', error: err.message });
  }
};

const createEvent = async(req, res) => {
  try {
    const { sabhaId, name, date } = req.body;
    if (!sabhaId || !name || !date) {
      return res.status(400).json({ success: false, message: 'sabhaId, name and date are required' });
    }
    const event = await getOrCreateEvent({ sabhaId, name, date });
    res.status(201).json({ success: true, data: event });
  }
  catch (err) {
    res.status(500).json({ success: false, message: 'Error creating event', error: err.message });
  } 
};

const getEventById = async(req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("sabhaId", "sabhaType sabhaDate sabhaNo");
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  }
    catch (err) {
      return res.status(500).json({ success: false, message: 'Error fetching event', error: err.message });
    }
  };

const getAllEvents = async(req, res) => {
  try {
    const events = await Event.find().populate("sabhaId", "name type date").sort({ date: -1 });   

    res.status(200).json({ success: true, data: events });
  }
  catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching events', error: err.message });
  }
};
/**
 * Get all sabhas
 * Query params:
 *  - sabhaType
 *  - startDate, endDate  (ISO strings)
 *  - isCancelled (true|false)
 *  - area
 *  - visibility (optional)
 *  - page, limit (pagination)
 *
 * If req.user exists, visibility filtering can be performed:
 *  - PUBLIC -> everyone
 *  - REGISTERED -> requires authenticated user (req.user)
 *  - ROLE_BASED -> requires req.user.role and sabha.visibleToRoles contains it
 *  - USER_SPECIFIC -> requires req.user._id in sabha.visibleToUsers
 *
 * If you don't pass req.user, REGISTERED/ROLE_BASED/USER_SPECIFIC sabhas will still be returned
 * unless you choose to enforce server-side auth in your route/middleware.
 */
const getAllSabhas = async (req, res) => {
  try {
    const { sabhaType, startDate, endDate, isCancelled, area, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (sabhaType) filter.sabhaType = sabhaType;
    if (area) filter.area = area;
    if (isCancelled !== undefined) filter.isCancelled = isCancelled === 'true';

    if (startDate || endDate) {
      filter.sabhaDate = {};
      if (startDate) filter.sabhaDate.$gte = new Date(startDate);
      if (endDate) filter.sabhaDate.$lte = new Date(endDate);
    }

    // basic pagination
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));
    const q = Sabha.find(filter).sort({ sabhaDate: -1 }).skip(skip).limit(parseInt(limit, 10));

    // populate attendance.user limited fields
    q.populate('attendance.user', 'firstName lastName smkNo personalMobile');

    const [items, total] = await Promise.all([q.exec(), Sabha.countDocuments(filter)]);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      data: items
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching sabhas', error: err.message });
  }
};

/**
 * Get one sabha by id
 */
const getSabhaById = async (req, res) => {
  try {
    const sabha = await Sabha.findById(req.params.id).populate('attendance.user', 'firstName lastName smkNo personalMobile');

    if (!sabha) return res.status(404).json({ success: false, message: 'Sabha not found' });

    res.status(200).json({ success: true, data: sabha });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching sabha', error: err.message });
  }
};

/**
 * Update sabha
 * - allows updating attendance array (replace) or other fields
 * - validates start/end times
 */
const updateSabha = async (req, res) => {
  try {
    const update = { ...req.body };

    if (typeof update.attendance === 'string') {
      try { update.attendance = JSON.parse(update.attendance); } catch (e) { update.attendance = undefined; }
    }

    if (update.sabhaDate) update.sabhaDate = parseMaybeDate(update.sabhaDate);
    if (update.sabhaStartTime) update.sabhaStartTime = parseMaybeDate(update.sabhaStartTime);
    if (update.sabhaEndTime) update.sabhaEndTime = parseMaybeDate(update.sabhaEndTime);

    // If start/end provided ensure end > start
    if (update.sabhaStartTime && update.sabhaEndTime && update.sabhaEndTime <= update.sabhaStartTime) {
      return res.status(400).json({ success: false, message: 'sabhaEndTime must be after sabhaStartTime' });
    }

    const sabha = await Sabha.findById(req.params.id);
    if (!sabha) return res.status(404).json({ success: false, message: 'Sabha not found' });

    // merge changes
    Object.assign(sabha, update);

    // recalc attendance stats (model pre save also handles but we do it here for safety)
    recalcAttendanceStats(sabha);

    await sabha.save();
    await sabha.populate('attendance.user', 'firstName lastName smkNo personalMobile');

    res.status(200).json({ success: true, message: 'Sabha updated', data: sabha });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error updating sabha', error: err.message });
  }
};

/**
 * Delete sabha
 */
const deleteSabha = async (req, res) => {
  try {
    const sabha = await Sabha.findByIdAndDelete(req.params.id);
    if (!sabha) return res.status(404).json({ success: false, message: 'Sabha not found' });

    res.status(200).json({ success: true, message: 'Sabha deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting sabha', error: err.message });
  }
};

/**
 * Mark single attendance (toggle/update)
 * Body: { userId, isPresent: true/false }
 */
const markAttendance = async (req, res) => {
  try {
    const { sabhaId } = req.params;
    const { userId, isPresent } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

    const sabha = await Sabha.findById(sabhaId);
    if (!sabha) return res.status(404).json({ success: false, message: 'Sabha not found' });

    const member = await Member.findById(userId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const idx = sabha.attendance.findIndex(a => a.user.toString() === userId);
    if (idx !== -1) {
      sabha.attendance[idx].isPresent = !!isPresent;
      sabha.attendance[idx].markedAt = new Date();
    } else {
      sabha.attendance.push({ user: userId, isPresent: !!isPresent, markedAt: new Date() });
    }

    recalcAttendanceStats(sabha);
    await sabha.save();
    await sabha.populate('attendance.user', 'firstName lastName smkNo personalMobile');

    res.status(200).json({ success: true, message: 'Attendance updated', data: sabha });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error marking attendance', error: err.message });
  }
};

/**
 * Bulk attendance
 * Body: { attendanceList: [ { userId, isPresent } ] }
 */
const markBulkAttendance = async (req, res) => {
  try {
    const { sabhaId } = req.params;
    const { attendanceList } = req.body;

    if (!Array.isArray(attendanceList)) {
      return res.status(400).json({ success: false, message: 'attendanceList must be an array' });
    }

    const sabha = await Sabha.findById(sabhaId);
    if (!sabha) return res.status(404).json({ success: false, message: 'Sabha not found' });

    for (const item of attendanceList) {
      if (!item.userId) continue;
      const memberExists = await Member.exists({ _id: item.userId });
      if (!memberExists) continue; // skip invalid users

      const idx = sabha.attendance.findIndex(a => a.user.toString() === item.userId);
      if (idx !== -1) {
        sabha.attendance[idx].isPresent = !!item.isPresent;
        sabha.attendance[idx].markedAt = new Date();
      } else {
        sabha.attendance.push({ user: item.userId, isPresent: !!item.isPresent, markedAt: new Date() });
      }
    }

    recalcAttendanceStats(sabha);
    await sabha.save();
    await sabha.populate('attendance.user', 'firstName lastName smkNo personalMobile');

    res.status(200).json({ success: true, message: 'Bulk attendance updated', data: sabha });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error marking bulk attendance', error: err.message });
  }
};

/**
 * Attendance report for a sabha
 */
const getSabhaAttendanceReport = async (req, res) => {
  try {
    const { sabhaId } = req.params;
    const sabha = await Sabha.findById(sabhaId).populate('attendance.user', 'firstName lastName smkNo personalMobile');

    if (!sabha) return res.status(404).json({ success: false, message: 'Sabha not found' });

    const report = {
      sabhaNo: sabha.sabhaNo,
      sabhaType: sabha.sabhaType,
      sabhaDate: sabha.sabhaDate,
      sabhaStartTime: sabha.sabhaStartTime,
      sabhaEndTime: sabha.sabhaEndTime,
      totalPresent: sabha.totalPresent,
      totalAbsent: sabha.totalAbsent,
      totalUsers: sabha.attendance.length,
      presentUsers: sabha.attendance.filter(a => a.isPresent),
      absentUsers: sabha.attendance.filter(a => !a.isPresent)
    };

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error generating report', error: err.message });
  }
};

/**
 * Get a user's attendance history across sabhas
 * (expects :userId param)
 */
const getUserAttendanceHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const member = await Member.findById(userId);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const sabhas = await Sabha.find({ 'attendance.user': userId }).sort({ sabhaDate: -1 });

    const history = sabhas.map(sabha => {
      const att = sabha.attendance.find(a => a.user.toString() === userId) || {};
      return {
        sabhaId: sabha._id,
        sabhaNo: sabha.sabhaNo,
        sabhaType: sabha.sabhaType,
        sabhaDate: sabha.sabhaDate,
        isPresent: !!att.isPresent,
        markedAt: att.markedAt || null
      };
    });

    const totalSabhas = history.length;
    const totalPresent = history.filter(h => h.isPresent).length;
    const attendancePercentage = totalSabhas ? ((totalPresent / totalSabhas) * 100).toFixed(2) : '0.00';

    res.status(200).json({
      success: true,
      data: {
        member: { id: member._id, firstName: member.firstName, lastName: member.lastName, smkNo: member.smkNo },
        statistics: { totalSabhas, totalPresent, totalAbsent: totalSabhas - totalPresent, attendancePercentage: `${attendancePercentage}%` },
        history
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching attendance history', error: err.message });
  }
};

/**
 * Bulk import sabhas from JSON array
 */
const importSabhasFromJSON = async (req, res) => {
  try {
    const sabhasArray = req.body;
    if (!Array.isArray(sabhasArray)) {
      return res.status(400).json({ success: false, message: 'Request body must be array' });
    }

    const mapped = sabhasArray.map(row => ({
      sabhaNo: row.sabhaNo || undefined,
      sabhaType: row.sabhaType || undefined,
      sabhaDate: row.sabhaDate ? parseMaybeDate(row.sabhaDate) : undefined,
      sabhaStartTime: row.sabhaStartTime ? parseMaybeDate(row.sabhaStartTime) : undefined,
      sabhaEndTime: row.sabhaEndTime ? parseMaybeDate(row.sabhaEndTime) : undefined,
      sabhaLeader: row.sabhaLeader || '',
      sahSanchalak: row.sahSanchalak || '',
      sahayak: row.sahayak || '',
      yajman: row.yajman || '',
      prashad: row.prashad || '',
      Topic: row.Topic || '',
      SabhaSanchalan: row.SabhaSanchalan || '',
      Vakta: row.Vakta || '',
      isCancelled: row.isCancelled === true,
      reasonForCancellation: row.reasonForCancellation || '',
      reason: row.reason || '',
      attendance: Array.isArray(row.attendance) ? row.attendance.map(a => ({ user: a.user, isPresent: !!a.isPresent, markedAt: a.markedAt ? parseMaybeDate(a.markedAt) : undefined })) : [],
      totalPresent: typeof row.totalPresent === 'number' ? row.totalPresent : undefined,
      totalAbsent: typeof row.totalAbsent === 'number' ? row.totalAbsent : undefined,
      area: row.area || undefined,
      visibility: row.visibility || 'REGISTERED',
      visibleToRoles: Array.isArray(row.visibleToRoles) ? row.visibleToRoles : [],
      visibleToUsers: Array.isArray(row.visibleToUsers) ? row.visibleToUsers : [],
      notes: row.notes || ''
    }));

    const result = await Sabha.insertMany(mapped);
    res.status(201).json({ success: true, message: 'Sabhas imported', count: result.length, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error importing sabhas', error: err.message });
  }
};

module.exports = {
  createSabha,
  getAllSabhas,
  getSabhaById,
  updateSabha,
  deleteSabha,
  markAttendance,
  markBulkAttendance,
  getSabhaAttendanceReport,
  getUserAttendanceHistory,
  importSabhasFromJSON,
  createEvent,
  getEventById,
  getAllEvents
};

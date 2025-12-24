const Sabha = require("../models/Sabha");
const Event = require("../models/Event");
const EventResponse = require("../models/EventResponse");
const { Member } = require("../models/Member");

function normalizeBooleanArray(arr, len = 4) {
  const out = new Array(len).fill(false);
  if (!Array.isArray(arr)) return out;
  for (let i = 0; i < Math.min(len, arr.length); i++) {
    const v = arr[i];
    if (v === true || v === false) out[i] = v;
    else if (v === "true") out[i] = true;
    else if (v === "false") out[i] = false;
    else out[i] = false;
  }
  return out;
}

function sameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

async function getOrCreateEvent({ sabhaId, name, date }) {
  const when = new Date(date);
  const found = await Event.findOne({ sabhaId, name: name.trim(), date: when });
  if (found) return found;
  return Event.create({ sabhaId, name: name.trim(), date: when });
}

const getEvents = async (req, res) => {
  try {
    const { sabhaId } = req.query;

    const filter = {};
    if (sabhaId) filter.sabhaId = sabhaId;

    const events = await Event.find(filter)
      .populate("sabhaId", "sabhaType sabhaDate sabhaNo")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// POST /api/event-response
// Body: { eventId, answers: [bool,bool,bool,bool], userId? | isNew? + name? + mobile? }
const createEventResponse = async (req, res) => {
  try {
    const {
      eventId,
      userId,
      isNew,
      name,
      mobile,
      answers,
    } = req.body || {};

    if (!eventId) {
      return res.status(400).json({ success: false, message: "eventId is required" });
    }

    // Validate event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Validate user or new responder
    if (userId) {
      const exists = await Member.exists({ _id: userId });
      if (!exists) {
        return res.status(404).json({ success: false, message: "Member not found" });
      }
    } else if (isNew) {
      if (!name && !mobile) {
        return res.status(400).json({ success: false, message: "Provide name or mobile for new responder" });
      }
    } else {
      return res.status(400).json({ success: false, message: "Provide userId or set isNew=true" });
    }

    // Normalize answers to booleans and enforce length=4
    const normalizedAnswers = normalizeBooleanArray(answers, 4);
    if (!Array.isArray(normalizedAnswers) || normalizedAnswers.length !== 4) {
      return res.status(400).json({ success: false, message: "answers must be an array of length 4" });
    }

    // Prevent duplicate for same event + userId
    if (userId) {
      const existing = await EventResponse.findOne({ eventId, userId });
      if (existing) {
        existing.answers = normalizedAnswers;
        await existing.save();
        return res.status(200).json({ success: true, data: existing, message: "Response updated" });
      }
    }

    const payload = {
      eventId: event._id,
      sabhaId: event.sabhaId,
      answers: normalizedAnswers,
    };

    if (userId) payload.userId = userId;
    if (isNew) {
      payload.isNew = true;
      if (name) payload.name = name;
      if (mobile) payload.mobile = mobile;
    }

    const saved = await EventResponse.create(payload);
    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createEventResponse };

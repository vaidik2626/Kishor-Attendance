// models/EventResponse.js
const mongoose = require("mongoose");

const EventResponseSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    sabhaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sabha",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    // For ad-hoc/new users captured from UI without full Member record
    isNew: { type: Boolean, default: false },
    name: { type: String, trim: true },
    mobile: { type: String, trim: true },
    answers: {
      type: [Boolean],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === 4;
        },
        message: "answers must be an array of length 4",
      },
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.EventResponse ||
  mongoose.model("EventResponse", EventResponseSchema);

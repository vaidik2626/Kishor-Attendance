// models/Sabha.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  isPresent: {
    type: Boolean,
    default: false
  },
  markedAt: {
    type: Date,
    default: Date.now
  }
});

const sabhaSchema = new mongoose.Schema(
  {
    sabhaNo: {
      type: String,
      unique: true
    },

    sabhaType: {
      type: String,
      enum: ['Teen assembly', 'Youth assembly - C', ''],
      required: true
    },

    sabhaDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    // NEW: sabha start & end time (full DateTime)
    sabhaStartTime: {
      type: Date
    },
    sabhaEndTime: {
      type: Date
    },

    sabhaLeader: {
      type: String,
      trim: true
    },
    sahSanchalak: {
      type: String,
      trim: true
    },
    sahayak: {
      type: String,
      trim: true
    },
    yajman: {
      type: String,
      trim: true
    },
    prashad: {
      type: String,
      trim: true
    },
    Topic: {
      type: String,
      trim: true
    },
    SabhaSanchalan: {
      type: String,
      trim: true
    },
    Vakta: {
      type: String,
      trim: true
    },

    isCancelled: {
      type: Boolean,
      default: false
    },
    reasonForCancellation: {
      type: String,
      trim: true,
      default: ''
    },
    reason: {
      type: String,
      trim: true
    },

    attendance: [attendanceSchema],

    totalPresent: {
      type: Number,
      default: 0
    },
    totalAbsent: {
      type: Number,
      default: 0
    },

    area: {
      type: String,
      enum: [
        'Murtibaug',
        'Radheshyam Society Siganpore',
        'Sarjan (Haridarshan no Khado)',
        'Nathdwar Society',
        'Rivanta Garden City (Variyav)'
      ],
      required: true
    },

    // NEW: visibility fields
    visibility: {
      type: String,
      enum: ['PUBLIC', 'REGISTERED', 'ROLE_BASED', 'USER_SPECIFIC'],
      default: 'ROLE_BASED'
    },

    // if visibility === 'ROLE_BASED'
    visibleToRoles: [
      {
        type: String,
        trim: true // you can enforce enum based on your role names
      }
    ],

    // if visibility === 'USER_SPECIFIC'
    visibleToUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
      }
    ],

    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Helper to get area code
function getAreaCode(area) {
  if (!area) return 'GEN';
  if (area.includes('Murtibaug')) return 'MURTIBAG';
  if (area.includes('Nathdwar Society')) return 'NATHDWAR';
  if (area.includes('Radheshyam')) return 'RADHESHYAM';
  if (area.includes('Sarjan')) return 'SARJAN';
  if (area.includes('Rivanta')) return 'RIVANTA';
  return 'GEN';
}

// Auto-generate sabha number + calculate attendance + validate times
sabhaSchema.pre('save', async function () {
  // generate sabhaNo only once
  if (!this.sabhaNo && this.area) {
    const areaCode = getAreaCode(this.area);
    const prefix = `SAB-${areaCode}-`;

    // Base the next number on the highest sabhaNo actually in use for this
    // area, not a raw document count — countDocuments() undercounts once any
    // sabha in the area has been deleted, which reproduces an already-used
    // number and collides with the unique index.
    const lastSabha = await mongoose.model('Sabha')
      .findOne({ sabhaNo: { $regex: `^${prefix}\\d+$` } })
      .sort({ sabhaNo: -1 })
      .lean();

    let nextNum = 1;
    if (lastSabha) {
      const match = lastSabha.sabhaNo.match(/(\d+)$/);
      if (match) nextNum = parseInt(match[1], 10) + 1;
    }

    this.sabhaNo = `${prefix}${String(nextNum).padStart(6, '0')}`;
  }

  // Validate start/end times
  if (this.sabhaStartTime && this.sabhaEndTime && this.sabhaEndTime <= this.sabhaStartTime) {
    throw new Error('sabhaEndTime must be after sabhaStartTime');
  }

  // Calculate attendance statistics
  if (Array.isArray(this.attendance)) {
    this.totalPresent = this.attendance.filter(att => att.isPresent).length;
    this.totalAbsent = this.attendance.filter(att => !att.isPresent).length;
  } else {
    this.totalPresent = 0;
    this.totalAbsent = 0;
  }
});

// Speeds up the common list queries (calendar/dashboard/history filter by
// date range, optionally narrowed by type/area).
sabhaSchema.index({ sabhaDate: -1 });
sabhaSchema.index({ sabhaType: 1, sabhaDate: -1 });
sabhaSchema.index({ area: 1, sabhaDate: -1 });

const Sabha = mongoose.model('Sabha', sabhaSchema);

module.exports = Sabha;
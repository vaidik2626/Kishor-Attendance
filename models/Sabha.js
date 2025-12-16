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
    const count = await mongoose.model('Sabha').countDocuments({ area: this.area });

    // FIXED: second arg should be '0'
    this.sabhaNo = `SAB-${areaCode}-${String(count + 1).padStart(6, '0')}`;
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

const Sabha = mongoose.model('Sabha', sabhaSchema);

module.exports = Sabha;
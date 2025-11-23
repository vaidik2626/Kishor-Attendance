const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

const sabhaSchema = new mongoose.Schema({
  sabhaNo: {
    type: String,
    unique: true
  },
  sabhaType: {
    type: String,
    enum: ['Children\'s assembly', 'Teen assembly', 'Youth assembly', 'Special assembly', ''],
    required: true
  },
  sabhaDate: {
    type: Date,
    required: true,
    default: Date.now
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
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Auto-generate sabha number before saving
sabhaSchema.pre('save', async function() {
  if (!this.sabhaNo) {
    const count = await mongoose.model('Sabha').countDocuments();
    this.sabhaNo = `SAB${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate attendance statistics
  this.totalPresent = this.attendance.filter(att => att.isPresent).length;
  this.totalAbsent = this.attendance.filter(att => !att.isPresent).length;
});

const Sabha = mongoose.model('Sabha', sabhaSchema);

module.exports = Sabha;

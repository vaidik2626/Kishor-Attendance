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
    enum: ['Children\'s assembly', 'Teen assembly', 'Youth assembly - C', ''],
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
  area: {
    type: String,
    enum: [
      'મૂર્તિબાગ (Murtibaug)',
      'રાધેશ્યામ સોસાયટી સિંગણપોર (Radheshyam Society Siganpore)',
      'સર્જન (હરિદર્શનનો ખાડો) (Sarjan (Haridarshan no Khado))',
      'નાથદ્વાર સોસાયટી (Nathdwar Society)',
      'રિવાન્ટા ગાર્ડનસિટી (વરીયાવ) (Rivanta Garden City (Variyav))'
    ],
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Auto-generate sabha number before saving
// Helper to get area code
function getAreaCode(area) {
  if (!area) return 'GEN';
  if (area.includes('મૂર્તિબાગ')) return 'MURTIBAG';
  if (area.includes('નાથદ્વાર')) return 'NATHDWAR';
  if (area.includes('રાધેશ્યામ')) return 'RADHESHYAM';
  if (area.includes('સર્જન')) return 'SARJAN';
  if (area.includes('રિવાન્ટા')) return 'RIVANTA';
  return 'GEN';
}

sabhaSchema.pre('save', async function() {
  if (!this.sabhaNo && this.area) {
    const areaCode = getAreaCode(this.area);
    const count = await mongoose.model('Sabha').countDocuments({ area: this.area });
    this.sabhaNo = `SAB-${areaCode}-${String(count + 1).padStart(6, '5')}`;
  }
  // Calculate attendance statistics
  this.totalPresent = this.attendance.filter(att => att.isPresent).length;
  this.totalAbsent = this.attendance.filter(att => !att.isPresent).length;
});

const Sabha = mongoose.model('Sabha', sabhaSchema);

module.exports = Sabha;

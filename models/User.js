const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  photo: {
    type: String,
    default: ''
  },
  photoPublicId: {
    type: String,
    default: ''
  },
  smkNo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  attendanceNumber: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  nativeVillage: {
    type: String,
    trim: true
  },
  personalMobile: {
    type: String,
    trim: true
  },
  homeMobile: {
    type: String,
    trim: true
  },
  fatherMobile: {
    type: String,
    trim: true
  },
  fatherOccupation: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  satsangDay: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    default: ''
  },
  education: {
    type: String,
    trim: true
  },
  currentSchool: {
    type: String,
    trim: true
  },
  futureGoal: {
    type: String,
    trim: true
  },
  skills: {
    type: [String],
    default: []
  },
  hobbies: {
    type: [String],
    default: []
  },
  doWorship: {
    type: Boolean,
    default: false
  },
  haveFriendsOutside: {
    type: Boolean,
    default: false
  },
  satsangAtHome: {
    type: Boolean,
    default: false
  },
  childrensAssembly: {
    type: String,
    trim: true
  },
  assemblySaintsKnown: {
    type: [String],
    default: []
  },
  hariDevoteesKnown: {
    type: [String],
    default: []
  },
  poshakLeader: {
    type: String,
    trim: true
  },
  assemblyType: {
    type: String,
    enum: ['Children\'s assembly', 'Teen assembly', 'Youth assembly', ''],
    default: ''
  },
  poshakLeaderSelection: {
    type: String,
    trim: true
  },
  familyLeaderSelection: {
    type: String,
    trim: true
  },
  sevaRole: {
    type: String,
    trim: true
  },
  whatsappGroupAdded: {
    type: Boolean,
    default: false
  },
  familyTeen: {
    type: String,
    trim: true
  },
  teenStatus: {
    type: String,
    enum: ['regular', 'medium', 'cancelled', ''],
    default: ''
  }
}, {
  timestamps: true
});

// Auto-generate attendance number before saving
userSchema.pre('save', async function() {
  if (!this.attendanceNumber) {
    const count = await mongoose.model('User').countDocuments();
    this.attendanceNumber = `ATT${String(count + 1).padStart(6, '0')}`;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

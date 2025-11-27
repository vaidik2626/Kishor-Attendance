const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  teenStatus: {
    type: String,
    enum: ['Regular', 'NewAttend', 'NotProvided', ''],
    default: ''
  },
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
    trim: true,
    unique: true
  },
  attendanceNumber: {
    type: Number,
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true,
    default: ''
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
  Age: {
    type: Number
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
    type: [
      {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        secondName: { type: String, trim: true }
      }
    ],
    default: []
  },
  poshakLeaderSelection: {
    type: [
      {
      firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        secondName: { type: String, trim: true }
      }
    ],
    default: []
  },
  assemblyType: {
    type: String,
    enum: ['Bal Sabha', 'Kishor Sabha', 'Yuva Sabha-c', ''],
    default: ''
  },
  familyLeaderSelection: {
    type: [
      {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        secondName: { type: String, trim: true }
      }
    ],
    default: []
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

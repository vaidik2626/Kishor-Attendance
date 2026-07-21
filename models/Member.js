// models/Member.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = {
  KISHOR: "KISHOR",
  YUVAN: "YUVAN",
  POSHAK_LEADER: "POSHAK_LEADER",
  SAHSANCHALAK: "SAHSANCHALAK",
  MADADNISH: "MADADNISH",
  SANCHALAK: "SANCHALAK",
  VAKTA: "VAKTA"
};

function requiredForRoles(roles) {
  return function () {
    return roles.includes(this.role);
  };
}

const MemberSchema = new mongoose.Schema(
  {
    // ========================
    // Common
    // ========================
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true
    },

    photoUrl: {
      type: String
      // Kishor, Poshak Leader, Sanchalak can use this. Not strictly required.
    },

    smkNo: {
      type: String,
      trim: true,
      required: [true, "SMK No. is required for all roles"]
    },

    // ========================
    // Kishor only
    // ========================
    hajriNumber: {
      type: String,
      // auto-generated but only relevant for Kishor and Yuvan
      required: [
        requiredForRoles([ROLES.KISHOR, ROLES.YUVAN]),
        "Hajri Number is required for Kishor and Yuvan"
      ]
    },

    firstName: {
      type: String,
      required: [
        requiredForRoles([
          ROLES.KISHOR,
          ROLES.YUVAN,
          ROLES.POSHAK_LEADER,
          ROLES.SAHSANCHALAK,
          ROLES.MADADNISH,
          ROLES.SANCHALAK,
          ROLES.VAKTA
        ]),
        "First name is required"
      ]
    },

    middleName:{
      type : String,
      required: [
        requiredForRoles([
          ROLES.KISHOR,
          ROLES.YUVAN
        ]),
        "Middle name is required for Kishor and Yuvan"
      ]
    },

    lastName: {
      type: String,
      required: [
        requiredForRoles([
          ROLES.KISHOR,
          ROLES.YUVAN,
          ROLES.POSHAK_LEADER,
          ROLES.SAHSANCHALAK,
          ROLES.MADADNISH,
          ROLES.SANCHALAK,
          ROLES.VAKTA
        ]),
        "Last name is required"
      ]
    },

    // For Vakta only (single name field)

    mobileNumber: {
      type: String,
      required: [
        requiredForRoles([
          ROLES.POSHAK_LEADER,
          ROLES.SAHSANCHALAK,
          ROLES.MADADNISH,
          ROLES.SANCHALAK,
          ROLES.VAKTA
        ]),
        "Mobile number is required for this role"
      ]
    },

    // Kishor contact numbers
    personalMobile: {
      type: String,
      required: [
        requiredForRoles([ROLES.KISHOR, ROLES.YUVAN]),
        "Personal mobile is required for Kishor and Yuvan"
      ]
    },
    homeMobile: String,
    fatherMobile: String,

    // Basic info
    address: {
      type: String,
      required: [
        requiredForRoles([
          ROLES.KISHOR,
          ROLES.YUVAN,
          ROLES.POSHAK_LEADER,
          ROLES.SAHSANCHALAK,
          ROLES.MADADNISH,
          ROLES.SANCHALAK
        ]),
        "Address is required"
      ]
    },
    pincode: String,
    nativePlace: String,
    fatherOccupation: String,

    dateOfBirth: {
      type: String, // or Date if you want
      required: [
        requiredForRoles([
          ROLES.KISHOR,
          ROLES.YUVAN,
          ROLES.POSHAK_LEADER,
          ROLES.SAHSANCHALAK,
          ROLES.MADADNISH,
          ROLES.SANCHALAK
        ]),
        "Date of birth is required"
      ]
    },

    satsangDay: String, // 'dd-mm-yyyy' for Kishor optionally

    bloodGroup: {
      type: String,
      required: [
        requiredForRoles([ROLES.KISHOR, ROLES.YUVAN]),
        "Blood group is required for Kishor and Yuvan"
      ]
      // You can add enum here if you want fixed groups
      // enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-']
    },

    // Whether this Kishor has other family members who are also Kishor
    // (Kishor role only — not applicable to Yuvan or other roles).
    hasFamilyKishor: {
      type: String,
      enum: ["YES", "NO", ""],
      default: ""
    },

    // Education (Kishor)
    currentStandard: {
      type: String,
      required: [
        requiredForRoles([ROLES.KISHOR, ROLES.YUVAN]),
        "Current standard is required for Kishor and Yuvan"
      ]
    },
    schoolName: {
      type: String,
      required: [
        requiredForRoles([ROLES.KISHOR]),
        "School name is required for Kishor and Yuvan"
      ]
    },

    // Personal (Kishor)
    skills: [
      {
        type: String
      }
    ],
    hobbies: [
      {
        type: String
      }
    ],

    // Satsang related (Kishor)
    doesPooja: {
      type: String,
      enum: ["YES", "NO", "SOMETIMES", ""],
      default: ""
    },
    hasOutsideFriends: {
      type: String,
      enum: ["YES", "NO", "SOMETIMES", ""],
      default: ""
    },
    satsangAtHome: {
      type: String,
      enum: ["YES", "NO", "SOMETIMES", ""],
      default: ""
    },

    balSabhaName: { type: String },
    balSabhaCoordinatorName: { type: String },

    // Sant names (Kishor)
    sant1Name: { type: String },
    sant2Name: { type: String },

    // Haribhakta references (Kishor)
    haribhakta1Name: { type: String },
    haribhakta1Smk: { type: String },
    haribhakta1Mobile: { type: String },

    haribhakta2Name: { type: String },
    haribhakta2Smk: { type: String },
    haribhakta2Mobile: { type: String },
    // Sabha / leadership
    sabhaType: {
      type: String,
      required: [
        requiredForRoles([
          ROLES.POSHAK_LEADER,
          ROLES.SAHSANCHALAK,
          ROLES.MADADNISH,
          ROLES.SANCHALAK,
          ROLES.KISHOR,
          ROLES.YUVAN
        ]),
        "Sabha Type is required for this role"
      ]
    },

    poshakLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member"
    },
    familyLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member"
    },

    // Seva Roles (Kishor)
    sevaRoles: [
      {
        type: String
      }
    ],

    // WhatsApp group flags (Kishor)
    whatsappGroupAdded: {
      familyKishor: {
        type: Boolean,
        default: false
      },
      familyYuvan: {
        type: Boolean,
        default: false
      }
    },

    kishorStatus: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "LEFT", ""],
      required: [
        requiredForRoles([ROLES.KISHOR, ROLES.YUVAN]),
        "Kishor/Yuvan status is required for Kishor and Yuvan"
      ]
    },

    sabhaJoiningDate: {
      type: String,
      required: [
        requiredForRoles([ROLES.KISHOR, ROLES.YUVAN]),
        "Sabha joining date is required for Kishor and Yuvan"
      ]
    },

    // Virtual (calculated) field for age (not stored in DB)
    age: {
      type: Number,
      get() {
        if (!this.dateOfBirth) return undefined;
        const dob = new Date(this.dateOfBirth);
        if (isNaN(dob)) return undefined;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age;
      },
      // Not required, not stored
      required: false,
      select: true
    },

    // Login credential for staff-type roles (currently Poshak Leader) who get
    // their own dashboard. Optional — most members never log in.
    password: {
      type: String,
      select: false
    }

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

MemberSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

MemberSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

// Speeds up attendance member-sync (role + sabhaType + kishorStatus lookups)
// and the getAllMembers list sort.
MemberSchema.index({ role: 1, sabhaType: 1, kishorStatus: 1 });
MemberSchema.index({ createdAt: -1 });
// Leader login lookup (role + smkNo) and "my members" lookup (poshakLeaderId).
MemberSchema.index({ role: 1, smkNo: 1 });
MemberSchema.index({ poshakLeaderId: 1 });

const Member = mongoose.model("Member", MemberSchema);
module.exports = { Member, ROLES };

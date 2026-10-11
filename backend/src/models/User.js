// ==================================================
// CareerLink - User Model (Mongoose Schema)
// ==================================================
// User ka data structure define karta hai
// Recruiter aur Jobseeker dono ka data isi model mein store hota hai

const mongoose = require('mongoose');

// User schema define karo - MongoDB collection ka structure
const userSchema = new mongoose.Schema(
  {
    // User ka naam
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    // Email address - unique hona chahiye
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    // User role - recruiter ya jobseeker
    // Enum se restrict kiya hai ki sirf yeh 2 values ho sakti hain
    role: {
      type: String,
      enum: {
        values: ['recruiter', 'jobseeker'],
        message: 'Role must be either recruiter or jobseeker',
      },
      required: [true, 'Role is required'],
    },

    // Firebase Authentication UID
    // Firebase se authenticate hone ke baad yeh UID milta hai
    // Password MongoDB mein store NAHI karte - Firebase handle karta hai
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true, // Allows null values while maintaining uniqueness
    },

    // Jobseeker ke skills - array of strings
    skills: {
      type: [String],
      default: [],
      // Har skill ko trim aur lowercase karo consistency ke liye
      set: (skills) =>
        skills.map((skill) => skill.trim().toLowerCase()).filter((s) => s),
    },

    // Resume file ka URL ya path
    resume: {
      type: String,
      default: null,
    },

    // Profile photo URL
    profilePhoto: {
      type: String,
      default: null,
    },

    // Phone number (optional)
    phone: {
      type: String,
      default: null,
      trim: true,
    },

    // Bio / About section
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },

    // Location
    location: {
      type: String,
      default: '',
      trim: true,
    },

    // Company name (recruiter ke liye)
    company: {
      type: String,
      default: '',
      trim: true,
    },

    // Parsed resume data (resume parsing feature ke liye)
    parsedResume: {
      rawText: { type: String, default: '' },
      extractedSkills: { type: [String], default: [] },
      extractedEmail: { type: String, default: '' },
      extractedPhone: { type: String, default: '' },
      extractedName: { type: String, default: '' },
      parsedAt: { type: Date, default: null },
    },
  },
  {
    // Timestamps automatically createdAt aur updatedAt add karte hain
    timestamps: true,
  }
);

// Indexes for faster queries (email and firebaseUid already indexed via unique: true)
// Role pe filter fast hoga
userSchema.index({ role: 1 });
// Skills pe search ke liye
userSchema.index({ skills: 1 });

// Virtual field - user ka full profile URL (example)
userSchema.virtual('profileUrl').get(function () {
  return `/api/users/${this._id}`;
});

// JSON response mein __v field na aaye
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

// Model create karo schema se
const User = mongoose.model('User', userSchema);

module.exports = User;

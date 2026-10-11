// ==================================================
// CareerLink - Job Model (Mongoose Schema)
// ==================================================
// Job posting ka data structure define karta hai
// Recruiter jobs create karta hai, Jobseeker apply karta hai

const mongoose = require('mongoose');

// Job schema define karo
const jobSchema = new mongoose.Schema(
  {
    // Job ka title/designation
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [3, 'Job title must be at least 3 characters'],
      maxlength: [200, 'Job title cannot exceed 200 characters'],
    },

    // Company ka naam
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [150, 'Company name cannot exceed 150 characters'],
    },

    // Job description - detailed information
    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    // Job location
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    // Salary information
    salary: {
      type: String,
      default: 'Not Disclosed',
      trim: true,
    },

    // Required skills - array of strings
    // Job matching/recommendation algorithm iske basis pe kaam karta hai
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one skill is required',
      },
      // Skills ko lowercase mein store karo consistency ke liye
      set: (skills) =>
        skills.map((skill) => skill.trim().toLowerCase()).filter((s) => s),
    },

    // Recruiter reference - kis recruiter ne yeh job post ki
    // ObjectId se User collection ka reference
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User model se relation (populate ke liye)
      required: [true, 'Recruiter reference is required'],
    },

    // Job status - active ya closed
    status: {
      type: String,
      enum: {
        values: ['active', 'closed'],
        message: 'Status must be either active or closed',
      },
      default: 'active',
    },

    // Job type
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
      default: 'full-time',
    },

    // Experience level
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior', 'lead'],
      default: 'fresher',
    },

    // Application deadline
    deadline: {
      type: Date,
      default: null,
    },

    // Total applications count (denormalized for performance)
    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    // createdAt aur updatedAt automatically add honge
    timestamps: true,
  }
);

// Indexes for search optimization
// Text index - full text search ke liye title, description, company, skills pe
jobSchema.index({
  title: 'text',
  description: 'text',
  company: 'text',
  skills: 'text',
});
// Status filter fast hoga
jobSchema.index({ status: 1 });
// Recruiter ke jobs fast milenge
jobSchema.index({ recruiter: 1 });
// Skills pe filter
jobSchema.index({ skills: 1 });
// Latest jobs pehle
jobSchema.index({ createdAt: -1 });
// Location filter
jobSchema.index({ location: 1 });

// JSON response mein __v na aaye
jobSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

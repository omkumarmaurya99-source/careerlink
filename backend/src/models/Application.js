// ==================================================
// CareerLink - Application Model (Mongoose Schema)
// ==================================================
// Job application ka data structure define karta hai
// Jobseeker jab job pe apply karta hai toh yeh document create hota hai

const mongoose = require('mongoose');

// Application schema define karo
const applicationSchema = new mongoose.Schema(
  {
    // Kis job ke liye apply kiya - Job collection ka reference
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job', // Job model se relation (populate se details aayengi)
      required: [true, 'Job reference is required'],
    },

    // Kisne apply kiya - User (jobseeker) ka reference
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User model se relation
      required: [true, 'Applicant reference is required'],
    },

    // Resume file ka path/URL
    resume: {
      type: String,
      default: null,
    },

    // Cover letter - applicant ka introduction/motivation
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
      default: '',
    },

    // Application status - recruiter update karega
    // Enum se restrict kiya hai valid statuses tak
    status: {
      type: String,
      enum: {
        values: ['applied', 'shortlisted', 'rejected', 'selected'],
        message: 'Status must be applied, shortlisted, rejected, or selected',
      },
      default: 'applied',
    },

    // Kab apply kiya
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // updatedAt automatically track hoga
    timestamps: true,
  }
);

// Compound unique index - ek user ek job pe sirf ek baar apply kar sakta hai
// Duplicate applications prevent karne ke liye
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Applicant ke applications fast milenge
applicationSchema.index({ applicant: 1 });
// Job ki applications fast milengi
applicationSchema.index({ job: 1 });
// Status se filter
applicationSchema.index({ status: 1 });

// JSON response mein __v na aaye
applicationSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;

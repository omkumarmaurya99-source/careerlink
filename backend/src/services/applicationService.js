// ==================================================
// CareerLink - Application Service
// ==================================================
// Job application ka business logic
// Apply, view, status update, duplicate check

const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { NotFoundError, ConflictError, ForbiddenError, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');

class ApplicationService {
  // Job pe apply karo
  // Jobseeker ek job pe sirf ek baar apply kar sakta hai
  static async createApplication({ jobId, applicantId, resume, coverLetter }) {
    // Check karo ki job exist karti hai
    const job = await Job.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check karo ki job active hai
    if (job.status !== 'active') {
      throw new BadRequestError('This job is no longer accepting applications');
    }

    // Check karo ki applicant jobseeker hai
    const applicant = await User.findById(applicantId);
    if (!applicant || applicant.role !== 'jobseeker') {
      throw new ForbiddenError('Only jobseekers can apply for jobs');
    }

    // Check karo ki recruiter apni hi job pe apply toh nahi kar raha
    if (job.recruiter.toString() === applicantId.toString()) {
      throw new ForbiddenError('You cannot apply to your own job posting');
    }

    // Duplicate application ko prevent karne ke liye check kar rahe hain
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: applicantId,
    });

    if (existingApplication) {
      throw new ConflictError('You have already applied for this job');
    }

    // Application create karo
    const application = await Application.create({
      job: jobId,
      applicant: applicantId,
      resume: resume || applicant.resume, // User profile se resume use karo agar naya nahi diya
      coverLetter: coverLetter || '',
    });

    // Job ki application count update karo
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    // Populated application return karo
    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title company location salary status')
      .populate('applicant', 'name email skills');

    logger.info(`Application created: User ${applicantId} applied for job ${jobId}`);
    return populatedApplication;
  }

  // User ki saari applications fetch karo
  // Jobseeker apni applications dekh sakta hai
  static async getUserApplications(userId, { page = 1, limit = 10, status }) {
    const query = { applicant: userId };

    // Status filter agar diya gaya
    if (status) {
      query.status = status;
    }

    const totalItems = await Application.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // Applications fetch karo with populated job details
    const applications = await Application.find(query)
      .populate('job', 'title company location salary status jobType')
      .populate('applicant', 'name email')
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
      },
    };
  }

  // Application status update karo
  // Sirf job ka recruiter hi status update kar sakta hai
  static async updateApplicationStatus(applicationId, newStatus, recruiterId) {
    // Application find karo
    const application = await Application.findById(applicationId)
      .populate('job');

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Check karo ki recruiter isi job ka owner hai - ownership verification
    if (application.job.recruiter.toString() !== recruiterId.toString()) {
      throw new ForbiddenError(
        'You can only update applications for your own job postings'
      );
    }

    // Status update karo
    application.status = newStatus;
    await application.save();

    // Updated application with populated fields return karo
    const updatedApplication = await Application.findById(applicationId)
      .populate('job', 'title company location')
      .populate('applicant', 'name email skills resume');

    logger.info(
      `Application ${applicationId} status updated to '${newStatus}' by recruiter ${recruiterId}`
    );

    return updatedApplication;
  }

  // Job ki saari applications fetch karo (recruiter ke liye)
  static async getJobApplications(jobId, recruiterId, { page = 1, limit = 10, status }) {
    // Job find karo aur ownership check karo
    const job = await Job.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Recruiter sirf apni job ki applications dekh sakta hai
    if (job.recruiter.toString() !== recruiterId.toString()) {
      throw new ForbiddenError(
        'You can only view applications for your own job postings'
      );
    }

    const query = { job: jobId };
    if (status) {
      query.status = status;
    }

    const totalItems = await Application.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const applications = await Application.find(query)
      .populate('applicant', 'name email skills resume phone bio location')
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
      },
    };
  }
}

module.exports = ApplicationService;

// ==================================================
// CareerLink - Job Service
// ==================================================
// Job CRUD operations ka business logic yahan hai
// MongoDB queries, search, filter, pagination sab yahan hai

const Job = require('../models/Job');
const Application = require('../models/Application');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

class JobService {
  // Nayi job create karo
  // Sirf recruiter hi job post kar sakta hai
  static async createJob(jobData, recruiterId) {
    const job = await Job.create({
      ...jobData,
      recruiter: recruiterId,
    });

    // Recruiter details populate karo response mein
    const populatedJob = await Job.findById(job._id).populate(
      'recruiter',
      'name email company'
    );

    logger.info(`Job created: "${job.title}" by recruiter ${recruiterId}`);
    return populatedJob;
  }

  // Saari jobs fetch karo with pagination, filtering, sorting
  static async getAllJobs({ page = 1, limit = 10, status = 'active', location, jobType, experienceLevel, skill, sortBy = 'createdAt', order = 'desc' }) {
    const query = {};

    // Status filter - default active jobs dikhao
    if (status) {
      query.status = status;
    }

    // Location filter
    if (location) {
      query.location = new RegExp(location, 'i'); // Case insensitive regex
    }

    // Skill filter
    if (skill) {
      query.skills = new RegExp(skill, 'i');
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Sorting configuration
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    // Total count for pagination
    const totalItems = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    // MongoDB se jobs fetch karo with pagination
    // skip aur limit se pagination implement hota hai
    const jobs = await Job.find(query)
      .populate('recruiter', 'name email company') // Recruiter info bhi laao
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Performance ke liye lean() - plain JS objects return karta hai

    return {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
      },
    };
  }

  // Single job details fetch karo by ID
  static async getJobById(jobId) {
    const job = await Job.findById(jobId).populate(
      'recruiter',
      'name email company'
    );

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    return job;
  }

  // Job update karo - sirf job creator (recruiter) hi update kar sakta hai
  static async updateJob(jobId, updateData, recruiterId) {
    // Pehle job find karo
    const job = await Job.findById(jobId);

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Recruiter sirf apni job ko update kar sakta hai - ownership check
    if (job.recruiter.toString() !== recruiterId.toString()) {
      throw new ForbiddenError('You can only update your own job postings');
    }

    // Job update karo with validation
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('recruiter', 'name email company');

    logger.info(`Job updated: "${updatedJob.title}" (${jobId})`);
    return updatedJob;
  }

  // Job delete karo - sirf job creator delete kar sakta hai
  static async deleteJob(jobId, recruiterId) {
    const job = await Job.findById(jobId);

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Ownership check - recruiter sirf apni job delete kar sakta hai
    if (job.recruiter.toString() !== recruiterId.toString()) {
      throw new ForbiddenError('You can only delete your own job postings');
    }

    // Job aur uski saari applications delete karo
    await Application.deleteMany({ job: jobId });
    await Job.findByIdAndDelete(jobId);

    logger.info(`Job deleted: "${job.title}" (${jobId})`);
    return { message: 'Job and associated applications deleted successfully' };
  }

  // Job search - keyword se search karo across multiple fields
  // Case insensitive search title, description, skills, company mein
  static async searchJobs({ keyword, page = 1, limit = 10, location, jobType, sortBy = 'createdAt', order = 'desc' }) {
    const query = { status: 'active' };

    // Keyword based search - MongoDB regex use karke case insensitive search
    if (keyword) {
      const searchRegex = new RegExp(keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { company: searchRegex },
        { skills: searchRegex },
      ];
    }

    // Additional filters
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    if (jobType) {
      query.jobType = jobType;
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const totalItems = await Job.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const jobs = await Job.find(query)
      .populate('recruiter', 'name email company')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    logger.info(`Search performed: keyword="${keyword}", found ${totalItems} results`);

    return {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
      },
    };
  }

  // Recruiter ki saari posted jobs
  static async getRecruiterJobs(recruiterId, { page = 1, limit = 10 }) {
    const totalItems = await Job.countDocuments({ recruiter: recruiterId });
    const totalPages = Math.ceil(totalItems / limit);

    const jobs = await Job.find({ recruiter: recruiterId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
      },
    };
  }
}

module.exports = JobService;

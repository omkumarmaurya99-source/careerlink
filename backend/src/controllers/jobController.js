// ==================================================
// CareerLink - Job Controller
// ==================================================
// Job CRUD endpoints ka logic - create, read, update, delete, search

const JobService = require('../services/jobService');
const { successResponse, paginatedResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

// POST /api/jobs
// Nayi job create karo - sirf recruiter ke liye
const createJob = async (req, res, next) => {
  try {
    const jobData = req.body;
    // req.userId authenticate middleware se milta hai
    const job = await JobService.createJob(jobData, req.userId);

    return successResponse(res, 201, 'Job created successfully', { job });
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs
// Saari jobs fetch karo with pagination aur filters
const getAllJobs = async (req, res, next) => {
  try {
    // Query parameters se filters aur pagination options lo
    const { page, limit, status, location, jobType, experienceLevel, skill, sortBy, order } = req.query;

    const result = await JobService.getAllJobs({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status,
      location,
      jobType,
      experienceLevel,
      skill,
      sortBy,
      order,
    });

    return paginatedResponse(
      res,
      200,
      'Jobs fetched successfully',
      result.jobs,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/search?keyword=backend-developer
// Jobs search karo keyword se - title, description, skills, company mein dhundhega
const searchJobs = async (req, res, next) => {
  try {
    const { keyword, page, limit, location, jobType, sortBy, order } = req.query;

    const result = await JobService.searchJobs({
      keyword,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      location,
      jobType,
      sortBy,
      order,
    });

    return paginatedResponse(
      res,
      200,
      keyword
        ? `Search results for "${keyword}"`
        : 'All active jobs',
      result.jobs,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/:id
// Single job details fetch karo by ID
const getJobById = async (req, res, next) => {
  try {
    // Route parameter se job ID lo
    const job = await JobService.getJobById(req.params.id);

    return successResponse(res, 200, 'Job fetched successfully', { job });
  } catch (error) {
    next(error);
  }
};

// PUT /api/jobs/:id
// Job update karo - sirf recruiter apni job update kar sakta hai
const updateJob = async (req, res, next) => {
  try {
    const job = await JobService.updateJob(
      req.params.id,
      req.body,
      req.userId // Ownership check ke liye
    );

    return successResponse(res, 200, 'Job updated successfully', { job });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/jobs/:id
// Job delete karo - sirf recruiter apni job delete kar sakta hai
const deleteJob = async (req, res, next) => {
  try {
    const result = await JobService.deleteJob(req.params.id, req.userId);

    return successResponse(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

// GET /api/jobs/recruiter/my-jobs
// Recruiter ki apni posted jobs
const getMyJobs = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await JobService.getRecruiterJobs(req.userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    return paginatedResponse(
      res,
      200,
      'Your posted jobs fetched successfully',
      result.jobs,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getAllJobs,
  searchJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
};

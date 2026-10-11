// ==================================================
// CareerLink - Application Controller
// ==================================================
// Job application endpoints - apply, view, status update

const ApplicationService = require('../services/applicationService');
const { successResponse, paginatedResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

// POST /api/applications
// Job pe apply karo - sirf jobseeker ke liye
const createApplication = async (req, res, next) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Application create karo
    const application = await ApplicationService.createApplication({
      jobId,
      applicantId: req.userId,
      resume: req.file ? req.file.path : null, // Multer se uploaded file
      coverLetter,
    });

    return successResponse(res, 201, 'Application submitted successfully', {
      application,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/user/:id
// User ki saari applications fetch karo
const getUserApplications = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;

    const result = await ApplicationService.getUserApplications(
      req.params.id,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
      }
    );

    return paginatedResponse(
      res,
      200,
      'Applications fetched successfully',
      result.applications,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/applications/:id/status
// Application status update karo - sirf recruiter (job owner)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const application = await ApplicationService.updateApplicationStatus(
      req.params.id,
      status,
      req.userId // Ownership verification ke liye
    );

    return successResponse(
      res,
      200,
      `Application status updated to '${status}'`,
      { application }
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/job/:jobId
// Job ki saari applications (recruiter ke liye)
const getJobApplications = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;

    const result = await ApplicationService.getJobApplications(
      req.params.jobId,
      req.userId,
      {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
      }
    );

    return paginatedResponse(
      res,
      200,
      'Job applications fetched successfully',
      result.applications,
      result.pagination
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApplication,
  getUserApplications,
  updateApplicationStatus,
  getJobApplications,
};

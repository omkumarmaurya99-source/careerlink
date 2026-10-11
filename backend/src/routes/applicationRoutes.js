// ==================================================
// CareerLink - Application Routes
// ==================================================
// Job application ke routes - apply, view, status update

const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { uploadResume } = require('../middleware/upload');
const {
  createApplicationValidation,
  updateStatusValidation,
  userApplicationsValidation,
} = require('../validators/applicationValidators');

// POST /api/applications - Job pe apply karo
// Protected + jobseeker only - resume file optional hai
router.post(
  '/',
  authenticate,
  authorize('jobseeker'),
  uploadResume, // File upload middleware - resume accept karega
  createApplicationValidation,
  validate,
  applicationController.createApplication
);

// GET /api/applications/user/:id - User ki applications dekho
// Protected route - authenticated user apni applications dekh sakta hai
router.get(
  '/user/:id',
  authenticate,
  userApplicationsValidation,
  validate,
  applicationController.getUserApplications
);

// PUT /api/applications/:id/status - Application status update karo
// Protected + recruiter only - sirf job owner status change kar sakta hai
router.put(
  '/:id/status',
  authenticate,
  authorize('recruiter'),
  updateStatusValidation,
  validate,
  applicationController.updateApplicationStatus
);

// GET /api/applications/job/:jobId - Job ki saari applications
// Protected + recruiter only
router.get(
  '/job/:jobId',
  authenticate,
  authorize('recruiter'),
  applicationController.getJobApplications
);

module.exports = router;

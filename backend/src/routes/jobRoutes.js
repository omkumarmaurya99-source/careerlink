// ==================================================
// CareerLink - Job Routes
// ==================================================
// Job CRUD aur search ke routes
// Modular routing - Express Router use kar rahe hain

const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createJobValidation,
  updateJobValidation,
  jobIdValidation,
  searchValidation,
} = require('../validators/jobValidators');

// IMPORTANT: Search route ko :id route se PEHLE define karo
// Nahi toh "search" ko ID samajh lega Express

// GET /api/jobs/search?keyword=backend-developer - Jobs search karo
// Public route - koi bhi search kar sakta hai
router.get('/search', searchValidation, validate, jobController.searchJobs);

// GET /api/jobs/recruiter/my-jobs - Recruiter ki posted jobs
// Protected + authorized - sirf recruiter
router.get(
  '/recruiter/my-jobs',
  authenticate,
  authorize('recruiter'),
  jobController.getMyJobs
);

// GET /api/jobs - Saari jobs fetch karo
// Public route - pagination aur filters supported hain
router.get('/', jobController.getAllJobs);

// GET /api/jobs/:id - Single job details
// Public route
router.get('/:id', jobIdValidation, validate, jobController.getJobById);

// POST /api/jobs - Nayi job create karo
// Protected + authorized - sirf recruiter hi job bana sakta hai
router.post(
  '/',
  authenticate,
  authorize('recruiter'),
  createJobValidation,
  validate,
  jobController.createJob
);

// PUT /api/jobs/:id - Job update karo
// Protected + authorized - sirf recruiter apni job update kar sakta hai
router.put(
  '/:id',
  authenticate,
  authorize('recruiter'),
  updateJobValidation,
  validate,
  jobController.updateJob
);

// DELETE /api/jobs/:id - Job delete karo
// Protected + authorized - sirf recruiter apni job delete kar sakta hai
router.delete(
  '/:id',
  authenticate,
  authorize('recruiter'),
  jobIdValidation,
  validate,
  jobController.deleteJob
);

module.exports = router;

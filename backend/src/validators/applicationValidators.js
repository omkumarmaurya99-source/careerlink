// ==================================================
// CareerLink - Application Validators
// ==================================================
// Job application ke liye validation rules

const { body, param, query } = require('express-validator');

// Application create validation
const createApplicationValidation = [
  body('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Invalid Job ID format'),

  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Cover letter cannot exceed 2000 characters'),
];

// Application status update validation
// Recruiter application status update karega
const updateStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid application ID format'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['applied', 'shortlisted', 'rejected', 'selected'])
    .withMessage('Status must be applied, shortlisted, rejected, or selected'),
];

// User applications fetch validation
const userApplicationsValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('status')
    .optional()
    .isIn(['applied', 'shortlisted', 'rejected', 'selected'])
    .withMessage('Invalid status filter'),
];

module.exports = {
  createApplicationValidation,
  updateStatusValidation,
  userApplicationsValidation,
};

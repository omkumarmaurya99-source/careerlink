// ==================================================
// CareerLink - Job Validators
// ==================================================
// Job creation aur update ke liye validation rules

const { body, param, query } = require('express-validator');

// Job create validation
// Title, company, description, location, skills required hain
const createJobValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Job title must be between 3 and 200 characters'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Company name must be between 2 and 150 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),

  body('salary')
    .optional()
    .trim(),

  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),

  body('skills.*')
    .isString()
    .withMessage('Each skill must be a string')
    .trim()
    .notEmpty()
    .withMessage('Skill cannot be empty'),

  body('status')
    .optional()
    .isIn(['active', 'closed'])
    .withMessage('Status must be either active or closed'),

  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'internship', 'contract', 'remote'])
    .withMessage('Invalid job type'),

  body('experienceLevel')
    .optional()
    .isIn(['fresher', 'junior', 'mid', 'senior', 'lead'])
    .withMessage('Invalid experience level'),

  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date'),
];

// Job update validation - saare fields optional hain
const updateJobValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid job ID format'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Job title must be between 3 and 200 characters'),

  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Company name must be between 2 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),

  body('location')
    .optional()
    .trim(),

  body('salary')
    .optional()
    .trim(),

  body('skills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),

  body('skills.*')
    .optional()
    .isString()
    .withMessage('Each skill must be a string')
    .trim()
    .notEmpty()
    .withMessage('Skill cannot be empty'),

  body('status')
    .optional()
    .isIn(['active', 'closed'])
    .withMessage('Status must be either active or closed'),

  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'internship', 'contract', 'remote'])
    .withMessage('Invalid job type'),

  body('experienceLevel')
    .optional()
    .isIn(['fresher', 'junior', 'mid', 'senior', 'lead'])
    .withMessage('Invalid experience level'),
];

// Job ID param validation
const jobIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid job ID format'),
];

// Search query validation
const searchValidation = [
  query('keyword')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search keyword cannot exceed 200 characters'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('location')
    .optional()
    .trim(),

  query('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'internship', 'contract', 'remote'])
    .withMessage('Invalid job type filter'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'salary', 'title'])
    .withMessage('Invalid sort field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
];

module.exports = {
  createJobValidation,
  updateJobValidation,
  jobIdValidation,
  searchValidation,
};

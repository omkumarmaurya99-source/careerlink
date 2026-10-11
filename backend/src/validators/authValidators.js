// ==================================================
// CareerLink - Auth Validators
// ==================================================
// Registration aur Login ke liye validation rules define karte hain
// express-validator library use kar rahe hain

const { body } = require('express-validator');

// Registration validation rules
// Name, email, role required hain aur format check hota hai
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['recruiter', 'jobseeker'])
    .withMessage('Role must be either recruiter or jobseeker'),

  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('company')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Company name cannot exceed 150 characters'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('skills.*')
    .optional()
    .isString()
    .withMessage('Each skill must be a string')
    .trim()
    .notEmpty()
    .withMessage('Skill cannot be empty'),
];

// Login validation rules
// Email aur password required hain
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = {
  registerValidation,
  loginValidation,
};

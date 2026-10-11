// ==================================================
// CareerLink - Validation Middleware
// ==================================================
// express-validator ke results check karta hai
// Agar validation errors hain toh 422 response return karta hai

const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

// Validation rules check karne ke baad yeh middleware run hoga
// Agar koi validation error hai toh clean error response dega
const validate = (req, res, next) => {
  const errors = validationResult(req);

  // Agar validation errors hain
  if (!errors.isEmpty()) {
    // Errors ko readable format mein convert karo
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    throw new ValidationError('Validation failed', formattedErrors);
  }

  next();
};

module.exports = validate;

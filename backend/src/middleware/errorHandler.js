// ==================================================
// CareerLink - Centralized Error Handling Middleware
// ==================================================
// Saari errors yahan handle hoti hain
// Consistent error response format maintain karta hai

const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

// 404 handler - jab koi route match nahi karta
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
};

// Global error handler middleware
// Express mein 4 arguments wala middleware error handler hota hai
const errorHandler = (err, req, res, next) => {
  // Default values set karo
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose validation error handle karo
  // Jab schema validation fail hoti hai
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose CastError - invalid ObjectId
  // Jab galat format ka ID pass kiya jaye
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // MongoDB duplicate key error (code 11000)
  // Jab unique field mein duplicate value daalne ki koshish ho
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for '${field}'. This ${field} already exists.`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum size is 5MB.';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  }

  // Error log karo - sensitive info expose nahi karo response mein
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn(`[${statusCode}] ${message}`, {
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Consistent error response format
  const response = {
    success: false,
    message,
  };

  // Errors array sirf tab include karo jab ho
  if (errors.length > 0) {
    response.errors = errors;
  }

  // Development mein stack trace bhi bhejo debugging ke liye
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFoundHandler, errorHandler };

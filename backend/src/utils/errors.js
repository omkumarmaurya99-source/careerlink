// ==================================================
// CareerLink - Custom Error Classes
// ==================================================
// Custom error classes banaye hain taaki error handling clean aur consistent ho

// Base AppError class - saari custom errors isse extend karengi
class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Operational errors = expected errors
    this.errors = errors;

    // Stack trace capture karo debugging ke liye
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 - Bad Request: Jab client ne galat data bheja
class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errors = []) {
    super(message, 400, errors);
  }
}

// 401 - Unauthorized: Jab authentication fail ho
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized - Please login') {
    super(message, 401);
  }
}

// 403 - Forbidden: Jab authenticated user ke paas permission nahi hai
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden - You do not have permission') {
    super(message, 403);
  }
}

// 404 - Not Found: Jab requested resource nahi mila
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// 409 - Conflict: Jab duplicate data create karne ki koshish ho
class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

// 400 - Validation Error / Bad Request: Jab validation fail ho
class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400, errors);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};

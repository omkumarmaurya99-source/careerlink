// ==================================================
// CareerLink - Response Helper Utility
// ==================================================
// Consistent API response format ke liye helper functions
// Har API ek jaisa response format return karegi

// Success response helper
// Jab API successfully kaam kare toh yeh format use karo
const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  // Agar data hai toh include karo
  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Error response helper
// Jab API mein error aaye toh yeh format use karo
const errorResponse = (res, statusCode, message, errors = []) => {
  const response = {
    success: false,
    message,
  };

  // Agar specific errors hain toh include karo
  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Pagination helper
// Job listing jaise endpoints ke liye pagination metadata
const paginatedResponse = (res, statusCode, message, data, pagination) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};

// ==================================================
// CareerLink - Authorization Middleware (RBAC)
// ==================================================
// Role-Based Access Control implement karta hai
// Check karta hai ki authenticated user ke paas required role hai ya nahi

const { ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

// Role check middleware factory function
// Allowed roles pass karo, agar user ka role match nahi kiya toh 403 Forbidden
// Usage: authorize('recruiter') ya authorize('recruiter', 'jobseeker')
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Pehle check karo ki user authenticated hai (req.user set hai)
    if (!req.user) {
      return next(
        new ForbiddenError('Authentication required before authorization')
      );
    }

    // Check karo ki user ka role allowed roles mein hai ya nahi
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Authorization failed: User ${req.user.email} with role '${req.user.role}' tried to access route requiring [${allowedRoles.join(', ')}]`
      );
      return next(
        new ForbiddenError(
          `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    logger.debug(
      `Authorization passed: ${req.user.email} (${req.user.role})`
    );
    next();
  };
};

module.exports = authorize;

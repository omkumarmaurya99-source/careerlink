// ==================================================
// CareerLink - Recommendation Controller
// ==================================================
// Job recommendation endpoint

const RecommendationService = require('../services/recommendationService');
const { successResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

// GET /api/recommendations
// User ke skills ke basis pe matching jobs recommend karo
const getRecommendations = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    // Recommendation service se recommendations lo
    const result = await RecommendationService.getRecommendations(req.userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
    });

    return successResponse(res, 200, 'Recommendations generated successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
};

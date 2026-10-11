// ==================================================
// CareerLink - Recommendation Routes
// ==================================================
// Job recommendation endpoint

const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const authenticate = require('../middleware/authenticate');

// GET /api/recommendations - Skill-based job recommendations
// Protected route - user ke skills ke basis pe
router.get('/', authenticate, recommendationController.getRecommendations);

module.exports = router;

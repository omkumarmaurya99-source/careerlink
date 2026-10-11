// ==================================================
// CareerLink - Resume Routes
// ==================================================
// Resume upload aur parsing routes

const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authenticate = require('../middleware/authenticate');
const { uploadResume } = require('../middleware/upload');

// POST /api/resume/upload - Resume upload aur parse karo
// Protected route - sirf authenticated user
router.post(
  '/upload',
  authenticate,
  uploadResume, // Multer middleware - file upload handle karega
  resumeController.uploadResume
);

// GET /api/resume/parsed - Parsed resume data fetch karo
// Protected route
router.get('/parsed', authenticate, resumeController.getParsedResume);

module.exports = router;

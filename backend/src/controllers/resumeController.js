// ==================================================
// CareerLink - Resume Controller
// ==================================================
// Resume upload aur parsing endpoints

const User = require('../models/User');
const ResumeParserService = require('../services/resumeParserService');
const { successResponse } = require('../utils/responseHelper');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');
const path = require('path');

// POST /api/resume/upload
// Resume upload karo aur parse karo
const uploadResume = async (req, res, next) => {
  try {
    // Check karo ki file upload hui hai ya nahi
    if (!req.file) {
      throw new BadRequestError('Please upload a resume file (PDF, DOC, or DOCX)');
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Resume file parse karo - text extract hoga
    const parsedData = await ResumeParserService.parseResume(filePath);

    // User profile mein resume path aur parsed data update karo
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          resume: `/uploads/${fileName}`,
          parsedResume: parsedData,
        },
      },
      { new: true }
    ).select('-__v');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info(`Resume uploaded and parsed for user: ${user.email}`);

    return successResponse(res, 200, 'Resume uploaded and parsed successfully', {
      resume: {
        fileName: req.file.originalname,
        filePath: `/uploads/${fileName}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
      parsedData: {
        extractedSkills: parsedData.extractedSkills,
        extractedEmail: parsedData.extractedEmail,
        extractedPhone: parsedData.extractedPhone,
        extractedName: parsedData.extractedName,
        parsedAt: parsedData.parsedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/resume/parsed
// User ka parsed resume data fetch karo
const getParsedResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('parsedResume resume');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.resume) {
      throw new NotFoundError('No resume uploaded yet');
    }

    return successResponse(res, 200, 'Parsed resume data fetched successfully', {
      resume: user.resume,
      parsedData: user.parsedResume,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getParsedResume,
};

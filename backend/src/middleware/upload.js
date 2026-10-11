// ==================================================
// CareerLink - File Upload Middleware (Multer)
// ==================================================
// Resume aur profile photo upload handle karta hai
// File type, size validation, storage configuration

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { BadRequestError } = require('../utils/errors');

// Allowed file types for resume
const ALLOWED_RESUME_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

// Allowed file types for profile photo
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// Max file size - 5MB
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

// Storage configuration - disk storage use kar rahe hain
// Files uploads/ folder mein save hongi unique naam ke saath
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  // Unique filename generate karo - collision avoid karne ke liye
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Resume upload filter - sirf PDF, DOC, DOCX allowed hain
const resumeFileFilter = (req, file, cb) => {
  if (ALLOWED_RESUME_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        'Invalid file type. Only PDF, DOC, and DOCX files are allowed for resume.'
      ),
      false
    );
  }
};

// Image upload filter - sirf JPG, PNG, WEBP allowed hain
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        'Invalid file type. Only JPG, PNG, and WEBP files are allowed for images.'
      ),
      false
    );
  }
};

// Resume upload middleware
// 'resume' field name se file accept hogi
const uploadResume = multer({
  storage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
}).single('resume');

// Profile photo upload middleware
const uploadProfilePhoto = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
}).single('profilePhoto');

// Multer error handling wrapper
// Multer errors ko clean error messages mein convert karta hai
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(
              new BadRequestError(
                `File too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
              )
            );
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return next(new BadRequestError('Unexpected file field name.'));
          }
          return next(new BadRequestError(`Upload error: ${err.message}`));
        }
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  uploadResume: handleUpload(uploadResume),
  uploadProfilePhoto: handleUpload(uploadProfilePhoto),
  ALLOWED_RESUME_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
};

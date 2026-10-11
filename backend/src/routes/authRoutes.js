// ==================================================
// CareerLink - Auth Routes
// ==================================================
// Authentication ke saare routes yahan define hain
// Registration, login, profile management

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { registerValidation, loginValidation } = require('../validators/authValidators');

// POST /api/auth/register - Naya user register karo
// Validation middleware pehle chalega, phir controller
router.post('/register', registerValidation, validate, authController.register);

// POST /api/auth/login - User login karo (Credentials ya Firebase ID token)
router.post('/login', loginValidation, validate, authController.login);

// POST /api/auth/firebase-login & /api/auth/firebase - Firebase ID token direct verification
router.post('/firebase-login', authController.firebaseLogin);
router.post('/firebase', authController.firebaseLogin);

// GET /api/auth/profile - Apni profile dekho (protected route)
// authenticate middleware JWT verify karega
router.get('/profile', authenticate, authController.getProfile);

// PUT /api/auth/profile - Profile update karo (protected route)
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;

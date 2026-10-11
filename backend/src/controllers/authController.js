// ==================================================
// CareerLink - Auth Controller
// ==================================================
// Authentication endpoints ka logic - register, login, profile
// Controller service ko call karta hai aur response bhejta hai

const AuthService = require('../services/authService');
const { successResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger');

// POST /api/auth/register
// Naya user register karo
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, firebaseToken, phone, company, skills } = req.body;

    // AuthService se registration handle karo
    const result = await AuthService.register({
      name,
      email,
      password,
      role,
      firebaseToken,
      phone,
      company,
      skills,
    });

    // 201 Created status code - naya resource create hua
    return successResponse(res, 201, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
// User login karo - credentials verify karke JWT token do
const login = async (req, res, next) => {
  try {
    const { email, password, firebaseToken } = req.body;

    // AuthService se login handle karo
    const result = await AuthService.login({ email, password, firebaseToken });

    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/profile
// Logged-in user ki profile fetch karo
const getProfile = async (req, res, next) => {
  try {
    // req.user authenticate middleware se set hota hai
    const user = await AuthService.getProfile(req.userId);

    return successResponse(res, 200, 'Profile fetched successfully', { user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
// User profile update karo
const updateProfile = async (req, res, next) => {
  try {
    const user = await AuthService.updateProfile(req.userId, req.body);

    return successResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/firebase-login (or /api/auth/firebase)
// Firebase ID token verify karke user session aur CareerLink JWT return karo
const firebaseLogin = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      token = req.body?.firebaseToken || req.body?.idToken;
    }

    const result = await AuthService.loginWithFirebaseToken(token, {
      name: req.body?.name,
      role: req.body?.role,
      company: req.body?.company,
      skills: req.body?.skills,
    });

    return successResponse(res, 200, 'Firebase authentication successful', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  firebaseLogin,
  getProfile,
  updateProfile,
};

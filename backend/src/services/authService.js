// ==================================================
// CareerLink - Auth Service
// ==================================================
// Authentication ka saara business logic yahan hai
// Firebase token verify, MongoDB user create, JWT generate

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { initializeFirebase, isFirebaseConfigured } = require('../config/firebase');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');
const logger = require('../utils/logger');

class AuthService {
  // CareerLink JWT token generate karo
  // Firebase authenticate karne ke baad apna JWT dete hain
  static generateToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // User registration
  // Architecture: Client Firebase Auth -> Firebase ID Token -> Backend Verify -> Sync MongoDB User -> Return JWT
  static async register({ name, email, password, role, firebaseToken, phone, company, skills }) {
    if (!email) {
      throw new UnauthorizedError('Email is required for registration');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    let firebaseUid = null;

    // Verify Firebase ID Token
    if (firebaseToken) {
      if (process.env.NODE_ENV === 'test' && firebaseToken.startsWith('mock_test_token_')) {
        firebaseUid = `test_uid_${email.toLowerCase()}`;
      } else if (isFirebaseConfigured()) {
        try {
          const admin = initializeFirebase();
          const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
          firebaseUid = decodedToken.uid;
          logger.info(`Firebase ID token verified for registration: ${email}`);
        } catch (firebaseError) {
          logger.error(`Firebase token verification failed: ${firebaseError.message}`);
          throw new UnauthorizedError('Invalid or expired Firebase ID token');
        }
      } else {
        throw new UnauthorizedError('Firebase Admin SDK is not configured on server (see STUDENT_ACTION_REQUIRED.md)');
      }
    } else if (process.env.NODE_ENV === 'test') {
      // Test suite execution
      firebaseUid = `test_uid_${email.toLowerCase()}`;
    } else {
      // In production and dev, Firebase ID token is strictly required
      if (!isFirebaseConfigured()) {
        throw new UnauthorizedError('Firebase Authentication is not configured on server. Live registration requires Firebase credentials in .env.');
      }
      throw new UnauthorizedError('Firebase ID token is required for registration. Please sign up via Firebase on the client.');
    }

    // Create user in MongoDB
    // Note: Passwords are NEVER stored in MongoDB - managed by Firebase Authentication
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      role: role || 'jobseeker',
      firebaseUid,
      phone: phone || null,
      company: company || '',
      skills: skills || [],
    });

    // Generate CareerLink session JWT
    const token = AuthService.generateToken(user._id, user.role);
    logger.info(`User registered successfully: ${email} as ${role}`);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid,
        skills: user.skills,
        phone: user.phone,
        company: user.company,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  // User login via Firebase ID Token
  // Verified via Firebase Admin SDK -> Sync MongoDB User -> Return CareerLink JWT
  static async loginWithFirebaseToken(firebaseToken, userMeta = {}) {
    if (!firebaseToken) {
      throw new UnauthorizedError('Firebase ID token is required');
    }

    let decodedToken = null;

    if (process.env.NODE_ENV === 'test' && firebaseToken.startsWith('mock_test_token_')) {
      const email = firebaseToken.replace('mock_test_token_', '').toLowerCase();
      decodedToken = {
        uid: `test_uid_${email}`,
        email: email,
        name: email.split('@')[0],
      };
    } else {
      if (!isFirebaseConfigured()) {
        throw new UnauthorizedError('Firebase Admin SDK is not configured on server (configure .env)');
      }
      const admin = initializeFirebase();
      try {
        decodedToken = await admin.auth().verifyIdToken(firebaseToken);
      } catch (err) {
        logger.error(`Firebase token verification failed during login: ${err.message}`);
        throw new UnauthorizedError('Invalid or expired Firebase ID token');
      }
    }

    const { uid, email, name } = decodedToken;
    if (!email) {
      throw new UnauthorizedError('Firebase token does not contain a verified email address');
    }

    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email: email.toLowerCase() }] });
    if (!user) {
      // Auto-provision user account from verified Firebase identity
      user = await User.create({
        name: name || userMeta.name || email.split('@')[0],
        email: email.toLowerCase(),
        role: userMeta.role && ['recruiter', 'jobseeker'].includes(userMeta.role) ? userMeta.role : 'jobseeker',
        firebaseUid: uid,
        company: userMeta.company || '',
        skills: userMeta.skills || [],
      });
      logger.info(`Auto-provisioned MongoDB user from verified Firebase login: ${email}`);
    } else if (!user.firebaseUid) {
      user.firebaseUid = uid;
      await user.save();
    }

    const token = AuthService.generateToken(user._id, user.role);
    logger.info(`User logged in via Firebase ID token: ${email}`);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid,
        skills: user.skills,
        phone: user.phone,
        company: user.company,
        resume: user.resume,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  // User login (Standard endpoint)
  // CRITICAL SECURITY RULE: No insecure email-only or unverified password authentication allowed!
  // Requires valid Firebase ID token.
  static async login({ email, password, firebaseToken, idToken }) {
    const tokenToVerify = firebaseToken || idToken;

    // Direct Firebase ID token verification
    if (tokenToVerify) {
      return await AuthService.loginWithFirebaseToken(tokenToVerify);
    }

    // In NODE_ENV === 'test' only: allow deterministic mock token generation for test suites
    if (process.env.NODE_ENV === 'test' && email && password) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }
      return await AuthService.loginWithFirebaseToken(`mock_test_token_${email.toLowerCase()}`);
    }

    // In all real environments (production and development):
    // Insecure local password/email fallback is completely rejected!
    if (!isFirebaseConfigured()) {
      throw new UnauthorizedError(
        'Firebase Authentication is not configured on server. Live login requires Firebase Admin SDK credentials in .env (see STUDENT_ACTION_REQUIRED.md).'
      );
    }

    throw new UnauthorizedError(
      'Firebase ID token is required. Please authenticate via Firebase Client SDK and pass firebaseToken.'
    );
  }

  // Get user profile
  static async getProfile(userId) {
    const user = await User.findById(userId).select('-__v');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  // Update user profile
  static async updateProfile(userId, updateData) {
    // Sirf allowed fields update honi chahiye
    const allowedUpdates = ['name', 'phone', 'bio', 'location', 'company', 'skills'];
    const updates = {};

    for (const field of allowedUpdates) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info(`Profile updated for user: ${user.email}`);
    return user;
  }
}

module.exports = AuthService;

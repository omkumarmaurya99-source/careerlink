// ==================================================
// CareerLink - Firebase ID Token Verification Middleware
// ==================================================
// Verifies Firebase ID Token from Authorization header or request body
// Architecture: Firebase Auth (Client) -> ID Token -> Backend Verify -> Sync MongoDB User

const { initializeFirebase, isFirebaseConfigured } = require('../config/firebase');
const User = require('../models/User');
const { UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Middleware: authenticateFirebaseUser
 * 1. Reads Authorization header (expects "Bearer <firebaseIdToken>") or req.body.firebaseToken
 * 2. Verifies Firebase ID token using Firebase Admin SDK
 * 3. Rejects invalid, expired, or missing tokens
 * 4. Identifies Firebase UID and email
 * 5. Finds or synchronizes the corresponding MongoDB User
 * 6. Attaches authenticated user and firebase info to req.user / req.userId
 */
const authenticateFirebaseUser = async (req, res, next) => {
  try {
    let token = null;

    // Step 1: Read Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.body && (req.body.firebaseToken || req.body.idToken)) {
      token = req.body.firebaseToken || req.body.idToken;
    }

    // Step 2 & 3: Reject missing tokens
    if (!token) {
      throw new UnauthorizedError('Access denied. Firebase ID token is required in Authorization header (Bearer <token>) or body.');
    }

    let decodedToken = null;

    // In automated test environment, support deterministic test tokens
    if (process.env.NODE_ENV === 'test' && token.startsWith('mock_test_token_')) {
      const email = token.replace('mock_test_token_', '');
      decodedToken = {
        uid: `test_uid_${email}`,
        email: email,
        name: email.split('@')[0],
      };
    } else {
      // Step 2: Verify using Firebase Admin SDK
      if (!isFirebaseConfigured()) {
        logger.warn('Firebase credentials not configured. Cannot verify real Firebase ID token.');
        throw new UnauthorizedError('Firebase credentials are not configured on server. Configure Firebase Admin SDK in .env (see STUDENT_ACTION_REQUIRED.md).');
      }

      const admin = initializeFirebase();
      if (!admin) {
        throw new UnauthorizedError('Firebase Admin SDK is not initialized.');
      }

      try {
        decodedToken = await admin.auth().verifyIdToken(token);
      } catch (err) {
        logger.error(`Firebase token verification failed: ${err.message}`);
        throw new UnauthorizedError('Invalid or expired Firebase ID token.');
      }
    }

    // Step 4 & 5: Identify UID & email, sync with MongoDB User
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email ? decodedToken.email.toLowerCase() : null;

    let user = null;
    if (firebaseUid) {
      user = await User.findOne({ firebaseUid });
    }
    if (!user && email) {
      user = await User.findOne({ email });
      if (user && !user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
    }

    // If user does not exist in MongoDB yet, sync/provision user
    if (!user && email) {
      const role = req.body?.role && ['recruiter', 'jobseeker'].includes(req.body.role)
        ? req.body.role
        : 'jobseeker';

      user = await User.create({
        name: decodedToken.name || req.body?.name || email.split('@')[0],
        email: email,
        role: role,
        firebaseUid: firebaseUid,
        company: req.body?.company || '',
        skills: req.body?.skills || [],
      });
      logger.info(`Auto-provisioned MongoDB user from Firebase Auth: ${email} (${role})`);
    }

    if (!user) {
      throw new UnauthorizedError('User account could not be found or initialized for this Firebase identity.');
    }

    // Step 6 & 7: Attach authenticated user to request
    req.user = user;
    req.userId = user._id;
    req.firebaseUser = decodedToken;

    logger.debug(`Firebase authenticated: ${user.email} (UID: ${firebaseUid})`);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticateFirebaseUser;

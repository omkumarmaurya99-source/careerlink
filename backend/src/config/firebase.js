// ==================================================
// CareerLink - Firebase Admin SDK Configuration
// ==================================================
// Firebase Admin SDK initialization for server-side ID token verification
// Supports both service account JSON file and individual environment variables

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

let firebaseApp = null;

/**
 * Resolves the service account JSON file path if available
 * Checks explicit environment variables first, then defaults to backend/src/config/firebase.json
 * @returns {string | null}
 */
const getServiceAccountPath = () => {
  // Check explicit environment variable path if provided
  const envKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKeyPath) {
    const resolvedPath = path.isAbsolute(envKeyPath) ? envKeyPath : path.resolve(process.cwd(), envKeyPath);
    if (fs.existsSync(resolvedPath)) {
      return resolvedPath;
    }
  }

  // Check default JSON file location in config directory (src/config/firebase.json)
  const defaultPath = path.join(__dirname, 'firebase.json');
  if (fs.existsSync(defaultPath)) {
    return defaultPath;
  }

  return null;
};

/**
 * Checks whether Firebase credentials are configured in the environment or via JSON file
 * @returns {boolean}
 */
const isFirebaseConfigured = () => {
  // Priority 1: Check service account JSON file (preferred)
  if (getServiceAccountPath()) {
    return true;
  }

  // Priority 2: Fall back to individual environment variables only if JSON file is not available
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return true;
  }

  return false;
};

/**
 * Initializes the Firebase Admin SDK if credentials are valid
 * Priority: Service account JSON file is loaded first.
 * Individual environment variables are only used as fallback when JSON file is not available.
 * @returns {admin.app.App | null}
 */
const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (admin.apps.length > 0) {
    firebaseApp = admin.apps[0];
    return firebaseApp;
  }

  try {
    // Configuration Priority 1: Service Account JSON File (backend/src/config/firebase.json)
    // When the JSON file is available, do NOT use FIREBASE_PRIVATE_KEY or FIREBASE_CLIENT_EMAIL from .env
    const serviceAccountPath = getServiceAccountPath();
    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
      });
      logger.info('Firebase Admin SDK initialized successfully from service account file');
      return firebaseApp;
    }

    // Configuration Priority 2: Individual Environment Variables (Fallback when JSON file is not available)
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
      });
      logger.info('Firebase Admin SDK initialized successfully via individual environment variables');
      return firebaseApp;
    }

    // Neither configured
    logger.warn('Firebase credentials not configured. Firebase ID token verification will require valid credentials.');
    logger.warn('STUDENT ACTION REQUIRED: Configure Firebase credentials in .env (see STUDENT_ACTION_REQUIRED.md)');
    return null;
  } catch (error) {
    logger.error(`Firebase initialization failed: ${error.message}`);
    return null;
  }
};

module.exports = {
  initializeFirebase,
  isFirebaseConfigured,
  admin,
};

// ==================================================
// CareerLink - Frontend Firebase Client Configuration
// ==================================================
// Initializes Firebase Client SDK for user authentication
// Handles: Email/Password Auth, Session Persistence, and ID Token retrieval

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from 'firebase/auth';

// Firebase configuration from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/**
 * Checks whether Firebase client credentials have been populated in frontend/.env
 * @returns {boolean}
 */
export const isFirebaseClientConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('YOUR_FIREBASE')
  );
};

// Initialize Firebase App singleton
let app = null;
let auth = null;

if (isFirebaseClientConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Ensure session persistence in local storage
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Firebase persistence warning:', err);
    });
  } catch (err) {
    console.error('Firebase initialization error:', err);
  }
} else {
  console.info(
    'ℹ️ Firebase client is not configured yet. Configure VITE_FIREBASE_* in frontend/.env. See STUDENT_ACTION_REQUIRED.md'
  );
}

export { auth, app };

/**
 * Registers user with Firebase Authentication and obtains Firebase ID token
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: any, idToken: string }>}
 */
export const signUpWithFirebase = async (email, password) => {
  if (!isFirebaseClientConfigured() || !auth) {
    throw new Error(
      'Firebase is not configured. Please add your Firebase credentials to frontend/.env (see STUDENT_ACTION_REQUIRED.md).'
    );
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
};

/**
 * Signs in user with Firebase Authentication and obtains fresh Firebase ID token
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: any, idToken: string }>}
 */
export const signInWithFirebase = async (email, password) => {
  if (!isFirebaseClientConfigured() || !auth) {
    throw new Error(
      'Firebase is not configured. Please add your Firebase credentials to frontend/.env (see STUDENT_ACTION_REQUIRED.md).'
    );
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
};

/**
 * Signs out user from Firebase
 */
export const signOutFirebase = async () => {
  if (auth) {
    await signOut(auth);
  }
};

/**
 * Gets fresh Firebase ID token for current user
 * @returns {Promise<string | null>}
 */
export const getCurrentFirebaseToken = async () => {
  if (!auth || !auth.currentUser) return null;
  return await auth.currentUser.getIdToken(true);
};

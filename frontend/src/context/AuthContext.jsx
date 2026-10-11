// ==================================================
// CareerLink - Authentication Context
// ==================================================
// Global state management for logged-in user, roles, and JWT session

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  isFirebaseClientConfigured,
  signInWithFirebase,
  signUpWithFirebase,
  signOutFirebase,
} from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('careerlink_token') || null);
  const [loading, setLoading] = useState(true);

  // Initial load pe profile fetch karo agar token hai
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getProfile();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    // Step 1: Strict Check - Firebase Client SDK MUST be configured
    if (!isFirebaseClientConfigured()) {
      throw new Error(
        'Firebase Authentication is not configured. Please add your Firebase credentials (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.) to frontend/.env (see STUDENT_ACTION_REQUIRED.md).'
      );
    }

    // Step 2: Authenticate via Firebase Client SDK
    let firebaseToken;
    try {
      const { idToken } = await signInWithFirebase(email, password);
      firebaseToken = idToken;
    } catch (fbErr) {
      console.error('Firebase Auth sign-in failed:', fbErr.message);
      throw new Error(`Firebase Authentication Failed: ${fbErr.message}`);
    }

    // Step 3: Send verified Firebase ID token to backend for MongoDB sync & CareerLink JWT
    const res = await api.login({ email, firebaseToken });
    if (res.success && res.data) {
      const newToken = res.data.token;
      const newUser = res.data.user;
      localStorage.setItem('careerlink_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    // Step 1: Strict Check - Firebase Client SDK MUST be configured
    if (!isFirebaseClientConfigured()) {
      throw new Error(
        'Firebase Authentication is not configured. Please add your Firebase credentials (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.) to frontend/.env (see STUDENT_ACTION_REQUIRED.md).'
      );
    }

    // Step 2: Register via Firebase Client SDK
    let firebaseToken;
    try {
      const { idToken } = await signUpWithFirebase(userData.email, userData.password);
      firebaseToken = idToken;
    } catch (fbErr) {
      console.error('Firebase Auth registration failed:', fbErr.message);
      throw new Error(`Firebase Registration Failed: ${fbErr.message}`);
    }

    // Step 3: Register profile in MongoDB via CareerLink backend with verified Firebase ID token
    const res = await api.register({ ...userData, firebaseToken });
    if (res.success && res.data) {
      const newToken = res.data.token;
      const newUser = res.data.user;
      localStorage.setItem('careerlink_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return newUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await signOutFirebase();
    } catch (err) {
      console.warn('Firebase signout note:', err);
    }
    localStorage.removeItem('careerlink_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getProfile();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Could not refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isRecruiter: user?.role === 'recruiter',
        isJobseeker: user?.role === 'jobseeker',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ==================================================
// CareerLink - Test Setup
// ==================================================
// Jest tests ke liye common setup - MongoDB connection, helper functions

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const Job = require('../src/models/Job');
const Application = require('../src/models/Application');

// Test environment variables set karo
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

// Test MongoDB URI - alag database use karo testing ke liye
const TEST_MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerlink_test';

// Test ke pehle database connect karo - fail fast if unavailable
const connectTestDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
    }
  } catch (error) {
    console.error('Test DB connection failed (check local MongoDB or TEST_MONGODB_URI):', error.message);
    throw error;
  }
};

// Test ke baad database clean karo
const cleanTestDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  } catch (error) {
    console.error('Test DB cleanup failed:', error.message);
  }
};

// Database connection close karo
const closeTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } catch (error) {
    console.error('Test DB close failed:', error.message);
  }
};

// Test user create karo helper function
const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    role: 'jobseeker',
    firebaseUid: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    skills: ['javascript', 'node.js', 'mongodb'],
    ...overrides,
  };

  const user = await User.create(defaultUser);
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user, token };
};

// Test recruiter create karo
const createTestRecruiter = async (overrides = {}) => {
  return createTestUser({
    name: 'Test Recruiter',
    email: `recruiter${Date.now()}@example.com`,
    role: 'recruiter',
    company: 'Test Company',
    ...overrides,
  });
};

// Test job create karo
const createTestJob = async (recruiterId, overrides = {}) => {
  const defaultJob = {
    title: 'Test Backend Developer',
    company: 'Test Tech Corp',
    description: 'We are looking for a skilled backend developer with experience in Node.js and MongoDB to join our team.',
    location: 'Mumbai, India',
    salary: '8-12 LPA',
    skills: ['node.js', 'express', 'mongodb', 'javascript'],
    recruiter: recruiterId,
    status: 'active',
    ...overrides,
  };

  return Job.create(defaultJob);
};

module.exports = {
  app,
  connectTestDB,
  cleanTestDB,
  closeTestDB,
  createTestUser,
  createTestRecruiter,
  createTestJob,
};

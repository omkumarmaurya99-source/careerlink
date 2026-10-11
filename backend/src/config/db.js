// ==================================================
// CareerLink - Database Configuration
// ==================================================
// MongoDB se connection banane ka logic yahan hai

const mongoose = require('mongoose');
const logger = require('../utils/logger');

// MongoDB se connect karne ka function
// Mongoose ODM use karke MongoDB se connection establish karta hai
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 8+ mein ye options by default enabled hain
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database Name: ${conn.connection.name}`);

    // Connection events monitor karne ke liye
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown - jab process band ho toh connection band karo
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    // Agar connection fail ho toh process exit karo
    process.exit(1);
  }
};

module.exports = connectDB;

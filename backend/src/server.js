// ==================================================
// CareerLink - Server Entry Point
// ==================================================
// Server start karta hai - MongoDB connect → Express listen
// Yeh file application ka entry point hai

// Environment variables load karo .env file se
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const { initializeFirebase } = require('./config/firebase');
const logger = require('./utils/logger');

// Port configuration - environment variable ya default 5000
const PORT = process.env.PORT || 5000;

// Server start karo
const startServer = async () => {
  try {
    // Step 1: MongoDB se connect karo
    logger.info('Connecting to MongoDB...');
    await connectDB();

    // Step 2: Firebase initialize karo
    logger.info('Initializing Firebase...');
    initializeFirebase();

    // Step 3: Express server start karo
    const server = app.listen(PORT, () => {
      logger.info(`
========================================
  CareerLink API Server
========================================
  Status:      Running ✅
  Port:        ${PORT}
  Environment: ${process.env.NODE_ENV || 'development'}
  API Base:    http://localhost:${PORT}/api
  Health:      http://localhost:${PORT}/health
  Swagger:     http://localhost:${PORT}/api-docs
========================================
      `);
    });

    // Graceful shutdown handle karo
    // Jab server band karna ho toh cleanly close karo
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds agar graceful shutdown nahi hua
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Unhandled errors catch karo
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection:', { reason: reason?.message || reason });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
      process.exit(1);
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Server start karo!
startServer();

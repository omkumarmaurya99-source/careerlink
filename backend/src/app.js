// ==================================================
// CareerLink - Express Application Configuration
// ==================================================
// Express app ka setup - middleware, routes, error handling
// Yeh file app configure karti hai, server.js start karta hai

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

// Express app create karo
const app = express();

// ==================================================
// SECURITY MIDDLEWARE
// ==================================================

// Helmet - HTTP headers ko secure karta hai
// XSS, clickjacking, MIME sniffing se protect karta hai
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS - Cross Origin Resource Sharing
// Frontend (different port/domain) se backend access karne ke liye
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Rate Limiting - brute force attacks se bachne ke liye
// Ek IP se limited requests hi accept hongi time window mein
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Max 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter sirf API routes pe lagao
app.use('/api/', limiter);

// ==================================================
// BODY PARSING MIDDLEWARE
// ==================================================

// JSON body parse karo - API request bodies ke liye
app.use(express.json({ limit: '10mb' }));

// URL-encoded data parse karo - form submissions ke liye
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================================================
// LOGGING MIDDLEWARE
// ==================================================

// Morgan - HTTP request logging
// Development mein detailed logs, production mein compact logs
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: logger.stream }));
} else {
  app.use(morgan('dev', { stream: logger.stream }));
}

// ==================================================
// STATIC FILES
// ==================================================

// Uploads folder ko static serve karo - resume files access ke liye
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Logs directory create karo agar nahi hai
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ==================================================
// SWAGGER API DOCUMENTATION
// ==================================================

try {
  const swaggerPath = path.join(__dirname, '../swagger.yaml');
  if (fs.existsSync(swaggerPath)) {
    const swaggerFile = fs.readFileSync(swaggerPath, 'utf8');
    const swaggerDocument = YAML.parse(swaggerFile);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'CareerLink API Documentation',
    }));
    logger.info('Swagger UI available at /api-docs');
  }
} catch (error) {
  logger.warn(`Swagger setup warning: ${error.message}`);
}

// ==================================================
// HEALTH CHECK ROUTE
// ==================================================

// GET /health and GET /api/health - Server health check
// Server status, uptime, database connectivity, and memory usage return karta hai
const healthHandler = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbState = dbStatusMap[mongoose.connection.readyState] || 'unknown';

  const healthcheck = {
    success: isDbConnected,
    message: isDbConnected ? 'CareerLink API is healthy' : 'Database connection unavailable',
    data: {
      status: isDbConnected ? 'OK' : 'DEGRADED',
      database: {
        status: dbState,
        connected: isDbConnected,
      },
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())} seconds`,
      environment: process.env.NODE_ENV || 'development',
      memoryUsage: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
      nodeVersion: process.version,
    },
  };

  const statusCode = isDbConnected ? 200 : 503;
  res.status(statusCode).json(healthcheck);
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// ==================================================
// API ROUTES
// ==================================================

// Auth routes - registration, login, profile
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Job routes - CRUD, search
const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

// Application routes - apply, view, status update
const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api/applications', applicationRoutes);

// Resume routes - upload, parse
const resumeRoutes = require('./routes/resumeRoutes');
app.use('/api/resume', resumeRoutes);

// Recommendation routes - skill-based job recommendations
const recommendationRoutes = require('./routes/recommendationRoutes');
app.use('/api/recommendations', recommendationRoutes);

// ==================================================
// ERROR HANDLING MIDDLEWARE
// ==================================================

// 404 handler - jab koi route match nahi karta
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);

// Global error handler - centralized error handling
app.use(errorHandler);

module.exports = app;

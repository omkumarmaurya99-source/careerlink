// ==================================================
// CareerLink - Winston Logger Configuration
// ==================================================
// Structured logging ke liye Winston use kar rahe hain
// Console aur file dono mein logs jaayenge

const winston = require('winston');
const path = require('path');

// Custom log format - timestamp aur level ke saath readable logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    // Agar error hai toh stack trace bhi dikhao
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// JSON format file logs ke liye - structured logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Logger instance create karo
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: jsonFormat,
  // Sensitive info filter - passwords, tokens log nahi honge
  defaultMeta: { service: 'careerlink-api' },
  transports: [
    // Error logs alag file mein
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Saare logs ek combined file mein
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Development mein console mein bhi logs dikhao
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: logFormat,
      level: 'debug',
    })
  );
}

// Morgan ke liye stream - HTTP request logs Winston se handle honge
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;

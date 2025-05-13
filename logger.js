// logger.js
const winston = require('winston');

// Define the log format with timestamp
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create the logger instance
const logger = winston.createLogger({
  level: 'info', // Log at 'info' level and higher (info, warn, error)
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    // Log to the console
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat)
    }),
    // Log to a file
    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info', // Log to file with 'info' level and higher
    })
  ]
});

module.exports = logger;

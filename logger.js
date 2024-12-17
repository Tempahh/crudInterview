// File: logger.js

const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);

// Configure daily rotating log files
const dailyRotateFileTransport = new transports.DailyRotateFile({
  dirname: 'logs', // Directory to save logs
  filename: '%DATE%-app.log', // File naming convention
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // Keep logs for 14 days
  maxSize: '10m', // Rotate if file exceeds 10 MB
});

const errorRotateFileTransport = new transports.DailyRotateFile({
  dirname: 'logs/errors', // Separate directory for errors
  filename: '%DATE%-errors.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error', // Log only errors
  maxFiles: '30d', // Keep error logs for 30 days
});

// Create logger
const logger = createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    dailyRotateFileTransport, // General logs
    errorRotateFileTransport, // Error logs
    new transports.Console({ format: format.simple() }), // Console output
  ],
});

module.exports = logger;

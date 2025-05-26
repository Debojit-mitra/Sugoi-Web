const winston = require("winston");
const { format, transports } = winston;
const path = require("path");

// Custom format for console output
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// Define different transport options for different environments
const transportOptions = [];

// Always log to console
transportOptions.push(
  new transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  })
);

// If in production, also log to files
if (process.env.NODE_ENV === "production") {
  transportOptions.push(
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join("logs", "combined.log"),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    })
  );
}

// Create and configure logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "anime-api" },
  transports: transportOptions,
  exitOnError: false,
});

module.exports = logger;

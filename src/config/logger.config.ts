import path from "path";
import winston from "winston";
import { env } from "./env.config";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Path to root logs directory
const LOGS_DIR = path.resolve(process.cwd(), "logs");

/**
 * Custom Human-Readable Console Format
 */
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  const logMessage = stack || message;
  return `[${timestamp}] ${level}: ${logMessage}${metaString}`;
});

/**
 * Winston Multi-Transport Logger
 * - Console: Colorized, human-readable
 * - logs/error.log: Stores only error-level logs with stack traces in JSON format
 * - logs/combined.log: Stores all info, warn, and error logs in JSON format
 */
export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json()
  ),
  transports: [
    // 1. Error Log File (only errors)
    new winston.transports.File({
      filename: path.join(LOGS_DIR, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB per file
      maxFiles: 5,
    }),

    // 2. Combined / Access Log File (all requests and general info)
    new winston.transports.File({
      filename: path.join(LOGS_DIR, "combined.log"),
      level: "info",
      maxsize: 10 * 1024 * 1024, // 10MB per file
      maxFiles: 5,
    }),
  ],
});

// Always attach console output with clean colorization
logger.add(
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: "HH:mm:ss" }),
      errors({ stack: true }),
      consoleFormat
    ),
  })
);

export default logger;


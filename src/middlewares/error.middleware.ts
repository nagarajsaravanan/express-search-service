import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.config";
import { logger } from "../config/logger.config";

/**
 * Custom Operational Application Error
 * Allows throwing errors with custom HTTP status codes throughout the application.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Restore prototype chain and capture stack trace
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express Error Handling Middleware
 * Must accept 4 arguments (err, req, res, next) to be treated as an error handler by Express.
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = "statusCode" in err && typeof err.statusCode === "number" 
    ? err.statusCode 
    : 500;

  const isOperational = "isOperational" in err ? err.isOperational : false;
  const isDevelopment = env.NODE_ENV === "development";

  // Log non-operational (programmer / unhandled) errors or 500s to Winston (which writes to logs/error.log)
  if (!isOperational || statusCode >= 500) {
    logger.error(`Unhandled / Server Error: ${err.message}`, {
      statusCode,
      stack: err.stack,
      isOperational,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(isDevelopment && { stack: err.stack }),
  });
};

export default errorHandler;


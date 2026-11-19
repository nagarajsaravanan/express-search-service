import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.config";

const SLOW_QUERY_THRESHOLD_MS = 250;

/**
 * Winston-Powered HTTP Request & Latency Logger Middleware
 * Logs every request to console and writes to logs/combined.log & logs/error.log.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = process.hrtime.bigint();

  // Listen for response completion
  res.on("finish", () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    const formattedDuration = `${durationMs.toFixed(2)}ms`;

    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;
    const ip = req.ip || req.socket.remoteAddress;

    const isSlow = durationMs >= SLOW_QUERY_THRESHOLD_MS;
    const logData = {
      method,
      url,
      status,
      duration: formattedDuration,
      ip,
      ...(isSlow && { slowQuery: true, threshold: `${SLOW_QUERY_THRESHOLD_MS}ms` }),
    };

    const message = `${method} ${url} ${status} in ${formattedDuration}${
      isSlow ? ` ⚠️ [SLOW >= ${SLOW_QUERY_THRESHOLD_MS}ms]` : ""
    }`;

    // Route to appropriate log level based on response code and latency
    if (status >= 500) {
      logger.error(message, logData);
    } else if (status >= 400 || isSlow) {
      logger.warn(message, logData);
    } else {
      logger.info(message, logData);
    }
  });

  next();
};

export default requestLogger;

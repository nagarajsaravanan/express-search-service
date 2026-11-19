import cors, { type CorsOptions } from "cors";
import { env } from "../config/env.config";

/**
 * Resolves allowed CORS origins from environment configuration.
 * Handles wildcards, comma-separated lists, or specific domains.
 */
const getAllowedOrigins = (): string[] | string => {
  if (env.CORS_ORIGIN === "*") return "*";
  if (env.CORS_ORIGIN.includes(",")) {
    return env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
  }
  return env.CORS_ORIGIN;
};

export const corsOptions: CorsOptions = {
  origin: getAllowedOrigins(),
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "x-service-api-key",
  ],
  credentials: true,
  optionsSuccessStatus: 204,
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;


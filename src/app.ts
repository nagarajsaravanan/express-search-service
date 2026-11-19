import express, { type Request, type Response } from "express";
import { corsMiddleware } from "./middlewares/cors.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

// Security & Cross-Origin Middleware
app.use(corsMiddleware);

// Request & Latency Logger Middleware
app.use(requestLogger);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "express-search-service",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Root Route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Search Service API is running",
    service: "express-search-service",
  });
});

// 404 Not Found Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;


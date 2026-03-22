// ============================================================================
// REMIT BACKEND - MAIN ENTRY POINT
// ============================================================================

import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import http from "http";
import cookieParser from "cookie-parser";
import compression from "compression";

// Configuration
import { env, constants, HttpStatus } from "./config/env.config.js";
import { connectDB, disconnectDB } from "./config/dbconfig.js";
import Logger from "./logs/logger.js";

// Middleware
import {
  corsMiddleware,
  helmetMiddleware,
  ipBlockingMiddleware,
} from "./middleware/security.middleware.js";
import {
  requestIdMiddleware,
  clientIpMiddleware,
  deviceInfoMiddleware,
  requestLoggingMiddleware,
  errorHandler,
  notFoundHandler,
} from "./middleware/core.middleware.js";

// Routes
import AuthRoutes from "./routes/Auth.routes.js";
import UserRoutes from "./routes/User.routes.js";
import AccountRoutes from "./routes/Account.routes.js";
import TransactionRoutes from "./routes/Transaction.routes.js";
import CardRoutes from "./routes/Card.routes.js";
import LoanRoutes from "./routes/Loan.routes.js";
import InvestmentRoutes from "./routes/Investment.routes.js";
import AdminRoutes from "./routes/Admin.routes.js";
import AdminOperationsRoutes from "./routes/AdminOperations.routes.js";
import FraudRoutes from "./routes/Fraud.routes.js";
import StatisticsRoutes from "./routes/Statistics.routes.js";
// import PermissionRoutes from './routes/Permission.routes.js';
import NotificationRoutes from "./routes/Notification.routes.js";
import AttachmentRoutes from "./routes/Attachment.routes.js";
import LegalRoutes from "./routes/Legal.routes.js";
import IntegrationRoutes from "./routes/Integrations.routes.js";
import SecurityRoutes from "./routes/Security.routes.js";
import TransferVerificationRoutes from "./routes/TransferVerification.routes.js";
import KycRoutes from "./routes/Kyc.routes.js";

// Services
import { initializeWebSocket } from "./services/websocket.service.js";
import { getRedisClient } from "./services/redis.service.js";

// Seeders
import { runSeeders } from "./scripts/seedAdmin.js";

// ============================================================================
// EXPRESS APPLICATION SETUP
// ============================================================================

const app: Express = express();
const server = http.createServer(app);

// ============================================================================
// TRUST PROXY (For reverse proxies like nginx, load balancers)
// ============================================================================

app.set("trust proxy", 1);

// ============================================================================
// GLOBAL MIDDLEWARE
// ============================================================================

// Security headers (configured in security.middleware.ts)
app.use(helmetMiddleware);

// CORS
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing
app.use(cookieParser(env.JWT_SECRET));

// Compression
app.use(compression());

// Request tracking middleware
app.use(requestIdMiddleware);
app.use(clientIpMiddleware);
app.use(deviceInfoMiddleware);

// IP blocking (check for blocked IPs)
app.use(ipBlockingMiddleware);

// Request logging
if (env.NODE_ENV !== "test") {
  app.use(requestLoggingMiddleware);
}

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

/**
 * Basic health check
 * GET /health
 */
app.get("/health", (req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

/**
 * Detailed health check
 * GET /health/detailed
 */
app.get("/health/detailed", async (req: Request, res: Response) => {
  const mongoStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  let redisStatus = "disconnected";
  try {
    const { isRedisConnected } = await import("./services/redis.service.js");
    redisStatus = isRedisConnected() ? "connected" : "disconnected";
  } catch (err) {
    redisStatus = "error";
  }

  res.status(HttpStatus.OK).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
    services: {
      database: {
        status: mongoStatus,
        name: "MongoDB",
      },
      redis: {
        status: redisStatus,
        name: "Redis",
      },
    },
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
      heapTotal:
        Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + "MB",
    },
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

const API_PREFIX = "/api/v1";

// Auth routes
app.use(`${API_PREFIX}/auth`, AuthRoutes);

// User routes
app.use(`${API_PREFIX}/users`, UserRoutes);

// Account/Wallet routes
app.use(`${API_PREFIX}/accounts`, AccountRoutes);

// Transaction routes
app.use(`${API_PREFIX}/transactions`, TransactionRoutes);

// Card routes
app.use(`${API_PREFIX}/cards`, CardRoutes);

// Loan routes
app.use(`${API_PREFIX}/loans`, LoanRoutes);

// Investment routes
app.use(`${API_PREFIX}/investments`, InvestmentRoutes);

// Admin routes
app.use(`${API_PREFIX}/admin`, AdminRoutes);

// Admin Operations routes (financial operations, approvals)
app.use(`${API_PREFIX}/admin/operations`, AdminOperationsRoutes);

// Fraud/Security routes
app.use(`${API_PREFIX}/fraud`, FraudRoutes);

// Statistics routes
app.use(`${API_PREFIX}/statistics`, StatisticsRoutes);

// Permission routes
// app.use(`${API_PREFIX}/permissions`, PermissionRoutes);

// Notification routes
app.use(`${API_PREFIX}/notifications`, NotificationRoutes);

// Attachment routes
app.use(`${API_PREFIX}/attachments`, AttachmentRoutes);

// Legal routes
app.use(`${API_PREFIX}/legal`, LegalRoutes);

// Integration routes
app.use(`${API_PREFIX}/integrations`, IntegrationRoutes);

// Security routes
app.use(`${API_PREFIX}/security`, SecurityRoutes);

// KYC routes (Know Your Customer verification)
app.use(`${API_PREFIX}/kyc`, KycRoutes);

// Secure Transfer Verification routes (3-step verification for transfers/withdrawals)
app.use(
  `${API_PREFIX}/transactions/secure-transfer`,
  TransferVerificationRoutes,
);

// ============================================================================
// API DOCUMENTATION ENDPOINT
// ============================================================================

app.get(`${API_PREFIX}`, (req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({
    name: "Remit Remittance API",
    version: "1.0.0",
    description: "Online Banking and Remittance Platform API",
    documentation: `${process.env.FRONTEND_URL}/docs`,
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      accounts: `${API_PREFIX}/accounts`,
      transactions: `${API_PREFIX}/transactions`,
      secureTransfer: `${API_PREFIX}/transactions/secure-transfer`,
      cards: `${API_PREFIX}/cards`,
      loans: `${API_PREFIX}/loans`,
      investments: `${API_PREFIX}/investments`,
      admin: `${API_PREFIX}/admin`,
      fraud: `${API_PREFIX}/fraud`,
      statistics: `${API_PREFIX}/statistics`,
      // permissions: `${API_PREFIX}/permissions`,
      notifications: `${API_PREFIX}/notifications`,
      attachments: `${API_PREFIX}/attachments`,
      legal: `${API_PREFIX}/legal`,
      integrations: `${API_PREFIX}/integrations`,
      security: `${API_PREFIX}/security`,
      kyc: `${API_PREFIX}/kyc`,
    },
    healthCheck: "/health",
  });
});

// ============================================================================
// 404 HANDLER (Must be after all routes)
// ============================================================================

app.use(notFoundHandler);

// ============================================================================
// GLOBAL ERROR HANDLER (Must be last)
// ============================================================================

app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDB();

    // Run database seeders (seeds super admin from .env)
    await runSeeders();

    // Initialize WebSocket
    initializeWebSocket(server);

    // Connect to Redis
    await getRedisClient();

    // Start HTTP server
    const PORT = env.PORT || 5000;

    server.listen(PORT, () => {
      Logger.info("=".repeat(60));
      Logger.info(`  REMIT BACKEND SERVER (NORDI-REMITTANCE)`);
      Logger.info("=".repeat(60));
      Logger.info(`  Environment: ${env.NODE_ENV}`);
      Logger.info(`  Port: ${PORT}`);
      Logger.info(`  API Base: ${API_PREFIX}`);
      Logger.info(`  Health Check: http://localhost:${PORT}/health`);
      Logger.info("=".repeat(60));
    });
  } catch (error) {
    Logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

async function gracefulShutdown(signal: string): Promise<void> {
  Logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(() => {
    Logger.info("HTTP server closed");
  });

  // Close database connection
  try {
    await disconnectDB();
    Logger.info("Database connection closed");
  } catch (error) {
    Logger.error("Error during database disconnect", { error });
  }

  // Disconnect Redis
  try {
    const { disconnectRedis } = await import("./services/redis.service.js");
    await disconnectRedis();
  } catch (error) {
    Logger.error("Error during Redis disconnect", { error });
  }

  // Exit process
  Logger.info("Graceful shutdown completed");
  process.exit(0);
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// ============================================================================
// START THE SERVER
// ============================================================================

startServer();

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export { app, server };

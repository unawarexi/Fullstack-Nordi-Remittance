// ============================================================================
// CORE MIDDLEWARE - REQUEST PROCESSING
// ============================================================================

import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import type { AuthenticatedRequest, DeviceInfo } from "../types/index.js";
import { constants, env } from "../config/env.config.js";
import {
  AppError,
  isAppError,
  createErrorResponse,
} from "../core/errors/AppError.js";
import {
  sendError,
  sendInternalError,
} from "../core/helpers/response.helper.js";
import { AuditLogs } from "../modules/audit/audit.model.js";
import onHeaders from "on-headers";
import Logger from "../logs/logger.js";

// ============================================================================
// REQUEST ID INJECTION
// ============================================================================

/**
 * Add unique request ID to each request for tracing
 */
export function requestIdMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const requestId =
    (req.headers[constants.REQUEST_ID_HEADER] as string) || uuidv4();
  req.requestId = requestId;
  res.setHeader(constants.REQUEST_ID_HEADER, requestId);
  next();
}

// ============================================================================
// REQUEST TIMING & LOGGING
// ============================================================================

/**
 * Track request timing and log HTTP details
 */
export function requestLoggingMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const startTime = process.hrtime();
  
  onHeaders(res, () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    res.setHeader("X-Response-Time", `${durationMs}ms`);
  });

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

    // Skip health check and metrics noise in info/http logs
    const isNoise = req.originalUrl === "/health" || req.originalUrl === "/metrics";

    const logData = {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${durationMs}ms`,
      ip: req.clientIp,
      userAgent: req.headers["user-agent"],
      userId: req.user?.userId,
    };

    if (res.statusCode >= 500) {
      Logger.error(`HTTP ${res.statusCode} - ${req.method} ${req.originalUrl}`, logData);
    } else if (res.statusCode >= 400) {
      Logger.warn(`HTTP ${res.statusCode} - ${req.method} ${req.originalUrl}`, logData);
    } else if (!isNoise) {
      Logger.http(`HTTP ${res.statusCode} - ${req.method} ${req.originalUrl}`, logData);
    }

    // Proactive warning for slow requests
    if (parseFloat(durationMs) > 3000) {
      Logger.warn(`Slow request detected: ${req.method} ${req.originalUrl} (${durationMs}ms)`);
    }
  });

  next();
}

// ============================================================================
// CLIENT IP EXTRACTION
// ============================================================================

/**
 * Extract real client IP from headers (for proxied requests)
 */
export function clientIpMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const forwardedFor = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];

  if (typeof forwardedFor === "string") {
    req.clientIp = forwardedFor.split(",")[0].trim();
  } else if (typeof realIp === "string") {
    req.clientIp = realIp;
  } else {
    req.clientIp = req.ip || req.socket.remoteAddress;
  }

  next();
}

// ============================================================================
// DEVICE INFO EXTRACTION
// ============================================================================

/**
 * Extract device information from user agent and headers
 */
export function deviceInfoMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const userAgent = req.headers["user-agent"] || "";
  const deviceId = req.headers["x-device-id"] as string;

  const deviceInfo: DeviceInfo = {
    deviceId,
    deviceType: detectDeviceType(userAgent),
    os: detectOS(userAgent),
    browser: detectBrowser(userAgent),
    userAgent,
  };

  req.deviceInfo = deviceInfo;
  next();
}

function detectDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return "mobile";
  if (/tablet/i.test(userAgent)) return "tablet";
  return "desktop";
}

function detectOS(userAgent: string): string {
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/macintosh|mac os x/i.test(userAgent)) return "MacOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Unknown";
}

function detectBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) return "Chrome";
  if (/firefox/i.test(userAgent)) return "Firefox";
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return "Safari";
  if (/edge/i.test(userAgent)) return "Edge";
  if (/opera|opr/i.test(userAgent)) return "Opera";
  return "Unknown";
}

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error,
  req: AuthenticatedRequest,
  res: Response,
  _next: NextFunction,
): void {
  const logData = {
    requestId: req.requestId,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.userId,
    stack: env.NODE_ENV === "development" ? error.stack : undefined,
  };

  Logger.error(`Unhandled Error: ${error.message}`, logData);

  if (isAppError(error)) {
    const response = createErrorResponse(error);
    res.status(error.statusCode).json({
      ...response,
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Mongoose validation errors
  if (error.name === "ValidationError") {
    sendError(res, "Validation failed", "VALIDATION_ERROR", 400, {
      details: (error as any).errors,
    });
    return;
  }

  // Mongoose duplicate key errors
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyValue || {})[0] || "field";
    sendError(res, `Duplicate value for ${field}`, "DUPLICATE_ENTRY", 409, { field });
    return;
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    sendError(res, "Invalid token", "TOKEN_INVALID", 401);
    return;
  }

  if (error.name === "TokenExpiredError") {
    sendError(res, "Token has expired", "TOKEN_EXPIRED", 401);
    return;
  }

  // Generic server error
  sendInternalError(
    res,
    env.NODE_ENV === "production" ? "An unexpected error occurred" : error.message,
  );
}

// ============================================================================
// 404 NOT FOUND HANDLER
// ============================================================================

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  sendError(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    "ROUTE_NOT_FOUND",
    404,
  );
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export async function auditLogMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }

  const skipPaths = ["/health", "/api/v1/auth/refresh"];
  if (skipPaths.some((path) => req.originalUrl.includes(path))) {
    return next();
  }

  res.on("finish", async () => {
    try {
      const action = determineAction(req.method, req.originalUrl);
      await AuditLogs.create({
        eventType: "user_action",
        action,
        actor: req.user?.userId || "anonymous",
        actorType: req.user ? "user" : "system",
        resource: req.originalUrl.split("/")[3] || "unknown",
        resourceId: req.params.id || req.body?.id || "unknown",
        ipAddress: req.clientIp,
        userAgent: req.headers["user-agent"],
        severity: res.statusCode >= 400 ? "warning" : "info",
        status: res.statusCode >= 400 ? "failed" : "success",
        metadata: {
          requestId: req.requestId,
          method: req.method,
          statusCode: res.statusCode,
        },
      });
    } catch (error) {
      Logger.error("Failed to create audit log", { error });
    }
  });

  next();
}

function determineAction(method: string, url: string): string {
  const parts = url.split("/").filter(Boolean);
  const resource = parts[2] || "resource";

  switch (method) {
    case "POST": return `create_${resource}`;
    case "PUT":
    case "PATCH": return `update_${resource}`;
    case "DELETE": return `delete_${resource}`;
    default: return `${method.toLowerCase()}_${resource}`;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  requestIdMiddleware,
  requestLoggingMiddleware,
  clientIpMiddleware,
  deviceInfoMiddleware,
  errorHandler,
  notFoundHandler,
  auditLogMiddleware,
};

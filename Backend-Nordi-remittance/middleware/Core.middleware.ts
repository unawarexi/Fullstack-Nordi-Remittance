// ============================================================================
// CORE MIDDLEWARE - REQUEST PROCESSING
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { AuthenticatedRequest, DeviceInfo } from '../types/index.js';
import { constants } from '../config/env.config.js';
import { AppError, isAppError, createErrorResponse } from '../core/errors/AppError.js';
import { sendError, sendInternalError } from '../core/helpers/response.helper.js';
import { AuditLogs } from '../models/AuditModels.js';
import { env } from '../config/env.config.js';

// ============================================================================
// REQUEST ID INJECTION
// ============================================================================

/**
 * Add unique request ID to each request for tracing
 */
export function requestIdMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.headers[constants.REQUEST_ID_HEADER] as string || uuidv4();
  req.requestId = requestId;
  res.setHeader(constants.REQUEST_ID_HEADER, requestId);
  next();
}

// ============================================================================
// REQUEST TIMING
// ============================================================================

/**
 * Track request timing for performance monitoring
 */
export function requestTimingMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  req.startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - (req.startTime || Date.now());
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Log slow requests
    if (duration > 3000) {
      console.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
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
  next: NextFunction
): void {
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  if (typeof forwardedFor === 'string') {
    req.clientIp = forwardedFor.split(',')[0].trim();
  } else if (typeof realIp === 'string') {
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
  next: NextFunction
): void {
  const userAgent = req.headers['user-agent'] || '';
  const deviceId = req.headers['x-device-id'] as string;

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
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function detectOS(userAgent: string): string {
  // Check mobile OS first (more specific patterns)
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
  if (/android/i.test(userAgent)) return 'Android';
  // Then check desktop OS
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/macintosh|mac os x/i.test(userAgent)) return 'MacOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  return 'Unknown';
}

function detectBrowser(userAgent: string): string {
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) return 'Chrome';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  if (/edge/i.test(userAgent)) return 'Edge';
  if (/opera|opr/i.test(userAgent)) return 'Opera';
  return 'Unknown';
}

// ============================================================================
// REQUEST LOGGING
// ============================================================================

/**
 * Log all incoming requests
 */
export function requestLoggingMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.clientIp,
      userAgent: req.headers['user-agent'],
      userId: req.user?.userId,
    };

    if (res.statusCode >= 400) {
      console.error('Request Error:', JSON.stringify(logData));
    } else if (env.NODE_ENV === 'development') {
      console.log('Request:', JSON.stringify(logData));
    }
  });

  next();
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
  _next: NextFunction
): void {
  // Log the error
  console.error('Error:', {
    requestId: req.requestId,
    message: error.message,
    stack: env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.userId,
  });

  // Handle operational errors
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

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    sendError(
      res,
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      { details: (error as any).errors }
    );
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    sendError(
      res,
      'Invalid resource identifier',
      'INVALID_ID',
      400
    );
    return;
  }

  // Handle Mongoose duplicate key errors
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyValue || {})[0] || 'field';
    sendError(
      res,
      `Duplicate value for ${field}`,
      'DUPLICATE_ENTRY',
      409,
      { field }
    );
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 'TOKEN_INVALID', 401);
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendError(res, 'Token has expired', 'TOKEN_EXPIRED', 401);
    return;
  }

  // Generic server error
  sendInternalError(
    res,
    env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message
  );
}

// ============================================================================
// 404 NOT FOUND HANDLER
// ============================================================================

/**
 * Handle 404 - Route not found
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  sendError(
    res,
    `Route ${req.method} ${req.originalUrl} not found`,
    'ROUTE_NOT_FOUND',
    404
  );
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

/**
 * Log important actions to audit trail
 */
export async function auditLogMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Only audit mutating requests
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Skip certain paths
  const skipPaths = ['/health', '/api/v1/auth/refresh'];
  if (skipPaths.some(path => req.originalUrl.includes(path))) {
    return next();
  }

  const originalJson = res.json.bind(res);
  let responseBody: any;

  res.json = function (body: any) {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', async () => {
    try {
      // Determine action from URL and method
      const action = determineAction(req.method, req.originalUrl);
      
      await AuditLogs.create({
        eventType: 'user_action',
        action,
        actor: req.user?.userId || 'anonymous',
        actorType: req.user ? 'user' : 'system',
        resource: req.originalUrl.split('/')[3] || 'unknown',
        resourceId: req.params.id || req.body?.id || 'unknown',
        ipAddress: req.clientIp,
        userAgent: req.headers['user-agent'],
        severity: res.statusCode >= 400 ? 'warning' : 'info',
        status: res.statusCode >= 400 ? 'failed' : 'success',
        metadata: {
          requestId: req.requestId,
          method: req.method,
          statusCode: res.statusCode,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  });

  next();
}

function determineAction(method: string, url: string): string {
  const parts = url.split('/').filter(Boolean);
  const resource = parts[2] || 'resource';
  
  switch (method) {
    case 'POST': return `create_${resource}`;
    case 'PUT':
    case 'PATCH': return `update_${resource}`;
    case 'DELETE': return `delete_${resource}`;
    default: return `${method.toLowerCase()}_${resource}`;
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  requestIdMiddleware,
  requestTimingMiddleware,
  clientIpMiddleware,
  deviceInfoMiddleware,
  requestLoggingMiddleware,
  errorHandler,
  notFoundHandler,
  auditLogMiddleware,
};
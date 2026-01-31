// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import type { AuthenticatedRequest } from '../types/index.js';
import { env, constants } from '../config/env.config.js';
import { RateLimitExceededError, IpBlockedError, ValidationError } from '../core/errors/AppError.js';

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (env.CORS_ORIGINS.includes(origin) || env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Correlation-ID',
    'X-Device-ID',
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  maxAge: 86400, // 24 hours
});

// ============================================================================
// HELMET SECURITY HEADERS
// ============================================================================

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// ============================================================================
// RATE LIMITING (In-Memory for now, Redis in production)
// ============================================================================

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetAt: number;
  };
}

const rateLimitStore: RateLimitStore = {};

function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const key in rateLimitStore) {
    if (rateLimitStore[key].resetAt < now) {
      delete rateLimitStore[key];
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

export function rateLimit(options: {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  skipSuccessfulRequests?: boolean;
} = {}) {
  const {
    windowMs = env.RATE_LIMIT_WINDOW_MS,
    maxRequests = env.RATE_LIMIT_MAX_REQUESTS,
    keyGenerator = (req: Request) => req.ip || 'unknown',
    message = 'Too many requests, please try again later',
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `ratelimit:${keyGenerator(req)}`;
    const now = Date.now();

    if (!rateLimitStore[key] || rateLimitStore[key].resetAt < now) {
      rateLimitStore[key] = {
        count: 1,
        resetAt: now + windowMs,
      };
    } else {
      rateLimitStore[key].count++;
    }

    const { count, resetAt } = rateLimitStore[key];
    const remaining = Math.max(0, maxRequests - count);
    const retryAfter = Math.ceil((resetAt - now) / 1000);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', new Date(resetAt).toISOString());

    if (count > maxRequests) {
      res.setHeader('Retry-After', retryAfter.toString());
      return next(new RateLimitExceededError(retryAfter));
    }

    next();
  };
}

// Predefined rate limiters
export const authRateLimit = rateLimit({
  windowMs: constants.AUTH_RATE_LIMIT.windowMs,
  maxRequests: constants.AUTH_RATE_LIMIT.maxRequests,
  keyGenerator: (req) => `auth:${req.ip}`,
  message: 'Too many authentication attempts, please try again later',
});

export const transactionRateLimit = rateLimit({
  windowMs: constants.TRANSACTION_RATE_LIMIT.windowMs,
  maxRequests: constants.TRANSACTION_RATE_LIMIT.maxRequests,
  keyGenerator: (req) => {
    const authReq = req as AuthenticatedRequest;
    return `txn:${authReq.user?.userId || req.ip}`;
  },
  message: 'Too many transaction requests, please slow down',
});

// ============================================================================
// IP BLOCKING
// ============================================================================

const blockedIPs = new Set<string>();
const suspiciousIPs = new Map<string, number>(); // IP -> failure count

export function blockIP(ip: string): void {
  blockedIPs.add(ip);
}

export function unblockIP(ip: string): void {
  blockedIPs.delete(ip);
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}

export function recordSuspiciousActivity(ip: string): void {
  const count = (suspiciousIPs.get(ip) || 0) + 1;
  suspiciousIPs.set(ip, count);

  // Auto-block after 10 suspicious activities
  if (count >= 10) {
    blockIP(ip);
    suspiciousIPs.delete(ip);
  }
}

export function ipBlockingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ip = req.ip || req.socket.remoteAddress || '';

  if (isIPBlocked(ip)) {
    return next(new IpBlockedError(ip));
  }

  next();
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

export function sanitizeInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query params
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query as Record<string, unknown>) as typeof req.query;
  }

  // Sanitize params
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params) as typeof req.params;
  }

  next();
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\x00-\x1f\x7f]/g, '') // Remove control characters
    .trim();
}

// ============================================================================
// REQUEST SIZE LIMITING
// ============================================================================

export function requestSizeLimit(maxSize: number = 10 * 1024 * 1024) { // 10MB default
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    if (contentLength > maxSize) {
      return next(new ValidationError(`Request body too large. Maximum size is ${maxSize / (1024 * 1024)}MB`));
    }

    next();
  };
}

// ============================================================================
// HTTPS REDIRECT (for production)
// ============================================================================

export function httpsRedirect(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}

// ============================================================================
// NO CACHE FOR SENSITIVE ENDPOINTS
// ============================================================================

export function noCache(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  corsMiddleware,
  helmetMiddleware,
  rateLimit,
  authRateLimit,
  transactionRateLimit,
  ipBlockingMiddleware,
  blockIP,
  unblockIP,
  isIPBlocked,
  recordSuspiciousActivity,
  sanitizeInput,
  requestSizeLimit,
  httpsRedirect,
  noCache,
};
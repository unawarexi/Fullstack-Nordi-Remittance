// ============================================================================
// Nordi-Remittance — Rate Limiter Middleware
// Production-grade rate limiting with Redis support
// ============================================================================

import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { RateLimits, HttpStatus, ErrorCodes } from "../config/constants";
import { getRedisService } from "../services/redis.service";

// ============================================================================
// RATE LIMITER FACTORY
// ============================================================================

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: ErrorCodes.RATE_LIMIT_EXCEEDED,
        message: message || "Too many requests, please try again later.",
      },
    },
    skip: (req: Request) => process.env.NODE_ENV === "test",
    handler: (_req: Request, res: Response) => {
      res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        success: false,
        error: {
          code: ErrorCodes.RATE_LIMIT_EXCEEDED,
          message: message || "Too many requests, please try again later.",
        },
      });
    },
  });
}

// ============================================================================
// PRESET RATE LIMITERS
// ============================================================================

/** General API rate limiter */
export const apiLimiter = createRateLimiter({
  ...RateLimits.API,
  message: "Too many API requests, please try again later.",
});

/** Authentication rate limiter (stricter) */
export const authLimiter = createRateLimiter({
  ...RateLimits.AUTH,
  message: "Too many authentication attempts, please try again later.",
});

/** Login rate limiter (very strict) */
export const loginLimiter = createRateLimiter({
  ...RateLimits.LOGIN,
  message: "Too many login attempts. Your account may be temporarily locked.",
});

/** Ride creation rate limiter */
export const rideCreateLimiter = createRateLimiter({
  ...RateLimits.RIDE_CREATE,
  message:
    "Too many ride requests. Please wait before requesting another ride.",
});

/** Ride action rate limiter (accept, cancel, complete) */
export const rideActionLimiter = createRateLimiter({
  ...RateLimits.RIDE_ACTION,
  message: "Too many ride actions. Please slow down.",
});

/** Payment rate limiter */
export const paymentLimiter = createRateLimiter({
  ...RateLimits.PAYMENT,
  message: "Too many payment requests. Please try again shortly.",
});

/** Driver location update rate limiter (high frequency allowed) */
export const driverLocationLimiter = createRateLimiter({
  ...RateLimits.DRIVER_LOCATION,
  message: "Location update rate exceeded.",
});

/** File upload rate limiter */
export const uploadLimiter = createRateLimiter({
  ...RateLimits.UPLOAD,
  message: "Too many file uploads. Please try again later.",
});

// ============================================================================
// REDIS-BACKED RATE LIMITER (Custom)
// ============================================================================

interface RedisRateLimitOptions {
  limit: number;
  windowMs: number;
  keyPrefix: string;
  message?: string;
}

export function redisRateLimiter(options: RedisRateLimitOptions) {
  const { limit, windowMs, keyPrefix, message } = options;

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const redis = getRedisService();
    if (!redis.getIsConnected()) {
      return next(); // Fail open
    }

    try {
      const userId = (req as any).user?.id;
      const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
      const identifier = `${keyPrefix}:${userId || ip}`;

      const result = await redis.checkRateLimit(identifier, limit, windowMs);

      res.set("X-RateLimit-Limit", String(limit));
      res.set("X-RateLimit-Remaining", String(result.remaining));

      if (!result.allowed) {
        res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          success: false,
          error: {
            code: ErrorCodes.RATE_LIMIT_EXCEEDED,
            message: message || "Rate limit exceeded. Please try again later.",
          },
        });
        return;
      }

      next();
    } catch (error) {
      // Fail open on error
      next();
    }
  };
}

export default {
  createRateLimiter,
  apiLimiter,
  authLimiter,
  loginLimiter,
  rideCreateLimiter,
  rideActionLimiter,
  paymentLimiter,
  driverLocationLimiter,
  uploadLimiter,
  redisRateLimiter,
};

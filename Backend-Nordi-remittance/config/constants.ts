/**
 * Nordi-Remittance — Constants re-export shim
 *
 * Canonical sources:
 *   - config/env.config.ts → HttpStatus, constants (ERROR_CODES, rate limits, etc.)
 *   - services/redis.service.ts → CACHE_TTL, CACHE_KEYS
 *   - core/constants/ws-events.ts → WS (socket events)
 *   - types/index.ts → enums (KycStatus, TransactionType, etc.)
 *
 * This file re-exports for backwards compatibility only.
 * New code should import directly from the canonical sources above.
 */

export { HttpStatus, constants } from "./env.config";
export { WS as SocketEvents } from "../core/constants/ws-events";
export { KycStatus, TransactionType, TransactionStatus, UserRole } from "../types/index";

// Re-export the error codes enum expected by rate-limit.middleware.ts
// Maps the simple enum names to the structured constants.ERROR_CODES values
export const ErrorCodes = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "E1004",
  FORBIDDEN: "E1005",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "E2001",
  INTERNAL_ERROR: "E9001",
  SERVICE_UNAVAILABLE: "E9004",
  RATE_LIMIT_EXCEEDED: "E8001",
  KYC_NOT_VERIFIED: "E3005",
  INSUFFICIENT_FUNDS: "E4001",
  LIMIT_EXCEEDED: "E4003",
  USER_NOT_FOUND: "E3001",
  INVALID_INPUT: "E2002",
  TOKEN_INVALID: "E1003",
  TOKEN_EXPIRED: "E1002",
  USER_ALREADY_EXISTS: "E3002",
} as const;

// Rate limit presets consumed by rate-limit.middleware.ts
export const RateLimits = {
  API: { windowMs: 15 * 60 * 1000, max: 100 },
  AUTH: { windowMs: 60 * 60 * 1000, max: 20 },
  LOGIN: { windowMs: 15 * 60 * 1000, max: 5 },
  RIDE_CREATE: { windowMs: 5 * 60 * 1000, max: 3 },
  RIDE_ACTION: { windowMs: 1 * 60 * 1000, max: 10 },
  PAYMENT: { windowMs: 10 * 60 * 1000, max: 5 },
  DRIVER_LOCATION: { windowMs: 1 * 60 * 1000, max: 60 },
  UPLOAD: { windowMs: 30 * 60 * 1000, max: 10 },
} as const;


// ============================================================================
// BULLMQ QUEUES
// ============================================================================

export const BullQueues = {
  EMAIL: "nordi-email",
  NOTIFICATION: "nordi-notification",
  TRANSACTION: "nordi-transaction",
  KYC: "nordi-kyc",
  FRAUD: "nordi-fraud",
  AUDIT: "nordi-audit",
  CLEANUP: "nordi-cleanup",
  DOCUMENT: "nordi-document",
} as const;
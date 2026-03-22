// ============================================================================
// DEPRECATED — All error handling is consolidated in:
//   - core/errors/AppError.ts  (error classes + factory helpers)
//   - middleware/core.middleware.ts (errorHandler + notFoundHandler)
//
// This file re-exports from the canonical locations for backwards compatibility.
// ============================================================================

export {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
  UserAlreadyExistsError,
  InternalServerError,
  RateLimitExceededError,
  isAppError,
  createErrorResponse,
} from "../core/errors/AppError.js";

export {
  errorHandler,
  notFoundHandler,
} from "./core.middleware.js";

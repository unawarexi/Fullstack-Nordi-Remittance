// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

import { constants, HttpStatus } from '../../config/env.config.js';

export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

// ============================================================================
// AUTHENTICATION ERRORS
// ============================================================================

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: Record<string, unknown>) {
    super(message, HttpStatus.UNAUTHORIZED, constants.ERROR_CODES.UNAUTHORIZED, true, details);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Invalid email or password') {
    super(message, HttpStatus.UNAUTHORIZED, constants.ERROR_CODES.INVALID_CREDENTIALS);
  }
}

export class TokenExpiredError extends AppError {
  constructor(message: string = 'Token has expired') {
    super(message, HttpStatus.UNAUTHORIZED, constants.ERROR_CODES.TOKEN_EXPIRED);
  }
}

export class TokenInvalidError extends AppError {
  constructor(message: string = 'Invalid token') {
    super(message, HttpStatus.UNAUTHORIZED, constants.ERROR_CODES.TOKEN_INVALID);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', details?: Record<string, unknown>) {
    super(message, HttpStatus.FORBIDDEN, constants.ERROR_CODES.FORBIDDEN, true, details);
  }
}

export class AccountLockedError extends AppError {
  constructor(message: string = 'Account is locked') {
    super(message, HttpStatus.FORBIDDEN, constants.ERROR_CODES.ACCOUNT_LOCKED);
  }
}

export class AccountSuspendedError extends AppError {
  constructor(message: string = 'Account is suspended') {
    super(message, HttpStatus.FORBIDDEN, constants.ERROR_CODES.ACCOUNT_SUSPENDED);
  }
}

export class EmailNotVerifiedError extends AppError {
  constructor(message: string = 'Email address is not verified') {
    super(message, HttpStatus.FORBIDDEN, constants.ERROR_CODES.EMAIL_NOT_VERIFIED);
  }
}

export class TwoFactorRequiredError extends AppError {
  constructor(message: string = 'Two-factor authentication required', details?: Record<string, unknown>) {
    super(message, HttpStatus.UNAUTHORIZED, constants.ERROR_CODES.TWO_FACTOR_REQUIRED, true, details);
  }
}

export class TwoFactorInvalidError extends AppError {
  constructor(message: string = 'Invalid two-factor code') {
    super(message, HttpStatus.UNAUTHORIZED, constants.ERROR_CODES.TWO_FACTOR_INVALID);
  }
}

export class SessionExpiredError extends AppError {
  constructor(message: string = 'Session has expired') {
    super(message, HttpStatus.UNAUTHORIZED, constants.ERROR_CODES.SESSION_EXPIRED);
  }
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: Record<string, unknown>) {
    super(message, HttpStatus.BAD_REQUEST, constants.ERROR_CODES.VALIDATION_ERROR, true, details);
  }
}

export class InvalidInputError extends AppError {
  constructor(message: string = 'Invalid input', details?: Record<string, unknown>) {
    super(message, HttpStatus.BAD_REQUEST, constants.ERROR_CODES.INVALID_INPUT, true, details);
  }
}

export class MissingRequiredFieldError extends AppError {
  constructor(field: string) {
    super(`Missing required field: ${field}`, HttpStatus.BAD_REQUEST, constants.ERROR_CODES.MISSING_REQUIRED_FIELD, true, { field });
  }
}

// ============================================================================
// RESOURCE ERRORS
// ============================================================================

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND, constants.ERROR_CODES.USER_NOT_FOUND, true, { resource, identifier });
  }
}

export class UserNotFoundError extends AppError {
  constructor(identifier?: string) {
    const message = identifier ? `User '${identifier}' not found` : 'User not found';
    super(message, HttpStatus.NOT_FOUND, constants.ERROR_CODES.USER_NOT_FOUND);
  }
}

export class UserAlreadyExistsError extends AppError {
  constructor(field: string = 'email') {
    super(`User with this ${field} already exists`, HttpStatus.CONFLICT, constants.ERROR_CODES.USER_ALREADY_EXISTS, true, { field });
  }
}

export class WalletNotFoundError extends AppError {
  constructor(identifier?: string) {
    const message = identifier ? `Wallet '${identifier}' not found` : 'Wallet not found';
    super(message, HttpStatus.NOT_FOUND, constants.ERROR_CODES.WALLET_NOT_FOUND);
  }
}

export class TransactionNotFoundError extends AppError {
  constructor(identifier?: string) {
    const message = identifier ? `Transaction '${identifier}' not found` : 'Transaction not found';
    super(message, HttpStatus.NOT_FOUND, constants.ERROR_CODES.TRANSACTION_NOT_FOUND);
  }
}

export class CardNotFoundError extends AppError {
  constructor(identifier?: string) {
    const message = identifier ? `Card '${identifier}' not found` : 'Card not found';
    super(message, HttpStatus.NOT_FOUND, constants.ERROR_CODES.CARD_NOT_FOUND);
  }
}

export class LoanNotFoundError extends AppError {
  constructor(identifier?: string) {
    const message = identifier ? `Loan '${identifier}' not found` : 'Loan not found';
    super(message, HttpStatus.NOT_FOUND, constants.ERROR_CODES.LOAN_NOT_FOUND);
  }
}

// ============================================================================
// TRANSACTION ERRORS
// ============================================================================

export class InsufficientBalanceError extends AppError {
  constructor(required?: number, available?: number) {
    super(
      'Insufficient balance for this transaction',
      HttpStatus.BAD_REQUEST,
      constants.ERROR_CODES.INSUFFICIENT_BALANCE,
      true,
      { required, available }
    );
  }
}

export class TransactionFailedError extends AppError {
  constructor(reason: string, details?: Record<string, unknown>) {
    super(`Transaction failed: ${reason}`, HttpStatus.BAD_REQUEST, constants.ERROR_CODES.TRANSACTION_FAILED, true, details);
  }
}

export class TransactionLimitExceededError extends AppError {
  constructor(limitType: string, limit: number, requested: number) {
    super(
      `Transaction ${limitType} limit exceeded`,
      HttpStatus.BAD_REQUEST,
      constants.ERROR_CODES.TRANSACTION_LIMIT_EXCEEDED,
      true,
      { limitType, limit, requested }
    );
  }
}

export class DuplicateTransactionError extends AppError {
  constructor(referenceNumber: string) {
    super(
      'Duplicate transaction detected',
      HttpStatus.CONFLICT,
      constants.ERROR_CODES.DUPLICATE_TRANSACTION,
      true,
      { referenceNumber }
    );
  }
}

// ============================================================================
// WALLET/ACCOUNT ERRORS
// ============================================================================

export class WalletSuspendedError extends AppError {
  constructor(reason?: string) {
    super(
      reason ? `Wallet is suspended: ${reason}` : 'Wallet is suspended',
      HttpStatus.FORBIDDEN,
      constants.ERROR_CODES.WALLET_SUSPENDED
    );
  }
}

export class WalletFrozenError extends AppError {
  constructor(reason?: string) {
    super(
      reason ? `Wallet is frozen: ${reason}` : 'Wallet is frozen',
      HttpStatus.FORBIDDEN,
      constants.ERROR_CODES.WALLET_FROZEN
    );
  }
}

// ============================================================================
// KYC ERRORS
// ============================================================================

export class KycNotVerifiedError extends AppError {
  constructor(message: string = 'KYC verification is required for this action') {
    super(message, HttpStatus.FORBIDDEN, constants.ERROR_CODES.KYC_NOT_VERIFIED);
  }
}

// ============================================================================
// SECURITY ERRORS
// ============================================================================

export class RateLimitExceededError extends AppError {
  constructor(retryAfter?: number) {
    super(
      'Rate limit exceeded. Please try again later.',
      HttpStatus.TOO_MANY_REQUESTS,
      constants.ERROR_CODES.RATE_LIMIT_EXCEEDED,
      true,
      { retryAfter }
    );
  }
}

export class FraudDetectedError extends AppError {
  constructor(reason: string, details?: Record<string, unknown>) {
    super(
      `Transaction blocked due to potential fraud: ${reason}`,
      HttpStatus.FORBIDDEN,
      constants.ERROR_CODES.FRAUD_DETECTED,
      true,
      details
    );
  }
}

export class SuspiciousActivityError extends AppError {
  constructor(activity: string) {
    super(
      `Suspicious activity detected: ${activity}`,
      HttpStatus.FORBIDDEN,
      constants.ERROR_CODES.SUSPICIOUS_ACTIVITY
    );
  }
}

export class IpBlockedError extends AppError {
  constructor(ip: string) {
    super(
      'Access denied from your IP address',
      HttpStatus.FORBIDDEN,
      constants.ERROR_CODES.IP_BLOCKED,
      true,
      { ip }
    );
  }
}

// ============================================================================
// SERVER ERRORS
// ============================================================================

export class InternalServerError extends AppError {
  constructor(message: string = 'An unexpected error occurred', details?: Record<string, unknown>) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_CODES.INTERNAL_ERROR, false, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, constants.ERROR_CODES.DATABASE_ERROR, false);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service error: ${service}`,
      HttpStatus.BAD_GATEWAY,
      constants.ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      true,
      { service }
    );
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, constants.ERROR_CODES.SERVICE_UNAVAILABLE);
  }
}

// ============================================================================
// ERROR HANDLER UTILITY
// ============================================================================

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function createErrorResponse(error: unknown) {
  if (isAppError(error)) {
    return error.toJSON();
  }

  // Handle mongoose validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    return {
      success: false,
      error: {
        code: constants.ERROR_CODES.VALIDATION_ERROR,
        message: error.message,
        details: (error as any).errors,
      },
    };
  }

  // Handle mongoose duplicate key errors
  if (error instanceof Error && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyValue || {})[0] || 'field';
    return {
      success: false,
      error: {
        code: constants.ERROR_CODES.USER_ALREADY_EXISTS,
        message: `Duplicate value for ${field}`,
        details: { field },
      },
    };
  }

  // Generic error
  return {
    success: false,
    error: {
      code: constants.ERROR_CODES.INTERNAL_ERROR,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    },
  };
}

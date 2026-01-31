// ============================================================================
// APP ERROR TESTS
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TokenExpiredError,
  TokenInvalidError,
  AccountLockedError,
  AccountSuspendedError,
  InsufficientBalanceError,
  TransactionFailedError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  MissingRequiredFieldError,
  RateLimitExceededError,
  isAppError,
  createErrorResponse,
} from '../../core/errors/AppError.js';

describe('App Errors', () => {
  describe('ValidationError', () => {
    it('should create validation error with message', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should create validation error with details', () => {
      const error = new ValidationError('Validation failed', {
        errors: ['Field is required', 'Invalid format'],
      });

      expect(error.details?.errors).toHaveLength(2);
    });

    it('should be instance of AppError', () => {
      const error = new ValidationError('Test');
      expect(error instanceof ValidationError).toBe(true);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error', () => {
      const error = new UnauthorizedError('Not logged in');

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Not logged in');
    });

    it('should have default message', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Unauthorized access');
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
    });

    it('should have default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Access forbidden');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with resource', () => {
      const error = new NotFoundError('User');

      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('User');
    });

    it('should create not found error with identifier', () => {
      const error = new NotFoundError('User', '123');

      expect(error.message).toContain('123');
    });
  });

  describe('TokenExpiredError', () => {
    it('should create token expired error', () => {
      const error = new TokenExpiredError();

      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('expired');
    });

    it('should accept custom message', () => {
      const error = new TokenExpiredError('Session has expired');

      expect(error.message).toBe('Session has expired');
    });
  });

  describe('TokenInvalidError', () => {
    it('should create invalid token error', () => {
      const error = new TokenInvalidError();

      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Invalid');
    });
  });

  describe('AccountLockedError', () => {
    it('should create account locked error', () => {
      const error = new AccountLockedError();

      expect(error.statusCode).toBe(403);
      expect(error.message).toContain('locked');
    });

    it('should accept custom message', () => {
      const error = new AccountLockedError('Account locked due to suspicious activity');

      expect(error.message).toBe('Account locked due to suspicious activity');
    });
  });

  describe('AccountSuspendedError', () => {
    it('should create account suspended error', () => {
      const error = new AccountSuspendedError();

      expect(error.statusCode).toBe(403);
      expect(error.message).toContain('suspended');
    });
  });

  describe('InsufficientBalanceError', () => {
    it('should create insufficient balance error', () => {
      const error = new InsufficientBalanceError(1000, 500);

      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('balance');
    });
  });

  describe('TransactionFailedError', () => {
    it('should create transaction failed error', () => {
      const error = new TransactionFailedError('Payment declined');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Transaction failed: Payment declined');
    });
  });

  describe('UserAlreadyExistsError', () => {
    it('should create user already exists error', () => {
      const error = new UserAlreadyExistsError('email');

      expect(error.statusCode).toBe(409);
      expect(error.message).toContain('email');
    });
  });

  describe('InvalidCredentialsError', () => {
    it('should create invalid credentials error', () => {
      const error = new InvalidCredentialsError();

      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Invalid');
    });
  });

  describe('MissingRequiredFieldError', () => {
    it('should create missing field error', () => {
      const error = new MissingRequiredFieldError('email');

      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('email');
    });
  });

  describe('RateLimitExceededError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitExceededError();

      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Rate limit exceeded. Please try again later.');
    });

    it('should accept retryAfter parameter', () => {
      const error = new RateLimitExceededError(60);

      expect(error.statusCode).toBe(429);
      expect(error.details?.retryAfter).toBe(60);
    });
  });

  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new ValidationError('Test');
      expect(isAppError(error)).toBe(true);
    });

    it('should return false for generic errors', () => {
      const error = new Error('Test');
      expect(isAppError(error)).toBe(false);
    });

    it('should return false for non-error objects', () => {
      expect(isAppError({})).toBe(false);
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response from AppError', () => {
      const error = new ValidationError('Invalid input');
      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error.message).toBe('Invalid input');
    });

    it('should create error response from generic error', () => {
      const error = new Error('Something went wrong');
      const response = createErrorResponse(error);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      const json = error.toJSON();

      expect(json.success).toBe(false);
      expect(json.error.message).toBe('Invalid input');
      expect(json.error.details).toBeDefined();
    });
  });

  describe('Error codes', () => {
    it('should have unique error codes', () => {
      const validationError = new ValidationError('Test');
      const unauthorizedError = new UnauthorizedError();
      const forbiddenError = new ForbiddenError();

      expect(validationError.code).not.toBe(unauthorizedError.code);
      expect(unauthorizedError.code).not.toBe(forbiddenError.code);
    });
  });

  describe('Stack trace', () => {
    it('should capture stack trace', () => {
      const error = new ValidationError('Test');

      expect(error.stack).toBeDefined();
      // Stack trace should include the test file location
      expect(error.stack).toContain('app-error.test.ts');
    });
  });
});

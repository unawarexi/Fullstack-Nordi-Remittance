// ============================================================================
// AUTH MIDDLEWARE TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  createTestUser,
  generateTestToken,
  generateExpiredToken,
} from '../helpers/test-utils.js';
import {
  authenticate,
  optionalAuth,
  requireRoles,
  requireAdmin,
} from '../../middleware/Auth.middleware.js';

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    it('should authenticate with valid Bearer token', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id.toString(), user.email as string);

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(user._id.toString());
    });

    it('should authenticate with valid cookie token', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id.toString(), user.email as string);

      const req = createMockRequest({
        cookies: {
          access_token: token,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should fail without token', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should fail with expired token', async () => {
      const user = await createTestUser();
      const token = generateExpiredToken(user._id.toString(), user.email as string);

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should fail with invalid token', async () => {
      const req = createMockRequest({
        headers: {
          authorization: 'Bearer invalid-token-here',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should fail with malformed Authorization header', async () => {
      const req = createMockRequest({
        headers: {
          authorization: 'InvalidFormat token-here',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should prefer Authorization header over cookie', async () => {
      const user = await createTestUser();
      const validToken = generateTestToken(user._id.toString(), user.email as string);

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        cookies: {
          accessToken: 'invalid-cookie-token',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });
  });

  describe('optionalAuth', () => {
    it('should attach user if valid token provided', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user._id.toString(), user.email as string);

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should continue without user if no token', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should continue without user if invalid token', async () => {
      const req = createMockRequest({
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe('requireRoles', () => {
    it('should allow user with required role', async () => {
      const req = createMockRequest({
        user: {
          userId: 'user-123',
          email: 'admin@test.com',
          role: 'admin',
          sessionId: 'session-123',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRoles('admin', 'super_admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny user without required role', () => {
      const req = createMockRequest({
        user: {
          userId: 'user-123',
          email: 'user@test.com',
          role: 'user',
          sessionId: 'session-123',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRoles('admin', 'super_admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should deny unauthenticated request', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRoles('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should allow multiple roles', () => {
      const req = createMockRequest({
        user: {
          userId: 'user-123',
          email: 'support@test.com',
          role: 'support_agent',
          sessionId: 'session-123',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const middleware = requireRoles('admin', 'super_admin', 'support_agent');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin users', () => {
      const req = createMockRequest({
        user: {
          userId: 'admin-123',
          email: 'admin@test.com',
          role: 'admin',
          sessionId: 'session-123',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should allow super_admin users', () => {
      const req = createMockRequest({
        user: {
          userId: 'super-123',
          email: 'super@test.com',
          role: 'super_admin',
          sessionId: 'session-123',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should deny regular users', () => {
      const req = createMockRequest({
        user: {
          userId: 'user-123',
          email: 'user@test.com',
          role: 'user',
          sessionId: 'session-123',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should deny unauthenticated requests', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeDefined();
    });
  });
});

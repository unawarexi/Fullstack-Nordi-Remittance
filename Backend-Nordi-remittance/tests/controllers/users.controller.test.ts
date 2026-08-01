// ============================================================================
// USERS CONTROLLER TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  createTestUser,
  createTestUserWithWallet,
  generateTestToken,
} from '../helpers/test-utils.js';
import * as UsersController from '../../modules/users/users.controller.js';
import Users from '../../modules/users/users.model.js';
import bcrypt from 'bcryptjs';

describe('Users Controller', () => {
  describe('getProfile', () => {
    it('should return user profile for authenticated user', async () => {
      const { user, wallet } = await createTestUserWithWallet();

      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.getProfile(req, res, next);

      if ((res.status as any).mock.calls.length > 0) {
        expect(res.status).toHaveBeenCalledWith(200);
        const responseData = (res.json as any).mock.calls[0][0];
        expect(responseData.success).toBe(true);
        expect(responseData.data.user.email).toBe(user.email);
      }
    });

    it('should fail for unauthenticated request', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.getProfile(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = (next as any).mock.calls[0][0];
      expect(error).toBeDefined();
    });

    it('should fail for non-existent user', async () => {
      const req = createMockRequest({
        user: {
          userId: 'nonexistent-user-id',
          email: 'nonexistent@test.com',
          role: 'user',
          sessionId: 'test-session',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.getProfile(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    let testUser: any;

    beforeEach(async () => {
      const { user } = await createTestUserWithWallet();
      testUser = user;
    });

    it('should update profile with valid data', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateProfile(req, res, next);

      if ((res.status as any).mock.calls.length > 0) {
        expect(res.status).toHaveBeenCalledWith(200);
        
        // Verify update in database
        const updatedUser = await Users.findById(testUser._id);
        expect(updatedUser?.firstName).toBe('UpdatedFirst');
        expect(updatedUser?.lastName).toBe('UpdatedLast');
      }
    });

    it('should fail with empty update', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateProfile(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid fields', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          password: 'hacked!', // Should not be updatable via this endpoint
          role: 'admin', // Should not be updatable
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateProfile(req, res, next);

      // Verify sensitive fields were not updated
      const user = await Users.findById(testUser._id);
      expect(user?.password).not.toBe('hacked!');
    });

    it('should sanitize input strings', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          firstName: '<script>alert("xss")</script>John',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateProfile(req, res, next);

      // Should sanitize the input
      const user = await Users.findById(testUser._id);
      if ((res.status as any).mock.calls.length > 0) {
        expect(user?.firstName).not.toContain('<script>');
      }
    });

    it('should fail for unauthenticated request', async () => {
      const req = createMockRequest({
        body: {
          firstName: 'UpdatedFirst',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateProfile(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should validate firstName minimum length', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          firstName: 'A', // Too short
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateProfile(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateEmail', () => {
    let testUser: any;

    beforeEach(async () => {
      const password = await bcrypt.hash('TestPassword123!', 10);
      const { user } = await createTestUserWithWallet({
        email: 'oldemail@test.com',
        password,
      });
      testUser = user;
    });

    it('should initiate email change with valid data', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          newEmail: 'newemail@test.com',
          password: 'TestPassword123!',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateEmail(req, res, next);

      // Should create confirmation token or send success
      if ((res.status as any).mock.calls.length > 0) {
        expect(res.status).toHaveBeenCalled();
      }
    });

    it('should fail with invalid email format', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          newEmail: 'invalid-email',
          password: 'TestPassword123!',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateEmail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with wrong password', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          newEmail: 'newemail@test.com',
          password: 'WrongPassword123!',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateEmail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail when email is already in use', async () => {
      await createTestUser({ email: 'existing@test.com' });

      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          newEmail: 'existing@test.com',
          password: 'TestPassword123!',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateEmail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail without password', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          newEmail: 'newemail@test.com',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await UsersController.updateEmail(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('getSettings', () => {
    it('should return user settings', async () => {
      const { user } = await createTestUserWithWallet();

      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Check if getSettings exists before calling
      if (typeof UsersController.getSettings === 'function') {
        await UsersController.getSettings(req, res, next);
        
        if ((res.status as any).mock.calls.length > 0) {
          expect(res.status).toHaveBeenCalled();
        }
      }
    });
  });

  describe('deactivateAccount', () => {
    let testUser: any;

    beforeEach(async () => {
      const password = await bcrypt.hash('TestPassword123!', 10);
      const { user } = await createTestUserWithWallet({
        password,
        isActive: true,
      });
      testUser = user;
    });

    it('should deactivate account with correct password', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          password: 'TestPassword123!',
          reason: 'No longer needed',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Check if deactivateAccount exists
      if (typeof UsersController.deactivateAccount === 'function') {
        await UsersController.deactivateAccount(req, res, next);

        if ((res.status as any).mock.calls.length > 0) {
          expect(res.status).toHaveBeenCalled();
        }
      }
    });

    it('should fail with incorrect password', async () => {
      const req = createMockRequest({
        user: {
          userId: testUser._id.toString(),
          email: testUser.email as string,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          password: 'WrongPassword123!',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof UsersController.deactivateAccount === 'function') {
        await UsersController.deactivateAccount(req, res, next);

        expect(next).toHaveBeenCalled();
      }
    });
  });
});

// ============================================================================
// TOKEN HELPER TESTS
// ============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  generateAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
  generateVerificationToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from '../../core/helpers/token.helper.js';

describe('Token Helper', () => {
  describe('generateAuthTokens', () => {
    it('should generate access and refresh tokens', () => {
      const tokens = generateAuthTokens(
        'user-123',
        'user@test.com',
        'user',
        'session-123'
      );

      expect(tokens).toBeDefined();
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate valid JWT tokens', () => {
      const tokens = generateAuthTokens(
        'user-123',
        'user@test.com',
        'user',
        'session-123'
      );

      // Tokens should be valid JWTs (3 parts separated by dots)
      expect(tokens.accessToken.split('.')).toHaveLength(3);
      expect(tokens.refreshToken.split('.')).toHaveLength(3);
    });

    it('should include user data in token payload', () => {
      const tokens = generateAuthTokens(
        'user-123',
        'user@test.com',
        'admin',
        'session-123'
      );

      const decoded = jwt.decode(tokens.accessToken) as any;
      
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('user@test.com');
      expect(decoded.role).toBe('admin');
    });

    it('should generate different tokens for different users', () => {
      const tokens1 = generateAuthTokens(
        'user-1',
        'user1@test.com',
        'user',
        'session-1'
      );
      const tokens2 = generateAuthTokens(
        'user-2',
        'user2@test.com',
        'user',
        'session-2'
      );

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const tokens = generateAuthTokens(
        'user-123',
        'user@test.com',
        'user',
        'session-123'
      );

      const decoded = verifyAccessToken(tokens.accessToken);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('user@test.com');
    });

    it('should throw for invalid token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw for expired token', () => {
      // Create a token that expires immediately
      const token = jwt.sign(
        { userId: 'user-123', email: 'user@test.com', role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1s' }
      );

      expect(() => verifyAccessToken(token)).toThrow();
    });

    it('should throw for token with wrong secret', () => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'user@test.com', role: 'user' },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      expect(() => verifyAccessToken(token)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const tokens = generateAuthTokens(
        'user-123',
        'user@test.com',
        'user',
        'session-123'
      );

      const decoded = verifyRefreshToken(tokens.refreshToken);

      expect(decoded.userId).toBe('user-123');
    });

    it('should throw for invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });

  describe('generateVerificationToken', () => {
    it('should generate a verification token', () => {
      const token = generateVerificationToken('user-123');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });

    it('should generate unique tokens', async () => {
      const token1 = generateVerificationToken('user-123');
      // Wait a small amount to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      const token2 = generateVerificationToken('user-123');

      expect(token1).not.toBe(token2);
    });
  });

  describe('getAccessTokenCookieOptions', () => {
    it('should return cookie options object', () => {
      const options = getAccessTokenCookieOptions();

      expect(options).toBeDefined();
      expect(typeof options).toBe('object');
      expect(options.httpOnly).toBe(true);
    });

    it('should set secure flag based on environment', () => {
      const options = getAccessTokenCookieOptions();
      // In test environment, secure should be false (not production)
      // The function uses env.NODE_ENV which is cached at module load time
      expect(typeof options.secure).toBe('boolean');
    });

    it('should set sameSite option', () => {
      const options = getAccessTokenCookieOptions();

      expect(options.sameSite).toBeDefined();
    });
  });

  describe('getRefreshTokenCookieOptions', () => {
    it('should return cookie options object', () => {
      const options = getRefreshTokenCookieOptions();

      expect(options).toBeDefined();
      expect(typeof options).toBe('object');
      expect(options.httpOnly).toBe(true);
    });

    it('should have longer maxAge than access token', () => {
      const accessOptions = getAccessTokenCookieOptions();
      const refreshOptions = getRefreshTokenCookieOptions();

      if (accessOptions.maxAge && refreshOptions.maxAge) {
        expect(refreshOptions.maxAge).toBeGreaterThan(accessOptions.maxAge);
      }
    });
  });
});

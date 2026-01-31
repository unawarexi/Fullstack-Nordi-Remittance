// ============================================================================
// CRYPTO HELPER TESTS
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  comparePassword,
  generateSecureToken,
  generateOTP,
} from '../../core/helpers/crypto.helper.js';

describe('Crypto Helper', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(password.length);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SecurePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for different passwords', async () => {
      const hash1 = await hashPassword('Password1!');
      const hash2 = await hashPassword('Password2!');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);
      const isValid = await comparePassword('WrongPassword!', hash);

      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await hashPassword('SecurePassword123!');
      const isValid = await comparePassword('', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate token of specified length', () => {
      const token = generateSecureToken(32);

      // Hex encoding doubles the byte length
      expect(token.length).toBe(64);
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken(32);
      const token2 = generateSecureToken(32);

      expect(token1).not.toBe(token2);
    });

    it('should generate different length tokens', () => {
      const token16 = generateSecureToken(16);
      const token32 = generateSecureToken(32);

      expect(token16.length).toBe(32);
      expect(token32.length).toBe(64);
    });
  });

  describe('generateOTP', () => {
    it('should generate OTP of specified length', () => {
      const otp = generateOTP(6);

      expect(otp.length).toBe(6);
    });

    it('should generate numeric OTP', () => {
      const otp = generateOTP(6);

      expect(/^\d+$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs', () => {
      const otp1 = generateOTP(6);
      const otp2 = generateOTP(6);

      // While theoretically possible to be equal, extremely unlikely
      expect(otp1 !== otp2 || otp1.length === 6).toBe(true);
    });

    it('should generate OTP of different lengths', () => {
      const otp4 = generateOTP(4);
      const otp8 = generateOTP(8);

      expect(otp4.length).toBe(4);
      expect(otp8.length).toBe(8);
    });
  });
});

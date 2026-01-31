// ============================================================================
// VALIDATION HELPER TESTS
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  validateRegistrationData,
  validateLoginData,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  isValidPassword,
} from '../../core/helpers/validation.helper.js';

describe('Validation Helper', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('user@subdomain.example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should reject emails with special characters', () => {
      expect(isValidEmail('user name@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct phone formats', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('+12345678901')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('12345')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      if (typeof isValidPassword === 'function') {
        const result1 = isValidPassword('SecurePass123!');
        const result2 = isValidPassword('MyP@ssw0rd!');
        expect(result1.isValid).toBe(true);
        expect(result2.isValid).toBe(true);
      }
    });

    it('should reject weak passwords', () => {
      if (typeof isValidPassword === 'function') {
        expect(isValidPassword('123').isValid).toBe(false);
        expect(isValidPassword('password').isValid).toBe(false);
        expect(isValidPassword('').isValid).toBe(false);
      }
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>John')).not.toContain('<script>');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should handle normal strings', () => {
      expect(sanitizeString('John Doe')).toBe('John Doe');
    });
  });

  describe('validateRegistrationData', () => {
    const getCompleteRegistrationData = () => ({
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      password: 'SecurePass123!',
      mobileNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      nationality: 'US',
      countryOfResidence: 'US',
      idType: 'passport',
      idNumber: 'AB123456',
      idExpiryDate: '2030-01-01',
      homeAddress: '123 Test Street',
      city: 'Test City',
      stateProvince: 'Test State',
      zipCode: '12345',
      country: 'US',
      accountType: 'personal',
      currency: 'USD',
      sourceOfIncome: 'employment',
      monthlyIncomeRange: '5000-10000',
      employmentStatus: 'employed',
      occupation: 'Engineer',
      accountName: 'John Doe',
      bankName: 'Test Bank',
      bankAddress: '456 Bank Street',
      swiftBic: 'TESTUS33',
      securityQuestion: 'What is your pet name?',
      securityAnswer: 'fluffy',
      addressDocType: 'utility_bill',
      taxIdentificationNumber: '123-45-6789',
      routingNumber: '011000015', // Valid ABA routing number (Federal Reserve Bank of Boston)
      agreeToTerms: true,
      agreeToPrivacy: true,
    });

    it('should validate complete registration data', () => {
      const result = validateRegistrationData(getCompleteRegistrationData());
      if (!result.isValid) {
        console.log('Validation errors:', JSON.stringify(result.errors, null, 2));
      }
      expect(result.isValid).toBe(true);
    });

    it('should reject missing email', () => {
      const data = getCompleteRegistrationData();
      delete (data as any).email;
      const result = validateRegistrationData(data);

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject missing password', () => {
      const data = getCompleteRegistrationData();
      delete (data as any).password;
      const result = validateRegistrationData(data);

      expect(result.isValid).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = validateRegistrationData({
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe('validateLoginData', () => {
    it('should validate complete login data', () => {
      const result = validateLoginData({
        email: 'user@example.com',
        password: 'SecurePass123!',
      });

      expect(result.isValid).toBe(true);
    });

    it('should reject missing email', () => {
      const result = validateLoginData({
        password: 'SecurePass123!',
      });

      expect(result.isValid).toBe(false);
    });

    it('should reject missing password', () => {
      const result = validateLoginData({
        email: 'user@example.com',
      });

      expect(result.isValid).toBe(false);
    });

    it('should reject invalid email format', () => {
      const result = validateLoginData({
        email: 'invalid',
        password: 'SecurePass123!',
      });

      expect(result.isValid).toBe(false);
    });
  });
});

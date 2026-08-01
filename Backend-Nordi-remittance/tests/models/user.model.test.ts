// ============================================================================
// USER MODEL TESTS
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import Users from '../../modules/users/users.model.js';
import { generateMockUser } from '../helpers/test-utils.js';

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid user with all required fields', async () => {
      const userData = generateMockUser();
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.email).toBe(userData.email);
    });

    it('should fail without required firstName', async () => {
      const userData = generateMockUser();
      delete (userData as any).firstName;
      const user = new Users(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail without required lastName', async () => {
      const userData = generateMockUser();
      delete (userData as any).lastName;
      const user = new Users(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail without required email', async () => {
      const userData = generateMockUser();
      delete (userData as any).email;
      const user = new Users(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail without required password', async () => {
      const userData = generateMockUser();
      delete (userData as any).password;
      const user = new Users(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const email = 'unique@test.com';
      const user1 = new Users(generateMockUser({ email }));
      await user1.save();

      const user2 = new Users(generateMockUser({ email }));
      await expect(user2.save()).rejects.toThrow();
    });

    it('should require either ibanNumber or routingNumber', async () => {
      const userData = generateMockUser();
      delete (userData as any).ibanNumber;
      delete (userData as any).routingNumber;
      const user = new Users(userData);

      await expect(user.save()).rejects.toThrow();
    });

    it('should accept user with only ibanNumber', async () => {
      const userData = generateMockUser();
      delete (userData as any).routingNumber;
      userData.ibanNumber = 'GB82WEST12345698765432';
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser.ibanNumber).toBe('GB82WEST12345698765432');
    });

    it('should accept user with only routingNumber', async () => {
      const userData = generateMockUser();
      delete (userData as any).ibanNumber;
      userData.routingNumber = '123456789';
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser.routingNumber).toBe('123456789');
    });
  });

  describe('Default Values', () => {
    it('should set isActive to false by default', async () => {
      const userData = generateMockUser();
      delete (userData as any).isActive;
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser.isActive).toBe(false);
    });

    it('should set kycStatus to pending by default', async () => {
      const userData = generateMockUser();
      delete (userData as any).kycStatus;
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser.kycStatus).toBe('pending');
    });

    it('should set enableTwoFactor to false by default', async () => {
      const userData = generateMockUser();
      userData.enableTwoFactor = false;
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser.twoFactorEnabled).toBe(false);
    });

    it('should set accountStatus to active by default', async () => {
      const userData = generateMockUser();
      delete (userData as any).accountStatus;
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser.accountStatus).toBe('active');
    });
  });

  describe('UUID Generation', () => {
    it('should generate UUID as _id if not provided', async () => {
      const userData = generateMockUser();
      delete (userData as any)._id;
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(typeof savedUser._id).toBe('string');
    });
  });

  describe('Active Sessions', () => {
    it('should store active sessions', async () => {
      const userData = generateMockUser();
      userData.activeSessions = [{
        sessionId: 'session-123',
        deviceId: 'device-456',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'MacOS',
        ipAddress: '192.168.1.1',
        createdAt: new Date(),
        lastActiveAt: new Date(),
      }];
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser.activeSessions).toHaveLength(1);
      expect(savedUser.activeSessions[0].sessionId).toBe('session-123');
    });
  });

  describe('Trusted Devices', () => {
    it('should store trusted devices', async () => {
      const userData = generateMockUser();
      userData.trustedDevices = [{
        deviceId: 'trusted-device-123',
        deviceName: 'My MacBook',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'MacOS',
        trustedAt: new Date(),
        lastUsedAt: new Date(),
      }];
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser.trustedDevices).toHaveLength(1);
      expect(savedUser.trustedDevices[0].deviceName).toBe('My MacBook');
    });
  });

  describe('Query Methods', () => {
    it('should find user by email', async () => {
      const userData = generateMockUser({ email: 'findme@test.com' });
      await new Users(userData).save();

      const foundUser = await Users.findOne({ email: 'findme@test.com' });
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('findme@test.com');
    });

    it('should find user by accountNumber', async () => {
      const userData = generateMockUser({ accountNumber: 'ACC123456' });
      await new Users(userData).save();

      const foundUser = await Users.findOne({ accountNumber: 'ACC123456' });
      expect(foundUser).toBeDefined();
      expect(foundUser?.accountNumber).toBe('ACC123456');
    });

    it('should update user fields', async () => {
      const userData = generateMockUser();
      const user = await new Users(userData).save();

      await Users.findByIdAndUpdate(user._id, { firstName: 'UpdatedName' });
      
      const updatedUser = await Users.findById(user._id);
      expect(updatedUser?.firstName).toBe('UpdatedName');
    });
  });

  describe('Account Status', () => {
    it('should accept valid account status values', async () => {
      const statuses = ['active', 'suspended', 'banned', 'restricted'];
      
      for (const status of statuses) {
        const userData = generateMockUser({ 
          email: `status-${status}@test.com`,
          accountStatus: status 
        });
        const user = new Users(userData);
        const savedUser = await user.save();
        expect(savedUser.accountStatus).toBe(status);
      }
    });
  });

  describe('Login Attempts', () => {
    it('should track login attempts', async () => {
      const userData = generateMockUser();
      userData.loginAttempts = [{
        timestamp: new Date(),
        successful: true,
        ipAddress: '192.168.1.1',
        userAgent: 'Chrome/91',
      }];
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser.loginAttempts).toHaveLength(1);
      expect(savedUser.loginAttempts[0].successful).toBe(true);
    });
  });

  describe('Security Settings', () => {
    it('should store security settings', async () => {
      const userData = generateMockUser();
      userData.securitySettings = {
        loginNotifications: true,
        transactionNotifications: true,
        marketingEmails: false,
      };
      const user = new Users(userData);
      const savedUser = await user.save();

      expect(savedUser.securitySettings?.loginNotifications).toBe(true);
      expect(savedUser.securitySettings?.marketingEmails).toBe(false);
    });
  });
});

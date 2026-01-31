// ============================================================================
// TEST UTILITIES AND HELPERS
// ============================================================================

import { vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Users from '../../models/UserModel.js';
import { Wallets } from '../../models/AccountsModel.js';
import type { AuthenticatedRequest, UserRole } from '../../types/index.js';
import { env } from '../../config/env.config.js';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

export const generateMockUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId().toString(),
  firstName: 'John',
  middleName: 'Test',
  lastName: 'Doe',
  email: `user${Date.now()}@test.com`,
  mobileNumber: '+1234567890',
  dateOfBirth: new Date('1990-01-01'),
  gender: 'male',
  nationality: 'US',
  countryOfResidence: 'US',
  idType: 'passport',
  idNumber: 'AB123456',
  idExpiryDate: new Date('2030-01-01'),
  addressDocType: 'utility_bill',
  taxIdentificationNumber: '123-45-6789',
  homeAddress: '123 Test Street',
  city: 'Test City',
  stateProvince: 'Test State',
  zipCode: '12345',
  country: 'US',
  accountType: 'personal',
  currency: 'USD',
  sourceOfIncome: 'employment',
  monthlyIncomeRange: '5000-10000',
  initialDeposit: 1000,
  employmentStatus: 'employed',
  occupation: 'Engineer',
  accountName: 'John Doe',
  accountNumber: `ACC${Date.now()}`,
  bankName: 'Test Bank',
  bankAddress: '456 Bank Street',
  routingNumber: '123456789',
  swiftBic: 'TESTUS33',
  password: bcrypt.hashSync('Password123!', 10),
  securityQuestion: 'What is your pet name?',
  securityAnswer: bcrypt.hashSync('fluffy', 10),
  enableTwoFactor: false,
  agreeToTerms: true,
  agreeToPrivacy: true,
  isActive: true,
  kycStatus: 'approved',
  accountStatus: 'active',
  createdAt: new Date(),
  ...overrides,
});

export const generateMockWallet = (userId: string, overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  user: userId,
  walletNumber: `W${Date.now()}${Math.random().toString(36).substring(7)}`,
  balances: new Map([['USD', 1000]]),
  status: 'active',
  walletType: 'personal',
  isPrimary: true,
  createdAt: new Date(),
  ...overrides,
});

export const generateMockTransaction = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  referenceNumber: `TXN${Date.now()}`,
  type: 'transfer',
  category: 'bankAccounts',
  amount: 100,
  currency: 'USD',
  fee: 0.5,
  status: 'completed',
  description: 'Test transaction',
  createdAt: new Date(),
  ...overrides,
});

export const generateMockCard = (userId: string, overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  userId,
  cardNumber: '4111111111111111',
  cardholderName: 'John Doe',
  expiryDate: '12/28',
  cvv: '123',
  cardType: 'debit',
  cardNetwork: 'visa',
  status: 'active',
  createdAt: new Date(),
  ...overrides,
});

export const generateMockLoan = (userId: string, overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  userId,
  loanType: 'personal',
  amount: 5000,
  interestRate: 5.5,
  term: 12,
  status: 'active',
  createdAt: new Date(),
  ...overrides,
});

// ============================================================================
// DATABASE HELPERS
// ============================================================================

export const createTestUser = async (overrides = {}) => {
  const userData = generateMockUser(overrides);
  const user = new Users(userData);
  await user.save();
  return user;
};

export const createTestWallet = async (userId: string, overrides = {}) => {
  const walletData = generateMockWallet(userId, overrides);
  const wallet = new Wallets(walletData);
  await wallet.save();
  return wallet;
};

export const createTestUserWithWallet = async (userOverrides = {}, walletOverrides = {}) => {
  const user = await createTestUser(userOverrides);
  const wallet = await createTestWallet(user._id.toString(), walletOverrides);
  return { user, wallet };
};

// ============================================================================
// MOCK REQUEST/RESPONSE FACTORIES
// ============================================================================

export const createMockRequest = (overrides: Partial<AuthenticatedRequest> = {}): AuthenticatedRequest => {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    user: undefined,
    requestId: 'test-request-id',
    clientIp: '127.0.0.1',
    startTime: Date.now(),
    deviceInfo: {
      deviceType: 'desktop',
      os: 'MacOS',
      browser: 'Chrome',
      userAgent: 'test-user-agent',
    },
    ...overrides,
  } as AuthenticatedRequest;
  
  return req;
};

export const createMockResponse = (): Response => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    once: vi.fn().mockReturnThis(),
    emit: vi.fn().mockReturnThis(),
    removeListener: vi.fn().mockReturnThis(),
    locals: {},
  } as unknown as Response;
  
  return res;
};

export const createMockNext = (): NextFunction => vi.fn();

// ============================================================================
// TOKEN HELPERS
// ============================================================================

export const generateTestToken = (
  userId: string,
  email: string,
  role: UserRole = 'user' as UserRole,
  sessionId: string = 'test-session'
): string => {
  return jwt.sign(
    { userId, email, role, sessionId },
    env.JWT_SECRET,
    { expiresIn: '1h', issuer: env.JWT_ISSUER, algorithm: 'HS256' }
  );
};

export const generateExpiredToken = (
  userId: string,
  email: string,
  role: UserRole = 'user' as UserRole
): string => {
  return jwt.sign(
    { userId, email, role, sessionId: 'test-session' },
    env.JWT_SECRET,
    { expiresIn: '-1h', issuer: env.JWT_ISSUER, algorithm: 'HS256' }
  );
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const expectSuccessResponse = (res: Response, statusCode: number = 200) => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  expect(res.json).toHaveBeenCalled();
  const jsonCall = (res.json as any).mock.calls[0][0];
  expect(jsonCall.success).toBe(true);
  return jsonCall;
};

export const expectErrorResponse = (res: Response, statusCode: number, errorCode?: string) => {
  expect(res.status).toHaveBeenCalledWith(statusCode);
  expect(res.json).toHaveBeenCalled();
  const jsonCall = (res.json as any).mock.calls[0][0];
  expect(jsonCall.success).toBe(false);
  if (errorCode) {
    expect(jsonCall.error?.code).toBe(errorCode);
  }
  return jsonCall;
};

// ============================================================================
// ASYNC HELPERS
// ============================================================================

export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const flushPromises = (): Promise<void> => {
  return new Promise(resolve => setImmediate(resolve));
};

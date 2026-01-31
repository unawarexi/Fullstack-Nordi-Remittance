// ============================================================================
// ACCOUNTS MODEL TESTS
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Wallets, AccountBalances, LedgerEntries, AccountLimits, AccountStatusHistories } from '../../models/AccountsModel.js';
import Users from '../../models/UserModel.js';
import { createTestUser, generateMockWallet } from '../helpers/test-utils.js';

describe('Accounts Models', () => {
  let testUser: any;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  describe('Wallet Model', () => {
    it('should create a wallet with valid data', async () => {
      const walletData = generateMockWallet(testUser._id.toString());
      const wallet = new Wallets(walletData);
      const savedWallet = await wallet.save();

      expect(savedWallet._id).toBeDefined();
      expect(savedWallet.user).toBe(testUser._id.toString());
      expect(savedWallet.status).toBe('active');
    });

    it('should require user field', async () => {
      const walletData = generateMockWallet(testUser._id.toString());
      delete (walletData as any).user;
      const wallet = new Wallets(walletData);

      await expect(wallet.save()).rejects.toThrow();
    });

    it('should require walletNumber field', async () => {
      const walletData = generateMockWallet(testUser._id.toString());
      delete (walletData as any).walletNumber;
      const wallet = new Wallets(walletData);

      await expect(wallet.save()).rejects.toThrow();
    });

    it('should enforce unique walletNumber', async () => {
      const walletNumber = 'W123456';
      const wallet1 = new Wallets({
        ...generateMockWallet(testUser._id.toString()),
        walletNumber,
      });
      await wallet1.save();

      const otherUser = await createTestUser({ email: 'other@test.com' });
      const wallet2 = new Wallets({
        ...generateMockWallet(otherUser._id.toString()),
        walletNumber,
      });

      await expect(wallet2.save()).rejects.toThrow();
    });

    it('should enforce unique user (one wallet per user)', async () => {
      const wallet1 = new Wallets(generateMockWallet(testUser._id.toString()));
      await wallet1.save();

      const wallet2 = new Wallets({
        ...generateMockWallet(testUser._id.toString()),
        walletNumber: 'W-DIFFERENT',
      });

      await expect(wallet2.save()).rejects.toThrow();
    });

    it('should store multiple currency balances', async () => {
      const walletData = generateMockWallet(testUser._id.toString());
      walletData.balances = new Map([
        ['USD', 1000],
        ['EUR', 500],
        ['GBP', 250],
      ]);
      const wallet = new Wallets(walletData);
      const savedWallet = await wallet.save();

      expect(savedWallet.balances.get('USD')).toBe(1000);
      expect(savedWallet.balances.get('EUR')).toBe(500);
      expect(savedWallet.balances.get('GBP')).toBe(250);
    });

    it('should accept valid status values', async () => {
      const statuses = ['active', 'suspended', 'closed'];

      for (const status of statuses) {
        const user = await createTestUser({ email: `wallet-${status}@test.com` });
        const wallet = new Wallets({
          ...generateMockWallet(user._id.toString()),
          status,
        });
        const savedWallet = await wallet.save();
        expect(savedWallet.status).toBe(status);
      }
    });

    it('should store wallet limits', async () => {
      const walletData = generateMockWallet(testUser._id.toString());
      walletData.limits = {
        daily: 5000,
        monthly: 50000,
        perTransaction: 2000,
      };
      const wallet = new Wallets(walletData);
      const savedWallet = await wallet.save();

      expect(savedWallet.limits?.daily).toBe(5000);
      expect(savedWallet.limits?.monthly).toBe(50000);
    });

    it('should track wallet type', async () => {
      const walletData = generateMockWallet(testUser._id.toString());
      walletData.walletType = 'business';
      const wallet = new Wallets(walletData);
      const savedWallet = await wallet.save();

      expect(savedWallet.walletType).toBe('business');
    });

    it('should track freeze reason', async () => {
      const walletData = generateMockWallet(testUser._id.toString());
      walletData.status = 'suspended';
      walletData.freezeReason = 'Suspicious activity detected';
      const wallet = new Wallets(walletData);
      const savedWallet = await wallet.save();

      expect(savedWallet.freezeReason).toBe('Suspicious activity detected');
    });
  });

  describe('Account Balance Model', () => {
    let testWallet: any;

    beforeEach(async () => {
      testWallet = await new Wallets(generateMockWallet(testUser._id.toString())).save();
    });

    it('should create account balance', async () => {
      const balance = new AccountBalances({
        wallet: testWallet._id,
        currency: 'USD',
        availableBalance: 1000,
        ledgerBalance: 1000,
        pendingBalance: 0,
        reservedBalance: 0,
      });
      const savedBalance = await balance.save();

      expect(savedBalance._id).toBeDefined();
      expect(savedBalance.availableBalance).toBe(1000);
    });

    it('should require wallet reference', async () => {
      const balance = new AccountBalances({
        currency: 'USD',
        availableBalance: 1000,
        ledgerBalance: 1000,
      });

      await expect(balance.save()).rejects.toThrow();
    });

    it('should require currency', async () => {
      const balance = new AccountBalances({
        wallet: testWallet._id,
        availableBalance: 1000,
        ledgerBalance: 1000,
      });

      await expect(balance.save()).rejects.toThrow();
    });

    it('should enforce unique wallet-currency combination', async () => {
      const balance1 = new AccountBalances({
        wallet: testWallet._id,
        currency: 'USD',
        availableBalance: 1000,
        ledgerBalance: 1000,
      });
      await balance1.save();

      const balance2 = new AccountBalances({
        wallet: testWallet._id,
        currency: 'USD',
        availableBalance: 500,
        ledgerBalance: 500,
      });

      await expect(balance2.save()).rejects.toThrow();
    });

    it('should allow multiple currencies per wallet', async () => {
      const usdBalance = new AccountBalances({
        wallet: testWallet._id,
        currency: 'USD',
        availableBalance: 1000,
        ledgerBalance: 1000,
      });
      await usdBalance.save();

      const eurBalance = new AccountBalances({
        wallet: testWallet._id,
        currency: 'EUR',
        availableBalance: 500,
        ledgerBalance: 500,
      });
      const savedEurBalance = await eurBalance.save();

      expect(savedEurBalance.currency).toBe('EUR');
    });

    it('should default pendingBalance to 0', async () => {
      const balance = new AccountBalances({
        wallet: testWallet._id,
        currency: 'USD',
        availableBalance: 1000,
        ledgerBalance: 1000,
      });
      const savedBalance = await balance.save();

      expect(savedBalance.pendingBalance).toBe(0);
    });
  });

  describe('Ledger Entry Model', () => {
    let testWallet: any;

    beforeEach(async () => {
      testWallet = await new Wallets(generateMockWallet(testUser._id.toString())).save();
    });

    it('should create debit ledger entry', async () => {
      const entry = new LedgerEntries({
        transaction: new mongoose.Types.ObjectId(),
        wallet: testWallet._id,
        entryType: 'debit',
        amount: 100,
        currency: 'USD',
        balance: 900,
        description: 'Test debit',
        accountingDate: new Date(),
      });
      const savedEntry = await entry.save();

      expect(savedEntry.entryType).toBe('debit');
      expect(savedEntry.amount).toBe(100);
    });

    it('should create credit ledger entry', async () => {
      const entry = new LedgerEntries({
        transaction: new mongoose.Types.ObjectId(),
        wallet: testWallet._id,
        entryType: 'credit',
        amount: 100,
        currency: 'USD',
        balance: 1100,
        description: 'Test credit',
        accountingDate: new Date(),
      });
      const savedEntry = await entry.save();

      expect(savedEntry.entryType).toBe('credit');
    });

    it('should require transaction reference', async () => {
      const entry = new LedgerEntries({
        wallet: testWallet._id,
        entryType: 'debit',
        amount: 100,
        currency: 'USD',
        balance: 900,
        description: 'Test',
        accountingDate: new Date(),
      });

      await expect(entry.save()).rejects.toThrow();
    });

    it('should require entry type', async () => {
      const entry = new LedgerEntries({
        transaction: new mongoose.Types.ObjectId(),
        wallet: testWallet._id,
        amount: 100,
        currency: 'USD',
        balance: 900,
        description: 'Test',
        accountingDate: new Date(),
      });

      await expect(entry.save()).rejects.toThrow();
    });

    it('should track reversal entries', async () => {
      const originalEntry = await new LedgerEntries({
        transaction: new mongoose.Types.ObjectId(),
        wallet: testWallet._id,
        entryType: 'debit',
        amount: 100,
        currency: 'USD',
        balance: 900,
        description: 'Original',
        accountingDate: new Date(),
      }).save();

      const reversalEntry = new LedgerEntries({
        transaction: new mongoose.Types.ObjectId(),
        wallet: testWallet._id,
        entryType: 'credit',
        amount: 100,
        currency: 'USD',
        balance: 1000,
        description: 'Reversal',
        accountingDate: new Date(),
        isReversed: true,
        reversalEntry: originalEntry._id,
      });
      const savedReversal = await reversalEntry.save();

      expect(savedReversal.isReversed).toBe(true);
      expect(savedReversal.reversalEntry?.toString()).toBe(originalEntry._id.toString());
    });
  });

  describe('Account Limit Model', () => {
    let testWallet: any;

    beforeEach(async () => {
      testWallet = await new Wallets(generateMockWallet(testUser._id.toString())).save();
    });

    it('should create account limit', async () => {
      const limit = new AccountLimits({
        wallet: testWallet._id,
        limitType: 'daily',
        category: 'withdrawal',
        amount: 5000,
        currency: 'USD',
        resetDate: new Date(),
      });
      const savedLimit = await limit.save();

      expect(savedLimit.limitType).toBe('daily');
      expect(savedLimit.amount).toBe(5000);
    });

    it('should accept valid limit types', async () => {
      const limitTypes = ['daily', 'monthly', 'yearly', 'per_transaction'];

      for (const limitType of limitTypes) {
        const limit = new AccountLimits({
          wallet: testWallet._id,
          limitType,
          category: 'all',
          amount: 1000,
          currency: 'USD',
          resetDate: new Date(),
        });
        const savedLimit = await limit.save();
        expect(savedLimit.limitType).toBe(limitType);
      }
    });

    it('should accept valid category values', async () => {
      const categories = ['withdrawal', 'transfer', 'payment', 'all'];

      for (const category of categories) {
        const limit = new AccountLimits({
          wallet: testWallet._id,
          limitType: 'daily',
          category,
          amount: 1000,
          currency: 'USD',
          resetDate: new Date(),
        });
        const savedLimit = await limit.save();
        expect(savedLimit.category).toBe(category);
      }
    });

    it('should track used amount', async () => {
      const limit = new AccountLimits({
        wallet: testWallet._id,
        limitType: 'daily',
        category: 'withdrawal',
        amount: 5000,
        currency: 'USD',
        usedAmount: 2500,
        resetDate: new Date(),
      });
      const savedLimit = await limit.save();

      expect(savedLimit.usedAmount).toBe(2500);
    });

    it('should default usedAmount to 0', async () => {
      const limit = new AccountLimits({
        wallet: testWallet._id,
        limitType: 'daily',
        category: 'withdrawal',
        amount: 5000,
        currency: 'USD',
        resetDate: new Date(),
      });
      const savedLimit = await limit.save();

      expect(savedLimit.usedAmount).toBe(0);
    });
  });

  describe('Account Status History Model', () => {
    let testWallet: any;

    beforeEach(async () => {
      testWallet = await new Wallets(generateMockWallet(testUser._id.toString())).save();
    });

    it('should create status history entry', async () => {
      const history = new AccountStatusHistories({
        wallet: testWallet._id,
        previousStatus: 'active',
        newStatus: 'suspended',
        reason: 'Fraudulent activity',
        changedBy: testUser._id.toString(),
        effectiveDate: new Date(),
      });
      const savedHistory = await history.save();

      expect(savedHistory.previousStatus).toBe('active');
      expect(savedHistory.newStatus).toBe('suspended');
    });

    it('should require reason', async () => {
      const history = new AccountStatusHistories({
        wallet: testWallet._id,
        previousStatus: 'active',
        newStatus: 'suspended',
        changedBy: testUser._id.toString(),
        effectiveDate: new Date(),
      });

      await expect(history.save()).rejects.toThrow();
    });

    it('should require changedBy', async () => {
      const history = new AccountStatusHistories({
        wallet: testWallet._id,
        previousStatus: 'active',
        newStatus: 'suspended',
        reason: 'Test',
        effectiveDate: new Date(),
      });

      await expect(history.save()).rejects.toThrow();
    });

    it('should store metadata', async () => {
      const history = new AccountStatusHistories({
        wallet: testWallet._id,
        previousStatus: 'active',
        newStatus: 'suspended',
        reason: 'Compliance review',
        changedBy: 'admin-123',
        metadata: {
          reviewTicket: 'TICKET-001',
          notes: 'Pending document verification',
        },
        effectiveDate: new Date(),
      });
      const savedHistory = await history.save();

      expect(savedHistory.metadata?.reviewTicket).toBe('TICKET-001');
    });
  });
});

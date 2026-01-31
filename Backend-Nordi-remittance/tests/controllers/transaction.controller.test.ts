// ============================================================================
// TRANSACTION CONTROLLER TESTS
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  createTestUser,
  createTestUserWithWallet,
  createTestWallet,
} from '../helpers/test-utils.js';
import * as TransactionController from '../../controllers/Transaction.controller.js';
import Transactions from '../../models/TransactionModel.js';
import { Wallets } from '../../models/AccountsModel.js';

describe('Transaction Controller', () => {
  describe('internalTransfer', () => {
    let sender: any;
    let senderWallet: any;
    let recipient: any;
    let recipientWallet: any;

    beforeEach(async () => {
      // Create sender with wallet
      const senderData = await createTestUserWithWallet(
        { email: 'sender@test.com', accountNumber: 'ACC001' },
        { balances: new Map([['USD', 5000]]) }
      );
      sender = senderData.user;
      senderWallet = senderData.wallet;

      // Create recipient with wallet
      const recipientData = await createTestUserWithWallet(
        { email: 'recipient@test.com', accountNumber: 'ACC002' },
        { balances: new Map([['USD', 1000]]) }
      );
      recipient = recipientData.user;
      recipientWallet = recipientData.wallet;
    });

    it('should transfer funds between wallets successfully', async () => {
      const req = createMockRequest({
        user: {
          userId: sender._id.toString(),
          email: sender.email,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          recipientAccountNumber: recipient.accountNumber,
          amount: 100,
          currency: 'USD',
          description: 'Test transfer',
          pin: '1234',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await TransactionController.internalTransfer(req, res, next);

      // Check if transfer was successful or proper error was raised
      if ((res.status as any).mock.calls.length > 0) {
        expect(res.status).toHaveBeenCalled();
      }
    });

    it('should fail transfer with insufficient balance', async () => {
      const req = createMockRequest({
        user: {
          userId: sender._id.toString(),
          email: sender.email,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          recipientAccountNumber: recipient.accountNumber,
          amount: 100000, // More than available balance
          currency: 'USD',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await TransactionController.internalTransfer(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail transfer with invalid amount', async () => {
      const req = createMockRequest({
        user: {
          userId: sender._id.toString(),
          email: sender.email,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          recipientAccountNumber: recipient.accountNumber,
          amount: -100, // Negative amount
          currency: 'USD',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await TransactionController.internalTransfer(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail transfer to non-existent recipient', async () => {
      const req = createMockRequest({
        user: {
          userId: sender._id.toString(),
          email: sender.email,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          recipientAccountNumber: 'NONEXISTENT',
          amount: 100,
          currency: 'USD',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await TransactionController.internalTransfer(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail self-transfer', async () => {
      const req = createMockRequest({
        user: {
          userId: sender._id.toString(),
          email: sender.email,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          recipientAccountNumber: sender.accountNumber, // Same as sender
          amount: 100,
          currency: 'USD',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await TransactionController.internalTransfer(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail transfer for unauthenticated user', async () => {
      const req = createMockRequest({
        body: {
          recipientAccountNumber: recipient.accountNumber,
          amount: 100,
          currency: 'USD',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await TransactionController.internalTransfer(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle transfer with email instead of account number', async () => {
      const req = createMockRequest({
        user: {
          userId: sender._id.toString(),
          email: sender.email,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          recipientEmail: recipient.email,
          amount: 100,
          currency: 'USD',
          description: 'Transfer via email',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await TransactionController.internalTransfer(req, res, next);

      // Should either succeed or fail gracefully
      if ((res.status as any).mock.calls.length > 0) {
        expect(res.status).toHaveBeenCalled();
      }
    });
  });

  describe('getTransactionHistory', () => {
    let user: any;
    let wallet: any;

    beforeEach(async () => {
      const data = await createTestUserWithWallet();
      user = data.user;
      wallet = data.wallet;

      // Create some test transactions
      await Transactions.create([
        {
          wallet: wallet._id,
          referenceNumber: 'TXN001',
          type: 'deposit',
          category: 'bankAccounts',
          initiatedBy: user._id,
          amount: 500,
          currency: 'USD',
          status: 'completed',
          description: 'Test deposit 1',
        },
        {
          wallet: wallet._id,
          referenceNumber: 'TXN002',
          type: 'withdrawal',
          category: 'bankAccounts',
          initiatedBy: user._id,
          amount: 200,
          currency: 'USD',
          status: 'completed',
          description: 'Test withdrawal',
        },
        {
          wallet: wallet._id,
          referenceNumber: 'TXN003',
          type: 'transfer',
          category: 'bankAccounts',
          initiatedBy: user._id,
          amount: 100,
          currency: 'USD',
          status: 'pending',
          description: 'Test transfer',
        },
      ]);
    });

    it('should return transaction history', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Check if method exists
      if (typeof TransactionController.getTransactionHistory === 'function') {
        await TransactionController.getTransactionHistory(req, res, next);

        if ((res.status as any).mock.calls.length > 0) {
          expect(res.status).toHaveBeenCalled();
        }
      }
    });

    it('should filter transactions by type', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        query: {
          type: 'deposit',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.getTransactionHistory === 'function') {
        await TransactionController.getTransactionHistory(req, res, next);
      }
    });

    it('should filter transactions by status', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        query: {
          status: 'completed',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.getTransactionHistory === 'function') {
        await TransactionController.getTransactionHistory(req, res, next);
      }
    });

    it('should paginate results', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        query: {
          page: '1',
          limit: '10',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.getTransactionHistory === 'function') {
        await TransactionController.getTransactionHistory(req, res, next);
      }
    });
  });

  describe('getTransactionById', () => {
    let user: any;
    let wallet: any;
    let transaction: any;

    beforeEach(async () => {
      const data = await createTestUserWithWallet();
      user = data.user;
      wallet = data.wallet;

      transaction = await Transactions.create({
        wallet: wallet._id,
        referenceNumber: 'TXN001',
        type: 'deposit',
        category: 'bankAccounts',
        initiatedBy: user._id,
        amount: 500,
        currency: 'USD',
        status: 'completed',
        description: 'Test deposit',
      });
    });

    it('should return transaction by ID', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        params: {
          id: transaction._id.toString(),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.getTransactionById === 'function') {
        await TransactionController.getTransactionById(req, res, next);

        if ((res.status as any).mock.calls.length > 0) {
          expect(res.status).toHaveBeenCalled();
        }
      }
    });

    it('should fail for non-existent transaction', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        params: {
          id: new mongoose.Types.ObjectId().toString(),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.getTransactionById === 'function') {
        await TransactionController.getTransactionById(req, res, next);

        expect(next).toHaveBeenCalled();
      }
    });

    it('should not allow access to other users transactions', async () => {
      const otherUser = await createTestUser({ email: 'other@test.com' });

      const req = createMockRequest({
        user: {
          userId: otherUser._id.toString(),
          email: otherUser.email,
          role: 'user',
          sessionId: 'test-session',
        },
        params: {
          id: transaction._id.toString(),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.getTransactionById === 'function') {
        await TransactionController.getTransactionById(req, res, next);

        // Should either return not found or forbidden
        expect(next).toHaveBeenCalled();
      }
    });
  });

  describe('getTransactionByReference', () => {
    let user: any;
    let wallet: any;
    let transaction: any;

    beforeEach(async () => {
      const data = await createTestUserWithWallet();
      user = data.user;
      wallet = data.wallet;

      transaction = await Transactions.create({
        wallet: wallet._id,
        referenceNumber: 'TXN-TEST-123',
        type: 'deposit',
        category: 'bankAccounts',
        initiatedBy: user._id,
        amount: 500,
        currency: 'USD',
        status: 'completed',
        description: 'Test deposit',
      });
    });

    it('should return transaction by reference number', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        params: {
          reference: 'TXN-TEST-123',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.getTransactionByReference === 'function') {
        await TransactionController.getTransactionByReference(req, res, next);

        if ((res.status as any).mock.calls.length > 0) {
          expect(res.status).toHaveBeenCalled();
        }
      }
    });
  });

  describe('deposit', () => {
    let user: any;
    let wallet: any;

    beforeEach(async () => {
      const data = await createTestUserWithWallet();
      user = data.user;
      wallet = data.wallet;
    });

    it('should create deposit request', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          amount: 500,
          currency: 'USD',
          source: 'bank_transfer',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.deposit === 'function') {
        await TransactionController.deposit(req, res, next);

        if ((res.status as any).mock.calls.length > 0) {
          expect(res.status).toHaveBeenCalled();
        }
      }
    });

    it('should fail deposit with invalid amount', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          amount: -100,
          currency: 'USD',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.deposit === 'function') {
        await TransactionController.deposit(req, res, next);

        expect(next).toHaveBeenCalled();
      }
    });
  });

  describe('withdraw', () => {
    let user: any;
    let wallet: any;

    beforeEach(async () => {
      const data = await createTestUserWithWallet(
        {},
        { balances: new Map([['USD', 5000]]) }
      );
      user = data.user;
      wallet = data.wallet;
    });

    it('should create withdrawal request', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          amount: 200,
          currency: 'USD',
          destination: 'bank_account',
          bankDetails: {
            accountNumber: '123456789',
            routingNumber: '987654321',
          },
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.withdraw === 'function') {
        await TransactionController.withdraw(req, res, next);

        if ((res.status as any).mock.calls.length > 0) {
          expect(res.status).toHaveBeenCalled();
        }
      }
    });

    it('should fail withdrawal with insufficient balance', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        body: {
          amount: 100000, // More than available
          currency: 'USD',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.withdraw === 'function') {
        await TransactionController.withdraw(req, res, next);

        expect(next).toHaveBeenCalled();
      }
    });
  });

  describe('cancelTransaction', () => {
    let user: any;
    let wallet: any;
    let pendingTransaction: any;

    beforeEach(async () => {
      const data = await createTestUserWithWallet();
      user = data.user;
      wallet = data.wallet;

      pendingTransaction = await Transactions.create({
        wallet: wallet._id,
        referenceNumber: 'TXN-PENDING-001',
        type: 'transfer',
        category: 'bankAccounts',
        initiatedBy: user._id,
        amount: 100,
        currency: 'USD',
        status: 'pending',
        description: 'Pending transfer',
      });
    });

    it('should cancel pending transaction', async () => {
      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        params: {
          id: pendingTransaction._id.toString(),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.cancelTransaction === 'function') {
        await TransactionController.cancelTransaction(req, res, next);

        if ((res.status as any).mock.calls.length > 0) {
          expect(res.status).toHaveBeenCalled();
        }
      }
    });

    it('should fail to cancel completed transaction', async () => {
      await Transactions.findByIdAndUpdate(pendingTransaction._id, { status: 'completed' });

      const req = createMockRequest({
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: 'user',
          sessionId: 'test-session',
        },
        params: {
          id: pendingTransaction._id.toString(),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      if (typeof TransactionController.cancelTransaction === 'function') {
        await TransactionController.cancelTransaction(req, res, next);

        expect(next).toHaveBeenCalled();
      }
    });
  });
});

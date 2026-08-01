import mongoose from 'mongoose';
import { AdminUsers } from './admin.model.js';
import Users from '../users/users.model.js';
import { Wallets, LedgerEntries } from '../accounts/accounts.model.js';
import Transactions from '../transactions/transactions.model.js';
import { generateReferenceNumber } from '../../core/helpers/generator.js';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  InsufficientBalanceError,
} from '../../core/errors/AppError.js';
import { queueTemplatedMail } from '../../services/workers.js';
import { emitToUser } from '../../services/websocket.service.js';
import { WS } from '../../core/constants/ws-events.js';
import { validateUserEligibility } from '../../core/guards/user-eligibility.guard.js';
import {
  calculateTransactionTax,
  createTaxRecord,
  getWalletBalance,
  updateWalletBalance,
  hasPermission,
  logAdminAction,
  notifyUser,
  TAX_RATE
} from './ops.helpers.js';

export class OpsWalletService {
  /**
   * Credit a user's wallet
   */
  static async creditUserWallet(
    currentUserId: string,
    currentUserEmail: string,
    data: any,
    ip: string,
    userAgent: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const canCredit = await hasPermission(currentUserId, 'canAdjustBalances');
      if (!canCredit) {
        throw new ForbiddenError('You do not have permission to credit user wallets');
      }

      const {
        userId,
        amount,
        currency = 'USD',
        description,
        transactionType = 'deposit',
        reference,
        metadata,
      } = data;

      await validateUserEligibility(userId, 'credit wallet');

      if (!amount || amount <= 0) {
        throw new ValidationError('Amount must be greater than zero');
      }

      const { taxAmount, netAmount, isTaxExempt } = calculateTransactionTax(amount, transactionType);

      const user = await Users.findById(userId).session(session);
      if (!user) throw new NotFoundError('User not found');

      let wallet = await Wallets.findOne({ user: userId, status: 'active' }).session(session);
      if (!wallet) {
        wallet = new Wallets({
          user: userId,
          walletNumber: `W${Date.now()}${Math.random().toString(36).substring(7)}`,
          balances: new Map([[currency, 0]]),
          status: 'active',
          walletType: 'personal',
          isPrimary: true,
        });
      }

      const previousBalance = getWalletBalance(wallet, currency);
      const creditAmount = isTaxExempt ? amount : netAmount;
      updateWalletBalance(wallet, currency, creditAmount);
      const newBalance = getWalletBalance(wallet, currency);

      await wallet.save({ session });

      const referenceNumber = reference || generateReferenceNumber();
      const isInternational = metadata?.isInternational === true;
      const senderDetails = metadata?.sender || {};

      const transaction = new Transactions({
        wallet: wallet._id,
        referenceNumber,
        type: transactionType,
        category: 'bankAccounts',
        amount: creditAmount,
        currency,
        status: 'completed',
        description: description || `Admin credit: ${transactionType}`,
        initiatedBy: userId,
        fee: taxAmount,
        isInternational,
        recipientName: senderDetails.name || undefined,
        recipientBankName: senderDetails.bankName || undefined,
        recipientAccountNumber: senderDetails.accountNumber || undefined,
        exchangeRate: metadata?.exchangeRate || undefined,
        meta: {
          adminInitiated: true,
          adminId: currentUserId,
          adminEmail: currentUserEmail,
          previousBalance,
          newBalance,
          originalAmount: amount,
          taxAmount,
          taxRate: isTaxExempt ? 0 : TAX_RATE,
          isTaxExempt,
          transferType: isInternational ? 'international' : 'domestic',
          ...metadata,
        },
        completedAt: new Date(),
        channel: 'web',
        ipAddress: ip,
        userAgent,
      });

      await transaction.save({ session });

      if (taxAmount > 0) {
        await createTaxRecord(transaction._id, userId, transactionType, amount, taxAmount, currency, session);
      }

      await LedgerEntries.create(
        [{
          wallet: wallet._id,
          transaction: transaction._id,
          entryType: 'credit',
          amount: creditAmount,
          currency,
          balance: newBalance,
          description: `Admin credit: ${description || transactionType}${taxAmount > 0 ? ` (Tax: ${currency} ${taxAmount.toFixed(2)})` : ''}`,
          accountingDate: new Date(),
        }],
        { session },
      );

      await logAdminAction(
        currentUserId,
        'CREDIT_USER_WALLET',
        'wallet',
        wallet._id.toString(),
        {
          userId, originalAmount: amount, creditedAmount: creditAmount, taxAmount,
          taxRate: isTaxExempt ? 0 : TAX_RATE, isTaxExempt, currency, transactionType,
          previousBalance, newBalance, referenceNumber,
        },
        ip,
        userAgent,
        'success',
      );

      await session.commitTransaction();

      const taxNote = taxAmount > 0 ? ` (${currency} ${taxAmount.toFixed(2)} tax deducted from original ${currency} ${amount.toFixed(2)})` : '';
      await notifyUser(userId, 'Wallet Credited', `Your wallet has been credited with ${currency} ${creditAmount.toFixed(2)}${taxNote}. Reference: ${referenceNumber}`, 'transaction', { transactionId: transaction._id, amount: creditAmount, taxAmount, currency });

      try {
        await queueTemplatedMail(String(user.email), {
          EMAIL_TITLE: 'Wallet Credited',
          GREETING: `Hello ${user.firstName},`,
          MAIN_CONTENT: `
            <p>Your wallet has been credited with <strong>${currency} ${creditAmount.toFixed(2)}</strong>.</p>
            ${taxAmount > 0 ? `<p>Tax Deducted (20%): ${currency} ${taxAmount.toFixed(2)}</p><p>Original Amount: ${currency} ${amount.toFixed(2)}</p>` : ''}
            <p>Reference: ${referenceNumber}</p>
            <p>New Balance: ${currency} ${newBalance.toFixed(2)}</p>
          `,
          COMPANY_NAME: 'Nordea Remittance',
          YEAR: new Date().getFullYear(),
          FOOTER_TEXT: 'This is an automated notification from Nordea Remittance.',
        } as any);
      } catch (emailError) {
        console.error('Failed to send credit notification email:', emailError);
      }

      return {
        transaction: {
          id: transaction._id, referenceNumber, type: transactionType, originalAmount: amount,
          creditedAmount: creditAmount, taxAmount, taxRate: isTaxExempt ? '0%' : '20%',
          isTaxExempt, currency, status: 'completed', previousBalance, newBalance,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Debit a user's wallet
   */
  static async debitUserWallet(
    currentUserId: string,
    currentUserEmail: string,
    data: any,
    ip: string,
    userAgent: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const canDebit = await hasPermission(currentUserId, 'canAdjustBalances');
      if (!canDebit) {
        throw new ForbiddenError('You do not have permission to debit user wallets');
      }

      const {
        userId, amount, currency = 'USD', description, transactionType = 'withdrawal',
        reference, forceDebit = false, metadata,
      } = data;

      await validateUserEligibility(userId, 'debit wallet');

      if (!amount || amount <= 0) {
        throw new ValidationError('Amount must be greater than zero');
      }

      const user = await Users.findById(userId).session(session);
      if (!user) throw new NotFoundError('User not found');

      const wallet = await Wallets.findOne({ user: userId, status: 'active' }).session(session);
      if (!wallet) throw new NotFoundError('User wallet not found');

      const previousBalance = getWalletBalance(wallet, currency);

      if (previousBalance < amount && !forceDebit) {
        throw new InsufficientBalanceError(amount, previousBalance);
      }

      if (forceDebit) {
        const admin = await AdminUsers.findById(currentUserId);
        if (admin?.role !== 'super_admin') {
          throw new ForbiddenError('Only super admin can force debit with insufficient balance');
        }
      }

      updateWalletBalance(wallet, currency, -amount);
      const newBalance = getWalletBalance(wallet, currency);

      await wallet.save({ session });

      const referenceNumber = reference || generateReferenceNumber();
      const isInternational = metadata?.isInternational === true;
      const recipientDetails = metadata?.recipient || {};

      const transaction = new Transactions({
        wallet: wallet._id,
        referenceNumber,
        type: transactionType,
        category: 'bankAccounts',
        amount,
        currency,
        status: 'completed',
        description: description || `Admin debit: ${transactionType}`,
        initiatedBy: userId,
        isInternational,
        recipientName: recipientDetails.name || undefined,
        recipientBankName: recipientDetails.bankName || undefined,
        recipientAccountNumber: recipientDetails.accountNumber || undefined,
        exchangeRate: metadata?.exchangeRate || undefined,
        meta: {
          adminInitiated: true,
          adminId: currentUserId,
          adminEmail: currentUserEmail,
          previousBalance,
          newBalance,
          forceDebit,
          transferType: isInternational ? 'international' : 'domestic',
          ...metadata,
        },
        completedAt: new Date(),
        channel: 'web',
        ipAddress: ip,
        userAgent,
      });

      await transaction.save({ session });

      await LedgerEntries.create(
        [{
          wallet: wallet._id,
          transaction: transaction._id,
          entryType: 'debit',
          amount,
          currency,
          balance: newBalance,
          description: `Admin debit: ${description || transactionType}`,
          accountingDate: new Date(),
        }],
        { session },
      );

      await logAdminAction(
        currentUserId,
        'DEBIT_USER_WALLET',
        'wallet',
        wallet._id.toString(),
        { userId, amount, currency, transactionType, previousBalance, newBalance, forceDebit, referenceNumber },
        ip,
        userAgent,
        'success',
      );

      await session.commitTransaction();

      await notifyUser(userId, 'Wallet Debited', `${currency} ${amount.toFixed(2)} has been debited from your wallet. Reference: ${referenceNumber}`, 'transaction', { transactionId: transaction._id, amount, currency });

      try {
        await queueTemplatedMail(String(user.email), {
          EMAIL_TITLE: 'Wallet Debited',
          GREETING: `Hello ${user.firstName},`,
          MAIN_CONTENT: `
            <p>${currency} ${amount.toFixed(2)} has been debited from your wallet.</p>
            <p>Reference: ${referenceNumber}</p>
            <p>New Balance: ${currency} ${newBalance.toFixed(2)}</p>
          `,
          COMPANY_NAME: 'Nordea Remittance',
          YEAR: new Date().getFullYear(),
          FOOTER_TEXT: 'This is an automated notification from Nordea Remittance.',
        } as any);
      } catch (emailError) {
        console.error('Failed to send debit notification email:', emailError);
      }

      return {
        transaction: {
          id: transaction._id, referenceNumber, type: transactionType, amount, currency,
          status: 'completed', previousBalance, newBalance,
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Transfer funds between two users
   */
  static async adminTransfer(
    currentUserId: string,
    currentUserEmail: string,
    data: any,
    ip: string,
    userAgent: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const canTransfer = await hasPermission(currentUserId, 'canAdjustBalances');
      if (!canTransfer) {
        throw new ForbiddenError('You do not have permission to perform transfers');
      }

      const { fromUserId, toUserId, amount, currency = 'USD', description, metadata } = data;

      await Promise.all([
        validateUserEligibility(fromUserId, 'admin transfer (sender)'),
        validateUserEligibility(toUserId, 'admin transfer (recipient)'),
      ]);

      if (fromUserId === toUserId) {
        throw new ValidationError('Cannot transfer to the same account');
      }

      if (!amount || amount <= 0) {
        throw new ValidationError('Amount must be greater than zero');
      }

      const [fromUser, toUser] = await Promise.all([
        Users.findById(fromUserId).session(session),
        Users.findById(toUserId).session(session),
      ]);

      if (!fromUser) throw new NotFoundError('Sender not found');
      if (!toUser) throw new NotFoundError('Recipient not found');

      const [fromWallet, toWallet] = await Promise.all([
        Wallets.findOne({ user: fromUserId, status: 'active' }).session(session),
        Wallets.findOne({ user: toUserId, status: 'active' }).session(session),
      ]);

      if (!fromWallet) throw new NotFoundError('Sender wallet not found');
      if (!toWallet) throw new NotFoundError('Recipient wallet not found');

      const fromPreviousBalance = getWalletBalance(fromWallet, currency);

      if (fromPreviousBalance < amount) {
        throw new InsufficientBalanceError(amount, fromPreviousBalance);
      }

      const toPreviousBalance = getWalletBalance(toWallet, currency);

      updateWalletBalance(fromWallet, currency, -amount);
      updateWalletBalance(toWallet, currency, amount);

      const fromNewBalance = getWalletBalance(fromWallet, currency);
      const toNewBalance = getWalletBalance(toWallet, currency);

      await fromWallet.save({ session });
      await toWallet.save({ session });

      const referenceNumber = generateReferenceNumber();

      const fromTransaction = new Transactions({
        wallet: fromWallet._id,
        referenceNumber,
        type: 'transfer',
        category: 'bankAccounts',
        amount,
        currency,
        status: 'completed',
        description: description || 'Admin initiated transfer',
        initiatedBy: fromUserId,
        recipientWallet: toWallet._id,
        recipientName: `${toUser.firstName} ${toUser.lastName}`,
        meta: {
          adminInitiated: true, adminId: currentUserId, adminEmail: currentUserEmail,
          previousBalance: fromPreviousBalance, newBalance: fromNewBalance, ...metadata,
        },
        completedAt: new Date(),
        channel: 'web',
        ipAddress: ip,
        userAgent,
      });

      const toTransaction = new Transactions({
        wallet: toWallet._id,
        referenceNumber: `${referenceNumber}-RCV`,
        type: 'deposit',
        category: 'bankAccounts',
        amount,
        currency,
        status: 'completed',
        description: description || 'Admin initiated transfer (received)',
        initiatedBy: toUserId,
        meta: {
          adminInitiated: true, adminId: currentUserId, relatedReference: referenceNumber,
          senderName: `${fromUser.firstName} ${fromUser.lastName}`,
          previousBalance: toPreviousBalance, newBalance: toNewBalance, ...metadata,
        },
        completedAt: new Date(),
        channel: 'web',
      });

      await fromTransaction.save({ session });
      await toTransaction.save({ session });

      await logAdminAction(
        currentUserId,
        'ADMIN_TRANSFER',
        'transaction',
        referenceNumber,
        { fromUserId, toUserId, amount, currency, fromPreviousBalance, fromNewBalance, toPreviousBalance, toNewBalance },
        ip,
        userAgent,
        'success',
      );

      await session.commitTransaction();

      await notifyUser(fromUserId, 'Funds Transferred', `${currency} ${amount.toFixed(2)} has been transferred from your account. Reference: ${referenceNumber}`, 'transaction', { transactionId: fromTransaction._id, amount, currency });
      await notifyUser(toUserId, 'Funds Received', `You have received ${currency} ${amount.toFixed(2)}. Reference: ${referenceNumber}`, 'transaction', { transactionId: toTransaction._id, amount, currency });

      return {
        transfer: {
          referenceNumber, amount, currency,
          from: { userId: fromUserId, name: `${fromUser.firstName} ${fromUser.lastName}`, previousBalance: fromPreviousBalance, newBalance: fromNewBalance },
          to: { userId: toUserId, name: `${toUser.firstName} ${toUser.lastName}`, previousBalance: toPreviousBalance, newBalance: toNewBalance },
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Bulk credit users
   */
  static async bulkCredit(
    currentUserId: string,
    data: any,
    ip: string,
    userAgent: string
  ) {
    const admin = await AdminUsers.findById(currentUserId);
    if (admin?.role !== 'super_admin') {
      throw new ForbiddenError('Only super admin can perform bulk operations');
    }

    const { operations, description } = data;

    if (!Array.isArray(operations) || operations.length === 0) {
      throw new ValidationError('Operations array is required');
    }

    if (operations.length > 100) {
      throw new ValidationError('Maximum 100 operations per batch');
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const op of operations) {
      try {
        await validateUserEligibility(op.userId, 'bulk credit');

        const session = await mongoose.startSession();
        session.startTransaction();

        const user = await Users.findById(op.userId).session(session);
        if (!user) {
          errors.push({ userId: op.userId, error: 'User not found' });
          await session.abortTransaction();
          session.endSession();
          continue;
        }

        let wallet = await Wallets.findOne({ user: op.userId, status: 'active' }).session(session);
        if (!wallet) {
          wallet = new Wallets({
            user: op.userId,
            walletNumber: `W${Date.now()}${Math.random().toString(36).substring(7)}`,
            balances: new Map([[op.currency || 'USD', 0]]),
            status: 'active',
            walletType: 'personal',
            isPrimary: true,
          });
        }

        const currency = op.currency || 'USD';
        const previousBalance = getWalletBalance(wallet, currency);
        updateWalletBalance(wallet, currency, op.amount);
        const newBalance = getWalletBalance(wallet, currency);

        await wallet.save({ session });

        const referenceNumber = generateReferenceNumber();
        const transaction = new Transactions({
          wallet: wallet._id,
          referenceNumber,
          type: 'deposit',
          category: 'bankAccounts',
          amount: op.amount,
          currency,
          status: 'completed',
          description: description || 'Bulk credit',
          initiatedBy: op.userId,
          meta: { adminInitiated: true, adminId: currentUserId, bulkOperation: true },
          completedAt: new Date(),
          channel: 'web',
        });

        await transaction.save({ session });
        await session.commitTransaction();
        session.endSession();

        results.push({ userId: op.userId, amount: op.amount, currency, previousBalance, newBalance, referenceNumber });
      } catch (err: any) {
        errors.push({ userId: op.userId, error: err.message });
      }
    }

    await logAdminAction(
      currentUserId,
      'BULK_CREDIT',
      'wallet',
      'bulk',
      { totalOperations: operations.length, successful: results.length, failed: errors.length, description },
      ip,
      userAgent,
      errors.length === operations.length ? 'failed' : 'success',
    );

    results.forEach((r: any) => {
      if (r.userId) {
        emitToUser(String(r.userId), WS.ADMIN.WALLET_FUND, {
          amount: r.amount, reference: r.referenceNumber, timestamp: new Date().toISOString(),
        });
      }
    });

    return {
      summary: { total: operations.length, successful: results.length, failed: errors.length },
      results,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

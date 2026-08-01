import mongoose from 'mongoose';
import { Wallets } from '../accounts/accounts.model.js';
import Transactions from '../transactions/transactions.model.js';
import { generateReferenceNumber } from '../../core/helpers/generator.js';
import { ValidationError, NotFoundError, ForbiddenError, InsufficientBalanceError } from '../../core/errors/AppError.js';
import { validateUserEligibility } from '../../core/guards/user-eligibility.guard.js';
import { emitToUser } from '../../services/websocket.service.js';
import { WS } from '../../core/constants/ws-events.js';
import {
  hasPermission,
  logAdminAction,
  notifyUser,
  getWalletBalance,
  updateWalletBalance
} from './ops.helpers.js';

export class OpsTransactionService {
  /**
   * Get pending transactions
   */
  static async getPendingTransactions(currentUserId: string, filters: any, pagination: { page: number; limit: number }) {
    const canView = await hasPermission(currentUserId, 'canViewTransactions');
    if (!canView) {
      throw new ForbiddenError('You do not have permission to view transactions');
    }

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const queryFilter: any = { status: 'pending' };
    if (filters.type) queryFilter.type = filters.type;
    if (filters.minAmount) queryFilter.amount = { $gte: parseFloat(filters.minAmount) };

    const [transactions, total] = await Promise.all([
      Transactions.find(queryFilter)
        .populate('wallet', 'walletNumber')
        .populate('initiatedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transactions.countDocuments(queryFilter),
    ]);

    return { transactions, total, page, limit };
  }

  /**
   * Approve a pending transaction
   */
  static async approveTransaction(currentUserId: string, transactionId: string, data: any, ip: string, userAgent: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const canApprove = await hasPermission(currentUserId, 'canReverseTransactions');
      if (!canApprove) {
        throw new ForbiddenError('You do not have permission to approve transactions');
      }

      const { notes } = data;

      const transaction = await Transactions.findById(transactionId).session(session);
      if (!transaction) throw new NotFoundError('Transaction not found');

      await validateUserEligibility(String(transaction.initiatedBy), 'transaction approval');

      if (transaction.status !== 'pending') {
        throw new ValidationError(`Cannot approve transaction with status: ${transaction.status}`);
      }

      const wallet = await Wallets.findById(transaction.wallet).session(session);
      if (!wallet) throw new NotFoundError('Wallet not found');

      const currency = transaction.currency;
      const amount = transaction.amount;

      if (transaction.type === 'withdrawal') {
        const currentBalance = getWalletBalance(wallet, currency);
        if (currentBalance < amount) {
          throw new InsufficientBalanceError(amount, currentBalance);
        }
        updateWalletBalance(wallet, currency, -amount);
      } else if (transaction.type === 'deposit') {
        updateWalletBalance(wallet, currency, amount);
      }

      await wallet.save({ session });

      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.meta = {
        ...transaction.meta,
        approvedBy: currentUserId,
        approvedAt: new Date(),
        approvalNotes: notes,
      };
      await transaction.save({ session });

      await logAdminAction(
        currentUserId,
        'APPROVE_TRANSACTION',
        'transaction',
        (transaction._id as any).toString(),
        { referenceNumber: transaction.referenceNumber, type: transaction.type, amount: transaction.amount, notes },
        ip,
        userAgent,
        'success',
      );

      await session.commitTransaction();

      emitToUser(String(transaction.initiatedBy), WS.TRANSACTION.APPROVED, {
        transactionId: transaction._id,
        referenceNumber: transaction.referenceNumber,
        amount: transaction.amount,
        status: transaction.status,
        timestamp: new Date().toISOString(),
      });

      return {
        transaction: {
          id: transaction._id, referenceNumber: transaction.referenceNumber,
          status: transaction.status, completedAt: transaction.completedAt,
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
   * Reject a pending transaction
   */
  static async rejectTransaction(currentUserId: string, transactionId: string, data: any, ip: string, userAgent: string) {
    const canReject = await hasPermission(currentUserId, 'canReverseTransactions');
    if (!canReject) {
      throw new ForbiddenError('You do not have permission to reject transactions');
    }

    const { reason } = data;

    const transaction = await Transactions.findById(transactionId);
    if (!transaction) throw new NotFoundError('Transaction not found');

    if (transaction.status !== 'pending') {
      throw new ValidationError(`Cannot reject transaction with status: ${transaction.status}`);
    }

    transaction.status = 'failed';
    transaction.failedReason = reason;
    transaction.meta = {
      ...transaction.meta,
      rejectedBy: currentUserId,
      rejectedAt: new Date(),
      rejectionReason: reason,
    };
    await transaction.save();

    await logAdminAction(
      currentUserId,
      'REJECT_TRANSACTION',
      'transaction',
      (transaction._id as any).toString(),
      { referenceNumber: transaction.referenceNumber, type: transaction.type, amount: transaction.amount, reason },
      ip,
      userAgent,
      'success',
    );

    await notifyUser(
      String(transaction.initiatedBy),
      'Transaction Rejected',
      `Your ${transaction.type} transaction of ${transaction.currency} ${transaction.amount.toFixed(2)} was rejected. Reason: ${reason}`,
      'transaction',
      { transactionId: transaction._id }
    );

    return {
      transaction: {
        id: transaction._id, referenceNumber: transaction.referenceNumber,
        status: transaction.status, failedReason: transaction.failedReason,
      },
    };
  }

  /**
   * Reverse a completed transaction
   */
  static async reverseTransaction(currentUserId: string, transactionId: string, data: any, ip: string, userAgent: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const canReverse = await hasPermission(currentUserId, 'canReverseTransactions');
      if (!canReverse) {
        throw new ForbiddenError('You do not have permission to reverse transactions');
      }

      const { reason, fullRefund = true, refundAmount } = data;

      if (!reason) {
        throw new ValidationError('Reversal reason is required');
      }

      const transaction = await Transactions.findById(transactionId).session(session);
      if (!transaction) throw new NotFoundError('Transaction not found');

      await validateUserEligibility(String(transaction.initiatedBy), 'transaction reversal');

      if (transaction.status !== 'completed') {
        throw new ValidationError('Only completed transactions can be reversed');
      }

      const wallet = await Wallets.findById(transaction.wallet).session(session);
      if (!wallet) throw new NotFoundError('Wallet not found');

      const currency = transaction.currency;
      const reverseAmount = fullRefund ? transaction.amount : refundAmount || transaction.amount;

      if (transaction.type === 'withdrawal' || transaction.type === 'payment' || transaction.type === 'transfer') {
        updateWalletBalance(wallet, currency, reverseAmount);
      } else if (transaction.type === 'deposit') {
        const currentBalance = getWalletBalance(wallet, currency);
        if (currentBalance < reverseAmount) {
          throw new InsufficientBalanceError(reverseAmount, currentBalance);
        }
        updateWalletBalance(wallet, currency, -reverseAmount);
      }

      await wallet.save({ session });

      const reversalReference = generateReferenceNumber();
      const reversalTransaction = new Transactions({
        wallet: wallet._id,
        referenceNumber: reversalReference,
        type: 'reversal',
        category: transaction.category,
        amount: reverseAmount,
        currency,
        status: 'completed',
        description: `Reversal of ${transaction.referenceNumber}: ${reason}`,
        initiatedBy: transaction.initiatedBy,
        reversalReason: reason,
        meta: {
          originalTransaction: transaction._id, originalReference: transaction.referenceNumber,
          adminInitiated: true, adminId: currentUserId, fullRefund,
        },
        completedAt: new Date(),
        channel: 'web',
      });

      await reversalTransaction.save({ session });

      transaction.status = 'reversed';
      transaction.reversalReason = reason;
      transaction.meta = {
        ...transaction.meta,
        reversedBy: currentUserId,
        reversedAt: new Date(),
        reversalTransaction: reversalTransaction._id,
      };
      await transaction.save({ session });

      await logAdminAction(
        currentUserId,
        'REVERSE_TRANSACTION',
        'transaction',
        (transaction._id as any).toString(),
        { originalReference: transaction.referenceNumber, reversalReference, amount: reverseAmount, reason, fullRefund },
        ip,
        userAgent,
        'success',
      );

      await session.commitTransaction();

      await notifyUser(
        String(transaction.initiatedBy),
        'Transaction Reversed',
        `Your transaction ${transaction.referenceNumber} has been reversed. Amount: ${currency} ${reverseAmount.toFixed(2)}`,
        'transaction',
        { transactionId: reversalTransaction._id, amount: reverseAmount }
      );

      return {
        reversal: {
          id: reversalTransaction._id, referenceNumber: reversalReference,
          originalTransaction: transaction.referenceNumber, amount: reverseAmount, status: 'completed',
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

import mongoose from "mongoose";
import Transactions from "./transactions.model.js";
import { Wallets } from "../accounts/accounts.model.js";
import { TransactionStatus } from "../../types/index.js";
import { ValidationError, NotFoundError } from "../../core/errors/AppError.js";
import { emitToUser } from "../../services/websocket.service.js";
import {
  cacheTransaction,
  invalidateTransactionCache,
} from "../../services/redis.service.js";
import { WS_EVENTS, updateWalletBalance } from "./transactions.helpers.js";

export class TransactionsAdminService {
  static async getAllTransactions(query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.userId) {
      filter.initiatedBy = query.userId;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate as string);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate as string);
    }

    const [transactions, total] = await Promise.all([
      Transactions.find(filter)
        .select(
          "type category amount currency status referenceNumber initiatedBy wallet recipientName createdAt completedAt fee isInternational channel description",
        )
        .populate("initiatedBy", "firstName lastName email")
        .populate("wallet", "walletNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transactions.countDocuments(filter),
    ]);

    return { transactions, page, limit, total };
  }

  static async updateTransactionStatus(adminId: string, transactionId: string, body: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { status, reason } = body;

      const validStatuses = [
        TransactionStatus.PENDING,
        TransactionStatus.COMPLETED,
        TransactionStatus.FAILED,
        TransactionStatus.CANCELLED,
        TransactionStatus.REVERSED,
      ];
      if (!status || !validStatuses.includes(status)) {
        throw new ValidationError("Invalid status");
      }

      const transaction = await Transactions.findById(transactionId).session(session);
      if (!transaction) throw new NotFoundError("Transaction not found");

      const previousStatus = transaction.status;

      if (status === "completed" && previousStatus === "pending") {
        transaction.completedAt = new Date();
      } else if (status === "failed" || status === "reversed") {
        const wallet = await Wallets.findById(transaction.wallet).session(session);
        if (wallet) {
          const refundAmount = transaction.amount + (transaction.fee || 0);
          updateWalletBalance(wallet, transaction.currency, refundAmount);
          await wallet.save({ session });
        }
        transaction.failedReason = reason;
      }

      transaction.status = status;
      transaction.updatedAt = new Date();
      transaction.meta = {
        ...(transaction.meta || {}),
        statusChangedBy: adminId,
        statusChangeReason: reason,
      };

      await transaction.save({ session });
      await session.commitTransaction();

      const userId = transaction.initiatedBy?.toString() || "";
      if (userId) {
        await invalidateTransactionCache(userId);

        await cacheTransaction(transaction._id.toString(), {
          id: transaction._id,
          referenceNumber: transaction.referenceNumber,
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          updatedAt: transaction.updatedAt,
        });

        const eventType =
          status === "completed"
            ? WS_EVENTS.TRANSACTION_COMPLETED
            : status === "failed"
              ? WS_EVENTS.TRANSACTION_FAILED
              : WS_EVENTS.TRANSACTION_PENDING;

        emitToUser(userId, eventType, {
          transactionId: transaction._id.toString(),
          referenceNumber: transaction.referenceNumber,
          type: transaction.type,
          amount: transaction.amount,
          status,
          previousStatus,
          reason,
          timestamp: new Date().toISOString(),
        });

        if (status === "failed" || status === "reversed") {
          emitToUser(userId, WS_EVENTS.BALANCE_UPDATED, {
            currency: transaction.currency,
            message: `Refund processed for ${transaction.type} transaction`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      return transaction;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

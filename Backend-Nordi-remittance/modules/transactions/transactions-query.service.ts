import mongoose from "mongoose";
import Transactions from "./transactions.model.js";
import Users from "../users/users.model.js";
import { NotFoundError } from "../../core/errors/AppError.js";
import {
  cacheTransaction,
  getCachedTransaction,
  cacheUserTransactions,
  getCachedUserTransactions,
} from "../../services/redis.service.js";

export class TransactionsQueryService {
  static async getTransactions(userId: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const hasFilters =
      query.type ||
      query.status ||
      query.startDate ||
      query.endDate ||
      query.minAmount ||
      query.maxAmount ||
      query.reference;

    if (page === 1 && !hasFilters) {
      const cachedTransactions = await getCachedUserTransactions(userId);
      if (cachedTransactions && cachedTransactions.length > 0) {
        const total = cachedTransactions.length;
        const paginatedTx = cachedTransactions.slice(0, limit);
        return {
          transactions: paginatedTx,
          page,
          limit,
          total,
          cached: true,
        };
      }
    }

    const filter: Record<string, any> = {
      initiatedBy: userId,
    };

    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate as string);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate as string);
    }

    if (query.minAmount || query.maxAmount) {
      filter.amount = {};
      if (query.minAmount) filter.amount.$gte = parseFloat(query.minAmount as string);
      if (query.maxAmount) filter.amount.$lte = parseFloat(query.maxAmount as string);
    }

    if (query.reference) {
      const sanitized = (query.reference as string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.referenceNumber = new RegExp(`^${sanitized}`, "i");
    }

    const [transactions, total] = await Promise.all([
      Transactions.find(filter)
        .select(
          "type category amount currency status referenceNumber initiatedBy recipientName createdAt completedAt fee isInternational channel description",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transactions.countDocuments(filter),
    ]);

    const transactionsWithDirection = transactions.map((tx) => ({
      ...tx,
      direction: tx.type === "deposit" ? "in" : tx.type === "withdrawal" ? "out" : "out",
    }));

    if (page === 1 && !hasFilters) {
      await cacheUserTransactions(userId, transactionsWithDirection);
    }

    return {
      transactions: transactionsWithDirection,
      page,
      limit,
      total,
      cached: false,
    };
  }

  static async getTransactionById(userId: string, id: string) {
    const idStr = Array.isArray(id) ? id[0] : id;

    const cachedTx = await getCachedTransaction(idStr);
    if (cachedTx) {
      return {
        ...cachedTx,
        direction: cachedTx.type === "deposit" ? "in" : "out",
      };
    }

    const transaction = await Transactions.findOne({
      $or: [
        {
          _id: mongoose.Types.ObjectId.isValid(idStr)
            ? new mongoose.Types.ObjectId(idStr)
            : undefined,
        },
        { referenceNumber: idStr },
      ],
      initiatedBy: userId,
    }).lean();

    if (!transaction) throw new NotFoundError("Transaction not found");

    const sender = transaction.initiatedBy
      ? await Users.findById(transaction.initiatedBy)
          .select("firstName lastName accountNumber")
          .lean()
      : null;

    const transactionData = {
      ...transaction,
      sender: sender
        ? {
            name: `${sender.firstName} ${sender.lastName}`,
            accountNumber: sender.accountNumber,
          }
        : null,
      direction: transaction.type === "deposit" ? "in" : "out",
    };

    await cacheTransaction(idStr, transactionData);
    return transactionData;
  }

  static async getTransactionByReference(userId: string, reference: string) {
    const transaction = await Transactions.findOne({
      referenceNumber: reference,
      initiatedBy: userId,
    })
      .select(
        "type category amount currency status referenceNumber initiatedBy recipientWallet recipientName recipientAccountNumber recipientBankName exchangeRate fee feeCurrency createdAt completedAt failedReason reversalReason isInternational channel description meta",
      )
      .lean();

    if (!transaction) throw new NotFoundError("Transaction not found");
    return transaction;
  }

  static async getTransactionStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const [todayStats, monthStats, yearStats, byType] = await Promise.all([
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: today },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalSent: {
              $sum: {
                $cond: [{ $in: ["$type", ["transfer", "withdrawal", "payment"]] }, "$amount", 0],
              },
            },
            totalReceived: {
              $sum: {
                $cond: [{ $in: ["$type", ["deposit", "refund"]] }, "$amount", 0],
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: firstDayOfMonth },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalSent: {
              $sum: {
                $cond: [{ $in: ["$type", ["transfer", "withdrawal", "payment"]] }, "$amount", 0],
              },
            },
            totalReceived: {
              $sum: {
                $cond: [{ $in: ["$type", ["deposit", "refund"]] }, "$amount", 0],
              },
            },
            count: { $sum: 1 },
            fees: { $sum: "$fee" },
          },
        },
      ]),
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: firstDayOfYear },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalSent: {
              $sum: {
                $cond: [{ $in: ["$type", ["transfer", "withdrawal", "payment"]] }, "$amount", 0],
              },
            },
            totalReceived: {
              $sum: {
                $cond: [{ $in: ["$type", ["deposit", "refund"]] }, "$amount", 0],
              },
            },
            count: { $sum: 1 },
            fees: { $sum: "$fee" },
          },
        },
      ]),
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: new mongoose.Types.ObjectId(userId),
            status: "completed",
          },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    return {
      today: todayStats[0] || { totalSent: 0, totalReceived: 0, count: 0 },
      month: monthStats[0] || {
        totalSent: 0,
        totalReceived: 0,
        count: 0,
        fees: 0,
      },
      year: yearStats[0] || {
        totalSent: 0,
        totalReceived: 0,
        count: 0,
        fees: 0,
      },
      byType: byType.reduce(
        (acc, item) => {
          acc[item._id] = { count: item.count, totalAmount: item.totalAmount };
          return acc;
        },
        {} as Record<string, any>,
      ),
    };
  }
}

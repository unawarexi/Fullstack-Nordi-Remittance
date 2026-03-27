// ============================================================================
// TRANSACTION CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import type { AuthenticatedRequest, TransactionType } from "../types/index.js";
import { TransactionStatus } from "../types/index.js";
import type { TransactionData } from "../types/Mail.types.js";
import Transactions from "../models/TransactionModel.js";
import { Wallets, LedgerEntries } from "../models/AccountsModel.js";
import Users from "../models/UserModel.js";
import { FraudSignals } from "../models/FraudSecurityModel.js";
import { Notifications } from "../models/NotificationModel.js";
import {
  generateReferenceNumber,
  generateUUID,
} from "../core/helpers/generator.js";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNotFound,
} from "../core/helpers/response.helper.js";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  InsufficientBalanceError,
  TransactionFailedError,
} from "../core/errors/AppError.js";
import { constants, HttpStatus } from "../config/env.config.js";
import { validateUserEligibility } from "../core/guards/user-eligibility.guard.js";
import { sendTemplatedMail } from "../services/mailer.service.js";
import EmailContentGenerator from "../core/mail/Mail-content.js";
import { emitToUser, broadcast } from "../services/websocket.service.js";
import {
  cacheTransaction,
  getCachedTransaction,
  cacheUserTransactions,
  getCachedUserTransactions,
  invalidateTransactionCache,
  invalidateUserCache,
  cacheUserWallets,
  incrementUnreadCount,
  withLock,
  CACHE_KEYS,
  CACHE_TTL,
} from "../services/redis.service.js";
import { onTransactionWrite } from "../services/query-cache.service.js";
import { getKafkaService, KafkaTopics } from "../services/kafka.service.js";

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================
const WS_EVENTS = {
  TRANSACTION_PENDING: "transaction:pending",
  TRANSACTION_COMPLETED: "transaction:completed",
  TRANSACTION_FAILED: "transaction:failed",
  TRANSACTION_CANCELLED: "transaction:cancelled",
  BALANCE_UPDATED: "wallet:balance_updated",
  MONEY_RECEIVED: "transaction:received",
  MONEY_SENT: "transaction:sent",
  DEPOSIT_COMPLETED: "transaction:deposit_completed",
  WITHDRAWAL_INITIATED: "transaction:withdrawal_initiated",
  WITHDRAWAL_COMPLETED: "transaction:withdrawal_completed",
};

// Helper to get balance from wallet for a specific currency
const getWalletBalance = (wallet: any, currency: string): number => {
  return wallet.balances?.get(currency) || 0;
};

// Helper to update wallet balance for a specific currency
const updateWalletBalance = (
  wallet: any,
  currency: string,
  amount: number,
): void => {
  const currentBalance = wallet.balances?.get(currency) || 0;
  wallet.balances.set(currency, currentBalance + amount);
};

// Initialize email content generator
const emailGenerator = new EmailContentGenerator();

// ============================================================================
// INTERNAL TRANSFER (WALLET TO WALLET)
// ============================================================================

/**
 * Transfer to another user's wallet
 * POST /transactions/transfer
 */
export async function internalTransfer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Validate sender eligibility (KYC approved, account active & unlocked)
    await validateUserEligibility(req.user.userId, "transfer");

    const {
      recipientAccountNumber,
      recipientEmail,
      amount,
      currency,
      description,
      pin,
    } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new ValidationError("Invalid transfer amount");
    }

    // Get sender
    const sender: any = await Users.findById(req.user.userId).session(session);
    if (!sender) {
      throw new NotFoundError("Sender not found");
    }

    // Get sender's wallet
    const senderWallet: any = await Wallets.findOne({
      user: String(sender._id),
      status: "active",
    }).session(session);

    if (!senderWallet) {
      throw new NotFoundError("Sender wallet not found");
    }

    // Check balance - get balance for specific currency or default
    const transferCurrency = currency || "USD";
    const senderBalance = getWalletBalance(senderWallet, transferCurrency);
    if (senderBalance < amount) {
      throw new InsufficientBalanceError(amount, senderBalance);
    }

    // Find recipient
    const recipientQuery: Record<string, any> = {};
    if (recipientAccountNumber) {
      recipientQuery.accountNumber = recipientAccountNumber;
    } else if (recipientEmail) {
      recipientQuery.email = recipientEmail.toLowerCase();
    } else {
      throw new ValidationError(
        "Recipient account number or email is required",
      );
    }

    const recipient: any = await Users.findOne(recipientQuery).session(session);
    if (!recipient) {
      throw new NotFoundError("Recipient not found");
    }

    // Validate recipient eligibility (KYC approved, account active & unlocked)
    await validateUserEligibility(String(recipient._id), "receive transfer");

    // Prevent self-transfer
    if (recipient._id.toString() === sender._id.toString()) {
      throw new ValidationError("Cannot transfer to yourself");
    }

    // Get recipient's wallet
    let recipientWallet: any = await Wallets.findOne({
      user: String(recipient._id),
      status: "active",
    }).session(session);

    // Create wallet if not exists
    if (!recipientWallet) {
      recipientWallet = new Wallets({
        user: String(recipient._id),
        walletNumber: `W${Date.now()}${Math.random().toString(36).substring(7)}`,
        balances: new Map([[transferCurrency, 0]]),
        status: "active",
        walletType: "personal",
        isPrimary: false,
      });
      await recipientWallet.save({ session });
    }

    // Generate reference number
    const reference = generateReferenceNumber();
    const transactionId = generateUUID();

    // Calculate fee (example: 0.5% with minimum 0.50)
    const feeRate = 0.005;
    const minimumFee = 0.5;
    const calculatedFee = Math.max(amount * feeRate, minimumFee);
    const fee = Math.round(calculatedFee * 100) / 100;

    // Create transaction record
    const transaction = new Transactions({
      wallet: senderWallet._id,
      referenceNumber: reference,
      type: "transfer",
      category: "bankAccounts",
      initiatedBy: sender._id,
      recipientWallet: recipientWallet._id,
      recipientAccountNumber: recipient.accountNumber,
      recipientName: `${recipient.firstName} ${recipient.lastName}`,
      amount,
      currency: transferCurrency,
      fee,
      status: "pending",
      description:
        description ||
        `Transfer to ${recipient.firstName} ${recipient.lastName}`,
      channel: "web",
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers["user-agent"] as string,
      meta: {
        senderName: `${sender.firstName} ${sender.lastName}`,
        senderAccountNumber: sender.accountNumber,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        recipientAccountNumber: recipient.accountNumber,
      },
    });

    await transaction.save({ session });

    // Kafka Event - Transaction Initiated
    const kafkaService = await getKafkaService();
    await kafkaService.publish(KafkaTopics.TRANSACTION_INITIATED, {
      transactionId: transaction._id.toString(),
      reference: transaction.referenceNumber,
      userId: sender._id.toString(),
      recipientId: recipient._id.toString(),
      amount: transaction.amount,
      currency: transaction.currency,
      type: "transfer",
      timestamp: new Date().toISOString(),
    });

    // Debit sender - get balance before update
    const senderBalanceBefore = getWalletBalance(
      senderWallet,
      transferCurrency,
    );
    updateWalletBalance(senderWallet, transferCurrency, -(amount + fee));
    senderWallet.updatedAt = new Date();
    senderWallet.lastTransactionAt = new Date();
    await senderWallet.save({ session });
    const senderBalanceAfter = getWalletBalance(senderWallet, transferCurrency);

    // Create debit ledger entry
    await LedgerEntries.create(
      [
        {
          wallet: senderWallet._id,
          transaction: transaction._id,
          entryType: "debit",
          amount: amount + fee,
          currency: transferCurrency,
          balance: senderBalanceAfter,
          description: `Transfer to ${recipient.accountNumber}`,
          accountingDate: new Date(),
        },
      ],
      { session },
    );

    // Credit recipient - get balance before update
    const recipientBalanceBefore = getWalletBalance(
      recipientWallet,
      transferCurrency,
    );
    updateWalletBalance(recipientWallet, transferCurrency, amount);
    recipientWallet.updatedAt = new Date();
    recipientWallet.lastTransactionAt = new Date();
    await recipientWallet.save({ session });
    const recipientBalanceAfter = getWalletBalance(
      recipientWallet,
      transferCurrency,
    );

    // Create credit ledger entry
    await LedgerEntries.create(
      [
        {
          wallet: recipientWallet._id,
          transaction: transaction._id,
          entryType: "credit",
          amount,
          currency: transferCurrency,
          balance: recipientBalanceAfter,
          description: `Transfer from ${sender.accountNumber}`,
          accountingDate: new Date(),
        },
      ],
      { session },
    );

    // Update transaction status
    transaction.status = "completed";
    transaction.completedAt = new Date();
    await transaction.save({ session });

    await session.commitTransaction();

    // Invalidate Redis caches for both users
    await Promise.all([
      invalidateTransactionCache(sender._id.toString()),
      invalidateTransactionCache(recipient._id.toString()),
      cacheUserWallets(sender._id.toString(), [senderWallet]),
      cacheUserWallets(recipient._id.toString(), [recipientWallet]),
    ]);

    // Cache the completed transaction
    await cacheTransaction(transaction._id.toString(), {
      id: transaction._id,
      referenceNumber: transaction.referenceNumber,
      type: transaction.type,
      amount: transaction.amount,
      fee: transaction.fee,
      currency: transaction.currency,
      status: transaction.status,
      createdAt: transaction.createdAt,
      completedAt: transaction.completedAt,
    });

    // Send notifications (non-blocking)
    Promise.all([
      // Email to sender using template
      (async () => {
        const senderEmailData: TransactionData = {
          userName: `${sender.firstName} ${sender.lastName}`,
          type: "transfer",
          amount: String(amount),
          currency: transferCurrency,
          referenceNumber: reference,
          status: "completed",
          transactionId: transaction._id.toString(),
          newBalance: String(senderBalanceAfter),
          accountNumber: String(sender.accountNumber || ""),
          createdAt: new Date().toISOString(),
        };
        const senderEmailContent =
          emailGenerator.transactionNotification(senderEmailData);
        await sendTemplatedMail(String(sender.email), senderEmailContent);
      })(),
      // Email to recipient using template
      (async () => {
        const recipientEmailData: TransactionData = {
          userName: `${recipient.firstName} ${recipient.lastName}`,
          type: "transfer",
          amount: String(amount),
          currency: transferCurrency,
          referenceNumber: reference,
          status: "completed",
          transactionId: transaction._id.toString(),
          newBalance: String(recipientBalanceAfter),
          accountNumber: String(recipient.accountNumber || ""),
          createdAt: new Date().toISOString(),
        };
        const recipientEmailContent =
          emailGenerator.transactionNotification(recipientEmailData);
        await sendTemplatedMail(String(recipient.email), recipientEmailContent);
      })(),
      // Create notifications
      Notifications.insertMany([
        {
          userId: sender._id,
          type: "transaction",
          title: "Transfer Successful",
          message: `Your transfer of ${amount} ${transferCurrency} to ${recipient.firstName} was successful.`,
          data: { transactionId: transaction._id, reference },
          read: false,
          createdAt: new Date(),
        },
        {
          userId: recipient._id,
          type: "transaction",
          title: "Money Received",
          message: `You received ${amount} ${transferCurrency} from ${sender.firstName}.`,
          data: { transactionId: transaction._id, reference },
          read: false,
          createdAt: new Date(),
        },
      ]),
      // Increment unread notification count in Redis
      incrementUnreadCount(sender._id.toString()),
      incrementUnreadCount(recipient._id.toString()),
      // WebSocket notifications - Enhanced with proper events
      emitToUser(sender._id.toString(), WS_EVENTS.MONEY_SENT, {
        type: "debit",
        transactionId: transaction._id.toString(),
        amount,
        currency: transferCurrency,
        reference,
        recipient: `${recipient.firstName} ${recipient.lastName}`,
        newBalance: senderBalanceAfter,
        timestamp: new Date().toISOString(),
      }),
      emitToUser(sender._id.toString(), WS_EVENTS.BALANCE_UPDATED, {
        currency: transferCurrency,
        balance: senderBalanceAfter,
        timestamp: new Date().toISOString(),
      }),
      emitToUser(recipient._id.toString(), WS_EVENTS.MONEY_RECEIVED, {
        type: "credit",
        transactionId: transaction._id.toString(),
        amount,
        currency: transferCurrency,
        reference,
        sender: `${sender.firstName} ${sender.lastName}`,
        newBalance: recipientBalanceAfter,
        timestamp: new Date().toISOString(),
      }),
      emitToUser(recipient._id.toString(), WS_EVENTS.BALANCE_UPDATED, {
        currency: transferCurrency,
        balance: recipientBalanceAfter,
        timestamp: new Date().toISOString(),
      }),
    ]).catch((err) => console.error("Notification error:", err));

    sendCreated(
      res,
      {
        transaction: {
          id: transaction._id,
          referenceNumber: transaction.referenceNumber,
          type: transaction.type,
          amount: transaction.amount,
          fee: transaction.fee,
          currency: transaction.currency,
          status: transaction.status,
          recipient: {
            name: `${recipient.firstName} ${recipient.lastName}`,
            accountNumber: recipient.accountNumber,
          },
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        },
        newBalance: senderBalanceAfter,
      },
      "Transfer successful",
    );

    // Invalidate dashboard/stats caches after successful transfer
    onTransactionWrite(req.user.userId.toString()).catch(() => {});

    // Kafka Event - Transaction Completed
    await kafkaService.publish(KafkaTopics.TRANSACTION_COMPLETED, {
      transactionId: transaction._id.toString(),
      reference: transaction.referenceNumber,
      status: "completed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// DEPOSIT
// ============================================================================

/**
 * Deposit funds (simulated - in production integrate with payment gateway)
 * POST /transactions/deposit
 */
export async function deposit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Validate user eligibility (KYC approved, account active & unlocked)
    await validateUserEligibility(req.user.userId, "deposit");

    const { amount, currency, paymentMethod, paymentReference } = req.body;

    if (!amount || amount <= 0) {
      throw new ValidationError("Invalid deposit amount");
    }

    const user: any = await Users.findById(req.user.userId).session(session);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get or create wallet
    const depositCurrency = currency || "USD";
    let wallet: any = await Wallets.findOne({
      user: String(user._id),
      status: "active",
    }).session(session);

    if (!wallet) {
      wallet = new Wallets({
        user: String(user._id),
        walletNumber: `W${Date.now()}${Math.random().toString(36).substring(7)}`,
        balances: new Map([[depositCurrency, 0]]),
        status: "active",
        walletType: "personal",
        isPrimary: true,
      });
      await wallet.save({ session });
    }

    const reference = generateReferenceNumber();

    // In production, this would be pending until payment gateway confirms
    const transaction = new Transactions({
      wallet: wallet._id,
      referenceNumber: reference,
      type: "deposit",
      category: "bankAccounts",
      initiatedBy: user._id,
      amount,
      currency: depositCurrency,
      fee: 0,
      status: "completed", // In production: 'pending'
      description: `Deposit via ${paymentMethod || "bank transfer"}`,
      channel: "web",
      ipAddress: req.clientIp || req.ip,
      meta: {
        paymentMethod,
        paymentReference,
      },
      completedAt: new Date(),
    });

    await transaction.save({ session });

    // Kafka Event - Transaction Completed (Direct Deposit)
    const kafkaService = await getKafkaService();
    await kafkaService.publish(KafkaTopics.TRANSACTION_COMPLETED, {
      transactionId: transaction._id.toString(),
      reference: transaction.referenceNumber,
      userId: user._id.toString(),
      amount: transaction.amount,
      currency: transaction.currency,
      type: "deposit",
      status: "completed",
      timestamp: new Date().toISOString(),
    });

    // Credit wallet
    const balanceBefore = getWalletBalance(wallet, depositCurrency);
    updateWalletBalance(wallet, depositCurrency, amount);
    wallet.updatedAt = new Date();
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });
    const balanceAfter = getWalletBalance(wallet, depositCurrency);

    // Create ledger entry
    await LedgerEntries.create(
      [
        {
          wallet: wallet._id,
          transaction: transaction._id,
          entryType: "credit",
          amount,
          currency: depositCurrency,
          balance: balanceAfter,
          description: "Deposit",
          accountingDate: new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();

    // Invalidate Redis cache for user
    await Promise.all([
      invalidateTransactionCache(user._id.toString()),
      cacheUserWallets(user._id.toString(), [wallet]),
      cacheTransaction(transaction._id.toString(), {
        id: transaction._id,
        referenceNumber: transaction.referenceNumber,
        type: transaction.type,
        amount: transaction.amount,
        currency: depositCurrency,
        status: transaction.status,
        createdAt: transaction.createdAt,
      }),
    ]);

    // Notifications
    Promise.all([
      (async () => {
        const depositEmailData: TransactionData = {
          userName: `${user.firstName} ${user.lastName}`,
          type: "deposit",
          amount: String(amount),
          currency: depositCurrency,
          referenceNumber: reference,
          status: "completed",
          transactionId: transaction._id.toString(),
          newBalance: String(balanceAfter),
          accountNumber: String(user.accountNumber || ""),
          createdAt: new Date().toISOString(),
        };
        const depositEmailContent =
          emailGenerator.transactionNotification(depositEmailData);
        await sendTemplatedMail(String(user.email), depositEmailContent);
      })(),
      Notifications.create({
        userId: user._id,
        type: "transaction",
        title: "Deposit Successful",
        message: `Your deposit of ${amount} ${depositCurrency} was successful.`,
        data: { transactionId: transaction._id, reference },
        read: false,
        createdAt: new Date(),
      }),
      incrementUnreadCount(user._id.toString()),
      // WebSocket notifications
      emitToUser(user._id.toString(), WS_EVENTS.DEPOSIT_COMPLETED, {
        transactionId: transaction._id.toString(),
        amount,
        currency: depositCurrency,
        reference,
        newBalance: balanceAfter,
        timestamp: new Date().toISOString(),
      }),
      emitToUser(user._id.toString(), WS_EVENTS.BALANCE_UPDATED, {
        currency: depositCurrency,
        balance: balanceAfter,
        timestamp: new Date().toISOString(),
      }),
    ]).catch((err) => console.error("Notification error:", err));

    sendCreated(
      res,
      {
        transaction: {
          id: transaction._id,
          referenceNumber: transaction.referenceNumber,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          createdAt: transaction.createdAt,
        },
        newBalance: balanceAfter,
      },
      "Deposit successful",
    );

    // Invalidate dashboard/stats caches after successful deposit
    onTransactionWrite(req.user.userId.toString()).catch(() => {});
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// WITHDRAWAL
// ============================================================================

/**
 * Withdraw funds
 * POST /transactions/withdraw
 */
export async function withdraw(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Validate user eligibility (KYC approved, account active & unlocked)
    await validateUserEligibility(req.user.userId, "withdrawal");

    const {
      amount,
      currency,
      withdrawalMethod,
      bankAccount,
      bankName,
      accountName,
      routingNumber,
    } = req.body;

    if (!amount || amount <= 0) {
      throw new ValidationError("Invalid withdrawal amount");
    }

    const user: any = await Users.findById(req.user.userId).session(session);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const withdrawCurrency = currency || "USD";
    const wallet: any = await Wallets.findOne({
      user: String(user._id),
      status: "active",
    }).session(session);

    if (!wallet) {
      throw new NotFoundError("Wallet not found");
    }

    // Calculate fee
    const fee = Math.max(amount * 0.01, 1.0); // 1% or minimum $1
    const walletBalance = getWalletBalance(wallet, withdrawCurrency);

    if (walletBalance < amount + fee) {
      throw new InsufficientBalanceError(amount + fee, walletBalance);
    }

    const reference = generateReferenceNumber();

    const transaction = new Transactions({
      wallet: wallet._id,
      referenceNumber: reference,
      type: "withdrawal",
      category: "bankAccounts",
      initiatedBy: user._id,
      recipientAccountNumber: bankAccount
        ? `****${bankAccount.slice(-4)}`
        : undefined,
      recipientBankName: bankName,
      recipientName: accountName,
      amount,
      currency: withdrawCurrency,
      fee,
      status: "pending", // Withdrawals require processing
      description: `Withdrawal to ${bankName || "bank account"}`,
      channel: "web",
      ipAddress: req.clientIp || req.ip,
      meta: {
        withdrawalMethod,
        routingNumber: routingNumber ? `****${routingNumber.slice(-4)}` : null,
      },
    });

    await transaction.save({ session });

    // Kafka Event - Transaction Initiated (Withdrawal)
    const kafkaService = await getKafkaService();
    await kafkaService.publish(KafkaTopics.TRANSACTION_INITIATED, {
      transactionId: transaction._id.toString(),
      reference: transaction.referenceNumber,
      userId: user._id.toString(),
      amount: transaction.amount,
      currency: transaction.currency,
      type: "withdrawal",
      timestamp: new Date().toISOString(),
    });

    // Debit wallet (hold funds)
    const balanceBefore = getWalletBalance(wallet, withdrawCurrency);
    updateWalletBalance(wallet, withdrawCurrency, -(amount + fee));
    wallet.updatedAt = new Date();
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });
    const balanceAfter = getWalletBalance(wallet, withdrawCurrency);

    // Create ledger entry
    await LedgerEntries.create(
      [
        {
          wallet: wallet._id,
          transaction: transaction._id,
          entryType: "debit",
          amount: amount + fee,
          currency: withdrawCurrency,
          balance: balanceAfter,
          description: "Withdrawal (pending)",
          accountingDate: new Date(),
        },
      ],
      { session },
    );

    await session.commitTransaction();

    // Invalidate Redis cache for user
    await Promise.all([
      invalidateTransactionCache(user._id.toString()),
      cacheUserWallets(user._id.toString(), [wallet]),
      cacheTransaction(transaction._id.toString(), {
        id: transaction._id,
        referenceNumber: transaction.referenceNumber,
        type: transaction.type,
        amount: transaction.amount,
        fee: transaction.fee,
        currency: withdrawCurrency,
        status: transaction.status,
        createdAt: transaction.createdAt,
      }),
    ]);

    // Notifications
    Promise.all([
      (async () => {
        const withdrawalEmailData: TransactionData = {
          userName: `${user.firstName} ${user.lastName}`,
          type: "withdrawal",
          amount: String(amount),
          currency: withdrawCurrency,
          referenceNumber: reference,
          status: "pending",
          transactionId: transaction._id.toString(),
          newBalance: String(balanceAfter),
          accountNumber: String(user.accountNumber || ""),
          createdAt: new Date().toISOString(),
        };
        const withdrawalEmailContent =
          emailGenerator.transactionNotification(withdrawalEmailData);
        await sendTemplatedMail(String(user.email), withdrawalEmailContent);
      })(),
      Notifications.create({
        userId: user._id,
        type: "transaction",
        title: "Withdrawal Pending",
        message: `Your withdrawal of ${amount} ${withdrawCurrency} is being processed.`,
        data: { transactionId: transaction._id, reference },
        read: false,
        createdAt: new Date(),
      }),
      incrementUnreadCount(user._id.toString()),
      // WebSocket notifications
      emitToUser(user._id.toString(), WS_EVENTS.WITHDRAWAL_INITIATED, {
        transactionId: transaction._id.toString(),
        amount,
        fee,
        currency: withdrawCurrency,
        reference,
        newBalance: balanceAfter,
        estimatedCompletion: "1-3 business days",
        timestamp: new Date().toISOString(),
      }),
      emitToUser(user._id.toString(), WS_EVENTS.BALANCE_UPDATED, {
        currency: withdrawCurrency,
        balance: balanceAfter,
        timestamp: new Date().toISOString(),
      }),
    ]).catch((err) => console.error("Notification error:", err));

    sendCreated(res, {
      transaction: {
        id: transaction._id,
        referenceNumber: transaction.referenceNumber,
        type: transaction.type,
        amount: transaction.amount,
        fee: transaction.fee,
        currency: transaction.currency,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      newBalance: balanceAfter,
      message:
        "Withdrawal request submitted. Processing typically takes 1-3 business days.",
    });

    // Invalidate dashboard/stats caches after successful withdrawal
    onTransactionWrite(req.user.userId.toString()).catch(() => {});
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// GET TRANSACTIONS
// ============================================================================

/**
 * Get user's transactions
 * GET /transactions
 */
export async function getTransactions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const hasFilters =
      req.query.type ||
      req.query.status ||
      req.query.startDate ||
      req.query.endDate ||
      req.query.minAmount ||
      req.query.maxAmount ||
      req.query.reference;

    // Try Redis cache for first page without filters
    if (page === 1 && !hasFilters) {
      const cachedTransactions = await getCachedUserTransactions(
        req.user.userId,
      );
      if (cachedTransactions && cachedTransactions.length > 0) {
        const total = cachedTransactions.length;
        const paginatedTx = cachedTransactions.slice(0, limit);
        sendPaginated(
          res,
          paginatedTx,
          { page, limit, total },
          "Transactions retrieved successfully (cached)",
        );
        return;
      }
    }

    // Build filter
    const filter: Record<string, any> = {
      initiatedBy: req.user.userId,
    };

    // Type filter
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Amount range filter
    if (req.query.minAmount || req.query.maxAmount) {
      filter.amount = {};
      if (req.query.minAmount) {
        filter.amount.$gte = parseFloat(req.query.minAmount as string);
      }
      if (req.query.maxAmount) {
        filter.amount.$lte = parseFloat(req.query.maxAmount as string);
      }
    }

    // Search by reference — use exact match or prefix-anchored regex for index usage
    if (req.query.reference) {
      const sanitized = (req.query.reference as string).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
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

    // Add direction indicator
    const transactionsWithDirection = transactions.map((tx) => ({
      ...tx,
      direction:
        tx.type === "deposit" ? "in" : tx.type === "withdrawal" ? "out" : "out",
    }));

    // Cache first page without filters
    if (page === 1 && !hasFilters) {
      await cacheUserTransactions(req.user.userId, transactionsWithDirection);
    }

    sendPaginated(
      res,
      transactionsWithDirection,
      { page, limit, total },
      "Transactions retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get single transaction by ID
 * GET /transactions/:id
 */
export async function getTransactionById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    // Try Redis cache first
    const cachedTx = await getCachedTransaction(idStr);
    if (cachedTx) {
      sendSuccess(res, {
        transaction: {
          ...cachedTx,
          direction: cachedTx.type === "deposit" ? "in" : "out",
        },
      });
      return;
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
      initiatedBy: req.user.userId,
    }).lean();

    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    // Get sender details
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

    // Cache the transaction
    await cacheTransaction(idStr, transactionData);

    sendSuccess(res, { transaction: transactionData });
  } catch (error) {
    next(error);
  }
}

/**
 * Get transaction by reference
 * GET /transactions/reference/:reference
 */
export async function getTransactionByReference(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { reference } = req.params;

    const transaction = await Transactions.findOne({
      referenceNumber: reference,
      initiatedBy: req.user.userId,
    })
      .select(
        "type category amount currency status referenceNumber initiatedBy recipientWallet recipientName recipientAccountNumber recipientBankName exchangeRate fee feeCurrency createdAt completedAt failedReason reversalReason isInternational channel description meta",
      )
      .lean();

    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    sendSuccess(res, { transaction });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET TRANSACTION STATISTICS
// ============================================================================

/**
 * Get transaction statistics for user
 * GET /transactions/stats
 */
export async function getTransactionStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const [todayStats, monthStats, yearStats, byType] = await Promise.all([
      // Today's stats
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: req.user.userId,
            createdAt: { $gte: today },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalSent: {
              $sum: {
                $cond: [
                  { $in: ["$type", ["transfer", "withdrawal", "payment"]] },
                  "$amount",
                  0,
                ],
              },
            },
            totalReceived: {
              $sum: {
                $cond: [
                  { $in: ["$type", ["deposit", "refund"]] },
                  "$amount",
                  0,
                ],
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // Month stats
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: req.user.userId,
            createdAt: { $gte: firstDayOfMonth },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalSent: {
              $sum: {
                $cond: [
                  { $in: ["$type", ["transfer", "withdrawal", "payment"]] },
                  "$amount",
                  0,
                ],
              },
            },
            totalReceived: {
              $sum: {
                $cond: [
                  { $in: ["$type", ["deposit", "refund"]] },
                  "$amount",
                  0,
                ],
              },
            },
            count: { $sum: 1 },
            fees: { $sum: "$fee" },
          },
        },
      ]),

      // Year stats
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: req.user.userId,
            createdAt: { $gte: firstDayOfYear },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalSent: {
              $sum: {
                $cond: [
                  { $in: ["$type", ["transfer", "withdrawal", "payment"]] },
                  "$amount",
                  0,
                ],
              },
            },
            totalReceived: {
              $sum: {
                $cond: [
                  { $in: ["$type", ["deposit", "refund"]] },
                  "$amount",
                  0,
                ],
              },
            },
            count: { $sum: 1 },
            fees: { $sum: "$fee" },
          },
        },
      ]),

      // By type
      Transactions.aggregate([
        {
          $match: {
            initiatedBy: req.user.userId,
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

    sendSuccess(res, {
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
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CANCEL PENDING TRANSACTION
// ============================================================================

/**
 * Cancel a pending transaction
 * POST /transactions/:id/cancel
 */
export async function cancelTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;
    const { reason } = req.body;

    const transaction = await Transactions.findOne({
      _id: id,
      initiatedBy: req.user.userId,
      status: "pending",
    }).session(session);

    if (!transaction) {
      throw new NotFoundError("Pending transaction not found");
    }

    // Refund to wallet
    const wallet = await Wallets.findById(transaction.wallet).session(session);
    const refundAmount = transaction.amount + (transaction.fee || 0);
    let newBalance = 0;

    if (wallet) {
      updateWalletBalance(wallet, transaction.currency, refundAmount);
      wallet.updatedAt = new Date();
      await wallet.save({ session });
      newBalance = getWalletBalance(wallet, transaction.currency);

      // Create refund ledger entry
      await LedgerEntries.create(
        [
          {
            wallet: wallet._id,
            transaction: transaction._id,
            entryType: "credit",
            amount: refundAmount,
            currency: transaction.currency,
            balance: newBalance,
            description: "Transaction cancelled - refund",
            accountingDate: new Date(),
          },
        ],
        { session },
      );
    }

    // Update transaction
    transaction.status = "cancelled";
    transaction.updatedAt = new Date();
    transaction.meta = {
      ...(transaction.meta || {}),
      cancelledAt: new Date(),
      cancellationReason: reason,
    };
    await transaction.save({ session });

    await session.commitTransaction();

    // Invalidate Redis cache
    await Promise.all([
      invalidateTransactionCache(req.user.userId.toString()),
      cacheTransaction(transaction._id.toString(), {
        id: transaction._id,
        referenceNumber: transaction.referenceNumber,
        type: transaction.type,
        amount: transaction.amount,
        status: "cancelled",
        cancelledAt: new Date(),
      }),
    ]);

    // WebSocket notification for cancellation
    emitToUser(req.user.userId.toString(), WS_EVENTS.TRANSACTION_CANCELLED, {
      transactionId: transaction._id.toString(),
      referenceNumber: transaction.referenceNumber,
      refundedAmount: refundAmount,
      newBalance,
      currency: transaction.currency,
      reason,
      timestamp: new Date().toISOString(),
    });

    if (wallet) {
      emitToUser(req.user.userId.toString(), WS_EVENTS.BALANCE_UPDATED, {
        currency: transaction.currency,
        balance: newBalance,
        timestamp: new Date().toISOString(),
      });
    }

    sendSuccess(
      res,
      {
        transaction: {
          id: transaction._id,
          referenceNumber: transaction.referenceNumber,
          status: transaction.status,
        },
        refundedAmount: refundAmount,
        newBalance,
      },
      "Transaction cancelled successfully",
    );

    // Invalidate dashboard/stats caches after cancellation
    onTransactionWrite(req.user.userId.toString()).catch(() => {});
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// ADMIN: GET ALL TRANSACTIONS
// ============================================================================

/**
 * Get all transactions (admin)
 * GET /transactions/admin/all
 */
export async function getAllTransactions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.userId) {
      filter.initiatedBy = req.query.userId;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate)
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      if (req.query.endDate)
        filter.createdAt.$lte = new Date(req.query.endDate as string);
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

    sendPaginated(res, transactions, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

/**
 * Update transaction status (admin)
 * PATCH /transactions/admin/:id/status
 */
export async function updateTransactionStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;
    const { status, reason } = req.body;

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

    const transaction = await Transactions.findById(id).session(session);
    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    const previousStatus = transaction.status;

    // Handle status transitions
    if (status === "completed" && previousStatus === "pending") {
      transaction.completedAt = new Date();
    } else if (status === "failed" || status === "reversed") {
      // Refund for failed/reversed
      const wallet = await Wallets.findById(transaction.wallet).session(
        session,
      );
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
      statusChangedBy: req.user.userId,
      statusChangeReason: reason,
    };

    await transaction.save({ session });
    await session.commitTransaction();

    // Invalidate Redis cache for transaction owner
    const userId = transaction.initiatedBy?.toString() || "";
    if (userId) {
      await invalidateTransactionCache(userId);

      // Update cached transaction
      await cacheTransaction(transaction._id.toString(), {
        id: transaction._id,
        referenceNumber: transaction.referenceNumber,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        updatedAt: transaction.updatedAt,
      });

      // WebSocket notification to transaction owner
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

      // If failed/reversed, notify about refund
      if (status === "failed" || status === "reversed") {
        emitToUser(userId, WS_EVENTS.BALANCE_UPDATED, {
          currency: transaction.currency,
          message: `Refund processed for ${transaction.type} transaction`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    sendSuccess(
      res,
      { transaction },
      `Transaction status updated to ${status}`,
    );

    // Invalidate dashboard/stats caches after admin status update
    if (userId) onTransactionWrite(userId).catch(() => {});

    // Kafka Event - Transaction Status Updated
    const kafkaService = await getKafkaService();
    const topic = status === "completed" ? KafkaTopics.TRANSACTION_COMPLETED : KafkaTopics.TRANSACTION_FAILED;
    await kafkaService.publish(topic, {
      transactionId: transaction._id.toString(),
      reference: transaction.referenceNumber,
      status,
      reason,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  internalTransfer,
  deposit,
  withdraw,
  getTransactions,
  getTransactionById,
  getTransactionByReference,
  getTransactionStats,
  cancelTransaction,
  getAllTransactions,
  updateTransactionStatus,
};

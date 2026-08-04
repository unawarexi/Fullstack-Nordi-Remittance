import mongoose from "mongoose";
import type { TransactionData } from "../../types/Mail.types.js";
import Transactions from "./transactions.model.js";
import { Wallets, LedgerEntries } from "../accounts/accounts.model.js";
import Users from "../users/users.model.js";
import { Notifications } from "../notifications/notifications.model.js";
import {
  generateReferenceNumber,
  generateUUID,
} from "../../core/helpers/generator.js";
import {
  ValidationError,
  NotFoundError,
  InsufficientBalanceError,
} from "../../core/errors/AppError.js";
import { validateUserEligibility } from "../../core/guards/user-eligibility.guard.js";
import { queueTemplatedMail } from "../../services/workers.js";
import EmailContentGenerator from "../../core/mail/Mail-content.js";
import { emitToUser } from "../../services/websocket.service.js";
import {
  cacheTransaction,
  invalidateTransactionCache,
  cacheUserWallets,
  incrementUnreadCount,
} from "../../services/redis.service.js";
import { onTransactionWrite } from "../../services/query-cache.service.js";
import { getKafkaService, KafkaTopics } from "../../services/kafka.service.js";
import { WS_EVENTS, getWalletBalance, updateWalletBalance } from "./transactions.helpers.js";

const emailGenerator = new EmailContentGenerator();

export class TransactionsTransferService {
  static async internalTransfer(userId: string, body: any, ip: string, userAgent: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await validateUserEligibility(userId, "transfer");

      const {
        recipientAccountNumber,
        recipientEmail,
        amount,
        currency,
        description,
      } = body;

      if (!amount || amount <= 0) {
        throw new ValidationError("Invalid transfer amount");
      }

      const sender: any = await Users.findById(userId).session(session);
      if (!sender) throw new NotFoundError("Sender not found");

      const senderWallet: any = await Wallets.findOne({
        user: String(sender._id),
        status: "active",
      }).session(session);

      if (!senderWallet) throw new NotFoundError("Sender wallet not found");

      const transferCurrency = currency || "USD";
      const senderBalance = getWalletBalance(senderWallet, transferCurrency);
      if (senderBalance < amount) {
        throw new InsufficientBalanceError(amount, senderBalance);
      }

      const recipientQuery: Record<string, any> = {};
      if (recipientAccountNumber) {
        recipientQuery.accountNumber = recipientAccountNumber;
      } else if (recipientEmail) {
        recipientQuery.email = recipientEmail.toLowerCase();
      } else {
        throw new ValidationError("Recipient account number or email is required");
      }

      const recipient: any = await Users.findOne(recipientQuery).session(session);
      if (!recipient) throw new NotFoundError("Recipient not found");

      await validateUserEligibility(String(recipient._id), "receive transfer");

      if (recipient._id.toString() === sender._id.toString()) {
        throw new ValidationError("Cannot transfer to yourself");
      }

      let recipientWallet: any = await Wallets.findOne({
        user: String(recipient._id),
        status: "active",
      }).session(session);

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

      const reference = generateReferenceNumber();
      const feeRate = 0.005;
      const minimumFee = 0.5;
      const calculatedFee = Math.max(amount * feeRate, minimumFee);
      const fee = Math.round(calculatedFee * 100) / 100;

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
        description: description || `Transfer to ${recipient.firstName} ${recipient.lastName}`,
        channel: "web",
        ipAddress: ip,
        userAgent,
        meta: {
          senderName: `${sender.firstName} ${sender.lastName}`,
          senderAccountNumber: sender.accountNumber,
          recipientName: `${recipient.firstName} ${recipient.lastName}`,
          recipientAccountNumber: recipient.accountNumber,
        },
      });

      await transaction.save({ session });

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

      updateWalletBalance(senderWallet, transferCurrency, -(amount + fee));
      senderWallet.updatedAt = new Date();
      senderWallet.lastTransactionAt = new Date();
      await senderWallet.save({ session });
      const senderBalanceAfter = getWalletBalance(senderWallet, transferCurrency);

      await LedgerEntries.create(
        [{
          wallet: senderWallet._id,
          transaction: transaction._id,
          entryType: "debit",
          amount: amount + fee,
          currency: transferCurrency,
          balance: senderBalanceAfter,
          description: `Transfer to ${recipient.accountNumber}`,
          accountingDate: new Date(),
        }],
        { session }
      );

      updateWalletBalance(recipientWallet, transferCurrency, amount);
      recipientWallet.updatedAt = new Date();
      recipientWallet.lastTransactionAt = new Date();
      await recipientWallet.save({ session });
      const recipientBalanceAfter = getWalletBalance(recipientWallet, transferCurrency);

      await LedgerEntries.create(
        [{
          wallet: recipientWallet._id,
          transaction: transaction._id,
          entryType: "credit",
          amount,
          currency: transferCurrency,
          balance: recipientBalanceAfter,
          description: `Transfer from ${sender.accountNumber}`,
          accountingDate: new Date(),
        }],
        { session }
      );

      transaction.status = "completed";
      transaction.completedAt = new Date();
      await transaction.save({ session });

      await session.commitTransaction();

      await Promise.all([
        invalidateTransactionCache(sender._id.toString()),
        invalidateTransactionCache(recipient._id.toString()),
        cacheUserWallets(sender._id.toString(), [senderWallet]),
        cacheUserWallets(recipient._id.toString(), [recipientWallet]),
        cacheTransaction(transaction._id.toString(), {
          id: transaction._id,
          referenceNumber: transaction.referenceNumber,
          type: transaction.type,
          amount: transaction.amount,
          fee: transaction.fee,
          currency: transaction.currency,
          status: transaction.status,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        }),
      ]);

      Promise.all([
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
          const senderEmailContent = emailGenerator.transactionNotification(senderEmailData);
          await queueTemplatedMail(String(sender.email), senderEmailContent);
        })(),
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
          const recipientEmailContent = emailGenerator.transactionNotification(recipientEmailData);
          await queueTemplatedMail(String(recipient.email), recipientEmailContent);
        })(),
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
        incrementUnreadCount(sender._id.toString()),
        incrementUnreadCount(recipient._id.toString()),
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

      onTransactionWrite(userId).catch(() => {});

      await kafkaService.publish(KafkaTopics.TRANSACTION_COMPLETED, {
        transactionId: transaction._id.toString(),
        reference: transaction.referenceNumber,
        status: "completed",
        timestamp: new Date().toISOString(),
      });

      return {
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
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async deposit(userId: string, body: any, ip: string, userAgent: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await validateUserEligibility(userId, "deposit");

      const { amount, currency, paymentMethod, paymentReference } = body;

      if (!amount || amount <= 0) {
        throw new ValidationError("Invalid deposit amount");
      }

      const user: any = await Users.findById(userId).session(session);
      if (!user) throw new NotFoundError("User not found");

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

      const transaction = new Transactions({
        wallet: wallet._id,
        referenceNumber: reference,
        type: "deposit",
        category: "bankAccounts",
        initiatedBy: user._id,
        amount,
        currency: depositCurrency,
        fee: 0,
        status: "completed",
        description: `Deposit via ${paymentMethod || "bank transfer"}`,
        channel: "web",
        ipAddress: ip,
        meta: { paymentMethod, paymentReference },
        completedAt: new Date(),
      });

      await transaction.save({ session });

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

      updateWalletBalance(wallet, depositCurrency, amount);
      wallet.updatedAt = new Date();
      wallet.lastTransactionAt = new Date();
      await wallet.save({ session });
      const balanceAfter = getWalletBalance(wallet, depositCurrency);

      await LedgerEntries.create(
        [{
          wallet: wallet._id,
          transaction: transaction._id,
          entryType: "credit",
          amount,
          currency: depositCurrency,
          balance: balanceAfter,
          description: "Deposit",
          accountingDate: new Date(),
        }],
        { session }
      );

      await session.commitTransaction();

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
          const depositEmailContent = emailGenerator.transactionNotification(depositEmailData);
          await queueTemplatedMail(String(user.email), depositEmailContent);
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

      onTransactionWrite(userId).catch(() => {});

      return {
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
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async withdraw(userId: string, body: any, ip: string, userAgent: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await validateUserEligibility(userId, "withdrawal");

      const {
        amount,
        currency,
        withdrawalMethod,
        bankAccount,
        bankName,
        accountName,
        routingNumber,
      } = body;

      if (!amount || amount <= 0) {
        throw new ValidationError("Invalid withdrawal amount");
      }

      const user: any = await Users.findById(userId).session(session);
      if (!user) throw new NotFoundError("User not found");

      const withdrawCurrency = currency || "USD";
      const wallet: any = await Wallets.findOne({
        user: String(user._id),
        status: "active",
      }).session(session);

      if (!wallet) throw new NotFoundError("Wallet not found");

      const fee = Math.max(amount * 0.01, 1.0);
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
        recipientAccountNumber: bankAccount ? `****${bankAccount.slice(-4)}` : undefined,
        recipientBankName: bankName,
        recipientName: accountName,
        amount,
        currency: withdrawCurrency,
        fee,
        status: "pending",
        description: `Withdrawal to ${bankName || "bank account"}`,
        channel: "web",
        ipAddress: ip,
        meta: {
          withdrawalMethod,
          routingNumber: routingNumber ? `****${routingNumber.slice(-4)}` : null,
        },
      });

      await transaction.save({ session });

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

      updateWalletBalance(wallet, withdrawCurrency, -(amount + fee));
      wallet.updatedAt = new Date();
      wallet.lastTransactionAt = new Date();
      await wallet.save({ session });
      const balanceAfter = getWalletBalance(wallet, withdrawCurrency);

      await LedgerEntries.create(
        [{
          wallet: wallet._id,
          transaction: transaction._id,
          entryType: "debit",
          amount: amount + fee,
          currency: withdrawCurrency,
          balance: balanceAfter,
          description: "Withdrawal (pending)",
          accountingDate: new Date(),
        }],
        { session }
      );

      await session.commitTransaction();

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
          const withdrawalEmailContent = emailGenerator.transactionNotification(withdrawalEmailData);
          await queueTemplatedMail(String(user.email), withdrawalEmailContent);
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

      onTransactionWrite(userId).catch(() => {});

      return {
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
        message: "Withdrawal request submitted. Processing typically takes 1-3 business days.",
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async cancelTransaction(userId: string, transactionId: string, reason: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transaction = await Transactions.findOne({
        _id: transactionId,
        initiatedBy: userId,
        status: "pending",
      }).session(session);

      if (!transaction) {
        throw new NotFoundError("Pending transaction not found");
      }

      const wallet = await Wallets.findById(transaction.wallet).session(session);
      const refundAmount = transaction.amount + (transaction.fee || 0);
      let newBalance = 0;

      if (wallet) {
        updateWalletBalance(wallet, transaction.currency, refundAmount);
        wallet.updatedAt = new Date();
        await wallet.save({ session });
        newBalance = getWalletBalance(wallet, transaction.currency);

        await LedgerEntries.create(
          [{
            wallet: wallet._id,
            transaction: transaction._id,
            entryType: "credit",
            amount: refundAmount,
            currency: transaction.currency,
            balance: newBalance,
            description: "Transaction cancelled - refund",
            accountingDate: new Date(),
          }],
          { session }
        );
      }

      transaction.status = "cancelled";
      transaction.updatedAt = new Date();
      transaction.meta = {
        ...(transaction.meta || {}),
        cancelledAt: new Date(),
        cancellationReason: reason,
      };
      await transaction.save({ session });

      await session.commitTransaction();

      await Promise.all([
        invalidateTransactionCache(userId.toString()),
        cacheTransaction(transaction._id.toString(), {
          id: transaction._id,
          referenceNumber: transaction.referenceNumber,
          type: transaction.type,
          amount: transaction.amount,
          status: "cancelled",
          cancelledAt: new Date(),
        }),
      ]);

      emitToUser(userId.toString(), WS_EVENTS.TRANSACTION_CANCELLED, {
        transactionId: transaction._id.toString(),
        referenceNumber: transaction.referenceNumber,
        refundedAmount: refundAmount,
        newBalance,
        currency: transaction.currency,
        reason,
        timestamp: new Date().toISOString(),
      });

      if (wallet) {
        emitToUser(userId.toString(), WS_EVENTS.BALANCE_UPDATED, {
          currency: transaction.currency,
          balance: newBalance,
          timestamp: new Date().toISOString(),
        });
      }

      onTransactionWrite(userId.toString()).catch(() => {});

      return {
        transaction: {
          id: transaction._id,
          referenceNumber: transaction.referenceNumber,
          status: transaction.status,
        },
        refundedAmount: refundAmount,
        newBalance,
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

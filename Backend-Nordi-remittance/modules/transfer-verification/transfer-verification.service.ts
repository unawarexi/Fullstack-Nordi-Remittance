import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  TransferVerifications,
  TransactionTaxes,
} from "./transfer-verification.model.js";
import Transactions from "../transactions/transactions.model.js";
import { Wallets, LedgerEntries } from "../accounts/accounts.model.js";
import Users from "../users/users.model.js";
import { Notifications } from "../notifications/notifications.model.js";
import { generateReferenceNumber } from "../../core/helpers/generator.js";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  InsufficientBalanceError,
} from "../../core/errors/AppError.js";
import { queueTemplatedMail } from "../../services/workers.js";
import EmailContentGenerator from "../../core/mail/Mail-content.js";
import { emitToUser } from "../../services/websocket.service.js";
import { WS } from "../../core/constants/ws-events.js";

const emailGenerator = new EmailContentGenerator();

const TAX_RATE = 0.2; // 20% tax rate
const CODE_EXPIRY_MINUTES = 30; // Codes expire after 30 minutes
const MAX_VERIFICATION_ATTEMPTS = 3;

function generateSecurityCode(type: "isin" | "imf_bop" | "lei"): string {
  const randomBytes = crypto.randomBytes(8).toString("hex").toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();

  switch (type) {
    case "isin":
      return `US${randomBytes.substring(0, 9)}${Math.floor(Math.random() * 10)}`;
    case "imf_bop":
      return `BOP-${randomBytes.substring(0, 5)}-TRF-${new Date().getFullYear()}`;
    case "lei":
      return `${randomBytes}${timestamp}`.substring(0, 20).toUpperCase();
    default:
      return randomBytes;
  }
}

async function hashCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

async function verifyCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

function getWalletBalance(wallet: any, currency: string): number {
  if (!wallet || !wallet.balances) return 0;
  if (wallet.balances instanceof Map) {
    return wallet.balances.get(currency) || 0;
  }
  return wallet.balances[currency] || 0;
}

function updateWalletBalance(wallet: any, currency: string, amount: number): void {
  const currentBalance = wallet.balances?.get(currency) || 0;
  wallet.balances.set(currency, currentBalance + amount);
}

function calculateTax(amount: number): {
  taxAmount: number;
  grossAmount: number;
  netAmount: number;
} {
  const taxAmount = Math.round(amount * TAX_RATE * 100) / 100;
  const grossAmount = Math.round((amount + taxAmount) * 100) / 100;
  return {
    taxAmount,
    grossAmount,
    netAmount: amount,
  };
}

async function sendVerificationCodeEmail(
  user: any,
  codeType: "isin" | "imf_bop" | "lei",
  code: string,
  transactionDetails: any,
): Promise<void> {
  const codeNames = {
    isin: "ISIN (International Securities Identification Number)",
    imf_bop: "IMF BOP (Balance of Payments)",
    lei: "LEI (Legal Entity Identifier)",
  };

  const stepNumber = {
    isin: 1,
    imf_bop: 2,
    lei: 3,
  };

  const emailContent = (emailGenerator as any).transferVerificationCodeEmail({
    firstName: user.firstName,
    step: stepNumber[codeType],
    codeName: codeNames[codeType],
    code: code,
    type: transactionDetails.type,
    currency: transactionDetails.currency,
    amount: transactionDetails.amount,
    taxAmount: transactionDetails.taxAmount,
    grossAmount: transactionDetails.grossAmount,
    recipientName: transactionDetails.recipientName,
    recipientAccountNumber: transactionDetails.recipientAccountNumber,
  });

  await queueTemplatedMail(String(user.email), emailContent);
}

async function completeVerifiedTransaction(
  verification: any,
  session: mongoose.ClientSession,
  userId: string,
): Promise<void> {
  const transaction = await Transactions.findById(verification.transaction).session(session);
  if (!transaction) throw new NotFoundError("Transaction not found");

  const senderWallet = await Wallets.findById(transaction.wallet).session(session);
  const recipientWallet = await Wallets.findById(transaction.recipientWallet).session(session);

  if (!senderWallet || !recipientWallet) {
    throw new NotFoundError("Wallet not found");
  }

  const currency = transaction.currency;
  const amount = verification.taxInfo.netAmount;
  const grossAmount = verification.taxInfo.grossAmount;

  const senderBalanceBefore = getWalletBalance(senderWallet, currency);
  updateWalletBalance(senderWallet, currency, -grossAmount);
  senderWallet.updatedAt = new Date();
  senderWallet.lastTransactionAt = new Date();
  await senderWallet.save({ session });
  const senderBalanceAfter = getWalletBalance(senderWallet, currency);

  await LedgerEntries.create(
    [
      {
        wallet: senderWallet._id,
        transaction: transaction._id,
        entryType: "debit",
        amount: grossAmount,
        currency,
        balance: senderBalanceAfter,
        description: `Secure transfer to ${transaction.recipientAccountNumber} (incl. 20% tax)`,
        accountingDate: new Date(),
      },
    ],
    { session },
  );

  const recipientBalanceBefore = getWalletBalance(recipientWallet, currency);
  updateWalletBalance(recipientWallet, currency, amount);
  recipientWallet.updatedAt = new Date();
  recipientWallet.lastTransactionAt = new Date();
  await recipientWallet.save({ session });
  const recipientBalanceAfter = getWalletBalance(recipientWallet, currency);

  await LedgerEntries.create(
    [
      {
        wallet: recipientWallet._id,
        transaction: transaction._id,
        entryType: "credit",
        amount,
        currency,
        balance: recipientBalanceAfter,
        description: `Secure transfer received`,
        accountingDate: new Date(),
      },
    ],
    { session },
  );

  transaction.status = "completed";
  transaction.completedAt = new Date();
  transaction.meta = {
    ...transaction.meta,
    verificationId: verification._id,
    verificationCompletedAt: new Date(),
    senderBalanceBefore,
    senderBalanceAfter,
    recipientBalanceBefore,
    recipientBalanceAfter,
  };
  await transaction.save({ session });

  await TransactionTaxes.findOneAndUpdate(
    { verification: verification._id },
    { status: "collected", collectedAt: new Date() },
    { session },
  );

  const sender = await Users.findById(verification.user).session(session);
  const recipient = await Users.findById(verification.transactionDetails.recipientId).session(session);

  if (sender) {
    await Notifications.create({
      userId: sender._id,
      type: "transaction",
      title: "Transfer Completed",
      message: `Your secure transfer of ${currency} ${amount.toFixed(2)} to ${verification.transactionDetails.recipientName} has been completed.`,
      data: {
        transactionId: transaction._id,
        reference: transaction.referenceNumber,
        amount,
        tax: verification.taxInfo.taxAmount,
      },
      read: false,
    });

    emitToUser(sender._id.toString(), "transaction", {
      type: "transfer_completed",
      transactionId: transaction._id,
      amount,
      newBalance: senderBalanceAfter,
    });
  }

  if (recipient) {
    await Notifications.create({
      userId: recipient._id,
      type: "transaction",
      title: "Money Received",
      message: `You received ${currency} ${amount.toFixed(2)} from ${sender?.firstName || "Unknown"}.`,
      data: {
        transactionId: transaction._id,
        reference: transaction.referenceNumber,
        amount,
      },
      read: false,
    });

    emitToUser(recipient._id.toString(), "transaction", {
      type: "transfer_received",
      transactionId: transaction._id,
      amount,
      newBalance: recipientBalanceAfter,
    });
  }
}

export class TransferVerificationService {
  static async initiateSecureTransfer(userId: string, body: any, ip: string, userAgent: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        recipientAccountNumber,
        recipientEmail,
        amount,
        currency = "USD",
        description,
      } = body;

      if (!amount || amount <= 0) {
        throw new ValidationError("Amount must be greater than zero");
      }

      const sender = await Users.findById(userId).session(session);
      if (!sender) throw new NotFoundError("Sender not found");

      const senderWallet = await Wallets.findOne({
        user: sender._id,
        status: "active",
      }).session(session);
      if (!senderWallet) throw new NotFoundError("Sender wallet not found");

      const recipientQuery: Record<string, any> = {};
      if (recipientAccountNumber) {
        recipientQuery.accountNumber = recipientAccountNumber;
      } else if (recipientEmail) {
        recipientQuery.email = recipientEmail.toLowerCase();
      } else {
        throw new ValidationError("Recipient account number or email is required");
      }

      const recipient = await Users.findOne(recipientQuery).session(session);

      if (!recipient) {
        throw new ValidationError(
          "Transfer failed: The recipient account does not exist in our system. You can only send money to accounts registered with Nordea Remittance.",
        );
      }

      if (recipient._id.toString() === sender._id.toString()) {
        throw new ValidationError("Cannot transfer to yourself");
      }

      let recipientWallet = await Wallets.findOne({
        user: recipient._id,
        status: "active",
      }).session(session);

      if (!recipientWallet) {
        recipientWallet = new Wallets({
          user: recipient._id,
          walletNumber: `W${Date.now()}${Math.random().toString(36).substring(7)}`,
          balances: new Map([[currency, 0]]),
          status: "active",
          walletType: "personal",
          isPrimary: true,
        });
        await recipientWallet.save({ session });
      }

      const { taxAmount, grossAmount, netAmount } = calculateTax(amount);

      const senderBalance = getWalletBalance(senderWallet, currency);
      if (senderBalance < grossAmount) {
        throw new InsufficientBalanceError(grossAmount, senderBalance);
      }

      const referenceNumber = generateReferenceNumber();

      const transaction = new Transactions({
        wallet: senderWallet._id,
        referenceNumber,
        type: "transfer",
        category: "bankAccounts",
        amount: netAmount,
        currency,
        status: "pending",
        description: description || `Secure transfer to ${recipient.firstName} ${recipient.lastName}`,
        initiatedBy: sender._id,
        recipientWallet: recipientWallet._id,
        recipientAccountNumber: recipient.accountNumber,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        fee: taxAmount,
        meta: {
          secureTransfer: true,
          verificationRequired: true,
          taxRate: TAX_RATE,
          taxAmount,
          grossAmount,
          netAmount,
          senderName: `${sender.firstName} ${sender.lastName}`,
          senderAccountNumber: sender.accountNumber,
        },
        channel: "web",
        ipAddress: ip,
        userAgent,
      });

      await transaction.save({ session });

      const verification = new TransferVerifications({
        transaction: transaction._id,
        user: sender._id,
        transactionDetails: {
          amount: netAmount,
          currency,
          recipientId: recipient._id,
          recipientName: `${recipient.firstName} ${recipient.lastName}`,
          recipientAccountNumber: recipient.accountNumber,
          type: "transfer",
        },
        taxInfo: {
          taxRate: TAX_RATE,
          taxAmount,
          grossAmount,
          netAmount,
        },
        currentStep: 1,
        status: "pending_isin",
        ipAddress: ip,
        userAgent,
      });

      await verification.save({ session });

      const taxRecord = new TransactionTaxes({
        transaction: transaction._id,
        user: sender._id,
        transactionType: "transfer",
        originalAmount: netAmount,
        taxRate: TAX_RATE,
        taxAmount,
        totalAmount: grossAmount,
        currency,
        status: "pending",
        verification: verification._id,
      });

      await taxRecord.save({ session });
      await session.commitTransaction();

      await Notifications.create({
        userId: sender._id,
        type: "transaction",
        title: "Transfer Initiated - Verification Required",
        message: `Your transfer of ${currency} ${amount.toFixed(2)} to ${recipient.firstName} requires security verification. Please complete all 3 verification steps.`,
        data: {
          transactionId: transaction._id,
          verificationId: verification._id,
          reference: referenceNumber,
        },
        read: false,
      });

      emitToUser(userId, WS.TRANSFER.INITIATED, {
        verificationId: verification.verificationId || verification._id,
        amount: netAmount,
        currency,
        referenceNumber,
        timestamp: new Date().toISOString(),
      });

      return {
        message: "Transfer initiated successfully. Please complete the 3-step security verification.",
        verification: {
          id: verification._id,
          verificationId: verification.verificationId,
          status: verification.status,
          currentStep: 1,
          totalSteps: 3,
          nextAction: "Request ISIN code by calling POST /transactions/secure-transfer/request-code",
        },
        transaction: {
          id: transaction._id,
          referenceNumber,
          status: "pending",
        },
        details: {
          amount: netAmount,
          tax: taxAmount,
          taxRate: "20%",
          totalDeducted: grossAmount,
          currency,
          recipient: {
            name: `${recipient.firstName} ${recipient.lastName}`,
            accountNumber: recipient.accountNumber,
          },
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async requestVerificationCode(userId: string, body: any) {
    const { verificationId } = body;
    if (!verificationId) {
      throw new ValidationError("Verification ID is required");
    }

    const verification = await TransferVerifications.findOne({
      _id: verificationId,
      user: userId,
    });

    if (!verification) {
      throw new NotFoundError("Verification not found");
    }

    if (verification.expiresAt && new Date() > verification.expiresAt) {
      verification.status = "expired";
      await verification.save();
      throw new ValidationError("Verification has expired. Please initiate a new transfer.");
    }

    let codeType: "isin" | "imf_bop" | "lei";
    let codeField: "isinCode" | "imfBopCode" | "leiCode";
    let nextStatus: string;

    switch (verification.status) {
      case "pending_isin":
        codeType = "isin";
        codeField = "isinCode";
        nextStatus = "isin_sent";
        break;
      case "pending_imf_bop":
        codeType = "imf_bop";
        codeField = "imfBopCode";
        nextStatus = "imf_bop_sent";
        break;
      case "pending_lei":
        codeType = "lei";
        codeField = "leiCode";
        nextStatus = "lei_sent";
        break;
      default:
        throw new ValidationError(
          `Cannot request code at current status: ${verification.status}. Complete the current step or wait for the appropriate stage.`,
        );
    }

    const code = generateSecurityCode(codeType);
    const codeHash = await hashCode(code);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    (verification as any)[codeField] = {
      code: code,
      codeHash,
      isVerified: false,
      generatedAt: new Date(),
      expiresAt,
      attempts: 0,
      maxAttempts: MAX_VERIFICATION_ATTEMPTS,
      sentToEmail: true,
      sentAt: new Date(),
    };
    verification.status = nextStatus as any;
    verification.updatedAt = new Date();

    await verification.save();

    const user = await Users.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    await sendVerificationCodeEmail(user, codeType, code, {
      ...verification.transactionDetails,
      taxAmount: verification.taxInfo.taxAmount,
      grossAmount: verification.taxInfo.grossAmount,
    });

    const stepNames = {
      isin: "ISIN (International Securities Identification Number)",
      imf_bop: "IMF BOP (Balance of Payments)",
      lei: "LEI (Legal Entity Identifier)",
    };

    return {
      message: `${stepNames[codeType]} code has been sent to your email.`,
      verification: {
        id: verification._id,
        verificationId: verification.verificationId,
        status: verification.status,
        currentStep: verification.currentStep,
        codeType: stepNames[codeType],
        expiresAt,
        attemptsRemaining: MAX_VERIFICATION_ATTEMPTS,
      },
      nextAction: `Enter the code by calling POST /transactions/secure-transfer/verify-code with { verificationId, code }`,
      codeTypeLabel: stepNames[codeType],
    };
  }

  static async verifySecurityCode(userId: string, body: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { verificationId, code } = body;
      if (!verificationId || !code) {
        throw new ValidationError("Verification ID and code are required");
      }

      const verification = await TransferVerifications.findOne({
        _id: verificationId,
        user: userId,
      }).session(session);

      if (!verification) {
        throw new NotFoundError("Verification not found");
      }

      let codeField: "isinCode" | "imfBopCode" | "leiCode";
      let codeType: "isin" | "imf_bop" | "lei";
      let nextStatus: string;
      let nextStep: number;

      switch (verification.status) {
        case "isin_sent":
          codeField = "isinCode";
          codeType = "isin";
          nextStatus = "pending_imf_bop";
          nextStep = 2;
          break;
        case "imf_bop_sent":
          codeField = "imfBopCode";
          codeType = "imf_bop";
          nextStatus = "pending_lei";
          nextStep = 3;
          break;
        case "lei_sent":
          codeField = "leiCode";
          codeType = "lei";
          nextStatus = "fully_verified";
          nextStep = 3;
          break;
        default:
          throw new ValidationError(
            `No code pending verification at current status: ${verification.status}`,
          );
      }

      const codeData = (verification as any)[codeField];

      if (codeData.expiresAt && new Date() > codeData.expiresAt) {
        throw new ValidationError("Code has expired. Please request a new code.");
      }

      if (codeData.attempts >= codeData.maxAttempts) {
        verification.status = "failed";
        verification.failureReason = "Maximum verification attempts exceeded";
        verification.failedAt = new Date();
        await verification.save({ session });

        await Transactions.findByIdAndUpdate(
          verification.transaction,
          {
            status: "failed",
            failedReason: "Security verification failed - too many attempts",
          },
          { session },
        );

        await session.commitTransaction();
        throw new ForbiddenError("Maximum attempts exceeded. Verification failed.");
      }

      const isValid = await verifyCode(code, codeData.codeHash);

      if (!isValid) {
        codeData.attempts += 1;
        (verification as any)[codeField] = codeData;
        await verification.save({ session });
        await session.commitTransaction();

        throw new ValidationError(
          `Invalid code. ${codeData.maxAttempts - codeData.attempts} attempts remaining.`,
        );
      }

      codeData.isVerified = true;
      codeData.verifiedAt = new Date();
      (verification as any)[codeField] = codeData;
      verification.status = nextStatus as any;
      verification.currentStep = nextStep as any;
      verification.updatedAt = new Date();

      if (nextStatus === "fully_verified") {
        verification.completedAt = new Date();
        await verification.save({ session });
        await completeVerifiedTransaction(verification, session, userId);
        await session.commitTransaction();

        return {
          fullyVerified: true,
          message: "All verification steps completed! Your transfer has been processed.",
          verification: {
            id: verification._id,
            status: "fully_verified",
            completedAt: verification.completedAt,
          },
          transaction: {
            status: "completed",
          },
        };
      }

      await verification.save({ session });
      await session.commitTransaction();

      const stepNames = {
        isin: "ISIN",
        imf_bop: "IMF BOP",
        lei: "LEI",
      };
      const nextStepName = nextStep === 2 ? "IMF BOP" : "LEI";

      return {
        fullyVerified: false,
        message: `${stepNames[codeType]} code verified successfully!`,
        verification: {
          id: verification._id,
          verificationId: verification.verificationId,
          status: verification.status,
          currentStep: nextStep,
          totalSteps: 3,
          completedSteps: nextStep - 1,
        },
        nextAction: `Request the next code (${nextStepName}) by calling POST /transactions/secure-transfer/request-code`,
        stepStr: `Step ${nextStep - 1} of 3 completed`,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getVerificationStatus(userId: string, verificationId: string) {
    const verification = await TransferVerifications.findOne({
      _id: verificationId,
      user: userId,
    }).populate("transaction");

    if (!verification) {
      throw new NotFoundError("Verification not found");
    }

    const steps = [
      {
        step: 1,
        name: "ISIN Code",
        status: verification.isinCode.isVerified
          ? "completed"
          : verification.status === "isin_sent"
            ? "pending_verification"
            : verification.status === "pending_isin"
              ? "not_started"
              : "completed",
        verifiedAt: verification.isinCode.verifiedAt,
      },
      {
        step: 2,
        name: "IMF BOP Code",
        status: verification.imfBopCode.isVerified
          ? "completed"
          : verification.status === "imf_bop_sent"
            ? "pending_verification"
            : ["pending_imf_bop"].includes(verification.status)
              ? "not_started"
              : verification.isinCode.isVerified
                ? "not_started"
                : "locked",
        verifiedAt: verification.imfBopCode.verifiedAt,
      },
      {
        step: 3,
        name: "LEI Code",
        status: verification.leiCode.isVerified
          ? "completed"
          : verification.status === "lei_sent"
            ? "pending_verification"
            : ["pending_lei"].includes(verification.status)
              ? "not_started"
              : verification.imfBopCode.isVerified
                ? "not_started"
                : "locked",
        verifiedAt: verification.leiCode.verifiedAt,
      },
    ];

    return {
      verification: {
        id: verification._id,
        verificationId: verification.verificationId,
        status: verification.status,
        currentStep: verification.currentStep,
        steps,
        transactionDetails: verification.transactionDetails,
        taxInfo: verification.taxInfo,
        createdAt: verification.createdAt,
        expiresAt: verification.expiresAt,
        completedAt: verification.completedAt,
      },
      transaction: verification.transaction,
    };
  }

  static async cancelVerification(userId: string, body: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { verificationId } = body;
      if (!verificationId) {
        throw new ValidationError("Verification ID is required");
      }

      const verification = await TransferVerifications.findOne({
        _id: verificationId,
        user: userId,
      }).session(session);

      if (!verification) {
        throw new NotFoundError("Verification not found");
      }

      if (verification.status === "fully_verified") {
        throw new ValidationError("Cannot cancel a completed verification");
      }

      if (verification.status === "cancelled") {
        throw new ValidationError("Verification already cancelled");
      }

      verification.status = "cancelled";
      verification.updatedAt = new Date();
      await verification.save({ session });

      await Transactions.findByIdAndUpdate(
        verification.transaction,
        {
          status: "cancelled",
          failedReason: "Verification cancelled by user",
        },
        { session },
      );

      await TransactionTaxes.findOneAndUpdate(
        { verification: verification._id },
        { status: "refunded" },
        { session },
      );

      await session.commitTransaction();

      emitToUser(userId, WS.TRANSFER.CANCELLED, {
        verificationId: verification.verificationId || verification._id,
        timestamp: new Date().toISOString(),
      });

      return {
        message: "Verification cancelled successfully",
        verification: {
          id: verification._id,
          status: "cancelled",
        },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getPendingVerifications(userId: string) {
    const verifications = await TransferVerifications.find({
      user: userId,
      status: { $nin: ["fully_verified", "failed", "expired", "cancelled"] },
    })
      .populate("transaction")
      .sort({ createdAt: -1 });

    return {
      count: verifications.length,
      verifications: verifications.map((v) => ({
        id: v._id,
        verificationId: v.verificationId,
        status: v.status,
        currentStep: v.currentStep,
        transactionDetails: v.transactionDetails,
        taxInfo: v.taxInfo,
        createdAt: v.createdAt,
        expiresAt: v.expiresAt,
      })),
    };
  }
}

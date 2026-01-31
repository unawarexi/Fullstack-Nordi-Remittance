// ============================================================================
// TRANSFER VERIFICATION CONTROLLER
// ============================================================================
// Handles the 3-step security verification process for transfers/withdrawals:
// 1. ISIN Code verification
// 2. IMF BOP Code verification  
// 3. LEI Code verification
// Each code must be requested and verified sequentially
// ============================================================================

import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { AuthenticatedRequest } from '../types/index.js';
import { TransferVerifications, TransactionTaxes } from '../models/TransferVerificationModel.js';
import Transactions from '../models/TransactionModel.js';
import { Wallets, LedgerEntries } from '../models/AccountsModel.js';
import Users from '../models/UserModel.js';
import { Notifications } from '../models/NotificationModel.js';
import { generateReferenceNumber } from '../core/helpers/generator.js';
import { sendSuccess, sendCreated } from '../core/helpers/response.helper.js';
import { 
  UnauthorizedError, 
  ValidationError, 
  NotFoundError, 
  ForbiddenError,
  InsufficientBalanceError 
} from '../core/errors/AppError.js';
import { sendTemplatedMail } from '../services/Mailer.service.js';
import EmailContentGenerator from '../core/mail/Mail-content.js';
import { emitToUser } from '../services/Websocket.service.js';

const emailGenerator = new EmailContentGenerator();

// ============================================================================
// CONSTANTS
// ============================================================================

const TAX_RATE = 0.20; // 20% tax rate
const CODE_EXPIRY_MINUTES = 30; // Codes expire after 30 minutes
const MAX_VERIFICATION_ATTEMPTS = 3;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a secure verification code
 * Format varies by type for realistic appearance
 */
function generateSecurityCode(type: 'isin' | 'imf_bop' | 'lei'): string {
  const randomBytes = crypto.randomBytes(8).toString('hex').toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  
  switch (type) {
    case 'isin':
      // ISIN format: 2-letter country code + 9 alphanumeric + 1 check digit
      // Example: US0378331005
      return `US${randomBytes.substring(0, 9)}${Math.floor(Math.random() * 10)}`;
    
    case 'imf_bop':
      // IMF BOP format: Numeric code with category
      // Example: BOP-45892-TRF-2026
      return `BOP-${randomBytes.substring(0, 5)}-TRF-${new Date().getFullYear()}`;
    
    case 'lei':
      // LEI format: 20 alphanumeric characters
      // Example: 549300BNKHG921LY2N15
      return `${randomBytes}${timestamp}`.substring(0, 20).toUpperCase();
    
    default:
      return randomBytes;
  }
}

/**
 * Hash a code for secure storage
 */
async function hashCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

/**
 * Verify a code against its hash
 */
async function verifyCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

/**
 * Get wallet balance for a specific currency
 */
function getWalletBalance(wallet: any, currency: string): number {
  if (!wallet || !wallet.balances) return 0;
  if (wallet.balances instanceof Map) {
    return wallet.balances.get(currency) || 0;
  }
  return wallet.balances[currency] || 0;
}

/**
 * Update wallet balance for a specific currency
 */
function updateWalletBalance(wallet: any, currency: string, amount: number): void {
  const currentBalance = wallet.balances?.get(currency) || 0;
  wallet.balances.set(currency, currentBalance + amount);
}

/**
 * Calculate tax for a transaction
 */
function calculateTax(amount: number): { taxAmount: number; grossAmount: number; netAmount: number } {
  const taxAmount = Math.round(amount * TAX_RATE * 100) / 100;
  const grossAmount = Math.round((amount + taxAmount) * 100) / 100;
  return {
    taxAmount,
    grossAmount,
    netAmount: amount,
  };
}

/**
 * Send verification code email
 */
async function sendVerificationCodeEmail(
  user: any,
  codeType: 'isin' | 'imf_bop' | 'lei',
  code: string,
  transactionDetails: any
): Promise<void> {
  const codeNames = {
    isin: 'ISIN (International Securities Identification Number)',
    imf_bop: 'IMF BOP (Balance of Payments)',
    lei: 'LEI (Legal Entity Identifier)',
  };
  
  const stepNumber = {
    isin: 1,
    imf_bop: 2,
    lei: 3,
  };

  const emailContent = {
    EMAIL_TITLE: `Security Verification Code - Step ${stepNumber[codeType]} of 3`,
    GREETING: `Hello ${user.firstName},`,
    MAIN_CONTENT: `
      <p>You have requested a verification code for your ${transactionDetails.type} transaction.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #333;">Transaction Details</h3>
        <p style="margin: 5px 0;"><strong>Amount:</strong> ${transactionDetails.currency} ${transactionDetails.amount.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Tax (20%):</strong> ${transactionDetails.currency} ${transactionDetails.taxAmount.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Total:</strong> ${transactionDetails.currency} ${transactionDetails.grossAmount.toFixed(2)}</p>
        <p style="margin: 5px 0;"><strong>Recipient:</strong> ${transactionDetails.recipientName}</p>
        <p style="margin: 5px 0;"><strong>Account:</strong> ${transactionDetails.recipientAccountNumber}</p>
      </div>
      
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="margin: 0 0 10px 0; color: #1565c0;">Step ${stepNumber[codeType]}: ${codeNames[codeType]} Code</h3>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #1565c0; margin: 15px 0;">${code}</p>
        <p style="color: #666; font-size: 12px;">This code expires in 30 minutes</p>
      </div>
      
      <p><strong>Important Security Notice:</strong></p>
      <ul>
        <li>Never share this code with anyone</li>
        <li>Our staff will never ask for this code</li>
        <li>This code is valid for 30 minutes only</li>
        <li>You have 3 attempts to enter the correct code</li>
      </ul>
      
      <p>If you did not initiate this transaction, please contact our support team immediately and secure your account.</p>
    `,
    COMPANY_NAME: 'Nordea Remittance',
    YEAR: new Date().getFullYear(),
    FOOTER_TEXT: 'This is an automated security notification from Nordea Remittance.',
  };

  await sendTemplatedMail(String(user.email), emailContent as any);
}

// ============================================================================
// INITIATE TRANSFER WITH VERIFICATION
// ============================================================================

/**
 * Initiate a transfer that requires 3-step verification
 * POST /transactions/secure-transfer/initiate
 */
export async function initiateSecureTransfer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const {
      recipientAccountNumber,
      recipientEmail,
      amount,
      currency = 'USD',
      description,
    } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    // Get sender
    const sender = await Users.findById(req.user.userId).session(session);
    if (!sender) throw new NotFoundError('Sender not found');

    // Get sender's wallet
    const senderWallet = await Wallets.findOne({
      user: sender._id,
      status: 'active',
    }).session(session);
    if (!senderWallet) throw new NotFoundError('Sender wallet not found');

    // Find recipient - MUST exist in database
    const recipientQuery: Record<string, any> = {};
    if (recipientAccountNumber) {
      recipientQuery.accountNumber = recipientAccountNumber;
    } else if (recipientEmail) {
      recipientQuery.email = recipientEmail.toLowerCase();
    } else {
      throw new ValidationError('Recipient account number or email is required');
    }

    const recipient = await Users.findOne(recipientQuery).session(session);
    
    // =========================================================================
    // CRITICAL: Recipient MUST exist in our database
    // =========================================================================
    if (!recipient) {
      throw new ValidationError(
        'Transfer failed: The recipient account does not exist in our system. ' +
        'You can only send money to accounts registered with Nordea Remittance.'
      );
    }

    // Prevent self-transfer
    if (recipient._id.toString() === sender._id.toString()) {
      throw new ValidationError('Cannot transfer to yourself');
    }

    // Get or create recipient's wallet
    let recipientWallet = await Wallets.findOne({
      user: recipient._id,
      status: 'active',
    }).session(session);

    if (!recipientWallet) {
      recipientWallet = new Wallets({
        user: recipient._id,
        walletNumber: `W${Date.now()}${Math.random().toString(36).substring(7)}`,
        balances: new Map([[currency, 0]]),
        status: 'active',
        walletType: 'personal',
        isPrimary: true,
      });
      await recipientWallet.save({ session });
    }

    // Calculate tax (20%)
    const { taxAmount, grossAmount, netAmount } = calculateTax(amount);

    // Check if sender has sufficient balance (amount + tax)
    const senderBalance = getWalletBalance(senderWallet, currency);
    if (senderBalance < grossAmount) {
      throw new InsufficientBalanceError(grossAmount, senderBalance);
    }

    // Generate reference number
    const referenceNumber = generateReferenceNumber();

    // Create pending transaction
    const transaction = new Transactions({
      wallet: senderWallet._id,
      referenceNumber,
      type: 'transfer',
      category: 'bankAccounts',
      amount: netAmount,
      currency,
      status: 'pending', // Will remain pending until all 3 codes verified
      description: description || `Secure transfer to ${recipient.firstName} ${recipient.lastName}`,
      initiatedBy: sender._id,
      recipientWallet: recipientWallet._id,
      recipientAccountNumber: recipient.accountNumber,
      recipientName: `${recipient.firstName} ${recipient.lastName}`,
      fee: taxAmount, // Store tax as fee for now
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
      channel: 'web',
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    await transaction.save({ session });

    // Create verification record
    const verification = new TransferVerifications({
      transaction: transaction._id,
      user: sender._id,
      transactionDetails: {
        amount: netAmount,
        currency,
        recipientId: recipient._id,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        recipientAccountNumber: recipient.accountNumber,
        type: 'transfer',
      },
      taxInfo: {
        taxRate: TAX_RATE,
        taxAmount,
        grossAmount,
        netAmount,
      },
      currentStep: 1,
      status: 'pending_isin',
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    await verification.save({ session });

    // Create tax record
    const taxRecord = new TransactionTaxes({
      transaction: transaction._id,
      user: sender._id,
      transactionType: 'transfer',
      originalAmount: netAmount,
      taxRate: TAX_RATE,
      taxAmount,
      totalAmount: grossAmount,
      currency,
      status: 'pending',
      verification: verification._id,
    });

    await taxRecord.save({ session });

    await session.commitTransaction();

    // Notify user
    await Notifications.create({
      userId: sender._id,
      type: 'transaction',
      title: 'Transfer Initiated - Verification Required',
      message: `Your transfer of ${currency} ${amount.toFixed(2)} to ${recipient.firstName} requires security verification. Please complete all 3 verification steps.`,
      data: { 
        transactionId: transaction._id, 
        verificationId: verification._id,
        reference: referenceNumber 
      },
      read: false,
    });

    sendCreated(res, {
      message: 'Transfer initiated successfully. Please complete the 3-step security verification.',
      verification: {
        id: verification._id,
        verificationId: verification.verificationId,
        status: verification.status,
        currentStep: 1,
        totalSteps: 3,
        nextAction: 'Request ISIN code by calling POST /transactions/secure-transfer/request-code',
      },
      transaction: {
        id: transaction._id,
        referenceNumber,
        status: 'pending',
      },
      details: {
        amount: netAmount,
        tax: taxAmount,
        taxRate: '20%',
        totalDeducted: grossAmount,
        currency,
        recipient: {
          name: `${recipient.firstName} ${recipient.lastName}`,
          accountNumber: recipient.accountNumber,
        },
      },
    }, 'Transfer initiated - verification required');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// REQUEST VERIFICATION CODE
// ============================================================================

/**
 * Request a verification code for the current step
 * POST /transactions/secure-transfer/request-code
 */
export async function requestVerificationCode(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { verificationId } = req.body;

    if (!verificationId) {
      throw new ValidationError('Verification ID is required');
    }

    // Get verification record
    const verification = await TransferVerifications.findOne({
      _id: verificationId,
      user: req.user.userId,
    });

    if (!verification) {
      throw new NotFoundError('Verification not found');
    }

    // Check if expired
    if (verification.expiresAt && new Date() > verification.expiresAt) {
      verification.status = 'expired';
      await verification.save();
      throw new ValidationError('Verification has expired. Please initiate a new transfer.');
    }

    // Check status and determine which code to generate
    let codeType: 'isin' | 'imf_bop' | 'lei';
    let codeField: 'isinCode' | 'imfBopCode' | 'leiCode';
    let nextStatus: string;

    switch (verification.status) {
      case 'pending_isin':
        codeType = 'isin';
        codeField = 'isinCode';
        nextStatus = 'isin_sent';
        break;
      case 'pending_imf_bop':
        codeType = 'imf_bop';
        codeField = 'imfBopCode';
        nextStatus = 'imf_bop_sent';
        break;
      case 'pending_lei':
        codeType = 'lei';
        codeField = 'leiCode';
        nextStatus = 'lei_sent';
        break;
      default:
        throw new ValidationError(
          `Cannot request code at current status: ${verification.status}. ` +
          'Complete the current step or wait for the appropriate stage.'
        );
    }

    // Generate code
    const code = generateSecurityCode(codeType);
    const codeHash = await hashCode(code);
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    // Update verification with new code
    (verification as any)[codeField] = {
      code: code, // Store plain code temporarily (in production, remove after sending)
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

    // Get user for email
    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError('User not found');

    // Send code via email
    await sendVerificationCodeEmail(user, codeType, code, {
      ...verification.transactionDetails,
      taxAmount: verification.taxInfo.taxAmount,
      grossAmount: verification.taxInfo.grossAmount,
    });

    // Step names for response
    const stepNames = {
      isin: 'ISIN (International Securities Identification Number)',
      imf_bop: 'IMF BOP (Balance of Payments)',
      lei: 'LEI (Legal Entity Identifier)',
    };

    sendSuccess(res, {
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
    }, `${stepNames[codeType]} code sent to ${user.email}`);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// VERIFY CODE
// ============================================================================

/**
 * Verify a security code
 * POST /transactions/secure-transfer/verify-code
 */
export async function verifySecurityCode(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { verificationId, code } = req.body;

    if (!verificationId || !code) {
      throw new ValidationError('Verification ID and code are required');
    }

    // Get verification record
    const verification = await TransferVerifications.findOne({
      _id: verificationId,
      user: req.user.userId,
    }).session(session);

    if (!verification) {
      throw new NotFoundError('Verification not found');
    }

    // Determine which code to verify based on status
    let codeField: 'isinCode' | 'imfBopCode' | 'leiCode';
    let codeType: 'isin' | 'imf_bop' | 'lei';
    let nextStatus: string;
    let nextStep: number;

    switch (verification.status) {
      case 'isin_sent':
        codeField = 'isinCode';
        codeType = 'isin';
        nextStatus = 'pending_imf_bop';
        nextStep = 2;
        break;
      case 'imf_bop_sent':
        codeField = 'imfBopCode';
        codeType = 'imf_bop';
        nextStatus = 'pending_lei';
        nextStep = 3;
        break;
      case 'lei_sent':
        codeField = 'leiCode';
        codeType = 'lei';
        nextStatus = 'fully_verified';
        nextStep = 3;
        break;
      default:
        throw new ValidationError(
          `No code pending verification at current status: ${verification.status}`
        );
    }

    const codeData = (verification as any)[codeField];

    // Check if code expired
    if (codeData.expiresAt && new Date() > codeData.expiresAt) {
      throw new ValidationError('Code has expired. Please request a new code.');
    }

    // Check attempts
    if (codeData.attempts >= codeData.maxAttempts) {
      verification.status = 'failed';
      verification.failureReason = 'Maximum verification attempts exceeded';
      verification.failedAt = new Date();
      await verification.save({ session });

      // Cancel the transaction
      await Transactions.findByIdAndUpdate(verification.transaction, {
        status: 'failed',
        failedReason: 'Security verification failed - too many attempts',
      }, { session });

      await session.commitTransaction();
      throw new ForbiddenError('Maximum attempts exceeded. Verification failed.');
    }

    // Verify the code
    const isValid = await verifyCode(code, codeData.codeHash);

    if (!isValid) {
      codeData.attempts += 1;
      (verification as any)[codeField] = codeData;
      await verification.save({ session });
      await session.commitTransaction();

      throw new ValidationError(
        `Invalid code. ${codeData.maxAttempts - codeData.attempts} attempts remaining.`
      );
    }

    // Code is valid - update verification
    codeData.isVerified = true;
    codeData.verifiedAt = new Date();
    (verification as any)[codeField] = codeData;
    verification.status = nextStatus as any;
    verification.currentStep = nextStep as any;
    verification.updatedAt = new Date();

    // If fully verified, complete the transaction
    if (nextStatus === 'fully_verified') {
      verification.completedAt = new Date();
      await verification.save({ session });

      // Complete the transaction
      await completeVerifiedTransaction(verification, session, req);

      await session.commitTransaction();

      sendSuccess(res, {
        message: 'All verification steps completed! Your transfer has been processed.',
        verification: {
          id: verification._id,
          status: 'fully_verified',
          completedAt: verification.completedAt,
        },
        transaction: {
          status: 'completed',
        },
      }, 'Transfer completed successfully');
      return;
    }

    await verification.save({ session });
    await session.commitTransaction();

    const stepNames = {
      isin: 'ISIN',
      imf_bop: 'IMF BOP',
      lei: 'LEI',
    };

    const nextStepName = nextStep === 2 ? 'IMF BOP' : 'LEI';

    sendSuccess(res, {
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
    }, `Step ${nextStep - 1} of 3 completed`);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// COMPLETE VERIFIED TRANSACTION
// ============================================================================

async function completeVerifiedTransaction(
  verification: any,
  session: mongoose.ClientSession,
  req: AuthenticatedRequest
): Promise<void> {
  // Get transaction
  const transaction = await Transactions.findById(verification.transaction).session(session);
  if (!transaction) throw new NotFoundError('Transaction not found');

  // Get wallets
  const senderWallet = await Wallets.findById(transaction.wallet).session(session);
  const recipientWallet = await Wallets.findById(transaction.recipientWallet).session(session);

  if (!senderWallet || !recipientWallet) {
    throw new NotFoundError('Wallet not found');
  }

  const currency = transaction.currency;
  const amount = verification.taxInfo.netAmount;
  const grossAmount = verification.taxInfo.grossAmount;

  // Debit sender (amount + tax)
  const senderBalanceBefore = getWalletBalance(senderWallet, currency);
  updateWalletBalance(senderWallet, currency, -grossAmount);
  senderWallet.updatedAt = new Date();
  senderWallet.lastTransactionAt = new Date();
  await senderWallet.save({ session });
  const senderBalanceAfter = getWalletBalance(senderWallet, currency);

  // Create debit ledger entry
  await LedgerEntries.create([{
    wallet: senderWallet._id,
    transaction: transaction._id,
    entryType: 'debit',
    amount: grossAmount,
    currency,
    balance: senderBalanceAfter,
    description: `Secure transfer to ${transaction.recipientAccountNumber} (incl. 20% tax)`,
    accountingDate: new Date(),
  }], { session });

  // Credit recipient (only the net amount, no tax)
  const recipientBalanceBefore = getWalletBalance(recipientWallet, currency);
  updateWalletBalance(recipientWallet, currency, amount);
  recipientWallet.updatedAt = new Date();
  recipientWallet.lastTransactionAt = new Date();
  await recipientWallet.save({ session });
  const recipientBalanceAfter = getWalletBalance(recipientWallet, currency);

  // Create credit ledger entry
  await LedgerEntries.create([{
    wallet: recipientWallet._id,
    transaction: transaction._id,
    entryType: 'credit',
    amount,
    currency,
    balance: recipientBalanceAfter,
    description: `Secure transfer received`,
    accountingDate: new Date(),
  }], { session });

  // Update transaction status
  transaction.status = 'completed';
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

  // Update tax record
  await TransactionTaxes.findOneAndUpdate(
    { verification: verification._id },
    { 
      status: 'collected',
      collectedAt: new Date(),
    },
    { session }
  );

  // Get users for notifications
  const sender = await Users.findById(verification.user).session(session);
  const recipient = await Users.findById(verification.transactionDetails.recipientId).session(session);

  // Send notifications
  if (sender) {
    await Notifications.create({
      userId: sender._id,
      type: 'transaction',
      title: 'Transfer Completed',
      message: `Your secure transfer of ${currency} ${amount.toFixed(2)} to ${verification.transactionDetails.recipientName} has been completed.`,
      data: { 
        transactionId: transaction._id, 
        reference: transaction.referenceNumber,
        amount,
        tax: verification.taxInfo.taxAmount,
      },
      read: false,
    });

    // WebSocket notification
    emitToUser(sender._id.toString(), 'transaction', {
      type: 'transfer_completed',
      transactionId: transaction._id,
      amount,
      newBalance: senderBalanceAfter,
    });
  }

  if (recipient) {
    await Notifications.create({
      userId: recipient._id,
      type: 'transaction',
      title: 'Money Received',
      message: `You received ${currency} ${amount.toFixed(2)} from ${sender?.firstName || 'Unknown'}.`,
      data: { 
        transactionId: transaction._id, 
        reference: transaction.referenceNumber,
        amount,
      },
      read: false,
    });

    // WebSocket notification
    emitToUser(recipient._id.toString(), 'transaction', {
      type: 'transfer_received',
      transactionId: transaction._id,
      amount,
      newBalance: recipientBalanceAfter,
    });
  }
}

// ============================================================================
// GET VERIFICATION STATUS
// ============================================================================

/**
 * Get current verification status
 * GET /transactions/secure-transfer/status/:verificationId
 */
export async function getVerificationStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { verificationId } = req.params;

    const verification = await TransferVerifications.findOne({
      _id: verificationId,
      user: req.user.userId,
    }).populate('transaction');

    if (!verification) {
      throw new NotFoundError('Verification not found');
    }

    const steps = [
      {
        step: 1,
        name: 'ISIN Code',
        status: verification.isinCode.isVerified ? 'completed' : 
                verification.status === 'isin_sent' ? 'pending_verification' : 
                verification.status === 'pending_isin' ? 'not_started' : 'completed',
        verifiedAt: verification.isinCode.verifiedAt,
      },
      {
        step: 2,
        name: 'IMF BOP Code',
        status: verification.imfBopCode.isVerified ? 'completed' : 
                verification.status === 'imf_bop_sent' ? 'pending_verification' : 
                ['pending_imf_bop'].includes(verification.status) ? 'not_started' : 
                verification.isinCode.isVerified ? 'not_started' : 'locked',
        verifiedAt: verification.imfBopCode.verifiedAt,
      },
      {
        step: 3,
        name: 'LEI Code',
        status: verification.leiCode.isVerified ? 'completed' : 
                verification.status === 'lei_sent' ? 'pending_verification' : 
                ['pending_lei'].includes(verification.status) ? 'not_started' : 
                verification.imfBopCode.isVerified ? 'not_started' : 'locked',
        verifiedAt: verification.leiCode.verifiedAt,
      },
    ];

    sendSuccess(res, {
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
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CANCEL VERIFICATION
// ============================================================================

/**
 * Cancel a pending verification
 * POST /transactions/secure-transfer/cancel
 */
export async function cancelVerification(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { verificationId } = req.body;

    if (!verificationId) {
      throw new ValidationError('Verification ID is required');
    }

    const verification = await TransferVerifications.findOne({
      _id: verificationId,
      user: req.user.userId,
    }).session(session);

    if (!verification) {
      throw new NotFoundError('Verification not found');
    }

    if (verification.status === 'fully_verified') {
      throw new ValidationError('Cannot cancel a completed verification');
    }

    if (verification.status === 'cancelled') {
      throw new ValidationError('Verification already cancelled');
    }

    // Update verification
    verification.status = 'cancelled';
    verification.updatedAt = new Date();
    await verification.save({ session });

    // Cancel the transaction
    await Transactions.findByIdAndUpdate(
      verification.transaction,
      {
        status: 'cancelled',
        failedReason: 'Verification cancelled by user',
      },
      { session }
    );

    // Update tax record
    await TransactionTaxes.findOneAndUpdate(
      { verification: verification._id },
      { status: 'refunded' },
      { session }
    );

    await session.commitTransaction();

    sendSuccess(res, {
      message: 'Verification cancelled successfully',
      verification: {
        id: verification._id,
        status: 'cancelled',
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// GET USER'S PENDING VERIFICATIONS
// ============================================================================

/**
 * Get all pending verifications for the user
 * GET /transactions/secure-transfer/pending
 */
export async function getPendingVerifications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const verifications = await TransferVerifications.find({
      user: req.user.userId,
      status: { $nin: ['fully_verified', 'failed', 'expired', 'cancelled'] },
    })
      .populate('transaction')
      .sort({ createdAt: -1 });

    sendSuccess(res, {
      count: verifications.length,
      verifications: verifications.map(v => ({
        id: v._id,
        verificationId: v.verificationId,
        status: v.status,
        currentStep: v.currentStep,
        transactionDetails: v.transactionDetails,
        taxInfo: v.taxInfo,
        createdAt: v.createdAt,
        expiresAt: v.expiresAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  initiateSecureTransfer,
  requestVerificationCode,
  verifySecurityCode,
  getVerificationStatus,
  cancelVerification,
  getPendingVerifications,
};

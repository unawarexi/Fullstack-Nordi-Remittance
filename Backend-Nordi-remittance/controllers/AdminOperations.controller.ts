// ============================================================================
// ADMIN OPERATIONS CONTROLLER
// ============================================================================
// Handles all admin-initiated financial operations:
// - Credit/Debit user wallets
// - Approve/Reject loans, cards, investments
// - Process refunds and reversals
// - Manual transaction creation
// ============================================================================

import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import type { AuthenticatedRequest } from '../types/index.js';
import { AdminUsers, AdminPermissions, AdminActionLogs } from '../models/AdminModel.js';
import Users from '../models/UserModel.js';
import { Wallets, LedgerEntries } from '../models/AccountsModel.js';
import Transactions from '../models/TransactionModel.js';
import { Loans, LoanApplications } from '../models/LoansModel.js';
import { Cards, CardApplications } from '../models/CardsModel.js';
import { InvestmentAccounts, Portfolios } from '../models/InvestmentsModel.js';
import { Notifications } from '../models/NotificationModel.js';
import { TransactionTaxes } from '../models/TransferVerificationModel.js';
import { generateReferenceNumber, generateUUID } from '../core/helpers/generator.js';
import { sendSuccess, sendCreated, sendPaginated } from '../core/helpers/response.helper.js';
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

// Initialize email content generator
const emailGenerator = new EmailContentGenerator();

// ============================================================================
// TAX CONSTANTS
// ============================================================================

const TAX_RATE = 0.20; // 20% mandatory tax
const TAX_EXEMPT_TYPES = ['loan', 'loan_disbursement', 'loan_repayment']; // No tax on loans

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate 20% tax for a transaction amount
 * Tax is NOT applied to loans
 */
function calculateTransactionTax(
  amount: number, 
  transactionType: string
): { taxAmount: number; netAmount: number; isTaxExempt: boolean } {
  // Check if transaction type is tax exempt (loans)
  const isTaxExempt = TAX_EXEMPT_TYPES.some(t => 
    transactionType.toLowerCase().includes(t.toLowerCase())
  );
  
  if (isTaxExempt) {
    return { taxAmount: 0, netAmount: amount, isTaxExempt: true };
  }
  
  const taxAmount = Math.round(amount * TAX_RATE * 100) / 100;
  const netAmount = Math.round((amount - taxAmount) * 100) / 100;
  
  return { taxAmount, netAmount, isTaxExempt: false };
}

/**
 * Create a tax record for tracking
 */
async function createTaxRecord(
  transactionId: mongoose.Types.ObjectId | string,
  userId: mongoose.Types.ObjectId | string,
  transactionType: string,
  originalAmount: number,
  taxAmount: number,
  currency: string,
  session?: mongoose.ClientSession
): Promise<void> {
  if (taxAmount <= 0) return; // No tax to record
  
  const createOptions = session ? { session } : {};
  await TransactionTaxes.create([{
    transaction: transactionId.toString(),
    user: userId.toString(),
    transactionType,
    originalAmount,
    taxRate: TAX_RATE,
    taxAmount,
    totalAmount: originalAmount, // User paid the full amount
    currency,
    status: 'collected',
    collectedAt: new Date(),
  }], createOptions as any);
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
  if (!wallet.balances) {
    wallet.balances = new Map();
  }
  const current = getWalletBalance(wallet, currency);
  if (wallet.balances instanceof Map) {
    wallet.balances.set(currency, current + amount);
  } else {
    wallet.balances[currency] = current + amount;
  }
}

/**
 * Check if admin has specific permission
 */
async function hasPermission(adminId: string, permission: string): Promise<boolean> {
  const admin = await AdminUsers.findById(adminId).populate('permissions');
  if (!admin) return false;
  
  // Super admin has all permissions
  if (admin.role === 'super_admin') return true;
  
  // Check specific permission
  const permissions = await AdminPermissions.findOne({ admin: adminId });
  if (!permissions) return false;
  
  return (permissions as any)[permission] === true;
}

/**
 * Log admin action
 */
async function logAdminAction(
  adminId: string,
  action: string,
  resource: string,
  resourceId: string,
  changes: any,
  req: AuthenticatedRequest,
  status: 'success' | 'failed',
  failureReason?: string
): Promise<void> {
  await AdminActionLogs.create({
    admin: adminId,
    action,
    resource,
    resourceId,
    changes,
    ipAddress: req.ip || '',
    userAgent: req.headers['user-agent'] || '',
    status,
    failureReason,
  });
}

/**
 * Create notification for user
 */
async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: string,
  metadata?: any
): Promise<void> {
  await Notifications.create({
    user: userId,
    title,
    message,
    type,
    metadata,
    isRead: false,
  });
  
  // Real-time notification
  emitToUser(userId, 'notification', { title, message, type });
}

// ============================================================================
// CREDIT USER WALLET
// ============================================================================

/**
 * Credit a user's wallet (Admin initiated deposit/funding)
 * POST /admin/operations/credit
 */
export async function creditUserWallet(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canCredit = await hasPermission(req.user.userId, 'canAdjustBalances');
    if (!canCredit) {
      throw new ForbiddenError('You do not have permission to credit user wallets');
    }

    const {
      userId,
      amount,
      currency = 'USD',
      description,
      transactionType = 'deposit', // deposit, funding, bonus, refund, correction
      reference,
      metadata,
    } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    // Calculate tax (20% - except for loans)
    const { taxAmount, netAmount, isTaxExempt } = calculateTransactionTax(amount, transactionType);

    // Get user
    const user = await Users.findById(userId).session(session);
    if (!user) throw new NotFoundError('User not found');

    // Get or create wallet
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
    // User receives net amount after tax (if applicable)
    const creditAmount = isTaxExempt ? amount : netAmount;
    updateWalletBalance(wallet, currency, creditAmount);
    const newBalance = getWalletBalance(wallet, currency);

    await wallet.save({ session });

    // Create transaction record
    const referenceNumber = reference || generateReferenceNumber();
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
      fee: taxAmount, // Store tax as fee
      meta: {
        adminInitiated: true,
        adminId: req.user.userId,
        adminEmail: req.user.email,
        previousBalance,
        newBalance,
        originalAmount: amount,
        taxAmount,
        taxRate: isTaxExempt ? 0 : TAX_RATE,
        isTaxExempt,
        ...metadata,
      },
      completedAt: new Date(),
      channel: 'web',
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    await transaction.save({ session });

    // Create tax record if applicable
    if (taxAmount > 0) {
      await createTaxRecord(
        transaction._id,
        userId,
        transactionType,
        amount,
        taxAmount,
        currency,
        session
      );
    }

    // Create ledger entry
    await LedgerEntries.create([{
      wallet: wallet._id,
      transaction: transaction._id,
      entryType: 'credit',
      amount: creditAmount,
      currency,
      balance: newBalance,
      description: `Admin credit: ${description || transactionType}${taxAmount > 0 ? ` (Tax: ${currency} ${taxAmount.toFixed(2)})` : ''}`,
      accountingDate: new Date(),
    }], { session });

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'CREDIT_USER_WALLET',
      'wallet',
      wallet._id.toString(),
      {
        userId,
        originalAmount: amount,
        creditedAmount: creditAmount,
        taxAmount,
        taxRate: isTaxExempt ? 0 : TAX_RATE,
        isTaxExempt,
        currency,
        transactionType,
        previousBalance,
        newBalance,
        referenceNumber,
      },
      req,
      'success'
    );

    await session.commitTransaction();

    // Notify user
    const taxNote = taxAmount > 0 
      ? ` (${currency} ${taxAmount.toFixed(2)} tax deducted from original ${currency} ${amount.toFixed(2)})` 
      : '';
    await notifyUser(
      userId,
      'Wallet Credited',
      `Your wallet has been credited with ${currency} ${creditAmount.toFixed(2)}${taxNote}. Reference: ${referenceNumber}`,
      'transaction',
      { transactionId: transaction._id, amount: creditAmount, taxAmount, currency }
    );

    // Send email notification (using generic notification)
    // Email is optional - log error but don't fail
    try {
      await sendTemplatedMail(String(user.email), {
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

    sendSuccess(res, {
      transaction: {
        id: transaction._id,
        referenceNumber,
        type: transactionType,
        originalAmount: amount,
        creditedAmount: creditAmount,
        taxAmount,
        taxRate: isTaxExempt ? '0%' : '20%',
        isTaxExempt,
        currency,
        status: 'completed',
        previousBalance,
        newBalance,
      },
    }, `Wallet credited successfully${taxAmount > 0 ? ' (20% tax applied)' : ''}`);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// DEBIT USER WALLET
// ============================================================================

/**
 * Debit a user's wallet (Admin initiated withdrawal/deduction)
 * POST /admin/operations/debit
 */
export async function debitUserWallet(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canDebit = await hasPermission(req.user.userId, 'canAdjustBalances');
    if (!canDebit) {
      throw new ForbiddenError('You do not have permission to debit user wallets');
    }

    const {
      userId,
      amount,
      currency = 'USD',
      description,
      transactionType = 'withdrawal', // withdrawal, fee, penalty, correction
      reference,
      forceDebit = false, // Allow negative balance (super admin only)
      metadata,
    } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    // Get user
    const user = await Users.findById(userId).session(session);
    if (!user) throw new NotFoundError('User not found');

    // Get wallet
    const wallet = await Wallets.findOne({ user: userId, status: 'active' }).session(session);
    if (!wallet) throw new NotFoundError('User wallet not found');

    const previousBalance = getWalletBalance(wallet, currency);

    // Check balance (unless forceDebit by super admin)
    if (previousBalance < amount && !forceDebit) {
      throw new InsufficientBalanceError(amount, previousBalance);
    }

    // Only super admin can force debit
    if (forceDebit) {
      const admin = await AdminUsers.findById(req.user.userId);
      if (admin?.role !== 'super_admin') {
        throw new ForbiddenError('Only super admin can force debit with insufficient balance');
      }
    }

    updateWalletBalance(wallet, currency, -amount);
    const newBalance = getWalletBalance(wallet, currency);

    await wallet.save({ session });

    // Create transaction record
    const referenceNumber = reference || generateReferenceNumber();
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
      meta: {
        adminInitiated: true,
        adminId: req.user.userId,
        adminEmail: req.user.email,
        previousBalance,
        newBalance,
        forceDebit,
        ...metadata,
      },
      completedAt: new Date(),
      channel: 'web',
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    await transaction.save({ session });

    // Create ledger entry
    await LedgerEntries.create([{
      wallet: wallet._id,
      transaction: transaction._id,
      entryType: 'debit',
      amount,
      currency,
      balance: newBalance,
      description: `Admin debit: ${description || transactionType}`,
      accountingDate: new Date(),
    }], { session });

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'DEBIT_USER_WALLET',
      'wallet',
      wallet._id.toString(),
      {
        userId,
        amount,
        currency,
        transactionType,
        previousBalance,
        newBalance,
        forceDebit,
        referenceNumber,
      },
      req,
      'success'
    );

    await session.commitTransaction();

    // Notify user
    await notifyUser(
      userId,
      'Wallet Debited',
      `${currency} ${amount.toFixed(2)} has been debited from your wallet. Reference: ${referenceNumber}`,
      'transaction',
      { transactionId: transaction._id, amount, currency }
    );

    // Send email notification (optional)
    try {
      await sendTemplatedMail(String(user.email), {
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

    sendSuccess(res, {
      transaction: {
        id: transaction._id,
        referenceNumber,
        type: transactionType,
        amount,
        currency,
        status: 'completed',
        previousBalance,
        newBalance,
      },
    }, 'Wallet debited successfully');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// ADMIN TRANSFER BETWEEN USERS
// ============================================================================

/**
 * Transfer funds between two users (Admin initiated)
 * POST /admin/operations/transfer
 */
export async function adminTransfer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canTransfer = await hasPermission(req.user.userId, 'canAdjustBalances');
    if (!canTransfer) {
      throw new ForbiddenError('You do not have permission to perform transfers');
    }

    const {
      fromUserId,
      toUserId,
      amount,
      currency = 'USD',
      description,
      metadata,
    } = req.body;

    if (fromUserId === toUserId) {
      throw new ValidationError('Cannot transfer to the same account');
    }

    // Validate amount
    if (!amount || amount <= 0) {
      throw new ValidationError('Amount must be greater than zero');
    }

    // Get users
    const [fromUser, toUser] = await Promise.all([
      Users.findById(fromUserId).session(session),
      Users.findById(toUserId).session(session),
    ]);

    if (!fromUser) throw new NotFoundError('Sender not found');
    if (!toUser) throw new NotFoundError('Recipient not found');

    // Get wallets
    const [fromWallet, toWallet] = await Promise.all([
      Wallets.findOne({ user: fromUserId, status: 'active' }).session(session),
      Wallets.findOne({ user: toUserId, status: 'active' }).session(session),
    ]);

    if (!fromWallet) throw new NotFoundError('Sender wallet not found');
    if (!toWallet) throw new NotFoundError('Recipient wallet not found');

    const fromPreviousBalance = getWalletBalance(fromWallet, currency);

    // Check balance
    if (fromPreviousBalance < amount) {
      throw new InsufficientBalanceError(amount, fromPreviousBalance);
    }

    const toPreviousBalance = getWalletBalance(toWallet, currency);

    // Update balances
    updateWalletBalance(fromWallet, currency, -amount);
    updateWalletBalance(toWallet, currency, amount);

    const fromNewBalance = getWalletBalance(fromWallet, currency);
    const toNewBalance = getWalletBalance(toWallet, currency);

    await fromWallet.save({ session });
    await toWallet.save({ session });

    // Create transaction records
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
        adminInitiated: true,
        adminId: req.user.userId,
        adminEmail: req.user.email,
        previousBalance: fromPreviousBalance,
        newBalance: fromNewBalance,
        ...metadata,
      },
      completedAt: new Date(),
      channel: 'web',
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
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
        adminInitiated: true,
        adminId: req.user.userId,
        relatedReference: referenceNumber,
        senderName: `${fromUser.firstName} ${fromUser.lastName}`,
        previousBalance: toPreviousBalance,
        newBalance: toNewBalance,
        ...metadata,
      },
      completedAt: new Date(),
      channel: 'web',
    });

    await fromTransaction.save({ session });
    await toTransaction.save({ session });

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'ADMIN_TRANSFER',
      'transaction',
      referenceNumber,
      {
        fromUserId,
        toUserId,
        amount,
        currency,
        fromPreviousBalance,
        fromNewBalance,
        toPreviousBalance,
        toNewBalance,
      },
      req,
      'success'
    );

    await session.commitTransaction();

    // Notify both users
    await notifyUser(
      fromUserId,
      'Funds Transferred',
      `${currency} ${amount.toFixed(2)} has been transferred from your account. Reference: ${referenceNumber}`,
      'transaction',
      { transactionId: fromTransaction._id, amount, currency }
    );

    await notifyUser(
      toUserId,
      'Funds Received',
      `You have received ${currency} ${amount.toFixed(2)}. Reference: ${referenceNumber}`,
      'transaction',
      { transactionId: toTransaction._id, amount, currency }
    );

    sendSuccess(res, {
      transfer: {
        referenceNumber,
        amount,
        currency,
        from: {
          userId: fromUserId,
          name: `${fromUser.firstName} ${fromUser.lastName}`,
          previousBalance: fromPreviousBalance,
          newBalance: fromNewBalance,
        },
        to: {
          userId: toUserId,
          name: `${toUser.firstName} ${toUser.lastName}`,
          previousBalance: toPreviousBalance,
          newBalance: toNewBalance,
        },
      },
    }, 'Transfer completed successfully');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// LOAN MANAGEMENT
// ============================================================================

/**
 * Approve loan application
 * POST /admin/operations/loans/:loanId/approve
 */
export async function approveLoan(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canApprove = await hasPermission(req.user.userId, 'canApproveLoans');
    if (!canApprove) {
      throw new ForbiddenError('You do not have permission to approve loans');
    }

    const { loanId } = req.params;
    const { 
      approvedAmount, 
      interestRate, 
      termMonths, 
      disbursementDate,
      notes,
    } = req.body;

    // Get loan application
    const application = await LoanApplications.findById(loanId).session(session);
    if (!application) throw new NotFoundError('Loan application not found');

    // LoanApplication status can be: draft, submitted, under_review, approved, rejected, cancelled
    if (application.status !== 'submitted' && application.status !== 'under_review') {
      throw new ValidationError(`Cannot approve loan with status: ${application.status}`);
    }

    const finalAmount = approvedAmount || application.requestedAmount;
    const finalRate = interestRate || 12; // Default 12% APR
    const finalTerm = termMonths || application.term || 12; // months

    // Update application status
    application.status = 'approved';
    application.approvedAmount = finalAmount;
    application.approvedRate = finalRate;
    application.approvedTerm = finalTerm;
    application.reviewedBy = req.user.userId;
    application.reviewedAt = new Date();
    application.reviewNotes = notes;
    await application.save({ session });

    // Get user's wallet
    const wallet = await Wallets.findOne({ user: application.user }).session(session);
    if (!wallet) throw new NotFoundError('User wallet not found');

    // Calculate loan details
    const monthlyPayment = calculateMonthlyPayment(finalAmount, finalRate, finalTerm);
    const totalInterest = (monthlyPayment * finalTerm) - finalAmount;
    const totalRepayment = finalAmount + totalInterest;

    // Calculate dates
    const startDate = disbursementDate ? new Date(disbursementDate) : new Date();
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + finalTerm);

    // Create loan record (Loan status: pending, active, paid, defaulted, written_off, paused)
    const loan = new Loans({
      user: application.user,
      wallet: wallet._id,
      loanType: application.loanType || 'personal',
      principalAmount: finalAmount,
      outstandingBalance: totalRepayment,
      interestRate: finalRate,
      term: finalTerm,
      startDate,
      maturityDate,
      monthlyPayment,
      totalInterest,
      totalRepayment,
      status: 'pending', // Will become 'active' after disbursement
      currency: 'USD',
      disbursementMethod: 'wallet',
      purpose: application.purpose,
      approvedBy: req.user.userId,
      approvedAt: new Date(),
    });

    // Link application to loan
    application.loan = loan._id;
    await application.save({ session });
    await loan.save({ session });

    // Get user for notification
    const user = await Users.findById(application.user).session(session);

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'APPROVE_LOAN',
      'loan',
      loan._id.toString(),
      {
        applicationId: application._id,
        approvedAmount: finalAmount,
        interestRate: finalRate,
        termMonths: finalTerm,
      },
      req,
      'success'
    );

    await session.commitTransaction();

    // Notify user
    if (user) {
      await notifyUser(
        user._id.toString(),
        'Loan Approved!',
        `Your loan application for USD ${finalAmount.toFixed(2)} has been approved!`,
        'loan',
        { loanId: loan._id, amount: finalAmount }
      );

      // Send email notification
      try {
        await sendTemplatedMail(String(user.email), {
          EMAIL_TITLE: 'Loan Application Approved',
          GREETING: `Hello ${user.firstName},`,
          MAIN_CONTENT: `
            <p>Great news! Your loan application has been <strong>approved</strong>.</p>
            <p><strong>Loan Details:</strong></p>
            <ul>
              <li>Principal Amount: USD ${finalAmount.toFixed(2)}</li>
              <li>Interest Rate: ${finalRate}% APR</li>
              <li>Term: ${finalTerm} months</li>
              <li>Monthly Payment: USD ${monthlyPayment.toFixed(2)}</li>
              <li>Total Repayment: USD ${totalRepayment.toFixed(2)}</li>
            </ul>
            <p>The loan will be disbursed to your wallet shortly.</p>
          `,
          COMPANY_NAME: 'Nordea Remittance',
          YEAR: new Date().getFullYear(),
          FOOTER_TEXT: 'This is an automated notification from Nordea Remittance.',
        } as any);
      } catch (emailError) {
        console.error('Failed to send loan approval email:', emailError);
      }
    }

    sendSuccess(res, {
      loan: {
        id: loan._id,
        applicationId: application._id,
        principalAmount: finalAmount,
        interestRate: finalRate,
        termMonths: finalTerm,
        monthlyPayment,
        totalRepayment,
        status: loan.status,
        startDate: loan.startDate,
        maturityDate: loan.maturityDate,
      },
    }, 'Loan approved successfully');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

/**
 * Reject loan application
 * POST /admin/operations/loans/:loanId/reject
 */
export async function rejectLoan(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canManage = await hasPermission(req.user.userId, 'canManageLoans');
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to reject loans');
    }

    const { loanId } = req.params;
    const { reason, notes } = req.body;

    const application = await LoanApplications.findById(loanId);
    if (!application) throw new NotFoundError('Loan application not found');

    if (application.status !== 'submitted' && application.status !== 'under_review') {
      throw new ValidationError(`Cannot reject loan with status: ${application.status}`);
    }

    application.status = 'rejected';
    application.rejectionReason = reason;
    application.reviewNotes = notes;
    application.reviewedBy = req.user.userId;
    application.reviewedAt = new Date();
    await application.save();

    // Get user for notification
    const user = await Users.findById(application.user);

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'REJECT_LOAN',
      'loan_application',
      application._id.toString(),
      { reason, notes },
      req,
      'success'
    );

    // Notify user
    if (user) {
      await notifyUser(
        user._id.toString(),
        'Loan Application Update',
        `Your loan application has been reviewed. Unfortunately, we cannot approve it at this time. Reason: ${reason}`,
        'loan',
        { applicationId: application._id }
      );

      // Send email notification
      try {
        await sendTemplatedMail(String(user.email), {
          EMAIL_TITLE: 'Loan Application Update',
          GREETING: `Hello ${user.firstName},`,
          MAIN_CONTENT: `
            <p>We have reviewed your loan application for <strong>USD ${application.requestedAmount.toFixed(2)}</strong>.</p>
            <p>Unfortunately, we are unable to approve your application at this time.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>If you have any questions or would like to discuss this decision, please contact our support team.</p>
          `,
          COMPANY_NAME: 'Nordea Remittance',
          YEAR: new Date().getFullYear(),
          FOOTER_TEXT: 'This is an automated notification from Nordea Remittance.',
        } as any);
      } catch (emailError) {
        console.error('Failed to send loan rejection email:', emailError);
      }
    }

    sendSuccess(res, {
      application: {
        id: application._id,
        status: application.status,
        rejectionReason: reason,
      },
    }, 'Loan application rejected');
  } catch (error) {
    next(error);
  }
}

/**
 * Disburse approved loan
 * POST /admin/operations/loans/:loanId/disburse
 */
export async function disburseLoan(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canDisburse = await hasPermission(req.user.userId, 'canApproveLoans');
    if (!canDisburse) {
      throw new ForbiddenError('You do not have permission to disburse loans');
    }

    const { loanId } = req.params;

    const loan = await Loans.findById(loanId).session(session);
    if (!loan) throw new NotFoundError('Loan not found');

    // Loan status: pending, active, paid, defaulted, written_off, paused
    // 'pending' is the status after approval but before disbursement
    if (loan.status !== 'pending') {
      throw new ValidationError('Loan must be in pending status for disbursement');
    }

    // Get user's wallet
    const wallet = await Wallets.findOne({ user: loan.user, status: 'active' }).session(session);
    if (!wallet) throw new NotFoundError('User wallet not found');

    const currency = loan.currency || 'USD';
    const previousBalance = getWalletBalance(wallet, currency);

    // Credit wallet with loan amount
    updateWalletBalance(wallet, currency, loan.principalAmount);
    const newBalance = getWalletBalance(wallet, currency);

    await wallet.save({ session });

    // Create transaction
    const referenceNumber = generateReferenceNumber();
    const transaction = new Transactions({
      wallet: wallet._id,
      referenceNumber,
      type: 'deposit',
      category: 'loans',
      categoryItemId: loan._id.toString(),
      amount: loan.principalAmount,
      currency,
      status: 'completed',
      description: `Loan disbursement - Loan ID: ${loan._id}`,
      initiatedBy: loan.user,
      meta: {
        loanId: loan._id,
        adminInitiated: true,
        adminId: req.user.userId,
        previousBalance,
        newBalance,
      },
      completedAt: new Date(),
      channel: 'web',
    });

    await transaction.save({ session });

    // Update loan status to 'active' (disbursed and active loan)
    loan.status = 'active';
    loan.disbursementDate = new Date();
    await loan.save({ session });

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'DISBURSE_LOAN',
      'loan',
      loan._id.toString(),
      {
        amount: loan.principalAmount,
        walletId: wallet._id,
        previousBalance,
        newBalance,
        referenceNumber,
      },
      req,
      'success'
    );

    await session.commitTransaction();

    // Notify user
    const user = await Users.findById(loan.user);
    if (user) {
      await notifyUser(
        user._id.toString(),
        'Loan Disbursed',
        `Your loan of ${currency} ${loan.principalAmount.toFixed(2)} has been disbursed to your wallet!`,
        'loan',
        { loanId: loan._id, amount: loan.principalAmount }
      );
    }

    sendSuccess(res, {
      loan: {
        id: loan._id,
        status: loan.status,
        disbursedAmount: loan.principalAmount,
        disbursementDate: loan.disbursementDate,
      },
      wallet: {
        previousBalance,
        newBalance,
      },
      transactionReference: referenceNumber,
    }, 'Loan disbursed successfully');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// CARD MANAGEMENT
// ============================================================================

/**
 * Approve card application
 * POST /admin/operations/cards/:cardId/approve
 */
export async function approveCard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canManage = await hasPermission(req.user.userId, 'canManageCards');
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to approve cards');
    }

    const { cardId } = req.params;
    const { creditLimit, notes } = req.body;

    // Get card application
    const application = await CardApplications.findById(cardId);
    if (!application) throw new NotFoundError('Card application not found');

    // CardApplication status: pending, under_review, approved, rejected, cancelled
    if (application.status !== 'pending' && application.status !== 'under_review') {
      throw new ValidationError(`Cannot approve card with status: ${application.status}`);
    }

    // Update application
    application.status = 'approved';
    application.approvedBy = req.user.userId;
    application.approvedAt = new Date();
    application.reviewNotes = notes;
    await application.save();

    // Get user's wallet
    const wallet = await Wallets.findOne({ user: application.user });
    if (!wallet) throw new NotFoundError('User wallet not found');

    // Generate card details
    const cardNumber = generateCardNumber();
    const cvv = generateCVV();
    const expiryMonth = new Date().getMonth() + 1;
    const expiryYear = new Date().getFullYear() + 4;

    // Create card (using actual CardSchema fields)
    const card = new Cards({
      user: application.user,
      wallet: wallet._id,
      cardNumber: cardNumber,
      cardholderName: 'Card Holder', // Should come from user profile
      cardType: application.cardType,
      cardBrand: 'visa',
      expiryMonth,
      expiryYear,
      cvv,
      status: 'pending_activation',
      isPhysical: !application.isVirtual,
      creditLimit: application.cardType === 'credit' ? (creditLimit || application.requestedLimit || 5000) : undefined,
      availableCredit: application.cardType === 'credit' ? (creditLimit || application.requestedLimit || 5000) : undefined,
      billingAddress: application.billingAddress,
      currency: application.currency || 'USD',
    });

    await card.save();

    // Get user for notification
    const user = await Users.findById(application.user);
    if (user && user.firstName && user.lastName) {
      card.cardholderName = `${user.firstName} ${user.lastName}`.toUpperCase();
      await card.save();
    }

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'APPROVE_CARD',
      'card',
      card._id.toString(),
      {
        applicationId: application._id,
        cardType: card.cardType,
        creditLimit: card.creditLimit,
      },
      req,
      'success'
    );

    // Notify user
    if (user) {
      await notifyUser(
        user._id.toString(),
        'Card Approved!',
        `Your ${card.cardType} card application has been approved! Card ending in ${cardNumber.slice(-4)}`,
        'card',
        { cardId: card._id }
      );

      // Send email
      try {
        await sendTemplatedMail(String(user.email), {
          EMAIL_TITLE: 'Card Application Approved',
          GREETING: `Hello ${user.firstName},`,
          MAIN_CONTENT: `
            <p>Your <strong>${card.cardType}</strong> card application has been approved!</p>
            <p><strong>Card Details:</strong></p>
            <ul>
              <li>Card Type: ${card.cardType}</li>
              <li>Card Number: **** **** **** ${cardNumber.slice(-4)}</li>
              <li>Expiry: ${String(expiryMonth).padStart(2, '0')}/${expiryYear}</li>
              ${card.creditLimit ? `<li>Credit Limit: ${application.currency || 'USD'} ${card.creditLimit.toFixed(2)}</li>` : ''}
            </ul>
            <p>Your card will need to be activated before use.</p>
          `,
          COMPANY_NAME: 'Nordea Remittance',
          YEAR: new Date().getFullYear(),
          FOOTER_TEXT: 'This is an automated notification from Nordea Remittance.',
        } as any);
      } catch (emailError) {
        console.error('Failed to send card approval email:', emailError);
      }
    }

    sendSuccess(res, {
      card: {
        id: card._id,
        cardNumberMasked: `**** **** **** ${cardNumber.slice(-4)}`,
        cardType: card.cardType,
        status: card.status,
        creditLimit: card.creditLimit,
        expiryMonth,
        expiryYear,
      },
    }, 'Card approved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Reject card application
 * POST /admin/operations/cards/:cardId/reject
 */
export async function rejectCard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canManage = await hasPermission(req.user.userId, 'canManageCards');
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to reject cards');
    }

    const { cardId } = req.params;
    const { reason, notes } = req.body;

    const application = await CardApplications.findById(cardId);
    if (!application) throw new NotFoundError('Card application not found');

    if (application.status !== 'pending' && application.status !== 'under_review') {
      throw new ValidationError(`Cannot reject card with status: ${application.status}`);
    }

    application.status = 'rejected';
    application.rejectionReason = reason;
    application.reviewNotes = notes;
    application.reviewedBy = req.user.userId;
    application.reviewedAt = new Date();
    await application.save();

    // Get user for notification
    const user = await Users.findById(application.user);

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'REJECT_CARD',
      'card_application',
      application._id.toString(),
      { reason, notes },
      req,
      'success'
    );

    // Notify user
    if (user) {
      await notifyUser(
        user._id.toString(),
        'Card Application Update',
        `Your card application has been reviewed. Unfortunately, we cannot approve it at this time.`,
        'card',
        { applicationId: application._id }
      );
    }

    sendSuccess(res, {
      application: {
        id: application._id,
        status: application.status,
        rejectionReason: reason,
      },
    }, 'Card application rejected');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// INVESTMENT MANAGEMENT
// ============================================================================

/**
 * Approve investment
 * POST /admin/operations/investments/:investmentId/approve
 */
export async function approveInvestment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canManage = await hasPermission(req.user.userId, 'canManageInvestments');
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to approve investments');
    }

    const { investmentId } = req.params;
    const { notes } = req.body;

    const investment = await InvestmentAccounts.findById(investmentId);
    if (!investment) throw new NotFoundError('Investment not found');

    // InvestmentAccount status: active, suspended, closed
    investment.status = 'active';
    await investment.save();

    // Get user
    const user = await Users.findById(investment.user);

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'APPROVE_INVESTMENT',
      'investment',
      investment._id.toString(),
      { notes },
      req,
      'success'
    );

    // Notify user
    if (user) {
      await notifyUser(
        user._id.toString(),
        'Investment Approved',
        `Your investment account has been approved and is now active!`,
        'investment',
        { investmentId: investment._id }
      );
    }

    sendSuccess(res, {
      investment: {
        id: investment._id,
        accountType: investment.accountType,
        status: investment.status,
        totalInvested: investment.totalInvested,
        currentValue: investment.currentValue,
      },
    }, 'Investment approved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Add returns/earnings to investment
 * POST /admin/operations/investments/:investmentId/add-returns
 * NOTE: 20% tax is applied when crediting returns to wallet
 */
export async function addInvestmentReturns(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canManage = await hasPermission(req.user.userId, 'canManageInvestments');
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to manage investments');
    }

    const { investmentId } = req.params;
    const { amount, description, creditToWallet = false } = req.body;

    if (!amount || amount <= 0) {
      throw new ValidationError('Return amount must be greater than zero');
    }

    const investment = await InvestmentAccounts.findById(investmentId).session(session);
    if (!investment) throw new NotFoundError('Investment not found');

    // Update investment value and returns (full amount - tax only on wallet credit)
    // InvestmentAccount has: totalInvested, currentValue, totalReturns, returnPercentage
    const previousValue = investment.currentValue || 0;
    investment.currentValue = previousValue + amount;
    investment.totalReturns = (investment.totalReturns || 0) + amount;
    investment.returnPercentage = investment.totalInvested > 0 
      ? ((investment.totalReturns / investment.totalInvested) * 100) 
      : 0;
    await investment.save({ session });

    let walletTransaction = null;
    let taxInfo = { taxAmount: 0, netAmount: amount, isTaxExempt: false };

    // Optionally credit to user's wallet (with 20% tax)
    if (creditToWallet) {
      const wallet = await Wallets.findOne({ user: investment.user, status: 'active' }).session(session);
      if (wallet) {
        const currency = investment.currency || 'USD';
        
        // Calculate 20% tax on investment returns credited to wallet
        taxInfo = calculateTransactionTax(amount, 'investment_return');
        const creditAmount = taxInfo.netAmount;
        
        const walletPrevBalance = getWalletBalance(wallet, currency);
        updateWalletBalance(wallet, currency, creditAmount);
        await wallet.save({ session });

        // Create transaction
        const referenceNumber = generateReferenceNumber();
        walletTransaction = new Transactions({
          wallet: wallet._id,
          referenceNumber,
          type: 'deposit',
          category: 'investments',
          categoryItemId: investment._id.toString(),
          amount: creditAmount,
          currency,
          status: 'completed',
          description: description || `Investment returns (after ${TAX_RATE * 100}% tax)`,
          initiatedBy: investment.user,
          fee: taxInfo.taxAmount,
          meta: {
            investmentId: investment._id,
            adminInitiated: true,
            adminId: req.user.userId,
            previousBalance: walletPrevBalance,
            newBalance: getWalletBalance(wallet, currency),
            originalAmount: amount,
            taxAmount: taxInfo.taxAmount,
            taxRate: TAX_RATE,
          },
          completedAt: new Date(),
          channel: 'web',
        });

        await walletTransaction.save({ session });

        // Create tax record
        if (taxInfo.taxAmount > 0) {
          await createTaxRecord(
            walletTransaction._id,
            investment.user,
            'investment_return',
            amount,
            taxInfo.taxAmount,
            currency,
            session
          );
        }

        // Create ledger entry
        await LedgerEntries.create([{
          wallet: wallet._id,
          transaction: walletTransaction._id,
          entryType: 'credit',
          amount: creditAmount,
          currency,
          balance: getWalletBalance(wallet, currency),
          description: `Investment returns: ${currency} ${amount.toFixed(2)} (Tax: ${currency} ${taxInfo.taxAmount.toFixed(2)})`,
          accountingDate: new Date(),
        }], { session });
      }
    }

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'ADD_INVESTMENT_RETURNS',
      'investment',
      investment._id.toString(),
      {
        amount,
        previousValue,
        newValue: investment.currentValue,
        creditedToWallet: creditToWallet,
        taxAmount: taxInfo.taxAmount,
        netAmountCredited: taxInfo.netAmount,
      },
      req,
      'success'
    );

    await session.commitTransaction();

    // Notify user
    const user = await Users.findById(investment.user);
    if (user) {
      const taxNote = creditToWallet && taxInfo.taxAmount > 0 
        ? ` After 20% tax, ${investment.currency || 'USD'} ${taxInfo.netAmount.toFixed(2)} credited to wallet.`
        : creditToWallet ? ' Funds have been credited to your wallet.' : '';
      await notifyUser(
        user._id.toString(),
        'Investment Returns Added',
        `${investment.currency || 'USD'} ${amount.toFixed(2)} has been added to your investment!${taxNote}`,
        'investment',
        { investmentId: investment._id, amount, taxAmount: taxInfo.taxAmount }
      );
    }

    sendSuccess(res, {
      investment: {
        id: investment._id,
        previousValue,
        currentValue: investment.currentValue,
        totalReturns: investment.totalReturns,
        returnPercentage: investment.returnPercentage,
      },
      walletTransaction: walletTransaction ? {
        referenceNumber: walletTransaction.referenceNumber,
        originalAmount: amount,
        creditedAmount: taxInfo.netAmount,
        taxAmount: taxInfo.taxAmount,
        taxRate: '20%',
      } : null,
    }, `Investment returns added successfully${creditToWallet && taxInfo.taxAmount > 0 ? ' (20% tax applied on wallet credit)' : ''}`);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// TRANSACTION MANAGEMENT
// ============================================================================

/**
 * Get pending transactions for review
 * GET /admin/operations/transactions/pending
 */
export async function getPendingTransactions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canView = await hasPermission(req.user.userId, 'canViewTransactions');
    if (!canView) {
      throw new ForbiddenError('You do not have permission to view transactions');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = { status: 'pending' };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.minAmount) filter.amount = { $gte: parseFloat(req.query.minAmount as string) };

    const [transactions, total] = await Promise.all([
      Transactions.find(filter)
        .populate('wallet', 'walletNumber')
        .populate('initiatedBy', 'firstName lastName email')
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
 * Approve pending transaction
 * POST /admin/operations/transactions/:transactionId/approve
 */
export async function approveTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canApprove = await hasPermission(req.user.userId, 'canReverseTransactions');
    if (!canApprove) {
      throw new ForbiddenError('You do not have permission to approve transactions');
    }

    const { transactionId } = req.params;
    const { notes } = req.body;

    const transaction = await Transactions.findById(transactionId).session(session);
    if (!transaction) throw new NotFoundError('Transaction not found');

    if (transaction.status !== 'pending') {
      throw new ValidationError(`Cannot approve transaction with status: ${transaction.status}`);
    }

    // Process the transaction based on type
    const wallet = await Wallets.findById(transaction.wallet).session(session);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const currency = transaction.currency;
    const amount = transaction.amount;

    if (transaction.type === 'withdrawal') {
      // Debit wallet
      const currentBalance = getWalletBalance(wallet, currency);
      if (currentBalance < amount) {
        throw new InsufficientBalanceError(amount, currentBalance);
      }
      updateWalletBalance(wallet, currency, -amount);
    } else if (transaction.type === 'deposit') {
      // Credit wallet
      updateWalletBalance(wallet, currency, amount);
    }

    await wallet.save({ session });

    // Update transaction status
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    transaction.meta = {
      ...transaction.meta,
      approvedBy: req.user.userId,
      approvedAt: new Date(),
      approvalNotes: notes,
    };
    await transaction.save({ session });

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'APPROVE_TRANSACTION',
      'transaction',
      transaction._id.toString(),
      {
        referenceNumber: transaction.referenceNumber,
        type: transaction.type,
        amount: transaction.amount,
        notes,
      },
      req,
      'success'
    );

    await session.commitTransaction();

    sendSuccess(res, {
      transaction: {
        id: transaction._id,
        referenceNumber: transaction.referenceNumber,
        status: transaction.status,
        completedAt: transaction.completedAt,
      },
    }, 'Transaction approved successfully');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

/**
 * Reject pending transaction
 * POST /admin/operations/transactions/:transactionId/reject
 */
export async function rejectTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canReject = await hasPermission(req.user.userId, 'canReverseTransactions');
    if (!canReject) {
      throw new ForbiddenError('You do not have permission to reject transactions');
    }

    const { transactionId } = req.params;
    const { reason } = req.body;

    const transaction = await Transactions.findById(transactionId);
    if (!transaction) throw new NotFoundError('Transaction not found');

    if (transaction.status !== 'pending') {
      throw new ValidationError(`Cannot reject transaction with status: ${transaction.status}`);
    }

    transaction.status = 'failed';
    transaction.failedReason = reason;
    transaction.meta = {
      ...transaction.meta,
      rejectedBy: req.user.userId,
      rejectedAt: new Date(),
      rejectionReason: reason,
    };
    await transaction.save();

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'REJECT_TRANSACTION',
      'transaction',
      transaction._id.toString(),
      {
        referenceNumber: transaction.referenceNumber,
        type: transaction.type,
        amount: transaction.amount,
        reason,
      },
      req,
      'success'
    );

    // Notify user
    await notifyUser(
      transaction.initiatedBy.toString(),
      'Transaction Rejected',
      `Your ${transaction.type} transaction of ${transaction.currency} ${transaction.amount.toFixed(2)} was rejected. Reason: ${reason}`,
      'transaction',
      { transactionId: transaction._id }
    );

    sendSuccess(res, {
      transaction: {
        id: transaction._id,
        referenceNumber: transaction.referenceNumber,
        status: transaction.status,
        failedReason: transaction.failedReason,
      },
    }, 'Transaction rejected');
  } catch (error) {
    next(error);
  }
}

/**
 * Reverse/Refund a completed transaction
 * POST /admin/operations/transactions/:transactionId/reverse
 */
export async function reverseTransaction(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Check permission
    const canReverse = await hasPermission(req.user.userId, 'canReverseTransactions');
    if (!canReverse) {
      throw new ForbiddenError('You do not have permission to reverse transactions');
    }

    const { transactionId } = req.params;
    const { reason, fullRefund = true, refundAmount } = req.body;

    if (!reason) {
      throw new ValidationError('Reversal reason is required');
    }

    const transaction = await Transactions.findById(transactionId).session(session);
    if (!transaction) throw new NotFoundError('Transaction not found');

    if (transaction.status !== 'completed') {
      throw new ValidationError('Only completed transactions can be reversed');
    }

    const wallet = await Wallets.findById(transaction.wallet).session(session);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const currency = transaction.currency;
    const reverseAmount = fullRefund ? transaction.amount : (refundAmount || transaction.amount);

    // Reverse the transaction
    if (transaction.type === 'withdrawal' || transaction.type === 'payment' || transaction.type === 'transfer') {
      // Original was debit, so credit back
      updateWalletBalance(wallet, currency, reverseAmount);
    } else if (transaction.type === 'deposit') {
      // Original was credit, so debit back
      const currentBalance = getWalletBalance(wallet, currency);
      if (currentBalance < reverseAmount) {
        throw new InsufficientBalanceError(reverseAmount, currentBalance);
      }
      updateWalletBalance(wallet, currency, -reverseAmount);
    }

    await wallet.save({ session });

    // Create reversal transaction
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
        originalTransaction: transaction._id,
        originalReference: transaction.referenceNumber,
        adminInitiated: true,
        adminId: req.user.userId,
        fullRefund,
      },
      completedAt: new Date(),
      channel: 'web',
    });

    await reversalTransaction.save({ session });

    // Update original transaction
    transaction.status = 'reversed';
    transaction.reversalReason = reason;
    transaction.meta = {
      ...transaction.meta,
      reversedBy: req.user.userId,
      reversedAt: new Date(),
      reversalTransaction: reversalTransaction._id,
    };
    await transaction.save({ session });

    // Log admin action
    await logAdminAction(
      req.user.userId,
      'REVERSE_TRANSACTION',
      'transaction',
      transaction._id.toString(),
      {
        originalReference: transaction.referenceNumber,
        reversalReference,
        amount: reverseAmount,
        reason,
        fullRefund,
      },
      req,
      'success'
    );

    await session.commitTransaction();

    // Notify user
    await notifyUser(
      transaction.initiatedBy.toString(),
      'Transaction Reversed',
      `Your transaction ${transaction.referenceNumber} has been reversed. Amount: ${currency} ${reverseAmount.toFixed(2)}`,
      'transaction',
      { transactionId: reversalTransaction._id, amount: reverseAmount }
    );

    sendSuccess(res, {
      reversal: {
        id: reversalTransaction._id,
        referenceNumber: reversalReference,
        originalTransaction: transaction.referenceNumber,
        amount: reverseAmount,
        status: 'completed',
      },
    }, 'Transaction reversed successfully');
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk credit multiple users
 * POST /admin/operations/bulk/credit
 */
export async function bulkCredit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    // Only super admin can do bulk operations
    const admin = await AdminUsers.findById(req.user.userId);
    if (admin?.role !== 'super_admin') {
      throw new ForbiddenError('Only super admin can perform bulk operations');
    }

    const { operations, description } = req.body;
    // operations: [{ userId, amount, currency }]

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
          meta: {
            adminInitiated: true,
            adminId: req.user!.userId,
            bulkOperation: true,
          },
          completedAt: new Date(),
          channel: 'web',
        });

        await transaction.save({ session });
        await session.commitTransaction();
        session.endSession();

        results.push({
          userId: op.userId,
          amount: op.amount,
          currency,
          previousBalance,
          newBalance,
          referenceNumber,
        });
      } catch (err: any) {
        errors.push({ userId: op.userId, error: err.message });
      }
    }

    // Log bulk operation
    await logAdminAction(
      req.user.userId,
      'BULK_CREDIT',
      'wallet',
      'bulk',
      {
        totalOperations: operations.length,
        successful: results.length,
        failed: errors.length,
        description,
      },
      req,
      errors.length === operations.length ? 'failed' : 'success'
    );

    sendSuccess(res, {
      summary: {
        total: operations.length,
        successful: results.length,
        failed: errors.length,
      },
      results,
      errors: errors.length > 0 ? errors : undefined,
    }, `Bulk credit completed: ${results.length}/${operations.length} successful`);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR LOAN CALCULATIONS
// ============================================================================

function calculateMonthlyPayment(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / tenureMonths;
  
  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                  (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(payment * 100) / 100;
}

function calculateTotalPayable(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, tenureMonths);
  return Math.round(monthlyPayment * tenureMonths * 100) / 100;
}

function generateCardNumber(): string {
  // Generate a valid-looking card number (for simulation)
  const prefix = '4'; // Visa prefix
  let cardNumber = prefix;
  for (let i = 0; i < 15; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
}

function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // Wallet Operations
  creditUserWallet,
  debitUserWallet,
  adminTransfer,
  
  // Loan Management
  approveLoan,
  rejectLoan,
  disburseLoan,
  
  // Card Management
  approveCard,
  rejectCard,
  
  // Investment Management
  approveInvestment,
  addInvestmentReturns,
  
  // Transaction Management
  getPendingTransactions,
  approveTransaction,
  rejectTransaction,
  reverseTransaction,
  
  // Bulk Operations
  bulkCredit,
};

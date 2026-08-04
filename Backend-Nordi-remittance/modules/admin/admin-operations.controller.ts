// @ts-nocheck
import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../core/helpers/response.helper.js';
import { UnauthorizedError } from '../../core/errors/AppError.js';

import { OpsWalletService } from './ops-wallet.service.js';
import { OpsLoanService } from './ops-loan.service.js';
import { OpsCardService } from './ops-card.service.js';
import { OpsInvestmentService } from './ops-investment.service.js';
import { OpsTransactionService } from './ops-transaction.service.js';
import { CardWalletLinkService } from '../accounts/card-wallet-link.service.js';

// ============================================================================
// CREDIT USER WALLET
// ============================================================================
export async function creditUserWallet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsWalletService.creditUserWallet(req.user.userId, req.user.email as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, `Wallet credited successfully${result.transaction.taxAmount > 0 ? ' (20% tax applied)' : ''}`);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DEBIT USER WALLET
// ============================================================================
export async function debitUserWallet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsWalletService.debitUserWallet(req.user.userId, req.user.email as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Wallet debited successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN TRANSFER BETWEEN USERS
// ============================================================================
export async function adminTransfer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsWalletService.adminTransfer(req.user.userId, req.user.email as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Transfer completed successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// BULK CREDIT
// ============================================================================
export async function bulkCredit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsWalletService.bulkCredit(req.user.userId, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, `Bulk credit completed: ${result.summary.successful}/${result.summary.total} successful`);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ACCOUNT APPLICATIONS MANAGEMENT
// ============================================================================
export async function getPendingApplications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsWalletService.getPendingApplications();
    sendSuccess(res, result, 'Pending applications retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function approveAccountApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsWalletService.approveApplication(req.user.userId, req.params.applicationId as string, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Account application approved successfully');
  } catch (error) {
    next(error);
  }
}

export async function rejectAccountApplication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsWalletService.rejectApplication(req.user.userId, req.params.applicationId as string, req.body.reason, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Account application rejected successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// LOAN MANAGEMENT
// ============================================================================
export async function approveLoan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsLoanService.approveLoan(req.user.userId, req.params.loanId as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Loan approved successfully');
  } catch (error) {
    next(error);
  }
}

export async function rejectLoan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsLoanService.rejectLoan(req.user.userId, req.params.loanId as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Loan application rejected');
  } catch (error) {
    next(error);
  }
}

export async function disburseLoan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsLoanService.disburseLoan(req.user.userId, req.params.loanId as string, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Loan disbursed successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CARD MANAGEMENT
// ============================================================================
export async function approveCard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const id = req.params.cardId || req.params.id;
    const result = await OpsCardService.approveCard(req.user.userId, id as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, { card: result.card, status: result.status || result.card.status }, result.isDirectActivation ? 'Card approved and activated successfully' : 'Card approved successfully');
  } catch (error) {
    next(error);
  }
}

export async function rejectCard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const id = req.params.cardId || req.params.id;
    const result = await OpsCardService.rejectCard(req.user.userId, id as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result.isDirectBlock ? { card: result.card, status: result.status } : { application: result.application }, result.isDirectBlock ? 'Card rejected/blocked successfully' : 'Card application rejected');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// INVESTMENT MANAGEMENT
// ============================================================================
export async function approveInvestment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsInvestmentService.approveInvestment(req.user.userId, req.params.investmentId as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Investment approved successfully');
  } catch (error) {
    next(error);
  }
}

export async function addInvestmentReturns(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsInvestmentService.addInvestmentReturns(req.user.userId, req.params.investmentId as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    const msg = `Investment returns added successfully${req.body.creditToWallet && result.walletTransaction?.taxAmount > 0 ? ' (20% tax applied on wallet credit)' : ''}`;
    sendSuccess(res, result, msg);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// TRANSACTION MANAGEMENT
// ============================================================================
export async function getPendingTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const filters = { type: req.query.type as string, minAmount: req.query.minAmount as string };
    const result = await OpsTransactionService.getPendingTransactions(req.user.userId, filters, { page, limit });
    sendPaginated(res, result.transactions, { page, limit, total: result.total });
  } catch (error) {
    next(error);
  }
}

export async function approveTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsTransactionService.approveTransaction(req.user.userId, req.params.transactionId as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Transaction approved successfully');
  } catch (error) {
    next(error);
  }
}

export async function rejectTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsTransactionService.rejectTransaction(req.user.userId, req.params.transactionId as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Transaction rejected');
  } catch (error) {
    next(error);
  }
}

export async function reverseTransaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await OpsTransactionService.reverseTransaction(req.user.userId, req.params.transactionId as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, result, 'Transaction reversed successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN CARD FUNDING FROM WALLET
// ============================================================================
export async function adminFundCardFromWallet(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const { walletId, amount, currency } = req.body;
    const result = await CardWalletLinkService.adminFundCardFromWallet(
      req.params.cardId as string,
      walletId,
      amount,
      req.user.userId,
      currency
    );
    sendSuccess(res, result, 'Card funded from wallet successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================
export default {
  // Wallet Operations
  creditUserWallet, debitUserWallet, adminTransfer,
  // Loan Management
  approveLoan, rejectLoan, disburseLoan,
  // Card Management
  approveCard, rejectCard,
  // Investment Management
  approveInvestment, addInvestmentReturns,
  // Transaction Management
  getPendingTransactions, approveTransaction, rejectTransaction, reverseTransaction,
  // Account Applications
  getPendingApplications, approveAccountApplication, rejectAccountApplication,
  // Bulk Operations
  bulkCredit,
  // Card Funding
  adminFundCardFromWallet,
};

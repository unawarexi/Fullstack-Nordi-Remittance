import mongoose from 'mongoose';
import type { AuthenticatedRequest } from '../../types/index.js';
import { AdminUsers, AdminPermissions, AdminActionLogs } from './admin.model.js';
import { TransactionTaxes } from '../transfer-verification/transfer-verification.model.js';
import { Notifications } from '../notifications/notifications.model.js';
import { emitToUser } from '../../services/websocket.service.js';

export const TAX_RATE = 0.2; // 20% mandatory tax
export const TAX_EXEMPT_TYPES = ['loan', 'loan_disbursement', 'loan_repayment'];

/**
 * Calculate 20% tax for a transaction amount
 * Tax is NOT applied to loans
 */
export function calculateTransactionTax(
  amount: number,
  transactionType: string,
): { taxAmount: number; netAmount: number; isTaxExempt: boolean } {
  const isTaxExempt = TAX_EXEMPT_TYPES.some((t) =>
    transactionType.toLowerCase().includes(t.toLowerCase()),
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
export async function createTaxRecord(
  transactionId: mongoose.Types.ObjectId | string,
  userId: mongoose.Types.ObjectId | string,
  transactionType: string,
  originalAmount: number,
  taxAmount: number,
  currency: string,
  session?: mongoose.ClientSession,
): Promise<void> {
  if (taxAmount <= 0) return;

  const createOptions = session ? { session } : {};
  await TransactionTaxes.create(
    [
      {
        transaction: transactionId.toString(),
        user: userId.toString(),
        transactionType,
        originalAmount,
        taxRate: TAX_RATE,
        taxAmount,
        totalAmount: originalAmount,
        currency,
        status: 'collected',
        collectedAt: new Date(),
      },
    ],
    createOptions as any,
  );
}

/**
 * Get wallet balance for a specific currency
 */
export function getWalletBalance(wallet: any, currency: string): number {
  if (!wallet || !wallet.balances) return 0;
  if (wallet.balances instanceof Map) {
    return wallet.balances.get(currency) || 0;
  }
  return wallet.balances[currency] || 0;
}

/**
 * Update wallet balance for a specific currency
 */
export function updateWalletBalance(wallet: any, currency: string, amount: number): void {
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
export async function hasPermission(adminId: string, permission: string): Promise<boolean> {
  const admin = await AdminUsers.findById(adminId).populate('permissions');
  if (!admin) return false;

  if (admin.role === 'super_admin') return true;

  const permissions = await AdminPermissions.findOne({ admin: adminId });
  if (!permissions) return false;

  return (permissions as any)[permission] === true;
}

/**
 * Log admin action
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  resource: string,
  resourceId: string,
  changes: any,
  ip: string,
  userAgent: string,
  status: 'success' | 'failed',
  failureReason?: string,
): Promise<void> {
  await AdminActionLogs.create({
    admin: adminId,
    action,
    resource,
    resourceId,
    changes,
    ipAddress: ip || '',
    userAgent: userAgent || '',
    status,
    failureReason,
  });
}

/**
 * Create notification for user
 */
export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: string,
  metadata?: any,
): Promise<void> {
  await Notifications.create({
    user: userId,
    title,
    message,
    type,
    metadata,
    isRead: false,
  });

  emitToUser(userId, 'notification', { title, message, type });
}

// ============================================================================
// HELPER FUNCTIONS FOR LOAN CALCULATIONS
// ============================================================================

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / tenureMonths;

  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(payment * 100) / 100;
}

export function calculateTotalPayable(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, tenureMonths);
  return Math.round(monthlyPayment * tenureMonths * 100) / 100;
}

// ============================================================================
// HELPER FUNCTIONS FOR CARDS
// ============================================================================

export function generateCardNumber(): string {
  const prefix = '4'; // Visa prefix
  let cardNumber = prefix;
  for (let i = 0; i < 15; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
}

export function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}



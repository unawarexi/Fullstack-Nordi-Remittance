import mongoose from 'mongoose';
import Users from '../users/users.model.js';
import { Wallets, LedgerEntries } from '../accounts/accounts.model.js';
import Transactions from '../transactions/transactions.model.js';
import { InvestmentAccounts } from '../investments/investments.model.js';
import { generateReferenceNumber } from '../../core/helpers/generator.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../../core/errors/AppError.js';
import { validateUserEligibility } from '../../core/guards/user-eligibility.guard.js';
import {
  hasPermission,
  logAdminAction,
  notifyUser,
  calculateTransactionTax,
  createTaxRecord,
  getWalletBalance,
  updateWalletBalance,
  TAX_RATE
} from './ops.helpers.js';

export class OpsInvestmentService {
  /**
   * Approve an investment
   */
  static async approveInvestment(currentUserId: string, investmentId: string, data: any, ip: string, userAgent: string) {
    const canManage = await hasPermission(currentUserId, 'canManageInvestments');
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to approve investments');
    }

    const { notes } = data;

    const investment = await InvestmentAccounts.findById(investmentId);
    if (!investment) throw new NotFoundError('Investment not found');

    await validateUserEligibility(String(investment.user), 'investment approval');

    investment.status = 'active';
    await investment.save();

    const user = await Users.findById(investment.user);

    await logAdminAction(
      currentUserId,
      'APPROVE_INVESTMENT',
      'investment',
      (investment._id as any).toString(),
      { notes },
      ip,
      userAgent,
      'success',
    );

    if (user) {
      await notifyUser(
        (user._id as any).toString(),
        'Investment Approved',
        `Your investment account has been approved and is now active!`,
        'investment',
        { investmentId: investment._id }
      );
    }

    return {
      investment: {
        id: investment._id,
        accountType: investment.accountType,
        status: investment.status,
        totalInvested: investment.totalInvested,
        currentValue: investment.currentValue,
      },
    };
  }

  /**
   * Add returns/earnings to investment
   */
  static async addInvestmentReturns(currentUserId: string, investmentId: string, data: any, ip: string, userAgent: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const canManage = await hasPermission(currentUserId, 'canManageInvestments');
      if (!canManage) {
        throw new ForbiddenError('You do not have permission to manage investments');
      }

      const { amount, description, creditToWallet = false } = data;

      if (!amount || amount <= 0) {
        throw new ValidationError('Return amount must be greater than zero');
      }

      const investment = await InvestmentAccounts.findById(investmentId).session(session);
      if (!investment) throw new NotFoundError('Investment not found');

      await validateUserEligibility(String(investment.user), 'investment returns');

      const previousValue = investment.currentValue || 0;
      investment.currentValue = previousValue + amount;
      investment.totalReturns = (investment.totalReturns || 0) + amount;
      investment.returnPercentage = investment.totalInvested > 0 ? (investment.totalReturns / investment.totalInvested) * 100 : 0;
      await investment.save({ session });

      let walletTransaction: any = null;
      let taxInfo = { taxAmount: 0, netAmount: amount, isTaxExempt: false };

      if (creditToWallet) {
        const wallet = await Wallets.findOne({ user: investment.user, status: 'active' }).session(session);
        if (wallet) {
          const currency = investment.currency || 'USD';

          taxInfo = calculateTransactionTax(amount, 'investment_return');
          const creditAmount = taxInfo.netAmount;

          const walletPrevBalance = getWalletBalance(wallet, currency);
          updateWalletBalance(wallet, currency, creditAmount);
          await wallet.save({ session });

          const referenceNumber = generateReferenceNumber();
          walletTransaction = new Transactions({
            wallet: wallet._id,
            referenceNumber,
            type: 'deposit',
            category: 'investments',
            categoryItemId: (investment._id as any).toString(),
            amount: creditAmount,
            currency,
            status: 'completed',
            description: description || `Investment returns (after ${TAX_RATE * 100}% tax)`,
            initiatedBy: investment.user,
            fee: taxInfo.taxAmount,
            meta: {
              investmentId: investment._id, adminInitiated: true, adminId: currentUserId,
              previousBalance: walletPrevBalance, newBalance: getWalletBalance(wallet, currency),
              originalAmount: amount, taxAmount: taxInfo.taxAmount, taxRate: TAX_RATE,
            },
            completedAt: new Date(),
            channel: 'web',
          });

          await walletTransaction.save({ session });

          if (taxInfo.taxAmount > 0) {
            await createTaxRecord(walletTransaction._id, investment.user, 'investment_return', amount, taxInfo.taxAmount, currency, session);
          }

          await LedgerEntries.create(
            [{
              wallet: wallet._id,
              transaction: walletTransaction._id,
              entryType: 'credit',
              amount: creditAmount,
              currency,
              balance: getWalletBalance(wallet, currency),
              description: `Investment returns: ${currency} ${amount.toFixed(2)} (Tax: ${currency} ${taxInfo.taxAmount.toFixed(2)})`,
              accountingDate: new Date(),
            }],
            { session },
          );
        }
      }

      await logAdminAction(
        currentUserId,
        'ADD_INVESTMENT_RETURNS',
        'investment',
        (investment._id as any).toString(),
        { amount, previousValue, newValue: investment.currentValue, creditedToWallet: creditToWallet, taxAmount: taxInfo.taxAmount, netAmountCredited: taxInfo.netAmount },
        ip,
        userAgent,
        'success',
      );

      await session.commitTransaction();

      const user = await Users.findById(investment.user);
      if (user) {
        const taxNote = creditToWallet && taxInfo.taxAmount > 0
          ? ` After 20% tax, ${investment.currency || 'USD'} ${taxInfo.netAmount.toFixed(2)} credited to wallet.`
          : creditToWallet ? ' Funds have been credited to your wallet.' : '';
        await notifyUser(
          (user._id as any).toString(),
          'Investment Returns Added',
          `${investment.currency || 'USD'} ${amount.toFixed(2)} has been added to your investment!${taxNote}`,
          'investment',
          { investmentId: investment._id, amount, taxAmount: taxInfo.taxAmount }
        );
      }

      return {
        investment: {
          id: investment._id, previousValue, currentValue: investment.currentValue,
          totalReturns: investment.totalReturns, returnPercentage: investment.returnPercentage,
        },
        walletTransaction: walletTransaction ? {
          referenceNumber: walletTransaction.referenceNumber, originalAmount: amount,
          creditedAmount: taxInfo.netAmount, taxAmount: taxInfo.taxAmount, taxRate: '20%',
        } : null,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

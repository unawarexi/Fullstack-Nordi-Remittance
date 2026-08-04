// @ts-nocheck
import { Wallets } from "./accounts.model.js";
import { Loans, LoanRepayments } from "../loans/loans.model.js";
import { LedgerEntries } from "./accounts.model.js";
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from "../../core/errors/AppError.js";

// ============================================================================
// DEFAULT POLICIES by account type — applied when a wallet is provisioned
// ============================================================================
export const DEFAULT_ACCOUNT_POLICIES: Record<string, any> = {
  personal: {
    maxWithdrawalsPerMonth: null, // unlimited
    minBalance: 0,
    earlyWithdrawalPenalty: 0,
    allowOverdraft: false,
    requiresApprovalForLargeTransfers: false,
    largeTransferThreshold: null,
  },
  business: {
    maxWithdrawalsPerMonth: null,
    minBalance: 0,
    earlyWithdrawalPenalty: 0,
    allowOverdraft: false,
    requiresApprovalForLargeTransfers: true,
    largeTransferThreshold: 10000,
  },
  savings: {
    maxWithdrawalsPerMonth: 6, // Regulation D
    minBalance: 100,
    earlyWithdrawalPenalty: 0,
    allowOverdraft: false,
    requiresApprovalForLargeTransfers: false,
    largeTransferThreshold: null,
  },
  current: {
    maxWithdrawalsPerMonth: null,
    minBalance: 0,
    earlyWithdrawalPenalty: 0,
    allowOverdraft: false, // set to true if approved via application
    requiresApprovalForLargeTransfers: false,
    largeTransferThreshold: null,
  },
  fixed_deposit: {
    maxWithdrawalsPerMonth: 0, // locked until maturity
    minBalance: 0, // will be set to principal
    earlyWithdrawalPenalty: 2, // 2% penalty
    allowOverdraft: false,
    requiresApprovalForLargeTransfers: false,
    largeTransferThreshold: null,
  },
};

export class WalletLifecycleService {
  /**
   * Central policy enforcement gate.
   * Called before any withdrawal/transfer from a wallet.
   */
  static async enforceAccountPolicies(
    walletId: string,
    operation: "withdrawal" | "transfer" | "payment",
    amount: number,
    currency: string = "USD"
  ) {
    const wallet = await Wallets.findById(walletId);
    if (!wallet) throw new NotFoundError("Wallet not found");

    if (wallet.isDeleted) throw new ForbiddenError("This account has been closed");
    if (wallet.status === "frozen") throw new ForbiddenError("This account is frozen by regulatory hold");
    if (wallet.status === "suspended") throw new ForbiddenError("This account is suspended");
    if (wallet.status === "closed") throw new ForbiddenError("This account is closed");

    const policies = wallet.accountPolicies;
    const walletType = wallet.walletType;
    const currentBalance = wallet.balances?.get(currency) || 0;

    const violations: string[] = [];

    // ===== FIXED DEPOSIT: block all withdrawals before maturity =====
    if (walletType === "fixed_deposit") {
      if (wallet.maturityDate && new Date() < wallet.maturityDate) {
        if (policies?.earlyWithdrawalPenalty && policies.earlyWithdrawalPenalty > 0) {
          violations.push(
            `Fixed deposit has not matured (maturity: ${wallet.maturityDate.toISOString().split("T")[0]}). ` +
            `Early withdrawal penalty of ${policies.earlyWithdrawalPenalty}% applies.`
          );
        } else {
          violations.push(
            `Fixed deposit has not matured. Withdrawals are locked until ${wallet.maturityDate.toISOString().split("T")[0]}.`
          );
        }
      }
    }

    // ===== SAVINGS: Regulation D withdrawal limit =====
    if (walletType === "savings" && policies?.maxWithdrawalsPerMonth) {
      // Reset counter if month has passed
      if (wallet.withdrawalCountResetDate && new Date() > wallet.withdrawalCountResetDate) {
        wallet.withdrawalCount = 0;
        wallet.withdrawalCountResetDate = WalletLifecycleService.getNextMonthResetDate();
        await wallet.save();
      }

      if ((wallet.withdrawalCount || 0) >= policies.maxWithdrawalsPerMonth) {
        violations.push(
          `Savings account withdrawal limit reached (${policies.maxWithdrawalsPerMonth}/month). ` +
          `Resets on ${wallet.withdrawalCountResetDate?.toISOString().split("T")[0] || "next month"}.`
        );
      }
    }

    // ===== MINIMUM BALANCE CHECK =====
    if (policies?.minBalance && policies.minBalance > 0) {
      const balanceAfter = currentBalance - amount;
      if (balanceAfter < policies.minBalance) {
        // Allow if overdraft is enabled (current accounts)
        if (policies.allowOverdraft && walletType === "current") {
          const overdraftAvailable = (wallet.overdraftLimit || 0) - (wallet.overdraftUsed || 0);
          const shortfall = policies.minBalance - balanceAfter;
          if (shortfall > overdraftAvailable) {
            violations.push(
              `Insufficient funds including overdraft. Available overdraft: ${currency} ${overdraftAvailable.toFixed(2)}`
            );
          }
        } else {
          violations.push(
            `Transaction would bring balance below minimum required (${currency} ${policies.minBalance.toFixed(2)})`
          );
        }
      }
    }

    // ===== BUSINESS: Large transfer approval =====
    if (walletType === "business" && policies?.requiresApprovalForLargeTransfers) {
      if (policies.largeTransferThreshold && amount > policies.largeTransferThreshold) {
        violations.push(
          `Business account transfers above ${currency} ${policies.largeTransferThreshold.toFixed(2)} require admin approval`
        );
      }
    }

    // ===== INSUFFICIENT BALANCE (general) =====
    if (currentBalance < amount) {
      if (walletType === "current" && policies?.allowOverdraft) {
        const overdraftAvailable = (wallet.overdraftLimit || 0) - (wallet.overdraftUsed || 0);
        const shortfall = amount - currentBalance;
        if (shortfall > overdraftAvailable) {
          violations.push(
            `Insufficient balance and overdraft. Balance: ${currency} ${currentBalance.toFixed(2)}, ` +
            `Overdraft available: ${currency} ${overdraftAvailable.toFixed(2)}`
          );
        }
        // If we get here, overdraft covers it — allowed
      } else {
        violations.push(`Insufficient balance: ${currency} ${currentBalance.toFixed(2)} available`);
      }
    }

    if (violations.length > 0) {
      throw new ValidationError(violations.join(" | "));
    }

    return { allowed: true, walletType, policies };
  }

  /**
   * Increment savings withdrawal counter (call after successful withdrawal)
   */
  static async recordWithdrawal(walletId: string) {
    const wallet = await Wallets.findById(walletId);
    if (!wallet) return;

    if (wallet.walletType === "savings") {
      wallet.withdrawalCount = (wallet.withdrawalCount || 0) + 1;
      if (!wallet.withdrawalCountResetDate || new Date() > wallet.withdrawalCountResetDate) {
        wallet.withdrawalCountResetDate = WalletLifecycleService.getNextMonthResetDate();
      }
      await wallet.save();
    }
  }

  /**
   * Calculate a user's credit score from all their wallets' loan history
   */
  static async calculateCreditScore(userId: string): Promise<number> {
    const loans = await Loans.find({ user: userId });

    if (loans.length === 0) {
      return 650; // default score for no credit history
    }

    let score = 650; // base

    for (const loan of loans) {
      // Positive: paid or active with no missed payments
      if (loan.status === "paid") {
        score += 30; // completed loan boosts score
      }
      if (loan.status === "active" && (loan.missedPayments || 0) === 0) {
        score += 15; // active loan in good standing
      }

      // Negative: missed/late payments
      score -= (loan.missedPayments || 0) * 20;
      score -= (loan.latePayments || 0) * 10;

      // Negative: defaulted
      if (loan.status === "defaulted") {
        score -= 100;
      }
      if (loan.status === "written_off") {
        score -= 150;
      }
    }

    // Factor in account age (longer is better)
    const wallets = await Wallets.find({ user: userId, isDeleted: false });
    const oldestWallet = wallets.reduce((oldest: any, w: any) => {
      return !oldest || w.createdAt < oldest.createdAt ? w : oldest;
    }, null);

    if (oldestWallet) {
      const accountAgeMonths = Math.floor(
        (Date.now() - new Date(oldestWallet.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000)
      );
      score += Math.min(accountAgeMonths * 2, 50); // max 50 points from age
    }

    // Clamp between 300 and 850
    score = Math.max(300, Math.min(850, score));

    // Update all user wallets with this score
    await Wallets.updateMany(
      { user: userId, isDeleted: false },
      { creditScore: score, creditScoreUpdatedAt: new Date() }
    );

    return score;
  }

  /**
   * Get consolidated account limits across all wallets for a user
   */
  static async getConsolidatedLimits(userId: string) {
    const wallets = await Wallets.find({ user: userId, isDeleted: false, status: "active" });

    return wallets.map((w: any) => ({
      walletId: w._id,
      walletNumber: w.walletNumber,
      walletType: w.walletType,
      limits: w.limits,
      accountPolicies: w.accountPolicies,
      overdraftLimit: w.overdraftLimit,
      overdraftUsed: w.overdraftUsed,
      withdrawalCount: w.withdrawalCount,
      withdrawalCountResetDate: w.withdrawalCountResetDate,
    }));
  }

  /**
   * Reset monthly withdrawal counters (call via cron monthly)
   */
  static async resetMonthlyCounts() {
    const result = await Wallets.updateMany(
      {
        walletType: "savings",
        isDeleted: false,
        status: "active",
      },
      {
        withdrawalCount: 0,
        withdrawalCountResetDate: WalletLifecycleService.getNextMonthResetDate(),
      }
    );
    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Process fixed deposit maturity.
   * Called by scheduler or admin. Credits accrued interest, optionally auto-renews.
   */
  static async processFixedDepositMaturity(walletId: string) {
    const wallet = await Wallets.findById(walletId);
    if (!wallet) throw new NotFoundError("Wallet not found");
    if (wallet.walletType !== "fixed_deposit") throw new ValidationError("Not a fixed deposit wallet");
    if (wallet.isDeleted) throw new ForbiddenError("Wallet is deleted");

    if (!wallet.maturityDate || new Date() < wallet.maturityDate) {
      throw new ValidationError("Fixed deposit has not yet matured");
    }

    const currency = wallet.balances ? Array.from((wallet.balances as any).keys())[0] || "USD" : "USD";
    const principal = wallet.balances?.get(currency) || 0;
    const rate = wallet.interestRate || 0;
    const accruedInterest = wallet.accruedInterest || 0;

    // Credit interest to the wallet
    const totalInterest = accruedInterest > 0 ? accruedInterest : principal * (rate / 100);
    wallet.balances?.set(currency, principal + totalInterest);
    wallet.accruedInterest = 0;
    wallet.lastInterestAccrualDate = new Date();

    if (wallet.autoRenew) {
      // Set new maturity date (same term length)
      const termMonths = wallet.accountPolicies?.minBalance
        ? 12 // default re-invest for 12 months
        : 12;
      const newMaturity = new Date();
      newMaturity.setMonth(newMaturity.getMonth() + termMonths);
      wallet.maturityDate = newMaturity;

      // Reset the balance to just the new principal (principal + interest)
      wallet.accountPolicies = {
        ...wallet.accountPolicies,
        minBalance: principal + totalInterest,
      };
    } else {
      // Unlock the deposit — change policies to allow withdrawal
      wallet.accountPolicies = {
        ...wallet.accountPolicies,
        maxWithdrawalsPerMonth: null as any,
        earlyWithdrawalPenalty: 0,
      };
    }

    wallet.updatedAt = new Date();
    await wallet.save();

    return {
      walletId,
      principal,
      interestEarned: totalInterest,
      newBalance: wallet.balances?.get(currency),
      autoRenewed: wallet.autoRenew,
      newMaturityDate: wallet.autoRenew ? wallet.maturityDate : null,
    };
  }

  /**
   * Helper: get next month's 1st for counter reset
   */
  private static getNextMonthResetDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
}

export default WalletLifecycleService;

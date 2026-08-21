// ============================================================================
// ACCOUNTS TYPES — Mirrors AccountsModel.ts
// Wallet, AccountBalance, LedgerEntry, AccountLimit, AccountStatusHistory
//
// ADDED in this pass:
//  - Beneficiary          (was pushed into Users.beneficiaries by BeneficiaryService,
//                           but had no matching frontend type at all)
//  - AccountLimitBand      + AccountLimitsSummary  (shape returned by
//                           AccountAnalyticsService.getAccountLimits)
//  - AccountSummaryResponse (shape returned by AccountAnalyticsService.getAccountSummary)
// ============================================================================

declare global {
  interface Wallet extends Timestamps {
    id: UUID;
    user: UUID;
    walletNumber: string;
    balances: Record<string, number>;
    status: WalletStatus;
    lastTransactionAt?: ISO8601Date;
    transactionHistory?: UUID[];
    isPrimary: boolean;
    walletType: WalletType;
    limits?: {
      daily?: number;
      monthly?: number;
      perTransaction?: number;
    };
    freezeReason?: string;
    closedAt?: ISO8601Date;
    notes?: string;
    /** Present only on list responses from WalletService.getWallets */
    recentTransactionsCount?: number;
  }

  interface AccountBalance extends Timestamps {
    id: UUID;
    wallet: UUID;
    currency: Currency;
    availableBalance: number;
    ledgerBalance: number;
    pendingBalance: number;
    reservedBalance: number;
    lastUpdated: ISO8601Date;
  }

  interface LedgerEntry {
    id: UUID;
    transaction: UUID;
    wallet: UUID;
    entryType: "debit" | "credit";
    amount: number;
    currency: string;
    balance: number;
    description: string;
    createdAt: ISO8601Date;
    accountingDate: ISO8601Date;
    isReversed: boolean;
    reversalEntry?: UUID;
  }

  interface AccountLimit extends Timestamps {
    id: UUID;
    wallet: UUID;
    limitType: "daily" | "monthly" | "yearly" | "per_transaction";
    category: "withdrawal" | "transfer" | "payment" | "all";
    amount: number;
    currency: string;
    usedAmount: number;
    resetDate: ISO8601Date;
    isActive: boolean;
  }

  interface AccountStatusHistory {
    id: UUID;
    wallet: UUID;
    previousStatus: string;
    newStatus: string;
    reason: string;
    changedBy: string;
    metadata?: Record<string, unknown>;
    effectiveDate: ISO8601Date;
    createdAt: ISO8601Date;
  }

  /** Sub-document on Users.beneficiaries, surfaced through the accounts BeneficiaryService. */
  interface Beneficiary {
    id: UUID;
    accountNumber?: string;
    email?: string;
    name: string;
    nickname?: string;
    bankName?: string;
    bankCode?: string;
    type: "internal" | "external";
    createdAt: ISO8601Date;
  }

  interface AccountLimitBand {
    limit: number;
    used: number;
    remaining: number;
  }

  interface AccountSummaryTransaction {
    id: UUID;
    reference: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    direction: "in" | "out";
    createdAt: ISO8601Date;
  }

  interface AccountSummaryResponse {
    summary: {
      totalBalance: number;
      primaryCurrency: string;
      walletsCount: number;
      monthlyStats: {
        incoming: number;
        outgoing: number;
        netFlow: number;
        transactionCount: number;
      };
    };
    wallets: Array<Pick<Wallet, "walletNumber" | "balances" | "walletType" | "isPrimary"> & { id?: UUID }>;
    recentTransactions: AccountSummaryTransaction[];
  }
  // ============================================================================
  // ACCOUNT APPLICATIONS — types for the client-side account-opening flow
  // ============================================================================

  type AccountApplicationType = "savings" | "current" | "fixed_deposit";
  type AccountApplicationStatus = "pending" | "approved" | "rejected";

  interface BaseAccountApplication {
    id: string;
    type: AccountApplicationType;
    status: AccountApplicationStatus;
    currency: string;
    nickname?: string;
    submittedAt: string;
    reviewedAt?: string;
    rejectionReason?: string;
  }

  interface SavingsAccountApplication extends BaseAccountApplication {
    type: "savings";
    initialDeposit: number;
    goal?: string;
    autoSave: boolean;
    autoSaveAmount?: number;
  }

  interface CurrentAccountApplication extends BaseAccountApplication {
    type: "current";
    purpose: "personal" | "business";
    businessName?: string;
    expectedMonthlyVolume?: number;
    overdraftRequested: boolean;
  }

  interface FixedDepositApplication extends BaseAccountApplication {
    type: "fixed_deposit";
    principal: number;
    termMonths: 3 | 6 | 12 | 24 | 36;
    interestRate: number;
    maturityDate: string;
    autoRenew: boolean;
  }

  type AccountApplication = SavingsAccountApplication | CurrentAccountApplication | FixedDepositApplication;
}

export {};
// ============================================================================
// ACCOUNT APPLICATIONS CONSTANTS
// ============================================================================

export const ACCOUNT_TYPE_LABELS: Record<AccountApplicationType, string> = {
  savings: "Savings Account",
  current: "Current Account",
  fixed_deposit: "Fixed Deposit",
};

/** Simple, editable-in-one-place indicative rates until the backend owns pricing. */
export const FIXED_DEPOSIT_RATES: Record<FixedDepositApplication["termMonths"], number> = {
  3: 3.5,
  6: 4.25,
  12: 5.25,
  24: 5.75,
  36: 6.1,
};

export const SAVINGS_INTEREST_RATE = 2.75;

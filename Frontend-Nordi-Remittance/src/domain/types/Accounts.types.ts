// ============================================================================
// ACCOUNTS TYPES — Mirrors AccountsModel.ts
// Wallet, AccountBalance, LedgerEntry, AccountLimit, AccountStatusHistory
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
    entryType: 'debit' | 'credit';
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
    limitType: 'daily' | 'monthly' | 'yearly' | 'per_transaction';
    category: 'withdrawal' | 'transfer' | 'payment' | 'all';
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
}

export {};

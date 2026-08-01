// ============================================================================
// TRANSACTION TYPES — Mirrors TransactionModel.ts
// ============================================================================

declare global {
  interface Transaction extends Timestamps {
    id: UUID;
    reference: string;
    referenceNumber?: string;
    wallet?: UUID;
    type: TransactionType;
    category?: TransactionCategory;
    categoryItemId?: string;
    status: TransactionStatus;
    amount: number;
    currency: Currency;
    fee: number;
    feeCurrency?: string;
    netAmount: number;
    exchangeRate?: number;
    sourceAccountId: UUID;
    destinationAccountId?: UUID;
    sourceWallet?: Wallet;
    destinationWallet?: Wallet;
    initiatedBy?: UUID;
    recipientWallet?: UUID;
    recipientAccountNumber?: string;
    recipientBankName?: string;
    recipientName?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    completedAt?: ISO8601Date;
    failureReason?: string;
    reversalReason?: string;
    scheduledFor?: ISO8601Date;
    isInternational?: boolean;
    channel?: TransactionChannel;
    ipAddress?: string;
    userAgent?: string;
  }

  interface TransactionFilters {
    [key: string]: unknown;
    type?: TransactionType | TransactionType[];
    status?: TransactionStatus | TransactionStatus[];
    category?: TransactionCategory;
    currency?: Currency;
    startDate?: ISO8601Date;
    endDate?: ISO8601Date;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
    page?: number;
    limit?: number;
  }

  interface TransferRequest {
    sourceAccountId: UUID;
    destinationAccountId: UUID;
    amount: number;
    currency: Currency;
    description?: string;
    pin?: string;
  }

  interface RemittanceRequest {
    sourceAccountId: UUID;
    recipientId: UUID;
    amount: number;
    sourceCurrency: Currency;
    destinationCurrency: Currency;
    deliveryMethod: DeliveryMethod;
    purpose: string;
    reference?: string;
  }

  interface DepositRequest {
    accountId: UUID;
    amount: number;
    currency: Currency;
    paymentMethod: 'card' | 'bank_transfer' | 'mobile_money';
    paymentDetails?: Record<string, unknown>;
  }

  interface WithdrawalRequest {
    accountId: UUID;
    amount: number;
    currency: Currency;
    destinationBankAccountId: UUID;
    description?: string;
    pin: string;
  }

  interface TransactionStats {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    data: {
      date: ISO8601Date;
      count: number;
      volume: number;
      fees: number;
    }[];
    totals: {
      count: number;
      volume: number;
      fees: number;
    };
  }

  interface Recipient extends Timestamps {
    id: UUID;
    userId: UUID;
    type: RecipientType;
    nickname?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    country: string;
    currency: Currency;
    deliveryMethod: DeliveryMethod;
    bankAccount?: {
      bankName: string;
      accountNumber: string;
      routingNumber?: string;
      swiftCode?: string;
    };
    mobileWallet?: {
      provider: string;
      number: string;
    };
    isFavorite: boolean;
  }

  interface CreateRecipientRequest {
    type: RecipientType;
    firstName: string;
    lastName: string;
    nickname?: string;
    email?: string;
    phone?: string;
    country: string;
    currency: Currency;
    deliveryMethod: DeliveryMethod;
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      routingNumber?: string;
      swiftCode?: string;
    };
    mobileWalletDetails?: {
      provider: string;
      number: string;
    };
  }
}

export {};

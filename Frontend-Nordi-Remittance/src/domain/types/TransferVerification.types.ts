// ============================================================================
// TRANSFER VERIFICATION TYPES — Mirrors TransferVerificationModel.ts
// TransferVerification, TransactionTax
// ============================================================================

declare global {
  interface VerificationCode {
    code?: string;
    codeHash?: string;
    isVerified: boolean;
    generatedAt?: ISO8601Date;
    verifiedAt?: ISO8601Date;
    expiresAt?: ISO8601Date;
    attempts: number;
    maxAttempts: number;
    sentToEmail: boolean;
    sentAt?: ISO8601Date;
  }

  interface TransferVerification extends Timestamps {
    verificationId: UUID;
    transaction: UUID;
    user: UUID;
    transactionDetails: {
      amount: number;
      currency: string;
      recipientId: string;
      recipientName: string;
      recipientAccountNumber: string;
      type: 'transfer' | 'withdrawal';
    };
    taxInfo: {
      taxRate: number;
      taxAmount: number;
      grossAmount: number;
      netAmount: number;
    };
    currentStep: 1 | 2 | 3;
    isinCode: VerificationCode;
    imfBopCode: VerificationCode;
    leiCode: VerificationCode;
    status:
      | 'pending_isin' | 'isin_sent'
      | 'pending_imf_bop' | 'imf_bop_sent'
      | 'pending_lei' | 'lei_sent'
      | 'fully_verified' | 'failed' | 'expired' | 'cancelled';
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: Record<string, unknown>;
    completedAt?: ISO8601Date;
    expiresAt: ISO8601Date;
    failureReason?: string;
    failedAt?: ISO8601Date;
  }

  interface TransactionTax {
    taxId: UUID;
    transaction: UUID;
    user: UUID;
    transactionType: 'transfer' | 'withdrawal' | 'deposit' | 'card_transaction' | 'investment_credit' | 'investment_return';
    originalAmount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
    status: 'pending' | 'collected' | 'refunded' | 'waived';
    verification?: UUID;
    collectedAt?: ISO8601Date;
    createdAt: ISO8601Date;
    notes?: string;
    waivedBy?: string;
    waivedReason?: string;
  }
}

export {};

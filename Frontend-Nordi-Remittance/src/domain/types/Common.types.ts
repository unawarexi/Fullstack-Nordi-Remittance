// ============================================================================
// COMMON TYPES — Shared scalars, enums, and base interfaces
// Mirrors enum values from all backend models for consistency.
// ============================================================================

declare global {
  // ==========================================================================
  // SCALAR TYPES
  // ==========================================================================
  type UUID = string;
  type ISO8601Date = string;
  type Currency =
    | 'USD' | 'EUR' | 'GBP' | 'NGN' | 'KES' | 'GHS' | 'ZAR' | 'CAD' | 'AUD';

  // ==========================================================================
  // BASE INTERFACES
  // ==========================================================================
  interface Timestamps {
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface SoftDelete extends Timestamps {
    deletedAt: ISO8601Date | null;
  }

  interface DeviceInfo {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    ip: string;
    userAgent: string;
  }

  // ==========================================================================
  // USER ENUMS
  // ==========================================================================
  type UserRole = 'admin' | 'user' | 'support' | 'compliance' | 'finance';
  type UserStatus =
    | 'active' | 'inactive' | 'suspended' | 'pending_verification' | 'blocked';

  // ==========================================================================
  // KYC ENUMS
  // ==========================================================================
  type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired';
  type KycLevel = 'none' | 'basic' | 'intermediate' | 'advanced';
  type KycDocumentType =
    | 'passport' | 'national_id' | 'drivers_license'
    | 'utility_bill' | 'bank_statement' | 'selfie';

  // ==========================================================================
  // WALLET / ACCOUNT ENUMS
  // ==========================================================================
  type WalletType = 'personal' | 'business';
  type WalletStatus = 'active' | 'suspended' | 'closed';

  // ==========================================================================
  // TRANSACTION ENUMS
  // ==========================================================================
  type TransactionType =
    | 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'remittance'
    | 'refund' | 'fee' | 'reversal' | 'exchange' | 'credit' | 'debit'
    | 'funding' | 'bonus' | 'correction' | 'interest'
    | 'loan_disbursement' | 'loan_repayment' | 'investment';
  type TransactionStatus =
    | 'pending' | 'processing' | 'completed' | 'failed'
    | 'cancelled' | 'refunded' | 'reversed' | 'on_hold';
  type TransactionCategory =
    | 'cards' | 'bankAccounts' | 'cryptoWallets' | 'loans' | 'investments';
  type TransactionChannel = 'web' | 'mobile' | 'api' | 'branch' | 'atm';

  // ==========================================================================
  // CARD ENUMS (shared — Card.types.ts has more detail)
  // ==========================================================================
  type CardType = 'debit' | 'credit' | 'prepaid' | 'virtual';
  type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover';
  type CardStatus =
    | 'active' | 'blocked' | 'expired' | 'stolen' | 'lost' | 'pending_activation';

  // ==========================================================================
  // LOAN ENUMS
  // ==========================================================================
  type LoanType =
    | 'personal' | 'business' | 'mortgage' | 'auto'
    | 'student' | 'payday' | 'line_of_credit'
    | 'emergency' | 'salary_advance';
  type LoanStatus =
    | 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected'
    | 'disbursed' | 'active' | 'completed' | 'paid'
    | 'defaulted' | 'written_off' | 'paused';

  // ==========================================================================
  // INVESTMENT ENUMS
  // ==========================================================================
  type InvestmentType =
    | 'fixed_deposit' | 'savings_plan' | 'mutual_fund' | 'treasury_bills'
    | 'stocks' | 'crypto' | 'mutual_funds' | 'bonds' | 'etf' | 'commodities';
  type InvestmentStatus = 'active' | 'matured' | 'withdrawn' | 'cancelled' | 'suspended' | 'closed';

  // ==========================================================================
  // RECIPIENT ENUMS
  // ==========================================================================
  type RecipientType = 'individual' | 'business';
  type DeliveryMethod = 'bank_transfer' | 'mobile_money' | 'cash_pickup';

  // ==========================================================================
  // NOTIFICATION ENUMS
  // ==========================================================================
  type NotificationType =
    | 'transaction' | 'security' | 'kyc' | 'card' | 'loan'
    | 'investment' | 'account' | 'system' | 'promotional' | 'marketing';

  // ==========================================================================
  // FRAUD / SECURITY ENUMS
  // ==========================================================================
  type FraudSignalSeverity = 'low' | 'medium' | 'high' | 'critical';
  type FraudSignalStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';
  type FraudSignalType =
    | 'velocity' | 'location' | 'device' | 'behavior'
    | 'amount' | 'pattern' | 'blacklist';
  type FraudCaseStatus = 'open' | 'investigating' | 'escalated' | 'resolved' | 'closed';
  type FraudCaseType =
    | 'account_takeover' | 'identity_theft' | 'transaction_fraud'
    | 'money_laundering' | 'suspicious_activity';
  type FraudCasePriority = 'low' | 'medium' | 'high' | 'urgent';

  // ==========================================================================
  // DISPUTE ENUMS
  // ==========================================================================
  type DisputeType =
    | 'unauthorized' | 'fraud' | 'duplicate' | 'incorrect_amount'
    | 'service_not_received' | 'refund_not_processed' | 'not_received'
    | 'wrong_amount' | 'other';
  type DisputeStatus =
    | 'open' | 'under_review' | 'pending_evidence'
    | 'resolved' | 'closed' | 'escalated' | 'rejected';
}

export {};

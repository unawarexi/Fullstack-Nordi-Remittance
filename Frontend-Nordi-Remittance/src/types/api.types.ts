// ============================================================================
// API TYPES - Comprehensive TypeScript definitions for all API entities
// ============================================================================

// ============================================================================
// COMMON TYPES
// ============================================================================

export type UUID = string;
export type ISO8601Date = string;
export type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'KES' | 'GHS' | 'ZAR' | 'CAD' | 'AUD';

export interface Timestamps {
  createdAt: ISO8601Date;
  updatedAt: ISO8601Date;
}

export interface SoftDelete extends Timestamps {
  deletedAt: ISO8601Date | null;
}

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'admin' | 'user' | 'support' | 'compliance' | 'finance';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification' | 'blocked';
export type KycStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired';
export type KycLevel = 'none' | 'basic' | 'intermediate' | 'advanced';

export interface User extends Timestamps {
  id: UUID;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  avatar?: string;
  dateOfBirth?: ISO8601Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: UserRole;
  status: UserStatus;
  kycStatus: KycStatus;
  kycLevel: KycLevel;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt?: ISO8601Date;
  lastLoginIp?: string;
  referralCode?: string;
  referredBy?: UUID;
}

export interface UserProfile extends User {
  address?: Address;
  employment?: EmploymentInfo;
  bankAccounts: BankAccount[];
  documents: KycDocument[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  unit?: string;
}

export interface EmploymentInfo {
  status: 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';
  employer?: string;
  jobTitle?: string;
  industry?: string;
  annualIncome?: number;
  sourceOfFunds: string;
}

export interface KycDocument extends Timestamps {
  id: UUID;
  type: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'selfie';
  status: 'pending' | 'approved' | 'rejected';
  frontImageUrl?: string;
  backImageUrl?: string;
  expiryDate?: ISO8601Date;
  documentNumber?: string;
  rejectionReason?: string;
}

export type KycDocumentType = 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement' | 'selfie';

export interface BankAccount extends Timestamps {
  id: UUID;
  bankName: string;
  accountNumber: string;
  accountName: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  currency: Currency;
  isVerified: boolean;
  isPrimary: boolean;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  deviceInfo?: DeviceInfo;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  requiresTwoFactor?: boolean;
  tempToken?: string;
  twoFactorMethod?: 'sms' | 'email' | 'authenticator';
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth?: ISO8601Date;
  referralCode?: string;
  acceptTerms: boolean;
}

// Full KYC Registration Request
export interface FullKycRegisterRequest {
  // Personal Details
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: ISO8601Date;
  gender: string;
  nationality: string;
  countryOfResidence: string;
  maritalStatus?: string;
  // Identity Verification
  idType: string;
  idNumber: string;
  idExpiryDate: ISO8601Date;
  addressDocType: string;
  socialSecurityNumber?: string;
  taxIdentificationNumber: string;
  // Contact Information
  email: string;
  mobileNumber: string;
  alternativePhone?: string;
  homeAddress: string;
  city: string;
  stateProvince: string;
  zipCode: string;
  country: string;
  // Banking Preferences
  accountType: string;
  currency: string;
  sourceOfIncome: string;
  monthlyIncomeRange: string;
  initialDeposit: number;
  employmentStatus: string;
  employerName?: string;
  occupation: string;
  // Bank Account Details
  accountName: string;
  bankName: string;
  bankAddress: string;
  ibanNumber?: string;
  routingNumber?: string;
  swiftBic: string;
  // Security Setup
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
  enableTwoFactor: boolean;
  twoFactorMethod?: string;
  // Terms and Verification
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  agreeToDataSharing?: boolean;
  referralCode?: string;
  inviteCode?: string;
}

export interface TwoFactorAuthRequest {
  code: string;
  tempToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  ip: string;
  userAgent: string;
}

// ============================================================================
// ACCOUNT / WALLET TYPES
// ============================================================================

export type AccountType = 'checking' | 'savings' | 'remittance' | 'investment';
export type AccountStatus = 'active' | 'inactive' | 'frozen' | 'closed';

export interface Account extends Timestamps {
  id: UUID;
  userId: UUID;
  accountNumber: string;
  accountType: AccountType;
  currency: Currency;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  status: AccountStatus;
  isDefault: boolean;
  name?: string;
  dailyLimit: number;
  monthlyLimit: number;
}

export interface AccountSummary {
  totalBalance: number;
  totalAvailable: number;
  totalPending: number;
  accounts: Account[];
  recentTransactions: Transaction[];
}

export interface CreateAccountRequest {
  accountType: AccountType;
  currency: Currency;
  name?: string;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'transfer' 
  | 'payment' 
  | 'remittance'
  | 'refund'
  | 'fee'
  | 'reversal'
  | 'interest'
  | 'loan_disbursement'
  | 'loan_repayment';

export type TransactionStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded'
  | 'reversed'
  | 'on_hold';

export interface Transaction extends Timestamps {
  id: UUID;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  fee: number;
  netAmount: number;
  exchangeRate?: number;
  sourceAccountId: UUID;
  destinationAccountId?: UUID;
  sourceAccount?: Account;
  destinationAccount?: Account;
  description?: string;
  metadata?: Record<string, unknown>;
  completedAt?: ISO8601Date;
  failureReason?: string;
}

export interface TransactionFilters {
  type?: TransactionType | TransactionType[];
  status?: TransactionStatus | TransactionStatus[];
  currency?: Currency;
  startDate?: ISO8601Date;
  endDate?: ISO8601Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TransferRequest {
  sourceAccountId: UUID;
  destinationAccountId: UUID;
  amount: number;
  currency: Currency;
  description?: string;
  pin?: string;
}

export interface RemittanceRequest {
  sourceAccountId: UUID;
  recipientId: UUID;
  amount: number;
  sourceCurrency: Currency;
  destinationCurrency: Currency;
  deliveryMethod: 'bank_transfer' | 'mobile_money' | 'cash_pickup';
  purpose: string;
  reference?: string;
}

export interface DepositRequest {
  accountId: UUID;
  amount: number;
  currency: Currency;
  paymentMethod: 'card' | 'bank_transfer' | 'mobile_money';
  paymentDetails?: Record<string, unknown>;
}

export interface WithdrawalRequest {
  accountId: UUID;
  amount: number;
  currency: Currency;
  destinationBankAccountId: UUID;
  description?: string;
  pin: string;
}

// ============================================================================
// CARD TYPES
// ============================================================================

export type CardType = 'virtual' | 'physical';
export type CardBrand = 'visa' | 'mastercard';
export type CardStatus = 'active' | 'inactive' | 'frozen' | 'expired' | 'cancelled';

export interface Card extends Timestamps {
  id: UUID;
  userId: UUID;
  accountId: UUID;
  cardNumber: string; // masked
  last4: string;
  cardType: CardType;
  brand: CardBrand;
  status: CardStatus;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  billingAddress?: Address;
  dailyLimit: number;
  monthlyLimit: number;
  onlineEnabled: boolean;
  atmEnabled: boolean;
  internationalEnabled: boolean;
  contactlessEnabled: boolean;
}

export interface CreateCardRequest {
  accountId: UUID;
  cardType: CardType;
  brand?: CardBrand;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface CardLimitsUpdateRequest {
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface CardSettingsUpdateRequest {
  onlineEnabled?: boolean;
  atmEnabled?: boolean;
  internationalEnabled?: boolean;
  contactlessEnabled?: boolean;
}

export interface CardTransaction extends Transaction {
  merchantName: string;
  merchantCategory: string;
  merchantLocation?: string;
}

// ============================================================================
// LOAN TYPES
// ============================================================================

export type LoanType = 'personal' | 'business' | 'emergency' | 'salary_advance';
export type LoanStatus = 
  | 'draft' 
  | 'pending' 
  | 'under_review' 
  | 'approved' 
  | 'rejected' 
  | 'disbursed' 
  | 'active' 
  | 'completed' 
  | 'defaulted'
  | 'written_off';

export interface Loan extends Timestamps {
  id: UUID;
  userId: UUID;
  loanNumber: string;
  type: LoanType;
  status: LoanStatus;
  principal: number;
  interestRate: number;
  currency: Currency;
  term: number; // in months
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  nextPaymentDate?: ISO8601Date;
  nextPaymentAmount?: number;
  disbursementDate?: ISO8601Date;
  maturityDate?: ISO8601Date;
  disbursementAccountId?: UUID;
  purpose?: string;
  collateral?: string;
}

export interface LoanApplication {
  type: LoanType;
  amount: number;
  term: number;
  purpose: string;
  monthlyIncome: number;
  employmentStatus: string;
  employer?: string;
  disbursementAccountId: UUID;
}

export interface LoanPayment extends Timestamps {
  id: UUID;
  loanId: UUID;
  amount: number;
  principal: number;
  interest: number;
  fees: number;
  paymentDate: ISO8601Date;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: UUID;
}

export interface LoanSchedule {
  paymentNumber: number;
  dueDate: ISO8601Date;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
  status: 'upcoming' | 'paid' | 'overdue' | 'partial';
}

// ============================================================================
// INVESTMENT TYPES
// ============================================================================

export type InvestmentType = 'fixed_deposit' | 'savings_plan' | 'mutual_fund' | 'treasury_bills';
export type InvestmentStatus = 'active' | 'matured' | 'withdrawn' | 'cancelled';

export interface Investment extends Timestamps {
  id: UUID;
  userId: UUID;
  type: InvestmentType;
  status: InvestmentStatus;
  name: string;
  principal: number;
  currency: Currency;
  interestRate: number;
  term: number; // in days
  expectedReturns: number;
  currentValue: number;
  accruedInterest: number;
  startDate: ISO8601Date;
  maturityDate: ISO8601Date;
  autoRenew: boolean;
  sourceAccountId: UUID;
}

export interface CreateInvestmentRequest {
  type: InvestmentType;
  amount: number;
  term: number;
  sourceAccountId: UUID;
  autoRenew?: boolean;
}

export interface InvestmentProduct {
  id: UUID;
  type: InvestmentType;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  interestRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  isAvailable: boolean;
}

// ============================================================================
// RECIPIENT / BENEFICIARY TYPES
// ============================================================================

export type RecipientType = 'individual' | 'business';
export type DeliveryMethod = 'bank_transfer' | 'mobile_money' | 'cash_pickup';

export interface Recipient extends Timestamps {
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

export interface CreateRecipientRequest {
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

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 
  | 'transaction' 
  | 'security' 
  | 'marketing' 
  | 'system' 
  | 'account' 
  | 'loan'
  | 'card'
  | 'kyc';

export interface Notification extends Timestamps {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: ISO8601Date;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  email: {
    transactions: boolean;
    security: boolean;
    marketing: boolean;
    account: boolean;
  };
  push: {
    transactions: boolean;
    security: boolean;
    marketing: boolean;
    account: boolean;
  };
  sms: {
    transactions: boolean;
    security: boolean;
  };
}

// ============================================================================
// FRAUD & SECURITY TYPES
// ============================================================================

export type FraudAlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FraudAlertStatus = 'open' | 'investigating' | 'resolved' | 'false_positive';
export type FraudAlertType = 'suspicious_login' | 'unusual_transaction' | 'account_takeover' | 'identity_theft' | 'payment_fraud' | 'other';

export interface FraudAlert extends Timestamps {
  id: UUID;
  userId: UUID;
  transactionId?: UUID;
  type: string;
  severity: FraudAlertSeverity;
  status: FraudAlertStatus;
  description: string;
  details?: Record<string, unknown>;
  resolvedAt?: ISO8601Date;
  resolvedBy?: UUID;
  resolution?: string;
}

export interface SecuritySession extends Timestamps {
  id: UUID;
  userId: UUID;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: string;
  isActive: boolean;
  lastActiveAt: ISO8601Date;
  expiresAt: ISO8601Date;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'sms' | 'email' | 'authenticator';
  loginNotifications: boolean;
  transactionNotifications: boolean;
  biometricEnabled: boolean;
  trustedDevices: TrustedDevice[];
}

export interface TrustedDevice {
  id: UUID;
  name: string;
  deviceInfo: DeviceInfo;
  addedAt: ISO8601Date;
  lastUsedAt: ISO8601Date;
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface AdminUser extends User {
  permissions: string[];
  department?: string;
  lastActivity?: ISO8601Date;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  transactionVolume: number;
  totalAccounts: number;
  totalBalance: number;
  pendingKyc: number;
  activeLoans: number;
  fraudAlerts: number;
  growth: {
    users: number;
    transactions: number;
    volume: number;
  };
}

export interface AuditLog extends Timestamps {
  id: UUID;
  userId: UUID;
  action: string;
  resource: string;
  resourceId?: UUID;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, unknown>;
  status: 'success' | 'failure';
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface TransactionStats {
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

export interface UserStats {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  byCountry: Record<string, number>;
  byKycLevel: Record<KycLevel, number>;
}

// ============================================================================
// LEGAL & COMPLIANCE TYPES
// ============================================================================

export type DisputeType = 'unauthorized' | 'not_received' | 'wrong_amount' | 'duplicate' | 'other';
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'rejected';

export interface Dispute extends Timestamps {
  id: UUID;
  userId: UUID;
  transactionId: UUID;
  type: DisputeType;
  status: DisputeStatus;
  amount: number;
  currency: Currency;
  description: string;
  resolution?: string;
  resolvedAt?: ISO8601Date;
  documents: UUID[];
}

export interface Report extends Timestamps {
  id: UUID;
  userId: UUID;
  type: 'account_statement' | 'transaction_history' | 'tax_report' | 'audit_report';
  status: 'pending' | 'generating' | 'ready' | 'failed';
  parameters: Record<string, unknown>;
  downloadUrl?: string;
  expiresAt?: ISO8601Date;
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export interface Webhook extends Timestamps {
  id: UUID;
  userId: UUID;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggeredAt?: ISO8601Date;
  failureCount: number;
}

export interface ApiKey extends Timestamps {
  id: UUID;
  userId: UUID;
  name: string;
  key: string; // masked
  prefix: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: ISO8601Date;
  expiresAt?: ISO8601Date;
}

// ============================================================================
// ATTACHMENT TYPES
// ============================================================================

export interface Attachment extends Timestamps {
  id: UUID;
  userId: UUID;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: 'document' | 'image' | 'other';
  metadata?: Record<string, unknown>;
}

export interface UploadResponse {
  id: UUID;
  url: string;
  filename: string;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

export interface Permission {
  id: UUID;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface Role extends Timestamps {
  id: UUID;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

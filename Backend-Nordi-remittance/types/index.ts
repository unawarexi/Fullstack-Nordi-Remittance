// ============================================================================
// CORE TYPE DEFINITIONS FOR BANKING APPLICATION
// ============================================================================

import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  COMPLIANCE_OFFICER = 'compliance_officer',
  SUPPORT_AGENT = 'support_agent',
  ANALYST = 'analyst'
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  FROZEN = 'frozen',
  PENDING = 'pending',
  CLOSED = 'closed'
}

export enum KycStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  REFUND = 'refund',
  FEE = 'fee',
  REVERSAL = 'reversal',
  EXCHANGE = 'exchange'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed'
}

export enum TransactionCategory {
  CARDS = 'cards',
  BANK_ACCOUNTS = 'bankAccounts',
  CRYPTO_WALLETS = 'cryptoWallets',
  LOANS = 'loans',
  INVESTMENTS = 'investments'
}

export enum CardType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  PREPAID = 'prepaid',
  VIRTUAL = 'virtual'
}

export enum CardStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  EXPIRED = 'expired',
  STOLEN = 'stolen',
  LOST = 'lost',
  PENDING_ACTIVATION = 'pending_activation'
}

export enum LoanStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAID = 'paid',
  DEFAULTED = 'defaulted',
  WRITTEN_OFF = 'written_off',
  PAUSED = 'paused'
}

export enum LoanType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  MORTGAGE = 'mortgage',
  AUTO = 'auto',
  STUDENT = 'student',
  PAYDAY = 'payday',
  LINE_OF_CREDIT = 'line_of_credit'
}

export enum NotificationType {
  TRANSACTION = 'transaction',
  SECURITY = 'security',
  KYC = 'kyc',
  CARD = 'card',
  LOAN = 'loan',
  INVESTMENT = 'investment',
  ACCOUNT = 'account',
  SYSTEM = 'system',
  PROMOTIONAL = 'promotional'
}

export enum AuditEventType {
  USER_ACTION = 'user_action',
  SYSTEM_ACTION = 'system_action',
  TRANSACTION = 'transaction',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  DATA_CHANGE = 'data_change'
}

export enum FraudSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// JWT AND AUTH TYPES
// ============================================================================

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId?: string;
  deviceId?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  tokenVersion: number;
  sessionId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionData {
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
  sessionId?: string;
  deviceId?: string;
  permissions?: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  requestId?: string;
  startTime?: number;
  clientIp?: string;
  deviceInfo?: DeviceInfo;
}

export interface DeviceInfo {
  deviceId?: string;
  deviceType: string;
  os: string;
  browser?: string;
  userAgent: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ResponseMeta {
  requestId?: string;
  timestamp?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: Date;
  gender: string;
  nationality: string;
  countryOfResidence: string;
  profilePicture?: string;
  kycStatus: KycStatus;
  isActive: boolean;
  isLocked: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserRegistrationData {
  // Personal Details
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  countryOfResidence: string;
  maritalStatus?: string;

  // Identity Verification
  idType: string;
  idNumber: string;
  idExpiryDate: string;
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

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceId?: string;
}

export interface TwoFactorVerification {
  userId: string;
  code: string;
  method: 'email' | 'sms' | 'authenticator';
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ============================================================================
// WALLET/ACCOUNT TYPES
// ============================================================================

export interface WalletInfo {
  id: string;
  walletNumber: string;
  userId: string;
  balances: Map<string, number>;
  status: AccountStatus;
  walletType: 'personal' | 'business';
  isPrimary: boolean;
  limits: WalletLimits;
  createdAt: Date;
  lastTransactionAt?: Date;
}

export interface WalletLimits {
  daily: number;
  monthly: number;
  perTransaction: number;
}

export interface BalanceInfo {
  currency: string;
  availableBalance: number;
  ledgerBalance: number;
  pendingBalance: number;
  reservedBalance: number;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface TransactionRequest {
  type: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  recipientWalletId?: string;
  recipientAccountNumber?: string;
  recipientBankName?: string;
  recipientName?: string;
  category?: TransactionCategory;
  categoryItemId?: string;
  scheduledFor?: Date;
  isInternational?: boolean;
}

export interface TransactionResponse {
  id: string;
  referenceNumber: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  fee?: number;
  exchangeRate?: number;
  description?: string;
  recipientName?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface TransferRequest {
  fromWalletId: string;
  toWalletId?: string;
  toAccountNumber?: string;
  toBankName?: string;
  toAccountName?: string;
  amount: number;
  currency: string;
  description?: string;
  pin?: string;
}

// ============================================================================
// CARD TYPES
// ============================================================================

export interface CardInfo {
  id: string;
  cardNumber: string; // masked
  cardholderName: string;
  cardType: CardType;
  cardBrand: string;
  expiryMonth: number;
  expiryYear: number;
  status: CardStatus;
  isPhysical: boolean;
  balance?: number;
  creditLimit?: number;
  availableCredit?: number;
}

export interface CardRequest {
  cardType: CardType;
  currency: string;
  isPhysical?: boolean;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// ============================================================================
// LOAN TYPES
// ============================================================================

export interface LoanApplication {
  loanType: LoanType;
  requestedAmount: number;
  term: number;
  purpose: string;
  employmentInfo: {
    employmentStatus: string;
    employer?: string;
    occupation: string;
    monthlyIncome: number;
    yearsEmployed?: number;
  };
  financialInfo: {
    monthlyExpenses: number;
    existingDebts: number;
    assets: number;
  };
}

export interface LoanInfo {
  id: string;
  loanId: string;
  loanType: LoanType;
  principalAmount: number;
  outstandingBalance: number;
  interestRate: number;
  term: number;
  monthlyPayment: number;
  status: LoanStatus;
  nextPaymentDate?: Date;
  nextPaymentAmount?: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  relatedResource?: {
    resourceType: string;
    resourceId: string;
  };
  metadata?: Record<string, unknown>;
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

export interface AuditLogEntry {
  eventType: AuditEventType;
  action: string;
  actor: string;
  actorType: 'user' | 'admin' | 'system';
  resource: string;
  resourceId: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'success' | 'failed';
  metadata?: Record<string, unknown>;
}

// ============================================================================
// FRAUD/SECURITY TYPES
// ============================================================================

export interface FraudCheckResult {
  isAllowed: boolean;
  riskScore: number;
  signals: FraudSignal[];
  action: 'allow' | 'review' | 'block' | 'challenge';
}

export interface FraudSignal {
  type: string;
  severity: FraudSeverity;
  description: string;
  score: number;
}

export interface SecurityEvent {
  eventType: string;
  userId: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
  };
  deviceInfo?: DeviceInfo;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// RATE LIMITING TYPES
// ============================================================================

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetAt: Date;
}

// ============================================================================
// EXPORT ALL MAIL TYPES
// ============================================================================

export * from './Mail.types.js';

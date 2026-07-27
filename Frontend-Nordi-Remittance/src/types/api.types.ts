declare global {
  interface Timestamps {
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface SoftDelete extends Timestamps {
    deletedAt: ISO8601Date | null;
  }

  interface User extends Timestamps {
    id: UUID;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    avatar?: string;
    dateOfBirth?: ISO8601Date;
    gender?: "male" | "female" | "other" | "prefer_not_to_say";
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

  interface UserProfile extends User {
    address?: Address;
    employment?: EmploymentInfo;
    bankAccounts: BankAccount[];
    documents: KycDocument[];
  }

  interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    unit?: string;
  }

  interface EmploymentInfo {
    status: "employed" | "self_employed" | "unemployed" | "retired" | "student";
    employer?: string;
    jobTitle?: string;
    industry?: string;
    annualIncome?: number;
    sourceOfFunds: string;
  }

  interface KycDocument extends Timestamps {
    id: UUID;
    type:
      | "passport"
      | "national_id"
      | "drivers_license"
      | "utility_bill"
      | "bank_statement"
      | "selfie";
    status: "pending" | "approved" | "rejected";
    frontImageUrl?: string;
    backImageUrl?: string;
    expiryDate?: ISO8601Date;
    documentNumber?: string;
    rejectionReason?: string;
  }

  interface BankAccount extends Timestamps {
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

  interface CardFilters {
    type?: CardType;
    status?: CardStatus;
    page?: number;
    limit?: number;
  }

  interface CardTransactionFilters {
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    merchantCategory?: string;
    page?: number;
    limit?: number;
  }

  interface LoginRequest {
    email: string;
    password: string;
    deviceId?: string;
    deviceInfo?: DeviceInfo;
  }

  interface LoginResponse {
    user: User;
    // Tokens may be nested under tokens object (backend) or at top level
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    wallet?: any;
    // 2FA fields - backend sends requires2FA/twoFactorToken/method
    requiresTwoFactor?: boolean;
    requires2FA?: boolean;
    tempToken?: string;
    twoFactorToken?: string;
    method?: string;
    twoFactorMethod?: "sms" | "email" | "authenticator";
  }

  interface ClerkSyncResponse {
    requiresOtp: boolean;
    otpSessionToken?: string;
    email?: string;
    isAdmin?: boolean;
    user?: User;
    admin?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      avatar?: string;
      profilePicture?: string;
      kycStatus?: string;
      emailVerified?: boolean;
      phoneVerified?: boolean;
    };
    tokens?: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    wallet?: any;
  }

  interface RegisterRequest {
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

  interface FullKycRegisterRequest {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: ISO8601Date;
    gender: string;
    nationality: string;
    countryOfResidence: string;
    maritalStatus?: string;
    idType: string;
    idNumber: string;
    idExpiryDate: ISO8601Date;
    addressDocType: string;
    socialSecurityNumber?: string;
    taxIdentificationNumber: string;
    email: string;
    mobileNumber: string;
    alternativePhone?: string;
    homeAddress: string;
    city: string;
    stateProvince: string;
    zipCode: string;
    country: string;
    accountType: string;
    currency: string;
    sourceOfIncome: string;
    monthlyIncomeRange: string;
    initialDeposit: number;
    employmentStatus: string;
    employerName?: string;
    occupation: string;
    accountName: string;
    externalAccountNumber: string;
    bankName: string;
    bankAddress: string;
    ibanNumber?: string;
    routingNumber?: string;
    swiftBic: string;

    // File contents (should be handled via FormData for multer)
    profilePicture?: File;
    governmentId?: File;
    proofOfAddress?: File;
    selfieWithId?: File;
    signature?: File;
    password: string;
    confirmPassword: string;
    securityQuestion: string;
    securityAnswer: string;
    enableTwoFactor: boolean;
    twoFactorMethod?: string;
    agreeToTerms: boolean;
    agreeToPrivacy: boolean;
    agreeToDataSharing?: boolean;
    referralCode?: string;
    inviteCode?: string;
  }

  interface TwoFactorAuthRequest {
    code: string;
    tempToken: string;
  }

  interface ResetPasswordRequest {
    email: string;
  }

  interface ConfirmResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
  }

  interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }

  interface DeviceInfo {
    deviceType: "mobile" | "tablet" | "desktop";
    os: string;
    browser: string;
    ip: string;
    userAgent: string;
  }

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

  interface Transaction extends Timestamps {
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
    sourceWallet?: Wallet;
    destinationWallet?: Wallet;
    description?: string;
    metadata?: Record<string, unknown>;
    completedAt?: ISO8601Date;
    failureReason?: string;
  }

  interface TransactionFilters {
    [key: string]: unknown;
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
    deliveryMethod: "bank_transfer" | "mobile_money" | "cash_pickup";
    purpose: string;
    reference?: string;
  }

  interface DepositRequest {
    accountId: UUID;
    amount: number;
    currency: Currency;
    paymentMethod: "card" | "bank_transfer" | "mobile_money";
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

  interface Card extends Timestamps {
    id: UUID;
    userId: UUID;
    accountId: UUID;
    cardNumber: string;
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

  interface CreateCardRequest {
    accountId: UUID;
    cardType: CardType;
    brand?: CardBrand;
    dailyLimit?: number;
    monthlyLimit?: number;
  }

  interface CardLimitsUpdateRequest {
    dailyLimit?: number;
    monthlyLimit?: number;
  }

  interface CardSettingsUpdateRequest {
    onlineEnabled?: boolean;
    atmEnabled?: boolean;
    internationalEnabled?: boolean;
    contactlessEnabled?: boolean;
  }

  interface CardTransaction extends Transaction {
    merchantName: string;
    merchantCategory: string;
    merchantLocation?: string;
  }

  interface Loan extends Timestamps {
    id: UUID;
    userId: UUID;
    loanNumber: string;
    type: LoanType;
    status: LoanStatus;
    principal: number;
    interestRate: number;
    currency: Currency;
    term: number;
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

  interface LoanApplication {
    type: LoanType;
    amount: number;
    term: number;
    purpose: string;
    monthlyIncome: number;
    employmentStatus: string;
    employer?: string;
    disbursementAccountId: UUID;
  }

  interface LoanPayment extends Timestamps {
    id: UUID;
    loanId: UUID;
    amount: number;
    principal: number;
    interest: number;
    fees: number;
    paymentDate: ISO8601Date;
    status: "pending" | "completed" | "failed";
    transactionId?: UUID;
  }

  interface LoanSchedule {
    paymentNumber: number;
    dueDate: ISO8601Date;
    principal: number;
    interest: number;
    totalPayment: number;
    remainingBalance: number;
    status: "upcoming" | "paid" | "overdue" | "partial";
  }

  interface Investment extends Timestamps {
    id: UUID;
    userId: UUID;
    type: InvestmentType;
    status: InvestmentStatus;
    name: string;
    principal: number;
    currency: Currency;
    interestRate: number;
    term: number;
    expectedReturns: number;
    currentValue: number;
    accruedInterest: number;
    startDate: ISO8601Date;
    maturityDate: ISO8601Date;
    autoRenew: boolean;
    sourceAccountId: UUID;
  }

  interface CreateInvestmentRequest {
    type: InvestmentType;
    amount: number;
    term: number;
    sourceAccountId: UUID;
    autoRenew?: boolean;
  }

  interface InvestmentProduct {
    id: UUID;
    type: InvestmentType;
    name: string;
    description: string;
    minAmount: number;
    maxAmount: number;
    minTerm: number;
    maxTerm: number;
    interestRate: number;
    riskLevel: "low" | "medium" | "high";
    isAvailable: boolean;
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

  interface AppNotification extends Timestamps {
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

  interface NotificationPreferences {
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

  interface FraudSignal extends Timestamps {
    signalId: UUID;
    user: UUID;
    transaction?: UUID;
    signalType: FraudSignalType;
    severity: FraudSignalSeverity;
    description: string;
    riskScore: number;
    detectedAt: ISO8601Date;
    status: FraudSignalStatus;
    notes?: string;
    reviewedBy?: string;
    reviewedAt?: ISO8601Date;
    resolvedAt?: ISO8601Date;
    resolvedBy?: string;
    resolution?: string;
    metadata?: Record<string, unknown>;
  }

  interface FraudCase extends Timestamps {
    caseId: UUID;
    user: UUID;
    caseType: FraudCaseType;
    status: FraudCaseStatus;
    priority: FraudCasePriority;
    severity: FraudSignalSeverity;
    assignedTo?: string;
    signals?: UUID[];
    transactions?: UUID[];
    evidences?: Array<{
      type: string;
      description: string;
      url?: string;
      uploadedAt: ISO8601Date;
    }>;
    notes?: Array<{ author: string; content: string; createdAt: ISO8601Date }>;
    actions?: Array<{
      action: string;
      performedBy: string;
      performedAt: ISO8601Date;
      details?: string;
    }>;
    timeline?: Array<{
      action: string;
      performedBy: string;
      timestamp: ISO8601Date;
      notes?: string;
    }>;
    resolution?: string;
    closedBy?: string;
    outcome?:
      | "legitimate"
      | "fraud_confirmed"
      | "account_suspended"
      | "account_closed"
      | "law_enforcement_notified";
    openedAt: ISO8601Date;
    closedAt?: ISO8601Date;
  }

  interface VelocityRule extends Timestamps {
    ruleId: UUID;
    name: string;
    description: string;
    ruleType:
      | "transaction_count"
      | "transaction_amount"
      | "login_attempts"
      | "failed_transactions";
    timeWindow: number;
    threshold: number;
    isActive: boolean;
    severity: "low" | "medium" | "high";
    action: "alert" | "block" | "review" | "challenge";
    appliesTo: "all" | "new_users" | "high_risk" | "specific_countries";
    countries?: string[];
  }

  interface BehaviorProfile extends Timestamps {
    user: UUID;
    averageTransactionAmount: number;
    averageMonthlyTransactions: number;
    typicalTransactionHours: number[];
    typicalDaysOfWeek: number[];
    commonMerchants: string[];
    commonCountries: string[];
    commonDevices: Array<{
      deviceId: string;
      deviceType: string;
      os?: string;
      browser?: string;
      lastUsed: ISO8601Date;
    }>;
    commonIpRanges: string[];
    riskLevel: "low" | "medium" | "high";
    lastUpdated: ISO8601Date;
  }

  interface SecurityEvent {
    eventId: UUID;
    user: UUID;
    eventType:
      | "login"
      | "login_success"
      | "login_failed"
      | "logout"
      | "password_change"
      | "password_reset"
      | "2fa_enabled"
      | "2fa_disabled"
      | "2fa_setup"
      | "2fa_verified"
      | "device_added"
      | "device_removed"
      | "suspicious_login"
      | "account_locked"
      | "account_unlocked"
      | "session_revoked"
      | "all_sessions_revoked"
      | "backup_codes_regenerated"
      | "security_settings_updated";
    severity: "info" | "warning" | "critical";
    ipAddress: string;
    userAgent: string;
    location?: {
      country?: string;
      city?: string;
      coordinates?: { lat: number; lng: number };
    };
    deviceInfo?: {
      deviceId?: string;
      deviceType?: string;
      os?: string;
      browser?: string;
    };
    metadata?: Record<string, unknown>;
    requiresAction: boolean;
    actionTaken?: string;
    createdAt: ISO8601Date;
  }

  interface SecuritySession extends Timestamps {
    id: UUID;
    userId: UUID;
    deviceInfo: DeviceInfo;
    ipAddress: string;
    location?: string;
    isActive: boolean;
    lastActiveAt: ISO8601Date;
    expiresAt: ISO8601Date;
  }

  interface SecuritySettings {
    twoFactorEnabled: boolean;
    twoFactorMethod?: "sms" | "email" | "authenticator";
    loginNotifications: boolean;
    transactionNotifications: boolean;
    biometricEnabled: boolean;
    trustedDevices: TrustedDevice[];
  }

  interface TrustedDevice {
    id: UUID;
    name: string;
    deviceInfo: DeviceInfo;
    addedAt: ISO8601Date;
    lastUsedAt: ISO8601Date;
  }

  interface AdminUser extends User {
    permissions: string[];
    department?: string;
    lastActivity?: ISO8601Date;
  }

  interface DashboardStats {
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

  interface AuditLog {
    logId: UUID;
    eventType:
      | "user_action"
      | "system_action"
      | "transaction"
      | "security"
      | "compliance"
      | "data_change";
    action: string;
    actor: string;
    actorType: "user" | "admin" | "system";
    resource: string;
    resourceId: string;
    changes?: {
      before?: Record<string, unknown>;
      after?: Record<string, unknown>;
    };
    ipAddress?: string;
    userAgent?: string;
    location?: {
      country?: string;
      city?: string;
    };
    severity: "info" | "warning" | "error" | "critical";
    status: "success" | "failed";
    errorMessage?: string;
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
  }

  interface TransactionStats {
    period: "daily" | "weekly" | "monthly" | "yearly";
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

  interface UserStats {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    byCountry: Record<string, number>;
    byKycLevel: Record<KycLevel, number>;
  }

  interface Dispute extends Timestamps {
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

  interface AppReport extends Timestamps {
    id: UUID;
    userId: UUID;
    type:
      | "account_statement"
      | "transaction_history"
      | "tax_report"
      | "audit_report";
    status: "pending" | "generating" | "ready" | "failed";
    parameters: Record<string, unknown>;
    downloadUrl?: string;
    expiresAt?: ISO8601Date;
  }

  interface Webhook extends Timestamps {
    id: UUID;
    userId: UUID;
    url: string;
    events: string[];
    secret: string;
    isActive: boolean;
    lastTriggeredAt?: ISO8601Date;
    failureCount: number;
  }

  interface ApiKey extends Timestamps {
    id: UUID;
    userId: UUID;
    name: string;
    key: string;
    prefix: string;
    permissions: string[];
    isActive: boolean;
    lastUsedAt?: ISO8601Date;
    expiresAt?: ISO8601Date;
  }

  interface Attachment extends Timestamps {
    id: UUID;
    userId: UUID;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    category: "document" | "image" | "other";
    metadata?: Record<string, unknown>;
  }

  interface UploadResponse {
    id: UUID;
    url: string;
    filename: string;
  }

  interface Permission {
    id: UUID;
    name: string;
    description: string;
    resource: string;
    action: "create" | "read" | "update" | "delete" | "manage";
  }

  interface Role extends Timestamps {
    id: UUID;
    name: string;
    description: string;
    permissions: Permission[];
    isSystem: boolean;
  }

  type UUID = string;
  type ISO8601Date = string;
  type Currency =
    | "USD"
    | "EUR"
    | "GBP"
    | "NGN"
    | "KES"
    | "GHS"
    | "ZAR"
    | "CAD"
    | "AUD";
  type UserRole = "admin" | "user" | "support" | "compliance" | "finance";
  type UserStatus =
    | "active"
    | "inactive"
    | "suspended"
    | "pending_verification"
    | "blocked";
  type KycStatus =
    | "unverified"
    | "pending"
    | "verified"
    | "rejected"
    | "expired";
  type KycLevel = "none" | "basic" | "intermediate" | "advanced";
  type KycDocumentType =
    | "passport"
    | "national_id"
    | "drivers_license"
    | "utility_bill"
    | "bank_statement"
    | "selfie";
  type WalletType = "personal" | "business";
  type WalletStatus = "active" | "suspended" | "closed";
  type TransactionType =
    | "deposit"
    | "withdrawal"
    | "transfer"
    | "payment"
    | "remittance"
    | "refund"
    | "fee"
    | "reversal"
    | "interest"
    | "loan_disbursement"
    | "loan_repayment";
  type TransactionStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded"
    | "reversed"
    | "on_hold";
  type CardType = "virtual" | "physical";
  type CardBrand = "visa" | "mastercard";
  type CardStatus = "active" | "inactive" | "frozen" | "expired" | "cancelled";
  type LoanType = "personal" | "business" | "emergency" | "salary_advance";
  type LoanStatus =
    | "draft"
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "disbursed"
    | "active"
    | "completed"
    | "defaulted"
    | "written_off";
  type InvestmentType =
    | "fixed_deposit"
    | "savings_plan"
    | "mutual_fund"
    | "treasury_bills";
  type InvestmentStatus = "active" | "matured" | "withdrawn" | "cancelled";
  type RecipientType = "individual" | "business";
  type DeliveryMethod = "bank_transfer" | "mobile_money" | "cash_pickup";
  type NotificationType =
    | "transaction"
    | "security"
    | "marketing"
    | "system"
    | "account"
    | "loan"
    | "card"
    | "kyc";
  type FraudSignalSeverity = "low" | "medium" | "high" | "critical";
  type FraudSignalStatus =
    | "open"
    | "investigating"
    | "resolved"
    | "false_positive";
  type FraudSignalType =
    | "velocity"
    | "location"
    | "device"
    | "behavior"
    | "amount"
    | "pattern"
    | "blacklist";
  type FraudCaseStatus =
    | "open"
    | "investigating"
    | "escalated"
    | "resolved"
    | "closed";
  type FraudCaseType =
    | "account_takeover"
    | "identity_theft"
    | "transaction_fraud"
    | "money_laundering"
    | "suspicious_activity";
  type FraudCasePriority = "low" | "medium" | "high" | "urgent";
  type DisputeType =
    | "unauthorized"
    | "not_received"
    | "wrong_amount"
    | "duplicate"
    | "other";
  type DisputeStatus = "open" | "under_review" | "resolved" | "rejected";
}
export {};

// ============================================================================
// BASE EMAIL TEMPLATE TYPES
// ============================================================================

export interface BaseTemplateData {
  EMAIL_TITLE: string;
  GREETING: string;
  MAIN_CONTENT: string;
  COMPANY_NAME: string;
  YEAR: number;
  SOCIAL_FACEBOOK: string;
  SOCIAL_TWITTER: string;
  SOCIAL_YOUTUBE: string;
  SOCIAL_LINKEDIN: string;
  LINK_LOGIN: string;
  LINK_TRANSACTIONS: string;
  LINK_SERVICES: string;
  LINK_SUPPORT: string;
  LINK_WEBSITE: string;
  LINK_PRIVACY: string;
  LINK_TERMS: string;
  FOOTER_TEXT: string;
  FOOTER_IMAGE?: string;
  HERO_IMAGE?: string;
  ADDITIONAL_CONTENT?: string;
  UNSUBSCRIBE_LINK?: string;
}

export interface EmailButton {
  text: string;
  url: string;
  primary: boolean;
}

export interface ContentSection {
  title?: string;
  content: string;
}

export interface TransactionDetail {
  label: string;
  value: string;
}

export interface StatusBadge {
  type: 'success' | 'pending' | 'failed' | 'warning';
  text: string;
}

export interface AlertBox {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  content: string;
}

export interface KycProgress {
  percentage: number;
  status_text: string;
}

export interface AccountSummary {
  label: string;
  account_number: string;
  currency: string;
  balance: string;
}

export interface LoanDetails {
  title: string;
  items: Array<{
    label: string;
    value: string;
  }>;
}

export interface SecurityAlertDetails {
  label: string;
  value: string;
}

export interface SecurityAlert {
  message: string;
  details?: SecurityAlertDetails[];
}

export interface MiniTransaction {
  description: string;
  date: string;
  amount: string;
  isCredit: boolean;
  status: string;
  statusText: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface PortfolioSummary {
  total_value: string;
  returns: string;
  returns_positive: boolean;
}

export interface Attachment {
  name: string;
  size: string;
  url: string;
}

export interface TicketInfo {
  ticket_id: string;
  status: string;
  priority: string;
  assigned_to: string;
}

// ============================================================================
// COMPLETE EMAIL TEMPLATE DATA
// ============================================================================

export interface EmailTemplateData extends Partial<BaseTemplateData> {
  HERO_IMAGE?: string;
  ACCOUNT_SUMMARY?: AccountSummary;
  TRANSACTION_DETAILS?: TransactionDetail[];
  STATUS?: StatusBadge;
  ALERT_BOX?: AlertBox;
  KYC_PROGRESS?: KycProgress;
  LOAN_DETAILS?: LoanDetails;
  CONTENT_SECTIONS?: ContentSection[];
  SECURITY_ALERT?: SecurityAlert;
  BUTTONS?: EmailButton[];
  MINI_TRANSACTIONS?: MiniTransaction[];
  FEATURES?: Feature[];
  PORTFOLIO_SUMMARY?: PortfolioSummary;
  ATTACHMENTS?: Attachment[];
  TICKET_INFO?: TicketInfo;
  QUICK_TIPS?: string;
  FOOTER_IMAGE?: string;
}

// ============================================================================
// EMAIL CONTENT GENERATOR INPUT TYPES
// ============================================================================

export interface UserAccountData {
  firstName: string;
  lastName?: string;
  email: string;
  accountNumber?: string;
  currency?: string;
  initialBalance?: string;
  verificationUrl?: string;
  userId?: string;
}

export interface KycStatusData {
  firstName: string;
  status: 'approved' | 'rejected' | 'pending';
  progress?: number;
  notes?: string;
  userId?: string;
}

export interface TransactionData {
  userName: string;
  type: string;
  status: 'completed' | 'pending' | 'failed';
  amount: string;
  currency: string;
  referenceNumber: string;
  createdAt?: string;
  newBalance?: string;
  accountNumber?: string;
  transactionId: string;
}

export interface CardIssuedData {
  cardholderName: string;
  cardType: string;
  cardBrand: string;
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
  status: string;
  cardId: string;
}

export interface LoanApplicationData {
  applicantName: string;
  status: 'approved' | 'rejected' | 'under_review';
  currency: string;
  amount: string;
  requestedAmount: string;
  loanType: string;
  term: number;
  applicationId: string;
  loanId?: string;
}

export interface SecurityAlertData {
  userName: string;
  alertMessage: string;
  alertType: string;
  detectedAt: string;
  ipAddress: string;
  location?: string;
  alertId: string;
}

export interface InvestmentData {
  userName: string;
  currency: string;
  totalValue: string;
  returns: string;
  returnsPositive: boolean;
  recentTransactions?: Array<{
    assetName: string;
    date: string;
    currency: string;
    amount: string;
    type: 'buy' | 'sell';
    status: string;
  }>;
}

export interface PasswordResetData {
  firstName: string;
  resetUrl: string;
  userId?: string;
}

export interface StatementData {
  userName: string;
  statementType: string;
  startDate: string;
  endDate: string;
  fileFormat: string;
  fileUrl: string;
  fileSize?: string;
}

export interface SupportTicketData {
  userName: string;
  ticketId: string;
  status: string;
  priority: string;
  assignedTo?: string;
  latestMessage?: string;
}

export interface PromotionData {
  userName: string;
  title?: string;
  description: string;
  bannerImage?: string;
  redeemInstructions?: string;
  ctaText?: string;
  ctaUrl: string;
  expiryDate: string;
}

export interface RegulatoryReportData {
  reportType: string;
  status: string;
  regulatorName: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  reportId: string;
}

// ============================================================================
// NEW EMAIL DATA TYPES FOR CONTROLLER INTEGRATION
// ============================================================================

export interface EmailVerificationData {
  firstName: string;
  email: string;
  verificationUrl: string;
  verificationCode?: string;
  expiresIn?: string;
  userId?: string;
}

export interface PasswordChangedData {
  firstName: string;
  email: string;
  changedAt: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

export interface EmailChangeData {
  firstName: string;
  newEmail: string;
  verificationCode: string;
  expiresIn?: string;
  userId?: string;
}

export interface TwoFactorEnabledData {
  firstName: string;
  email: string;
  method: 'sms' | 'email' | 'authenticator';
  backupCodes?: string[];
  enabledAt: string;
  userId?: string;
}

export interface TwoFactorDisabledData {
  firstName: string;
  email: string;
  disabledAt: string;
  ipAddress?: string;
  userId?: string;
}

export interface AccountDeletionData {
  firstName: string;
  email: string;
  verificationCode: string;
  expiresIn?: string;
  userId?: string;
}

export interface LoanDisbursedData {
  applicantName: string;
  loanId: string;
  loanType: string;
  amount: string;
  currency: string;
  disbursedTo: string;
  disbursedAt: string;
  repaymentStartDate: string;
  monthlyPayment: string;
}

export interface CardBlockedData {
  cardholderName: string;
  cardId: string;
  lastFour: string;
  cardType: string;
  blockedAt: string;
  reason: string;
  blockedBy: 'user' | 'admin' | 'system';
}

export interface CardReportedData {
  cardholderName: string;
  cardId: string;
  lastFour: string;
  cardType: string;
  reportType: 'lost' | 'stolen' | 'damaged';
  reportedAt: string;
  caseNumber?: string;
}

export interface AdminAccountData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  temporaryPassword?: string;
  createdBy: string;
  createdAt: string;
}

export interface AccountStatusData {
  firstName: string;
  email: string;
  status: 'active' | 'suspended' | 'banned' | 'restricted';
  reason?: string;
  effectiveDate: string;
  appealUrl?: string;
  userId?: string;
}

export interface AccountRestoredData {
  firstName: string;
  email: string;
  restoredAt: string;
  reason: string;
  userId?: string;
}

export interface DisputeClaimData {
  userName: string;
  claimId: string;
  transactionId: string;
  amount: string;
  currency: string;
  claimType: string;
  status: 'submitted' | 'under_review' | 'resolved' | 'rejected';
  submittedAt?: string;
  updatedAt?: string;
  resolution?: string;
  notes?: string;
}

export interface SavingsGoalData {
  userName: string;
  goalId: string;
  goalName: string;
  targetAmount: string;
  currentAmount: string;
  currency: string;
  progress: number;
  deadline?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface LoginAlertData {
  firstName: string;
  email: string;
  loginAt: string;
  ipAddress: string;
  location?: string;
  device?: string;
  browser?: string;
  userId?: string;
}

export interface OtpEmailData {
  firstName: string;
  email: string;
  otpCode: string;
  purpose: string;
  expiresIn: string;
  userId?: string;
}

// ============================================================================
// EMAIL CONTENT GENERATOR CLASS TYPES
// ============================================================================

export interface SocialLinks {
  facebook: string;
  twitter: string;
  youtube: string;
  linkedin: string;
}

export interface NavigationLinks {
  login: string;
  transactions: string;
  services: string;
  support: string;
  website: string;
  privacy: string;
  terms: string;
}

export interface EmailContentGeneratorConfig {
  baseUrl: string;
  supportEmail: string;
  companyName: string;
  year: number;
  socialLinks: SocialLinks;
  navLinks: NavigationLinks;
}

// ============================================================================
// MAILER SERVICE TYPES
// ============================================================================

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
  }>;
}

export interface SendMailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  response: string;
}

// ============================================================================
// RENDERER TYPES
// ============================================================================

export type RenderFunction<T> = (data: T) => string;

export interface ConditionalBlockConfig<T> {
  blockName: string;
  data: T | null | undefined;
  renderFn: RenderFunction<T>;
}

// ============================================================================
// EMAIL NOTIFICATION PREFERENCES (from NotificationModel)
// ============================================================================

export interface EmailNotificationPreferences {
  enabled: boolean;
  transactions: boolean;
  security: boolean;
  marketing: boolean;
  accountUpdates: boolean;
  newsletters: boolean;
  productUpdates: boolean;
}

// ============================================================================
// BULK EMAIL TYPES
// ============================================================================

export interface BulkEmailRecipient {
  email: string;
  templateData: EmailTemplateData;
}

export interface BulkEmailJob {
  recipients: BulkEmailRecipient[];
  batchSize?: number;
  delayBetweenBatches?: number;
}

export interface BulkEmailResult {
  total: number;
  sent: number;
  failed: number;
  errors: Array<{
    email: string;
    error: string;
  }>;
}

// ============================================================================
// EMAIL QUEUE TYPES (for async processing)
// ============================================================================

export interface EmailQueueItem {
  id: string;
  to: string;
  templateData: EmailTemplateData;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attempts: number;
  maxAttempts: number;
  scheduledFor?: Date;
  createdAt: Date;
  lastAttemptAt?: Date;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  error?: string;
}

// ============================================================================
// EMAIL ANALYTICS TYPES
// ============================================================================

export interface EmailAnalytics {
  emailId: string;
  recipient: string;
  subject: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  bounceReason?: string;
  opens: number;
  clicks: number;
  links: Array<{
    url: string;
    clicks: number;
  }>;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateDataValidator {
  emailType: string;
  requiredFields: string[];
  optionalFields: string[];
  validate: (data: Record<string, unknown>) => EmailValidationResult;
}

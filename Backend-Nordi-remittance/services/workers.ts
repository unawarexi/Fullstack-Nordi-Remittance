// ============================================================================
// Nordi-Remittance — BullMQ Workers
// Email, notification, transaction, KYC, and fraud job processors
// ============================================================================

import type { Job, JobsOptions } from "bullmq";
import { registerWorker, initQueues, addJob } from "./bullmq.service.js";
import { sendTemplatedMail, sendMail } from "./mailer.service.js";
import EmailContentGenerator from "../core/mail/Mail-content.js";
import { render } from "../core/mail/Mail-renderer.js";
import type { EmailTemplateData } from "../types/Mail.types.js";
import { createLogger } from "../logs/logger.js";
import { generateAccountStatement, generateTransactionReceipt, generateLoanDocument, generatePDFFromTemplate } from "../core/pdf/pdf-renderer.js";
import { markJobDone, markJobFailed } from "../core/pdf/document-job.service.js";

const log = createLogger("Workers");
const emailContent = new EmailContentGenerator();

// ============================================================================
// EMAIL JOB TYPES
// ============================================================================

export type EmailJobType =
  | "account-created"
  | "kyc-status"
  | "transaction"
  | "card-issued"
  | "card-blocked"
  | "card-reported"
  | "loan-application"
  | "loan-disbursed"
  | "security-alert"
  | "investment-update"
  | "password-reset"
  | "statement-generated"
  | "support-ticket"
  | "promotion"
  | "regulatory-report"
  | "email-verification"
  | "password-changed"
  | "email-change-verification"
  | "2fa-enabled"
  | "2fa-disabled"
  | "account-deletion"
  | "account-status-update"
  | "account-restored"
  | "dispute-claim"
  | "savings-goal"
  | "login-alert"
  | "otp"
  | "admin-account-created"
  | "raw"; // fallback: { subject, html } pre-rendered

export interface EmailJobData {
  type: EmailJobType;
  to: string;
  data: Record<string, unknown>;
}

// ============================================================================
// EMAIL WORKER — resolves template and sends via SMTP
// ============================================================================

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { type, to, data } = job.data;

  // "raw" type lets callers pass pre-rendered HTML directly (e.g. OTP quick sends)
  if (type === "raw") {
    await sendMail(
      to,
      (data.subject as string) || "Nordea Remittance",
      data.html as string,
    );
    log.info("Raw email sent", { to, jobId: job.id });
    return;
  }

  let templateData;

  switch (type) {
    case "account-created":
      templateData = emailContent.accountCreatedEmail(data as unknown as Parameters<EmailContentGenerator["accountCreatedEmail"]>[0]);
      break;
    case "kyc-status":
      templateData = emailContent.kycStatusEmail(data as unknown as Parameters<EmailContentGenerator["kycStatusEmail"]>[0]);
      break;
    case "transaction":
      templateData = emailContent.transactionNotification(data as unknown as Parameters<EmailContentGenerator["transactionNotification"]>[0]);
      break;
    case "card-issued":
      templateData = emailContent.cardIssuedEmail(data as unknown as Parameters<EmailContentGenerator["cardIssuedEmail"]>[0]);
      break;
    case "card-blocked":
      templateData = emailContent.cardBlockedEmail(data as unknown as Parameters<EmailContentGenerator["cardBlockedEmail"]>[0]);
      break;
    case "card-reported":
      templateData = emailContent.cardReportedEmail(data as unknown as Parameters<EmailContentGenerator["cardReportedEmail"]>[0]);
      break;
    case "loan-application":
      templateData = emailContent.loanApplicationEmail(data as unknown as Parameters<EmailContentGenerator["loanApplicationEmail"]>[0]);
      break;
    case "loan-disbursed":
      templateData = emailContent.loanDisbursedEmail(data as unknown as Parameters<EmailContentGenerator["loanDisbursedEmail"]>[0]);
      break;
    case "security-alert":
      templateData = emailContent.securityAlertEmail(data as unknown as Parameters<EmailContentGenerator["securityAlertEmail"]>[0]);
      break;
    case "investment-update":
      templateData = emailContent.investmentUpdateEmail(data as unknown as Parameters<EmailContentGenerator["investmentUpdateEmail"]>[0]);
      break;
    case "password-reset":
      templateData = emailContent.passwordResetEmail(data as unknown as Parameters<EmailContentGenerator["passwordResetEmail"]>[0]);
      break;
    case "statement-generated":
      templateData = emailContent.statementGeneratedEmail(data as unknown as Parameters<EmailContentGenerator["statementGeneratedEmail"]>[0]);
      break;
    case "support-ticket":
      templateData = emailContent.supportTicketEmail(data as unknown as Parameters<EmailContentGenerator["supportTicketEmail"]>[0]);
      break;
    case "promotion":
      templateData = emailContent.promotionEmail(data as unknown as Parameters<EmailContentGenerator["promotionEmail"]>[0]);
      break;
    case "regulatory-report":
      templateData = emailContent.regulatoryReportEmail(data as unknown as Parameters<EmailContentGenerator["regulatoryReportEmail"]>[0]);
      break;
    case "email-verification":
      templateData = emailContent.emailVerificationEmail(data as unknown as Parameters<EmailContentGenerator["emailVerificationEmail"]>[0]);
      break;
    case "password-changed":
      templateData = emailContent.passwordChangedEmail(data as unknown as Parameters<EmailContentGenerator["passwordChangedEmail"]>[0]);
      break;
    case "email-change-verification":
      templateData = emailContent.emailChangeVerificationEmail(data as unknown as Parameters<EmailContentGenerator["emailChangeVerificationEmail"]>[0]);
      break;
    case "2fa-enabled":
      templateData = emailContent.twoFactorEnabledEmail(data as unknown as Parameters<EmailContentGenerator["twoFactorEnabledEmail"]>[0]);
      break;
    case "2fa-disabled":
      templateData = emailContent.twoFactorDisabledEmail(data as unknown as Parameters<EmailContentGenerator["twoFactorDisabledEmail"]>[0]);
      break;
    case "account-deletion":
      templateData = emailContent.accountDeletionRequestEmail(data as unknown as Parameters<EmailContentGenerator["accountDeletionRequestEmail"]>[0]);
      break;
    case "account-status-update":
      templateData = emailContent.accountStatusUpdateEmail(data as unknown as Parameters<EmailContentGenerator["accountStatusUpdateEmail"]>[0]);
      break;
    case "account-restored":
      templateData = emailContent.accountRestoredEmail(data as unknown as Parameters<EmailContentGenerator["accountRestoredEmail"]>[0]);
      break;
    case "dispute-claim":
      templateData = emailContent.disputeClaimEmail(data as unknown as Parameters<EmailContentGenerator["disputeClaimEmail"]>[0]);
      break;
    case "savings-goal":
      templateData = emailContent.savingsGoalEmail(data as unknown as Parameters<EmailContentGenerator["savingsGoalEmail"]>[0]);
      break;
    case "login-alert":
      templateData = emailContent.loginAlertEmail(data as unknown as Parameters<EmailContentGenerator["loginAlertEmail"]>[0]);
      break;
    case "otp":
      templateData = emailContent.otpEmail(data as unknown as Parameters<EmailContentGenerator["otpEmail"]>[0]);
      break;
    case "admin-account-created":
      templateData = emailContent.adminAccountCreatedEmail(data as unknown as Parameters<EmailContentGenerator["adminAccountCreatedEmail"]>[0]);
      break;
    default:
      throw new Error(`Unknown email type: ${type}`);
  }

  await sendTemplatedMail(to, templateData);
  log.info("Email sent via worker", { type, to, jobId: job.id });
}

// ============================================================================
// NOTIFICATION JOB TYPES
// ============================================================================

export type NotificationType =
  | "transaction"
  | "security"
  | "kyc"
  | "card"
  | "loan"
  | "investment"
  | "account"
  | "system"
  | "promotional";

export interface NotificationJobData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  actionLabel?: string;
  relatedResource?: { resourceType: string; resourceId: string };
  metadata?: Record<string, unknown>;
}

// ============================================================================
// NOTIFICATION WORKER — persists in-app notifications to MongoDB
// ============================================================================

async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { userId, type, title, message, priority, actionUrl, actionLabel, relatedResource, metadata } = job.data;

  // Dynamic import avoids circular dependency: workers → model → (nothing)
  const { Notifications } = await import("../modules/notifications/notifications.model.js");

  await Notifications.create({
    user: userId,
    type,
    title,
    message,
    priority: priority ?? "medium",
    actionUrl,
    actionLabel,
    relatedResource,
    metadata,
  });

  log.info("Notification persisted", { type, userId, jobId: job.id });
}

// ============================================================================
// TRANSACTION JOB — async post-processing after a transaction commits
// Sends confirmation email + in-app notification
// ============================================================================

export interface TransactionJobData {
  userId: string;
  email: string;
  transactionData: Record<string, unknown>;
}

async function processTransactionJob(job: Job<TransactionJobData>): Promise<void> {
  const { userId, email, transactionData } = job.data;

  // Queue email notification (non-blocking — adds to EMAIL queue)
  await queueEmail("transaction", email, transactionData);

  // Queue in-app notification
  await queueNotification(userId, "transaction", "Transaction Update", `Your ${transactionData.type ?? "transaction"} of ${transactionData.currency ?? ""} ${transactionData.amount ?? ""} is ${transactionData.status ?? "processed"}.`, "medium");

  log.info("Transaction job processed", { userId, jobId: job.id });
}

// ============================================================================
// KYC JOB — sends email + notification after KYC status change
// ============================================================================

export interface KycJobData {
  userId: string;
  email: string;
  kycData: Record<string, unknown>;
}

async function processKycJob(job: Job<KycJobData>): Promise<void> {
  const { userId, email, kycData } = job.data;

  await queueEmail("kyc-status", email, kycData);

  const statusMessages: Record<string, string> = {
    approved: "Your identity verification has been approved.",
    rejected: "Your KYC documents require attention. Please resubmit.",
    pending: "Your KYC documents are under review.",
  };

  const status = (kycData.status as string) ?? "pending";
  await queueNotification(userId, "kyc", "KYC Verification Update", statusMessages[status] ?? "Your KYC status has been updated.", status === "approved" ? "medium" : "high");

  log.info("KYC job processed", { userId, status, jobId: job.id });
}

// ============================================================================
// FRAUD JOB — high-priority security alert email + urgent notification
// ============================================================================

export interface FraudJobData {
  userId: string;
  email: string;
  alertData: Record<string, unknown>;
}

async function processFraudJob(job: Job<FraudJobData>): Promise<void> {
  const { userId, email, alertData } = job.data;

  await queueEmail("security-alert", email, alertData, { priority: 1 });
  await queueNotification(userId, "security", "Security Alert", (alertData.alertMessage as string) ?? "Unusual activity detected on your account.", "urgent");

  log.info("Fraud alert job processed", { userId, jobId: job.id });
}

// ============================================================================
// DOCUMENT JOB TYPES
// ============================================================================

export interface DocumentJobData {
  jobId: string;
  type: "render" | "export";
  templateName?: string;
  format?: string;
  data?: any;
  branding?: any;
  columns?: any;
  title?: string;
  tenantId?: string;
}

async function processDocumentJob(job: Job<DocumentJobData>): Promise<void> {
  const { jobId, type, format, data, branding, templateName } = job.data;
  try {
    let resultBuffer: Buffer;
    
    if (type === "render") {
      if (templateName === "account-statement") {
        resultBuffer = await generateAccountStatement({ ...data, branding });
      } else if (templateName === "transaction-receipt") {
        resultBuffer = await generateTransactionReceipt({ ...data, branding });
      } else if (templateName === "loan-document") {
        resultBuffer = await generateLoanDocument({ ...data, branding });
      } else {
        resultBuffer = await generatePDFFromTemplate({ templateName, data, branding });
      }
    } else if (type === "export") {
      if (format === 'csv' || format === 'xlsx') {
        // Basic placeholder for actual Excel/CSV implementation
        resultBuffer = Buffer.from("Export not fully implemented", "utf-8");
      } else {
        resultBuffer = await generatePDFFromTemplate({ data, branding });
      }
    } else {
      throw new Error(`Unknown document job type: ${type}`);
    }

    // In a production system, the buffer would be uploaded to Cloudinary or AWS S3.
    // For now we just mark the job as done in Redis.
    await markJobDone(jobId, { status: "success", length: resultBuffer.length });
    log.info("Document job processed successfully", { jobId, type });
  } catch (err: any) {
    log.error("Document job failed", { jobId, error: err.message });
    await markJobFailed(jobId, err);
    throw err;
  }
}

// ============================================================================
// REGISTER ALL WORKERS
// ============================================================================

export function startWorkers(): void {
  initQueues();

  registerWorker("EMAIL", processEmailJob as Parameters<typeof registerWorker>[1], { concurrency: 10 });
  registerWorker("NOTIFICATION", processNotificationJob as Parameters<typeof registerWorker>[1], { concurrency: 15 });
  registerWorker("TRANSACTION", processTransactionJob as Parameters<typeof registerWorker>[1], { concurrency: 5 });
  registerWorker("KYC", processKycJob as Parameters<typeof registerWorker>[1], { concurrency: 5 });
  registerWorker("FRAUD", processFraudJob as Parameters<typeof registerWorker>[1], { concurrency: 5 });
  registerWorker("DOCUMENT", processDocumentJob as Parameters<typeof registerWorker>[1], { concurrency: 3 });

  log.success("All Nordi workers started");
}

// ============================================================================
// QUEUE HELPERS — call these from services/controllers to enqueue work
// ============================================================================

/**
 * Queue a templated email job.
 *
 * @example
 *   await queueEmail("account-created", user.email, { firstName: "Jane", ... });
 */
export async function queueEmail(
  type: EmailJobType,
  to: string,
  data: Record<string, unknown>,
  options: JobsOptions = {},
): Promise<void> {
  await addJob<EmailJobData>(
    "EMAIL",
    `email:${type}`,
    { type, to, data },
    { priority: options.priority ?? 3, delay: options.delay ?? 0, ...options },
  );
}

/**
 * Queue an in-app notification job.
 *
 * @example
 *   await queueNotification(userId, "transaction", "Transfer Sent", "USD 500 sent to John.");
 */
export async function queueNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  priority: NotificationJobData["priority"] = "medium",
  extra: Partial<Omit<NotificationJobData, "userId" | "type" | "title" | "message" | "priority">> = {},
  options: JobsOptions = {},
): Promise<void> {
  await addJob<NotificationJobData>(
    "NOTIFICATION",
    `notification:${type}`,
    { userId, type, title, message, priority, ...extra },
    { priority: options.priority ?? 2, ...options },
  );
}

/**
 * Queue a transaction post-processing job.
 * Sends confirmation email and in-app notification asynchronously.
 */
export async function queueTransaction(
  userId: string,
  email: string,
  transactionData: Record<string, unknown>,
  options: JobsOptions = {},
): Promise<void> {
  await addJob<TransactionJobData>(
    "TRANSACTION",
    "transaction:process",
    { userId, email, transactionData },
    { priority: options.priority ?? 2, ...options },
  );
}

/**
 * Queue a KYC status notification job.
 */
export async function queueKycNotification(
  userId: string,
  email: string,
  kycData: Record<string, unknown>,
  options: JobsOptions = {},
): Promise<void> {
  await addJob<KycJobData>(
    "KYC",
    "kyc:notify",
    { userId, email, kycData },
    { priority: options.priority ?? 2, ...options },
  );
}

/**
 * Queue a fraud/security alert notification job.
 */
export async function queueFraudAlert(
  userId: string,
  email: string,
  alertData: Record<string, unknown>,
  options: JobsOptions = {},
): Promise<void> {
  await addJob<FraudJobData>(
    "FRAUD",
    "fraud:alert",
    { userId, email, alertData },
    { priority: 1, ...options }, // always highest priority
  );
}

// ============================================================================
// DROP-IN REPLACEMENT FOR sendTemplatedMail — queues pre-built template data
// ============================================================================

/**
 * Drop-in async replacement for `sendTemplatedMail`.
 * Pre-renders the HTML from template data then enqueues the email via BullMQ,
 * so the caller is never blocked waiting for SMTP.
 */
export async function queueTemplatedMail(
  to: string,
  templateData: EmailTemplateData,
  options: JobsOptions = {},
): Promise<void> {
  const html = render(templateData);
  const subject = templateData.EMAIL_TITLE ?? "Notification from Nordea Remittance";
  await addJob<EmailJobData>(
    "EMAIL",
    "email:raw",
    { type: "raw", to, data: { subject, html } },
    { priority: options.priority ?? 3, ...options },
  );
}

export default {
  startWorkers,
  queueEmail,
  queueTemplatedMail,
  queueNotification,
  queueTransaction,
  queueKycNotification,
  queueFraudAlert,
};
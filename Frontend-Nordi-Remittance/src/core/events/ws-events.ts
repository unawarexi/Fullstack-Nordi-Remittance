// ============================================================================
// WEBSOCKET EVENT CONSTANTS — Frontend mirror of backend ws-events.ts
// Single source of truth for all real-time event subscriptions
// ============================================================================

export const WS = {
  // ── Auth ──────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN_SUCCESS: "auth:login_success",
    LOGIN_FAILED: "auth:login_failed",
    LOGOUT: "auth:logout",
    SESSION_REVOKED: "auth:session_revoked",
    ALL_SESSIONS_REVOKED: "auth:all_sessions_revoked",
    TWO_FA_VERIFIED: "auth:2fa_verified",
    PASSWORD_CHANGED: "auth:password_changed",
    PASSWORD_RESET: "auth:password_reset",
    EMAIL_VERIFIED: "auth:email_verified",
    ACCOUNT_LOCKED: "auth:account_locked",
  },

  // ── Account / Wallet ─────────────────────────────────────────────────
  ACCOUNT: {
    WALLET_CREATED: "account:wallet_created",
    WALLET_UPDATED: "account:wallet_updated",
    WALLET_CLOSED: "account:wallet_closed",
    WALLET_STATUS_CHANGED: "account:wallet_status_changed",
    BALANCE_UPDATED: "account:balance_updated",
    BENEFICIARY_ADDED: "account:beneficiary_added",
    BENEFICIARY_REMOVED: "account:beneficiary_removed",
  },

  // ── Transaction ──────────────────────────────────────────────────────
  TRANSACTION: {
    CREATED: "transaction:created",
    COMPLETED: "transaction:completed",
    FAILED: "transaction:failed",
    CANCELLED: "transaction:cancelled",
    REVERSED: "transaction:reversed",
    STATUS_UPDATED: "transaction:status_updated",
    RECEIVED: "transaction:received",
    APPROVED: "transaction:approved",
    REJECTED: "transaction:rejected",
  },

  // ── Transfer Verification ────────────────────────────────────────────
  TRANSFER: {
    INITIATED: "transfer:initiated",
    STEP_VERIFIED: "transfer:step_verified",
    COMPLETED: "transfer:completed",
    CANCELLED: "transfer:cancelled",
  },

  // ── Card ──────────────────────────────────────────────────────────────
  CARD: {
    CREATED: "card:created",
    REQUESTED: "card:requested",
    ACTIVATED: "card:activated",
    BLOCKED: "card:blocked",
    UNBLOCKED: "card:unblocked",
    REPORTED: "card:reported",
    LIMITS_UPDATED: "card:limits_updated",
    CONTROLS_UPDATED: "card:controls_updated",
    PIN_CHANGED: "card:pin_changed",
  },

  // ── Loans ─────────────────────────────────────────────────────────────
  LOAN: {
    APPLICATION_SUBMITTED: "loan:application_submitted",
    APPLICATION_REVIEWED: "loan:application_reviewed",
    APPROVED: "loan:approved",
    REJECTED: "loan:rejected",
    DISBURSED: "loan:disbursed",
    PAYMENT_MADE: "loan:payment_made",
  },

  // ── Investments ───────────────────────────────────────────────────────
  INVESTMENT: {
    ACCOUNT_CREATED: "investment:account_created",
    PURCHASED: "investment:purchased",
    SOLD: "investment:sold",
    RETURNS_ADDED: "investment:returns_added",
    ACCOUNT_APPROVED: "investment:account_approved",
    SAVINGS_GOAL_CREATED: "investment:savings_goal_created",
    SAVINGS_GOAL_DEPOSIT: "investment:savings_goal_deposit",
    SAVINGS_GOAL_WITHDRAWAL: "investment:savings_goal_withdrawal",
    SAVINGS_GOAL_DELETED: "investment:savings_goal_deleted",
  },

  // ── KYC / Attachment ──────────────────────────────────────────────────
  KYC: {
    DOCUMENT_UPLOADED: "kyc:document_uploaded",
    DOCUMENT_REVIEWED: "kyc:document_reviewed",
    STATUS_UPDATED: "kyc:status_updated",
  },

  // ── Fraud ─────────────────────────────────────────────────────────────
  FRAUD: {
    SIGNAL_UPDATED: "fraud:signal_updated",
    CASE_CREATED: "fraud:case_created",
    CASE_UPDATED: "fraud:case_updated",
    COMMENT_ADDED: "fraud:comment_added",
    SECURITY_EVENT: "fraud:security_event",
  },

  // ── Permission ────────────────────────────────────────────────────────
  PERMISSION: {
    UPDATED: "permission:updated",
    FIELD_UPDATED: "permission:field_updated",
    REVOKED: "permission:revoked",
    BULK_UPDATED: "permission:bulk_updated",
  },

  // ── Security ──────────────────────────────────────────────────────────
  SECURITY: {
    TWO_FA_ENABLED: "security:2fa_enabled",
    TWO_FA_DISABLED: "security:2fa_disabled",
    BACKUP_CODES_REGENERATED: "security:backup_codes_regenerated",
    TRUSTED_DEVICE_ADDED: "security:trusted_device_added",
    TRUSTED_DEVICE_REMOVED: "security:trusted_device_removed",
    SESSION_REVOKED: "security:session_revoked",
    ALL_SESSIONS_REVOKED: "security:all_sessions_revoked",
  },

  // ── Notification (multi-device sync) ──────────────────────────────────
  NOTIFICATION: {
    NEW: "notification:new",
    READ: "notification:read",
    ALL_READ: "notification:all_read",
  },

  // ── Admin ─────────────────────────────────────────────────────────────
  ADMIN: {
    USER_STATUS_CHANGED: "admin:user_status_changed",
    USER_PASSWORD_RESET: "admin:user_password_reset",
    SETTING_UPDATED: "admin:setting_updated",
    TASK_CREATED: "admin:task_created",
    TASK_UPDATED: "admin:task_updated",
    PERMISSIONS_UPDATED: "admin:permissions_updated",
    WALLET_FUND: "admin:wallet_fund",
    WALLET_DEBIT: "admin:wallet_debit",
  },

  // ── Legal / Disputes ──────────────────────────────────────────────────
  DISPUTE: {
    CREATED: "dispute:created",
    COMMENT_ADDED: "dispute:comment_added",
    STATUS_UPDATED: "dispute:status_updated",
  },

  // ── Integration ───────────────────────────────────────────────────────
  INTEGRATION: {
    EXTERNAL_ACCOUNT_LINKED: "integration:account_linked",
    EXTERNAL_ACCOUNT_UNLINKED: "integration:account_unlinked",
    EXTERNAL_ACCOUNT_VERIFIED: "integration:account_verified",
  },
} as const;

// ============================================================================
// TYPE HELPERS
// ============================================================================

type ExtractValues<T> = T extends Record<string, infer V>
  ? V extends string
    ? V
    : V extends Record<string, string>
      ? V[keyof V]
      : never
  : never;

/** Union of all WebSocket event name strings */
export type WSEventName = ExtractValues<typeof WS>;

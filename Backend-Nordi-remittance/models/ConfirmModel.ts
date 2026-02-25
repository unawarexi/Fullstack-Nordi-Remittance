// ============================================================================
// CONFIRMATION & SECURITY MODELS
// ============================================================================

import mongoose, { Schema, Document, Types } from "mongoose";

// ============================================================================
// CONFIRMATION TOKEN MODEL
// ============================================================================

interface IConfirmationToken extends Document {
  userId: string;
  token: string;
  type:
    | "email_verification"
    | "password_reset"
    | "two_factor"
    | "two_factor_setup"
    | "phone_verification"
    | "email_change"
    | "phone_change"
    | "account_deletion"
    | "refresh_token";
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ConfirmationTokenSchema = new Schema<IConfirmationToken>(
  {
    userId: { type: String, ref: "Users", required: true },
    token: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "email_verification",
        "password_reset",
        "two_factor",
        "two_factor_setup",
        "phone_verification",
        "email_change",
        "phone_change",
        "account_deletion",
        "refresh_token",
      ],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    usedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  },
);

// Compound index for efficient lookups
ConfirmationTokenSchema.index({ token: 1, type: 1, used: 1 });
ConfirmationTokenSchema.index({ userId: 1, type: 1 });

// Auto-delete expired tokens
ConfirmationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================================================
// LOGIN ATTEMPT MODEL
// ============================================================================

interface ILoginAttempt extends Document {
  userId?: string;
  email: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  createdAt: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>(
  {
    userId: { type: String, ref: "Users" },
    email: { type: String, required: true, lowercase: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String },
    success: { type: Boolean, required: true },
    reason: { type: String },
    location: {
      country: { type: String },
      city: { type: String },
      region: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  },
);

// Index for analytics and security monitoring
LoginAttemptSchema.index({ email: 1, createdAt: -1 });
LoginAttemptSchema.index({ ipAddress: 1, createdAt: -1 });
LoginAttemptSchema.index({ success: 1, createdAt: -1 });

// Auto-delete old attempts (keep for 90 days)
LoginAttemptSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

// ============================================================================
// SECURITY EVENT MODEL
// ============================================================================

interface ISecurityEvent extends Document {
  userId?: string;
  type: string;
  severity?: "low" | "medium" | "high" | "critical";
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}

const SecurityEventSchema = new Schema<ISecurityEvent>(
  {
    userId: { type: String, ref: "Users" },
    type: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "login_failed",
        "login_locked",
        "password_changed",
        "password_reset_requested",
        "password_reset_completed",
        "email_changed",
        "phone_changed",
        "two_factor_enabled",
        "two_factor_disabled",
        "two_factor_failed",
        "status_changed",
        "kyc_status_changed",
        "suspicious_activity",
        "account_locked",
        "account_unlocked",
        "account_deleted",
        "api_key_created",
        "api_key_revoked",
        "device_added",
        "device_removed",
        "transaction_flagged",
        "transaction_blocked",
        "ip_blocked",
        "ip_unblocked",
      ],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    description: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    location: {
      country: { type: String },
      city: { type: String },
      region: { type: String },
    },
    metadata: { type: Schema.Types.Mixed },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolvedBy: { type: String, ref: "Users" },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  },
);

// Indexes for security monitoring
SecurityEventSchema.index({ userId: 1, type: 1, createdAt: -1 });
SecurityEventSchema.index({ type: 1, severity: 1, createdAt: -1 });
SecurityEventSchema.index({ ipAddress: 1, createdAt: -1 });
SecurityEventSchema.index({ resolved: 1, severity: 1 });

// ============================================================================
// BLOCKED IP MODEL
// ============================================================================

interface IBlockedIP extends Document {
  ipAddress: string;
  reason: string;
  blockedBy?: string;
  expiresAt?: Date;
  permanent: boolean;
  createdAt: Date;
}

const BlockedIPSchema = new Schema<IBlockedIP>(
  {
    ipAddress: { type: String, required: true, unique: true },
    reason: { type: String, required: true },
    blockedBy: { type: String, ref: "Users" },
    expiresAt: { type: Date, index: true },
    permanent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  },
);

// Auto-delete expired blocks
BlockedIPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================================================
// DEVICE/SESSION MODEL
// ============================================================================

interface IUserDevice extends Document {
  userId: string;
  deviceId: string;
  deviceName?: string;
  deviceType?: "mobile" | "tablet" | "desktop" | "other";
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
  };
  trusted: boolean;
  lastActive: Date;
  createdAt: Date;
}

const UserDeviceSchema = new Schema<IUserDevice>(
  {
    userId: { type: String, ref: "Users", required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    deviceName: { type: String },
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop", "other"],
    },
    browser: { type: String },
    os: { type: String },
    ipAddress: { type: String },
    location: {
      country: { type: String },
      city: { type: String },
    },
    trusted: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  },
);

UserDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

// ============================================================================
// LEGACY CONFIRM MODEL (For backward compatibility)
// ============================================================================

interface IConfirm extends Document {
  accountPassword: string;
  confirmPassword: string;
  nationalId: string;
}

const ConfirmSchema = new Schema<IConfirm>({
  accountPassword: { type: String, required: true },
  confirmPassword: { type: String, required: true },
  nationalId: { type: String, required: true },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const ConfirmationToken = mongoose.model<IConfirmationToken>(
  "ConfirmationToken",
  ConfirmationTokenSchema,
);
export const LoginAttempt = mongoose.model<ILoginAttempt>(
  "LoginAttempt",
  LoginAttemptSchema,
);
export const SecurityEvent = mongoose.model<ISecurityEvent>(
  "SecurityEvent",
  SecurityEventSchema,
);
export const BlockedIP = mongoose.model<IBlockedIP>(
  "BlockedIP",
  BlockedIPSchema,
);
export const UserDevice = mongoose.model<IUserDevice>(
  "UserDevice",
  UserDeviceSchema,
);
export const Confirm = mongoose.model<IConfirm>("Confirm", ConfirmSchema);

// Default export for backward compatibility
export default Confirm;

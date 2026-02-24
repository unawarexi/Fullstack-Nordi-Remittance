import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

//---------------------------------------- Schemas
const AdminUserSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  role: {
    type: String,
    enum: [
      "super_admin",
      "admin",
      "compliance_officer",
      "support_agent",
      "analyst",
    ],
    required: true,
  },
  permissions: { type: Schema.Types.ObjectId, ref: "AdminPermissions" },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  lockReason: { type: String },
  lockedAt: { type: Date },
  // Two-Factor Authentication
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  twoFactorBackupCodes: [{ type: String }],
  // Password Management
  passwordChangedAt: { type: Date },
  mustChangePassword: { type: Boolean, default: false },
  passwordHistory: [{ type: String }], // Store hashed previous passwords
  // Session Management
  activeSessions: [
    {
      sessionId: { type: String },
      deviceInfo: { type: String },
      ipAddress: { type: String },
      createdAt: { type: Date, default: Date.now },
      lastActivity: { type: Date, default: Date.now },
    },
  ],
  // OTP for sensitive operations
  pendingOtp: {
    code: { type: String },
    purpose: { type: String }, // 'password_change', 'email_change', 'sensitive_action'
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
  },
  // Audit
  createdBy: { type: String, ref: "AdminUsers" },
  updatedBy: { type: String, ref: "AdminUsers" },
  isSuperAdmin: { type: Boolean, default: false }, // Flag for the seeded super admin
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AdminPermissionSchema = new Schema({
  admin: { type: String, ref: "AdminUsers", required: true, unique: true },
  permissionId: { type: String, required: true, unique: true, default: uuidv4 },
  // User Management
  canViewUsers: { type: Boolean, default: false },
  canEditUsers: { type: Boolean, default: false },
  canSuspendUsers: { type: Boolean, default: false },
  canDeleteUsers: { type: Boolean, default: false },
  canVerifyKyc: { type: Boolean, default: false },
  // Transaction Management
  canViewTransactions: { type: Boolean, default: false },
  canReverseTransactions: { type: Boolean, default: false },
  canRefundTransactions: { type: Boolean, default: false },
  canAdjustBalances: { type: Boolean, default: false },
  // Financial Operations
  canManageLoans: { type: Boolean, default: false },
  canApproveLoans: { type: Boolean, default: false },
  canManageInvestments: { type: Boolean, default: false },
  canManageCards: { type: Boolean, default: false },
  // Fraud & Security
  canViewFraudCases: { type: Boolean, default: false },
  canManageFraudCases: { type: Boolean, default: false },
  canBlockAccounts: { type: Boolean, default: false },
  canAccessSecurityLogs: { type: Boolean, default: false },
  // System Configuration
  canManageSettings: { type: Boolean, default: false },
  canManageAdmins: { type: Boolean, default: false },
  canViewReports: { type: Boolean, default: false },
  canExportData: { type: Boolean, default: false },
  // Support
  canManageTickets: { type: Boolean, default: false },
  canViewCustomerData: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AdminActionLogSchema = new Schema({
  logId: { type: String, required: true, unique: true, default: uuidv4 },
  admin: { type: String, ref: "AdminUsers", required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: String, required: true },
  changes: { type: Schema.Types.Mixed },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  status: { type: String, enum: ["success", "failed"], required: true },
  failureReason: { type: String },
  createdAt: { type: Date, default: Date.now, immutable: true },
});

const SystemSettingSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  category: {
    type: String,
    enum: [
      "general",
      "security",
      "payment",
      "compliance",
      "notification",
      "feature",
    ],
    required: true,
  },
  description: { type: String, required: true },
  isEditable: { type: Boolean, default: true },
  dataType: {
    type: String,
    enum: ["string", "number", "boolean", "json"],
    required: true,
  },
  updatedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const OperationalTaskSchema = new Schema({
  taskId: { type: String, required: true, unique: true, default: uuidv4 },
  title: { type: String, required: true },
  description: { type: String, required: true },
  taskType: {
    type: String,
    enum: [
      "kyc_review",
      "loan_approval",
      "transaction_review",
      "fraud_investigation",
      "customer_verification",
      "other",
    ],
    required: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending",
  },
  assignedTo: { type: String },
  relatedUser: { type: String },
  relatedTransaction: { type: Schema.Types.ObjectId, ref: "Transactions" },
  relatedCase: { type: Schema.Types.ObjectId, ref: "FraudCases" },
  dueDate: { type: Date },
  completedAt: { type: Date },
  completedBy: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const SupportTicketSchema = new Schema({
  ticketId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: "Users", required: true },
  subject: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "account",
      "transaction",
      "card",
      "loan",
      "technical",
      "billing",
      "other",
    ],
    required: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "pending", "in_progress", "resolved", "closed"],
    default: "open",
  },
  assignedTo: { type: String },
  description: { type: String, required: true },
  attachments: [{ type: String }],
  resolution: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
});

const SupportMessageSchema = new Schema({
  ticket: {
    type: Schema.Types.ObjectId,
    ref: "SupportTickets",
    required: true,
  },
  messageId: { type: String, required: true, unique: true, default: uuidv4 },
  sender: { type: String, required: true },
  senderType: { type: String, enum: ["user", "admin"], required: true },
  message: { type: String, required: true },
  attachments: [{ type: String }],
  isInternal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, immutable: true },
});

// Indexes
AdminUserSchema.index({ role: 1, isActive: 1 });
AdminActionLogSchema.index({ admin: 1, createdAt: -1 });
AdminActionLogSchema.index({ resource: 1, resourceId: 1 });
SystemSettingSchema.index({ category: 1 });
OperationalTaskSchema.index({ assignedTo: 1, status: 1 });
OperationalTaskSchema.index({ taskType: 1, status: 1 });
SupportTicketSchema.index({ user: 1, status: 1 });
SupportTicketSchema.index({ assignedTo: 1, status: 1 });
SupportMessageSchema.index({ ticket: 1, createdAt: 1 });

export const AdminUsers = mongoose.model("AdminUsers", AdminUserSchema);
export const AdminPermissions = mongoose.model(
  "AdminPermissions",
  AdminPermissionSchema,
);
export const AdminActionLogs = mongoose.model(
  "AdminActionLogs",
  AdminActionLogSchema,
);
export const SystemSettings = mongoose.model(
  "SystemSettings",
  SystemSettingSchema,
);
export const OperationalTasks = mongoose.model(
  "OperationalTasks",
  OperationalTaskSchema,
);
export const SupportTickets = mongoose.model(
  "SupportTickets",
  SupportTicketSchema,
);
export const SupportMessages = mongoose.model(
  "SupportMessages",
  SupportMessageSchema,
);

export default AdminUsers;

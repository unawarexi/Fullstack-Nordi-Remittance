import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

// Audit Logs Schema - Immutable system events for compliance
const AuditLogSchema = new Schema({
  logId: { type: String, required: true, unique: true, default: uuidv4 },
  eventType: { 
    type: String, 
    enum: ['user_action', 'system_action', 'transaction', 'security', 'compliance', 'data_change'], 
    required: true 
  },
  action: { type: String, required: true },
  actor: { type: String, required: true },
  actorType: { type: String, enum: ['user', 'admin', 'system'], required: true },
  resource: { type: String, required: true },
  resourceId: { type: String, required: true },
  changes: {
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed }
  },
  ipAddress: { type: String },
  userAgent: { type: String },
  location: {
    country: { type: String },
    city: { type: String }
  },
  severity: { type: String, enum: ['info', 'warning', 'error', 'critical'], required: true },
  status: { type: String, enum: ['success', 'failed'], required: true },
  errorMessage: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, immutable: true }
});

// Activity Logs Schema - User activity history
const ActivityLogSchema = new Schema({
  activityId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  activityType: { 
    type: String, 
    enum: ['login', 'logout', 'transaction', 'profile_update', 'settings_change', 'view', 'download', 'other'], 
    required: true 
  },
  description: { type: String, required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  deviceInfo: {
    deviceId: { type: String },
    deviceType: { type: String, required: true },
    os: { type: String, required: true },
    browser: { type: String }
  },
  location: {
    country: { type: String },
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, immutable: true }
});

// Data Access Logs Schema - Sensitive data access tracking (GDPR/compliance)
const DataAccessLogSchema = new Schema({
  accessId: { type: String, required: true, unique: true, default: uuidv4 },
  accessor: { type: String, required: true },
  accessorType: { type: String, enum: ['user', 'admin', 'system'], required: true },
  dataOwner: { type: String, ref: 'Users', required: true },
  dataType: { type: String, enum: ['pii', 'financial', 'kyc', 'transaction', 'document', 'other'], required: true },
  accessReason: { type: String, required: true },
  accessMethod: { type: String, enum: ['view', 'export', 'modify', 'delete'], required: true },
  dataFields: [{ type: String }],
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  consentObtained: { type: Boolean, required: true },
  legalBasis: { type: String },
  retentionPeriod: { type: Number },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, immutable: true }
});

// Error Logs Schema - System error logging
const ErrorLogSchema = new Schema({
  errorId: { type: String, required: true, unique: true, default: uuidv4 },
  errorType: { 
    type: String, 
    enum: ['application', 'database', 'network', 'external_api', 'validation', 'authentication', 'authorization'], 
    required: true 
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  message: { type: String, required: true },
  stackTrace: { type: String },
  userId: { type: String },
  endpoint: { type: String },
  method: { type: String },
  statusCode: { type: Number },
  requestBody: { type: Schema.Types.Mixed },
  responseBody: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  environment: { type: String, enum: ['development', 'staging', 'production'], required: true },
  isResolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  resolvedBy: { type: String },
  resolution: { type: String },
  createdAt: { type: Date, default: Date.now, immutable: true }
});

// Webhook Events Schema - External webhook events
const WebhookEventSchema = new Schema({
  eventId: { type: String, required: true, unique: true, default: uuidv4 },
  provider: { type: String, required: true },
  eventType: { type: String, required: true },
  eventData: { type: Schema.Types.Mixed, required: true },
  webhookUrl: { type: String, required: true },
  httpMethod: { type: String, required: true },
  headers: { type: Map, of: String, required: true },
  status: { type: String, enum: ['received', 'processing', 'processed', 'failed', 'retrying'], default: 'received' },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  lastAttemptAt: { type: Date },
  nextRetryAt: { type: Date },
  processedAt: { type: Date },
  failureReason: { type: String },
  responseStatus: { type: Number },
  responseBody: { type: String },
  signature: { type: String },
  signatureVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compliance Reports Schema
const ComplianceReportSchema = new Schema({
  reportId: { type: String, required: true, unique: true, default: uuidv4 },
  reportType: { 
    type: String, 
    enum: ['transaction_monitoring', 'kyc_compliance', 'suspicious_activity', 'regulatory', 'aml', 'other'], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  findings: [{
    type: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    count: { type: Number, required: true },
    description: { type: String, required: true }
  }],
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
  generatedBy: { type: String, ref: 'Users', required: true },
  generatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// System Audit Trails Schema
const SystemAuditTrailSchema = new Schema({
  trailId: { type: String, required: true, unique: true, default: uuidv4 },
  component: { type: String, required: true },
  eventType: { 
    type: String, 
    enum: ['startup', 'shutdown', 'config_change', 'deployment', 'error', 'warning', 'info', 'other'], 
    required: true 
  },
  description: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  severity: { type: String, enum: ['info', 'warning', 'error', 'critical'], default: 'info' },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, immutable: true }
});

// Indexes
AuditLogSchema.index({ actor: 1, createdAt: -1 });
AuditLogSchema.index({ eventType: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ severity: 1, status: 1 });
ActivityLogSchema.index({ user: 1, createdAt: -1 });
ActivityLogSchema.index({ activityType: 1, createdAt: -1 });
DataAccessLogSchema.index({ dataOwner: 1, createdAt: -1 });
DataAccessLogSchema.index({ accessor: 1, createdAt: -1 });
DataAccessLogSchema.index({ dataType: 1, accessMethod: 1 });
ErrorLogSchema.index({ errorType: 1, severity: 1 });
ErrorLogSchema.index({ isResolved: 1, createdAt: -1 });
ErrorLogSchema.index({ userId: 1, createdAt: -1 });
WebhookEventSchema.index({ provider: 1, eventType: 1 });
WebhookEventSchema.index({ status: 1, nextRetryAt: 1 });
WebhookEventSchema.index({ createdAt: -1 });
ComplianceReportSchema.index({ reportType: 1, status: 1 });
ComplianceReportSchema.index({ generatedBy: 1, createdAt: -1 });
ComplianceReportSchema.index({ periodStart: 1, periodEnd: 1 });
SystemAuditTrailSchema.index({ component: 1, createdAt: -1 });
SystemAuditTrailSchema.index({ eventType: 1, severity: 1 });
SystemAuditTrailSchema.index({ timestamp: -1 });

export const AuditLogs = mongoose.model('AuditLogs', AuditLogSchema);
export const ActivityLogs = mongoose.model('ActivityLogs', ActivityLogSchema);
export const DataAccessLogs = mongoose.model('DataAccessLogs', DataAccessLogSchema);
export const ErrorLogs = mongoose.model('ErrorLogs', ErrorLogSchema);
export const WebhookEvents = mongoose.model('WebhookEvents', WebhookEventSchema);
export const ComplianceReports = mongoose.model('ComplianceReports', ComplianceReportSchema);
export const SystemAuditTrails = mongoose.model('SystemAuditTrails', SystemAuditTrailSchema);

export default AuditLogs;

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

// Schemas
const FraudSignalSchema = new Schema({
  signalId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  transaction: { type: Schema.Types.ObjectId, ref: 'Transactions' },
  signalType: { 
    type: String, 
    enum: ['velocity', 'location', 'device', 'behavior', 'amount', 'pattern', 'blacklist'], 
    required: true 
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  description: { type: String, required: true },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  detectedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'false_positive'], default: 'open' },
  notes: { type: String },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  resolvedAt: { type: Date },
  resolvedBy: { type: String },
  resolution: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, immutable: true }
});

const FraudCaseSchema = new Schema({
  caseId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  caseType: { 
    type: String, 
    enum: ['account_takeover', 'identity_theft', 'transaction_fraud', 'money_laundering', 'suspicious_activity'], 
    required: true 
  },
  status: { type: String, enum: ['open', 'investigating', 'escalated', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  assignedTo: { type: String },
  signals: [{ type: Schema.Types.ObjectId, ref: 'FraudSignals' }],
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transactions' }],
  evidences: [{
    type: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  notes: [{
    author: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  actions: [{
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    performedAt: { type: Date, default: Date.now },
    details: { type: String }
  }],
  timeline: [{
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String }
  }],
  resolution: { type: String },
  closedBy: { type: String },
  outcome: { 
    type: String, 
    enum: ['legitimate', 'fraud_confirmed', 'account_suspended', 'account_closed', 'law_enforcement_notified'] 
  },
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const VelocityRuleSchema = new Schema({
  ruleId: { type: String, required: true, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  description: { type: String, required: true },
  ruleType: { 
    type: String, 
    enum: ['transaction_count', 'transaction_amount', 'login_attempts', 'failed_transactions'], 
    required: true 
  },
  timeWindow: { type: Number, required: true },
  threshold: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  action: { type: String, enum: ['alert', 'block', 'review', 'challenge'], required: true },
  appliesTo: { type: String, enum: ['all', 'new_users', 'high_risk', 'specific_countries'], required: true },
  countries: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const BehaviorProfileSchema = new Schema({
  user: { type: String, ref: 'Users', required: true, unique: true },
  averageTransactionAmount: { type: Number, default: 0 },
  averageMonthlyTransactions: { type: Number, default: 0 },
  typicalTransactionHours: [{ type: Number, min: 0, max: 23 }],
  typicalDaysOfWeek: [{ type: Number, min: 0, max: 6 }],
  commonMerchants: [{ type: String }],
  commonCountries: [{ type: String }],
  commonDevices: [{
    deviceId: { type: String, required: true },
    deviceType: { type: String, required: true },
    lastUsed: { type: Date, required: true }
  }],
  commonIpRanges: [{ type: String }],
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const SecurityEventSchema = new Schema({
  eventId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  eventType: { 
    type: String, 
    enum: ['login', 'login_success', 'login_failed', 'logout', 'password_change', 'password_reset', '2fa_enabled', '2fa_disabled', '2fa_setup', '2fa_verified', 'device_added', 'device_removed', 'suspicious_login', 'account_locked', 'account_unlocked', 'session_revoked', 'all_sessions_revoked', 'backup_codes_regenerated', 'security_settings_updated'], 
    required: true 
  },
  severity: { type: String, enum: ['info', 'warning', 'critical'], required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  location: {
    country: { type: String },
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  deviceInfo: {
    deviceId: { type: String },
    deviceType: { type: String },
    os: { type: String },
    browser: { type: String }
  },
  metadata: { type: Schema.Types.Mixed },
  requiresAction: { type: Boolean, default: false },
  actionTaken: { type: String },
  createdAt: { type: Date, default: Date.now, immutable: true }
});

// Indexes
FraudSignalSchema.index({ user: 1, status: 1 });
FraudSignalSchema.index({ severity: 1, status: 1 });
FraudSignalSchema.index({ detectedAt: -1 });
FraudCaseSchema.index({ user: 1, status: 1 });
FraudCaseSchema.index({ assignedTo: 1, status: 1 });
FraudCaseSchema.index({ priority: 1, status: 1 });
VelocityRuleSchema.index({ isActive: 1 });
BehaviorProfileSchema.index({ user: 1 }, { unique: true });
SecurityEventSchema.index({ user: 1, createdAt: -1 });
SecurityEventSchema.index({ eventType: 1, createdAt: -1 });

export const FraudSignals = mongoose.model('FraudSignals', FraudSignalSchema);
export const FraudCases = mongoose.model('FraudCases', FraudCaseSchema);
export const VelocityRules = mongoose.model('VelocityRules', VelocityRuleSchema);
export const BehaviorProfiles = mongoose.model('BehaviorProfiles', BehaviorProfileSchema);
export const SecurityEvents = mongoose.model('SecurityEvents', SecurityEventSchema);

export default FraudSignals;
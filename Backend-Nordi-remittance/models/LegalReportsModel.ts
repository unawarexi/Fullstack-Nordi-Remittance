import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

// Schemas
const StatementSchema = new Schema({
  statementId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallets', required: true },
  statementType: { type: String, enum: ['monthly', 'quarterly', 'annual', 'custom'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  currency: { type: String, required: true },
  openingBalance: { type: Number, required: true },
  closingBalance: { type: Number, required: true },
  totalCredits: { type: Number, required: true },
  totalDebits: { type: Number, required: true },
  transactions: [{ type: Schema.Types.ObjectId, ref: 'Transactions' }],
  generatedAt: { type: Date, default: Date.now },
  fileUrl: { type: String },
  fileFormat: { type: String, enum: ['pdf', 'csv', 'excel'], required: true },
  downloadCount: { type: Number, default: 0 },
  lastDownloadedAt: { type: Date },
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const TaxRecordSchema = new Schema({
  taxRecordId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  taxYear: { type: Number, required: true },
  taxCountry: { type: String, required: true },
  totalIncome: { type: Number, required: true },
  totalExpenses: { type: Number, required: true },
  taxableIncome: { type: Number, required: true },
  estimatedTax: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USD' },
  transactionCount: { type: Number, default: 0 },
  interestEarned: { type: Number, default: 0 },
  capitalGains: { type: Number, default: 0 },
  capitalLosses: { type: Number, default: 0 },
  dividends: { type: Number, default: 0 },
  foreignIncome: { type: Number, default: 0 },
  categories: {
    business: { type: Number, default: 0 },
    investment: { type: Number, default: 0 },
    salary: { type: Number, default: 0 },
    freelance: { type: Number, default: 0 },
    rental: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  fileUrl: { type: String },
  status: { type: String, enum: ['draft', 'finalized', 'filed', 'amended'], default: 'draft' },
  filedDate: { type: Date },
  filedBy: { type: String },
  amendmentReason: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const RegulatoryReportSchema = new Schema({
  reportId: { type: String, required: true, unique: true, default: uuidv4 },
  reportType: { 
    type: String, 
    enum: ['suspicious_activity', 'large_transaction', 'cross_border', 'aml_compliance', 'quarterly_return', 'annual_return', 'other'], 
    required: true 
  },
  regulatorName: { type: String, required: true },
  reportingPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  submissionDeadline: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'submitted', 'accepted', 'rejected'], default: 'pending' },
  reportData: { type: Schema.Types.Mixed, required: true },
  affectedUsers: [{ type: String }],
  affectedTransactions: [{ type: Schema.Types.ObjectId, ref: 'Transactions' }],
  totalAmount: { type: Number },
  currency: { type: String },
  fileUrl: { type: String },
  submittedAt: { type: Date },
  submittedBy: { type: String },
  acknowledgementNumber: { type: String },
  rejectionReason: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DisputeSchema = new Schema({
  disputeId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  transaction: { type: Schema.Types.ObjectId, ref: 'Transactions', required: true },
  disputeType: { 
    type: String, 
    enum: ['unauthorized', 'fraud', 'duplicate', 'incorrect_amount', 'service_not_received', 'refund_not_processed', 'other'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['open', 'under_review', 'pending_evidence', 'resolved', 'closed', 'escalated'], 
    default: 'open' 
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  description: { type: String, required: true },
  evidences: [{
    type: { type: String, required: true },
    description: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  timeline: [{
    status: { type: String, required: true },
    notes: { type: String, required: true },
    updatedBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
  }],
  assignedTo: { type: String },
  resolution: { type: String },
  resolutionType: { type: String, enum: ['refund', 'partial_refund', 'no_refund', 'reversal', 'other'] },
  refundAmount: { type: Number },
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  dueDate: { type: Date },
  merchantResponse: { type: String },
  internalNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ChargebackSchema = new Schema({
  chargebackId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  card: { type: Schema.Types.ObjectId, ref: 'Cards', required: true },
  transaction: { type: Schema.Types.ObjectId, ref: 'Transactions', required: true },
  cardTransaction: { type: Schema.Types.ObjectId, ref: 'CardTransactions' },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  reasonCode: { type: String, required: true },
  reasonDescription: { type: String, required: true },
  chargebackType: { 
    type: String, 
    enum: ['fraud', 'authorization', 'processing_error', 'consumer_dispute', 'other'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['received', 'under_review', 'pending_merchant_response', 'won', 'lost', 'withdrawn', 'arbitration'], 
    default: 'received' 
  },
  filedDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  merchant: { type: Schema.Types.ObjectId, ref: 'Merchants' },
  merchantName: { type: String, required: true },
  merchantResponse: { type: String },
  merchantResponseDate: { type: Date },
  evidences: [{
    type: { type: String, required: true },
    description: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  timeline: [{
    status: { type: String, required: true },
    notes: { type: String, required: true },
    updatedBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
  }],
  outcome: { type: String, enum: ['customer_favor', 'merchant_favor', 'split_liability'] },
  finalAmount: { type: Number },
  fees: { type: Number, default: 0 },
  issuingBank: { type: String },
  acquiringBank: { type: String },
  caseNumber: { type: String },
  arbitrationDate: { type: Date },
  closedAt: { type: Date },
  internalNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
StatementSchema.index({ user: 1, statementType: 1, startDate: -1 });
StatementSchema.index({ wallet: 1, generatedAt: -1 });
TaxRecordSchema.index({ user: 1, taxYear: -1 });
TaxRecordSchema.index({ status: 1, taxYear: -1 });
RegulatoryReportSchema.index({ reportType: 1, status: 1 });
RegulatoryReportSchema.index({ submissionDeadline: 1, status: 1 });
DisputeSchema.index({ user: 1, status: 1 });
DisputeSchema.index({ transaction: 1 });
DisputeSchema.index({ assignedTo: 1, status: 1 });
ChargebackSchema.index({ user: 1, status: 1 });
ChargebackSchema.index({ card: 1, filedDate: -1 });
ChargebackSchema.index({ merchant: 1, status: 1 });

// Legal Documents Schema - for Terms, Privacy Policy, etc.
const LegalDocumentSchema = new Schema({
  documentId: { type: String, required: true, unique: true, default: uuidv4 },
  title: { type: String, required: true },
  documentType: { 
    type: String, 
    enum: ['terms', 'privacy', 'cookie', 'aml', 'kyc', 'user_agreement', 'other'], 
    required: true 
  },
  content: { type: String, required: true },
  summary: { type: String },
  version: { type: String, required: true },
  effectiveDate: { type: Date, required: true },
  requiresConsent: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
  createdBy: { type: String, ref: 'Users' },
  updatedBy: { type: String, ref: 'Users' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Consents Schema
const UserConsentSchema = new Schema({
  consentId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  document: { type: Schema.Types.ObjectId, ref: 'LegalDocuments', required: true },
  documentType: { type: String, required: true },
  documentVersion: { type: String, required: true },
  consentType: { type: String, enum: ['explicit', 'implicit', 'opt_in', 'opt_out'], default: 'explicit' },
  accepted: { type: Boolean, required: true },
  consentDate: { type: Date, required: true },
  withdrawnAt: { type: Date },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Policy Versions Schema
const PolicyVersionSchema = new Schema({
  versionId: { type: String, required: true, unique: true, default: uuidv4 },
  documentType: { type: String, required: true },
  version: { type: String, required: true },
  documentId: { type: Schema.Types.ObjectId, ref: 'LegalDocuments', required: true },
  changes: { type: String, required: true },
  effectiveDate: { type: Date, required: true },
  createdBy: { type: String, ref: 'Users' },
  createdAt: { type: Date, default: Date.now }
});

// Dispute Claims Schema (alias for Disputes with additional fields)
const DisputeClaimSchema = new Schema({
  claimId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  transaction: { type: Schema.Types.ObjectId, ref: 'Transactions', required: true },
  claimType: { 
    type: String, 
    enum: ['unauthorized', 'fraud', 'duplicate', 'incorrect_amount', 'service_not_received', 'refund_not_processed', 'other'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['open', 'under_review', 'pending_evidence', 'resolved', 'closed', 'escalated'], 
    default: 'open' 
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  description: { type: String, required: true },
  evidences: [{
    type: { type: String, required: true },
    description: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  timeline: [{
    status: { type: String, required: true },
    notes: { type: String, required: true },
    updatedBy: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
  }],
  assignedTo: { type: String },
  resolution: { type: String },
  resolutionType: { type: String, enum: ['refund', 'partial_refund', 'no_refund', 'reversal', 'other'] },
  refundAmount: { type: Number },
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  dueDate: { type: Date },
  internalNotes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Regulatory Filings Schema
const RegulatoryFilingSchema = new Schema({
  filingId: { type: String, required: true, unique: true, default: uuidv4 },
  filingType: { 
    type: String, 
    enum: ['suspicious_activity', 'large_transaction', 'cross_border', 'aml_compliance', 'quarterly_return', 'annual_return', 'ctr', 'sar', 'other'], 
    required: true 
  },
  regulatorName: { type: String, required: true },
  jurisdiction: { type: String, required: true },
  reportingPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  submissionDeadline: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'submitted', 'accepted', 'rejected'], default: 'pending' },
  filingData: { type: Schema.Types.Mixed, required: true },
  affectedUsers: [{ type: String }],
  affectedTransactions: [{ type: Schema.Types.ObjectId, ref: 'Transactions' }],
  totalAmount: { type: Number },
  currency: { type: String },
  fileUrl: { type: String },
  submittedAt: { type: Date },
  submittedBy: { type: String },
  acknowledgementNumber: { type: String },
  rejectionReason: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Additional indexes for new schemas
LegalDocumentSchema.index({ documentType: 1, status: 1 });
LegalDocumentSchema.index({ effectiveDate: -1 });
UserConsentSchema.index({ user: 1, document: 1 });
UserConsentSchema.index({ user: 1, documentType: 1 });
PolicyVersionSchema.index({ documentType: 1, version: -1 });
DisputeClaimSchema.index({ user: 1, status: 1 });
DisputeClaimSchema.index({ transaction: 1 });
RegulatoryFilingSchema.index({ filingType: 1, status: 1 });
RegulatoryFilingSchema.index({ submissionDeadline: 1 });

export const Statements = mongoose.model('Statements', StatementSchema);
export const TaxRecords = mongoose.model('TaxRecords', TaxRecordSchema);
export const RegulatoryReports = mongoose.model('RegulatoryReports', RegulatoryReportSchema);
export const Disputes = mongoose.model('Disputes', DisputeSchema);
export const Chargebacks = mongoose.model('Chargebacks', ChargebackSchema);
export const LegalDocuments = mongoose.model('LegalDocuments', LegalDocumentSchema);
export const UserConsents = mongoose.model('UserConsents', UserConsentSchema);
export const PolicyVersions = mongoose.model('PolicyVersions', PolicyVersionSchema);
export const DisputeClaims = mongoose.model('DisputeClaims', DisputeClaimSchema);
export const RegulatoryFilings = mongoose.model('RegulatoryFilings', RegulatoryFilingSchema);

export default Statements;
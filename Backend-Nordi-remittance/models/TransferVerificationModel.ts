// ============================================================================
// TRANSFER VERIFICATION MODEL
// ============================================================================
// Handles the 3-step security verification for transfers and withdrawals:
// Step 1: ISIN Code (International Securities Identification Number)
// Step 2: IMF BOP Code (Balance of Payments Code)
// Step 3: LEI Code (Legal Entity Identifier)
// ============================================================================

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

// ============================================================================
// TRANSFER VERIFICATION SCHEMA
// ============================================================================

const TransferVerificationSchema = new Schema({
  verificationId: { 
    type: String, 
    required: true, 
    unique: true, 
    default: uuidv4 
  },
  
  // Link to the pending transaction
  transaction: { 
    type: Schema.Types.ObjectId, 
    ref: 'Transactions', 
    required: true 
  },
  
  // User who initiated the transfer
  user: { 
    type: String, 
    ref: 'Users', 
    required: true 
  },
  
  // Transaction details (stored for reference)
  transactionDetails: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    recipientId: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientAccountNumber: { type: String, required: true },
    type: { type: String, enum: ['transfer', 'withdrawal'], required: true },
  },
  
  // Tax information
  taxInfo: {
    taxRate: { type: Number, required: true, default: 0.20 }, // 20%
    taxAmount: { type: Number, required: true },
    grossAmount: { type: Number, required: true }, // amount + tax
    netAmount: { type: Number, required: true }, // original amount
  },
  
  // Current verification step (1, 2, or 3)
  currentStep: { 
    type: Number, 
    enum: [1, 2, 3], 
    default: 1 
  },
  
  // ============================================================================
  // STEP 1: ISIN CODE
  // ============================================================================
  isinCode: {
    code: { type: String }, // The generated code
    codeHash: { type: String }, // Hashed version for security
    isVerified: { type: Boolean, default: false },
    generatedAt: { type: Date },
    verifiedAt: { type: Date },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    sentToEmail: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  
  // ============================================================================
  // STEP 2: IMF BOP CODE
  // ============================================================================
  imfBopCode: {
    code: { type: String },
    codeHash: { type: String },
    isVerified: { type: Boolean, default: false },
    generatedAt: { type: Date },
    verifiedAt: { type: Date },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    sentToEmail: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  
  // ============================================================================
  // STEP 3: LEI CODE
  // ============================================================================
  leiCode: {
    code: { type: String },
    codeHash: { type: String },
    isVerified: { type: Boolean, default: false },
    generatedAt: { type: Date },
    verifiedAt: { type: Date },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    sentToEmail: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  
  // Overall verification status
  status: { 
    type: String, 
    enum: [
      'pending_isin',      // Waiting for ISIN code generation request
      'isin_sent',         // ISIN code sent, waiting verification
      'pending_imf_bop',   // ISIN verified, waiting for IMF BOP request
      'imf_bop_sent',      // IMF BOP code sent, waiting verification
      'pending_lei',       // IMF BOP verified, waiting for LEI request
      'lei_sent',          // LEI code sent, waiting verification
      'fully_verified',    // All 3 steps completed
      'failed',            // Verification failed (too many attempts)
      'expired',           // Verification expired
      'cancelled',         // User cancelled
    ], 
    default: 'pending_isin' 
  },
  
  // Metadata
  ipAddress: { type: String },
  userAgent: { type: String },
  deviceInfo: { type: Schema.Types.Mixed },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  expiresAt: { 
    type: Date, 
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  
  // Failure tracking
  failureReason: { type: String },
  failedAt: { type: Date },
});

// ============================================================================
// TRANSACTION TAX SCHEMA
// ============================================================================

const TransactionTaxSchema = new Schema({
  taxId: { 
    type: String, 
    required: true, 
    unique: true, 
    default: uuidv4 
  },
  
  // Link to transaction
  transaction: { 
    type: Schema.Types.ObjectId, 
    ref: 'Transactions', 
    required: true 
  },
  
  // User who was taxed
  user: { 
    type: String, 
    ref: 'Users', 
    required: true 
  },
  
  // Tax details
  transactionType: { 
    type: String, 
    enum: ['transfer', 'withdrawal', 'deposit', 'card_transaction', 'investment_credit', 'investment_return'],
    required: true 
  },
  
  // Amount details
  originalAmount: { type: Number, required: true },
  taxRate: { type: Number, required: true, default: 0.20 }, // 20%
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true }, // original + tax
  currency: { type: String, required: true },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'collected', 'refunded', 'waived'],
    default: 'pending'
  },
  
  // Reference to verification (if applicable)
  verification: { 
    type: Schema.Types.ObjectId, 
    ref: 'TransferVerifications' 
  },
  
  // Timestamps
  collectedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  
  // Notes
  notes: { type: String },
  waivedBy: { type: String, ref: 'AdminUsers' },
  waivedReason: { type: String },
});

// ============================================================================
// INDEXES
// ============================================================================

TransferVerificationSchema.index({ user: 1, status: 1 });
TransferVerificationSchema.index({ transaction: 1 });
TransferVerificationSchema.index({ verificationId: 1 });
TransferVerificationSchema.index({ status: 1, expiresAt: 1 });
TransferVerificationSchema.index({ createdAt: -1 });

TransactionTaxSchema.index({ user: 1, createdAt: -1 });
TransactionTaxSchema.index({ transaction: 1 });
TransactionTaxSchema.index({ status: 1 });
TransactionTaxSchema.index({ transactionType: 1 });

// ============================================================================
// EXPORTS
// ============================================================================

export const TransferVerifications = mongoose.model('TransferVerifications', TransferVerificationSchema);
export const TransactionTaxes = mongoose.model('TransactionTaxes', TransactionTaxSchema);

export default TransferVerifications;

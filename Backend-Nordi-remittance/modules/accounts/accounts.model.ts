import mongoose from "mongoose";

const { Schema } = mongoose;

const WalletSchema = new Schema({
  user: { type: String, ref: "Users", required: true }, // removed unique — users can have multiple wallets
  walletNumber: { type: String, required: true, unique: true },
  balances: { type: Map, of: Number, default: {} },
  status: {
    type: String,
    enum: ["active", "suspended", "frozen", "closed"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastTransactionAt: { type: Date },
  transactionHistory: [{ type: Schema.Types.ObjectId, ref: "Transactions" }],
  isPrimary: { type: Boolean, default: true },
  walletType: {
    type: String,
    enum: ["personal", "business", "savings", "current", "fixed_deposit"],
    default: "personal",
  },
  limits: {
    daily: { type: Number },
    monthly: { type: Number },
    perTransaction: { type: Number },
  },
  freezeReason: { type: String },
  closedAt: { type: Date },
  notes: { type: String },

  // ======================================================================
  // SOFT DELETE — wallet data is never physically removed
  // ======================================================================
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  closureReason: { type: String },
  migratedToWallet: { type: Schema.Types.ObjectId, ref: "Wallets" },

  // ======================================================================
  // LINKED PRODUCTS — cross-references to cards, loans, investments
  // ======================================================================
  linkedCards: [{ type: Schema.Types.ObjectId, ref: "Cards" }],
  linkedLoans: [{ type: Schema.Types.ObjectId, ref: "Loans" }],
  linkedInvestments: [{ type: Schema.Types.ObjectId, ref: "InvestmentAccounts" }],

  // ======================================================================
  // CREDIT & RISK
  // ======================================================================
  creditScore: { type: Number, min: 0, max: 850 },
  creditScoreUpdatedAt: { type: Date },

  // ======================================================================
  // ACCOUNT TYPE–SPECIFIC FIELDS
  // ======================================================================
  // Current account overdraft
  overdraftLimit: { type: Number, default: 0 },
  overdraftUsed: { type: Number, default: 0 },

  // Savings / Fixed Deposit interest
  interestRate: { type: Number },
  accruedInterest: { type: Number, default: 0 },
  lastInterestAccrualDate: { type: Date },

  // Fixed Deposit maturity
  maturityDate: { type: Date },
  autoRenew: { type: Boolean, default: false },

  // Savings monthly withdrawal tracking (Regulation D)
  withdrawalCount: { type: Number, default: 0 },
  withdrawalCountResetDate: { type: Date },

  // ======================================================================
  // ACCOUNT POLICIES — set per account type on creation
  // ======================================================================
  accountPolicies: {
    maxWithdrawalsPerMonth: { type: Number },          // savings: 6, current/personal: null (unlimited)
    minBalance: { type: Number, default: 0 },          // savings: 100, fixed_deposit: principal
    earlyWithdrawalPenalty: { type: Number, default: 0 }, // fixed_deposit: 1-3%
    allowOverdraft: { type: Boolean, default: false },  // current: true if approved
    requiresApprovalForLargeTransfers: { type: Boolean, default: false }, // business: true
    largeTransferThreshold: { type: Number },           // business: 10000
  },
});

const AccountBalanceSchema = new Schema({
  wallet: { type: Schema.Types.ObjectId, ref: "Wallets", required: true },
  currency: { type: String, required: true },
  availableBalance: { type: Number, required: true, default: 0 },
  ledgerBalance: { type: Number, required: true, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  reservedBalance: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const LedgerEntrySchema = new Schema({
  transaction: {
    type: Schema.Types.ObjectId,
    ref: "Transactions",
    required: true,
  },
  wallet: { type: Schema.Types.ObjectId, ref: "Wallets", required: true },
  entryType: { type: String, enum: ["debit", "credit"], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  balance: { type: Number, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, immutable: true },
  accountingDate: { type: Date, required: true },
  isReversed: { type: Boolean, default: false },
  reversalEntry: { type: Schema.Types.ObjectId, ref: "LedgerEntry" },
});

const AccountLimitSchema = new Schema({
  wallet: { type: Schema.Types.ObjectId, ref: "Wallets", required: true },
  limitType: {
    type: String,
    enum: ["daily", "monthly", "yearly", "per_transaction"],
    required: true,
  },
  category: {
    type: String,
    enum: ["withdrawal", "transfer", "payment", "all"],
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  usedAmount: { type: Number, default: 0 },
  resetDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const AccountStatusHistorySchema = new Schema({
  wallet: { type: Schema.Types.ObjectId, ref: "Wallets", required: true },
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  reason: { type: String, required: true },
  changedBy: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  effectiveDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, immutable: true },
});

const AccountApplicationSchema = new Schema({
  user: { type: String, ref: "Users", required: true },
  type: {
    type: String,
    enum: ["savings", "current", "fixed_deposit"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  currency: { type: String, required: true },
  nickname: { type: String },
  rejectionReason: { type: String },
  reviewedAt: { type: Date },
  reviewedBy: { type: String, ref: "Users" },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Savings specific fields
  initialDeposit: { type: Number },
  goal: { type: String },
  autoSave: { type: Boolean },
  autoSaveAmount: { type: Number },

  // Current specific fields
  purpose: { type: String, enum: ["personal", "business"] },
  businessName: { type: String },
  expectedMonthlyVolume: { type: Number },
  overdraftRequested: { type: Boolean },

  // Fixed Deposit specific fields
  principal: { type: Number },
  termMonths: { type: Number, enum: [3, 6, 12, 24, 36] },
  interestRate: { type: Number },
  maturityDate: { type: Date },
  autoRenew: { type: Boolean },
});

// ==========================================================================
// INDEXES — Optimized for actual query patterns
// ==========================================================================
WalletSchema.index({ status: 1 });
WalletSchema.index({ user: 1, status: 1 });
WalletSchema.index({ user: 1, isPrimary: 1 });
WalletSchema.index({ user: 1, isDeleted: 1, status: 1 });
WalletSchema.index({ user: 1, walletType: 1, isDeleted: 1 });
WalletSchema.index({ isDeleted: 1, status: 1 });
WalletSchema.index({ walletType: 1, maturityDate: 1 }); // fixed_deposit maturity queries
AccountBalanceSchema.index({ wallet: 1, currency: 1 }, { unique: true });
LedgerEntrySchema.index({ wallet: 1, createdAt: -1 });
LedgerEntrySchema.index({ transaction: 1 });
LedgerEntrySchema.index({ wallet: 1, entryType: 1, createdAt: -1 });
AccountLimitSchema.index({ wallet: 1, limitType: 1, category: 1 });
AccountLimitSchema.index({ wallet: 1, isActive: 1 });
AccountStatusHistorySchema.index({ wallet: 1, createdAt: -1 });
AccountApplicationSchema.index({ user: 1, status: 1 });
AccountApplicationSchema.index({ type: 1, status: 1 });

export const Wallets = mongoose.model("Wallets", WalletSchema);
export const AccountBalances = mongoose.model(
  "AccountBalances",
  AccountBalanceSchema,
);
export const LedgerEntries = mongoose.model("LedgerEntries", LedgerEntrySchema);
export const AccountLimits = mongoose.model(
  "AccountLimits",
  AccountLimitSchema,
);
export const AccountStatusHistories = mongoose.model(
  "AccountStatusHistories",
  AccountStatusHistorySchema,
);
export const AccountApplications = mongoose.model(
  "AccountApplications",
  AccountApplicationSchema,
);

export default Wallets;

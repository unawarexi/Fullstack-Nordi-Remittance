import mongoose from "mongoose";

const { Schema } = mongoose;

const WalletSchema = new Schema({
  user: { type: String, ref: "Users", required: true, unique: true },
  walletNumber: { type: String, required: true, unique: true },
  balances: { type: Map, of: Number, default: {} },
  status: {
    type: String,
    enum: ["active", "suspended", "closed"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastTransactionAt: { type: Date },
  transactionHistory: [{ type: Schema.Types.ObjectId, ref: "Transactions" }],
  isPrimary: { type: Boolean, default: true },
  walletType: {
    type: String,
    enum: ["personal", "business"],
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

// Indexes
WalletSchema.index({ status: 1 });
AccountBalanceSchema.index({ wallet: 1, currency: 1 }, { unique: true });
LedgerEntrySchema.index({ wallet: 1, createdAt: -1 });
LedgerEntrySchema.index({ transaction: 1 });
AccountLimitSchema.index({ wallet: 1, limitType: 1, category: 1 });
AccountStatusHistorySchema.index({ wallet: 1, createdAt: -1 });

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

export default Wallets;

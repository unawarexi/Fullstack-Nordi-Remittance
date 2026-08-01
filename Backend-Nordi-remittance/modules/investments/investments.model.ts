import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

// Schemas
const SavingsGoalSchema = new Schema({
  user: { type: String, ref: "Users", required: true },
  wallet: { type: Schema.Types.ObjectId, ref: "Wallets", required: true },
  goalId: { type: String, required: true, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  description: { type: String },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  currency: { type: String, required: true, default: "USD" },
  targetDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled", "paused"],
    default: "active",
  },
  category: {
    type: String,
    enum: [
      "emergency_fund",
      "vacation",
      "home",
      "car",
      "education",
      "retirement",
      "other",
    ],
    required: true,
  },
  autoSaveEnabled: { type: Boolean, default: false },
  autoSaveAmount: { type: Number },
  autoSaveFrequency: { type: String, enum: ["daily", "weekly", "monthly"] },
  nextAutoSaveDate: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const InterestPlanSchema = new Schema({
  planId: { type: String, required: true, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  description: { type: String, required: true },
  interestRate: { type: Number, required: true },
  compoundingFrequency: {
    type: String,
    enum: ["daily", "monthly", "quarterly", "annually"],
    required: true,
  },
  minimumBalance: { type: Number, required: true },
  maximumBalance: { type: Number },
  currency: { type: String, required: true, default: "USD" },
  accountType: {
    type: String,
    enum: ["savings", "fixed_deposit", "investment"],
    required: true,
  },
  term: { type: Number },
  earlyWithdrawalPenalty: { type: Number },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  effectiveDate: { type: Date, required: true },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const InvestmentAccountSchema = new Schema({
  accountId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: "Users", required: true },
  wallet: { type: Schema.Types.ObjectId, ref: "Wallets", required: true },
  accountType: {
    type: String,
    enum: ["stocks", "crypto", "mutual_funds", "bonds", "etf", "commodities"],
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "suspended", "closed"],
    default: "active",
  },
  totalInvested: { type: Number, default: 0 },
  currentValue: { type: Number, default: 0 },
  totalReturns: { type: Number, default: 0 },
  returnPercentage: { type: Number, default: 0 },
  currency: { type: String, required: true, default: "USD" },
  riskProfile: {
    type: String,
    enum: ["conservative", "moderate", "aggressive"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
});

const AssetSchema = new Schema({
  assetId: { type: String, required: true, unique: true, default: uuidv4 },
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  assetType: {
    type: String,
    enum: ["stock", "crypto", "mutual_fund", "bond", "etf", "commodity"],
    required: true,
  },
  exchange: { type: String },
  currentPrice: { type: Number, required: true },
  currency: { type: String, required: true, default: "USD" },
  priceChange24h: { type: Number },
  priceChangePercentage24h: { type: Number },
  marketCap: { type: Number },
  volume24h: { type: Number },
  high24h: { type: Number },
  low24h: { type: Number },
  isActive: { type: Boolean, default: true },
  metadata: { type: Schema.Types.Mixed },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const PortfolioSchema = new Schema({
  user: { type: String, ref: "Users", required: true },
  investmentAccount: {
    type: Schema.Types.ObjectId,
    ref: "InvestmentAccounts",
    required: true,
  },
  asset: { type: Schema.Types.ObjectId, ref: "Assets", required: true },
  portfolioId: { type: String, required: true, unique: true, default: uuidv4 },
  quantity: { type: Number, required: true, default: 0 },
  averageBuyPrice: { type: Number, required: true },
  totalInvested: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  unrealizedGain: { type: Number, default: 0 },
  unrealizedGainPercentage: { type: Number, default: 0 },
  realizedGain: { type: Number, default: 0 },
  currency: { type: String, required: true, default: "USD" },
  firstPurchaseDate: { type: Date, required: true },
  lastPurchaseDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const PortfolioTransactionSchema = new Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  user: { type: String, ref: "Users", required: true },
  investmentAccount: {
    type: Schema.Types.ObjectId,
    ref: "InvestmentAccounts",
    required: true,
  },
  portfolio: { type: Schema.Types.ObjectId, ref: "Portfolios" },
  asset: { type: Schema.Types.ObjectId, ref: "Assets", required: true },
  transactionType: {
    type: String,
    enum: ["buy", "sell", "dividend", "fee", "bonus"],
    required: true,
  },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  currency: { type: String, required: true, default: "USD" },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  executionDate: { type: Date, default: Date.now },
  settlementDate: { type: Date },
  orderId: { type: String },
  orderType: {
    type: String,
    enum: ["market", "limit", "stop_loss", "stop_limit"],
    required: true,
  },
  limitPrice: { type: Number },
  stopPrice: { type: Number },
  failureReason: { type: String },
  transaction: { type: Schema.Types.ObjectId, ref: "Transactions" },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

// Indexes
SavingsGoalSchema.index({ user: 1, status: 1 });
InvestmentAccountSchema.index({ user: 1, status: 1 });
AssetSchema.index({ assetType: 1, isActive: 1 });
PortfolioSchema.index({ user: 1, investmentAccount: 1 });
PortfolioSchema.index({ asset: 1 });
PortfolioTransactionSchema.index({ user: 1, createdAt: -1 });
PortfolioTransactionSchema.index({ investmentAccount: 1 });

export const SavingsGoals = mongoose.model("SavingsGoals", SavingsGoalSchema);
export const InterestPlans = mongoose.model(
  "InterestPlans",
  InterestPlanSchema,
);
export const InvestmentAccounts = mongoose.model(
  "InvestmentAccounts",
  InvestmentAccountSchema,
);
export const Assets = mongoose.model("Assets", AssetSchema);
export const Portfolios = mongoose.model("Portfolios", PortfolioSchema);
export const PortfolioTransactions = mongoose.model(
  "PortfolioTransactions",
  PortfolioTransactionSchema,
);

export default SavingsGoals;

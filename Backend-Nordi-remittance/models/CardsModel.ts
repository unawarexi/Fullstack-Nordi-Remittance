import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

// Card Application Schema (for tracking card requests)
const CardApplicationSchema = new Schema({
  applicationId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  cardType: { type: String, enum: ['debit', 'credit', 'prepaid', 'virtual'], required: true },
  requestedLimit: { type: Number },
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  isVirtual: { type: Boolean, default: false },
  billingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String }
  },
  employmentStatus: { type: String },
  monthlyIncome: { type: Number },
  reviewNotes: { type: String },
  approvedBy: { type: String, ref: 'AdminUsers' },
  approvedAt: { type: Date },
  reviewedBy: { type: String, ref: 'AdminUsers' },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Schemas
const CardSchema = new Schema({
  cardId: { type: String, required: true, unique: true, default: uuidv4 },
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallets', required: true },
  user: { type: String, ref: 'Users', required: true },
  cardNumber: { type: String, required: true, unique: true }, // Store encrypted
  cardholderName: { type: String, required: true },
  cardType: { type: String, enum: ['debit', 'credit', 'prepaid', 'virtual'], required: true },
  cardBrand: { type: String, enum: ['visa', 'mastercard', 'amex', 'discover'], required: true },
  expiryMonth: { type: Number, required: true, min: 1, max: 12 },
  expiryYear: { type: Number, required: true },
  cvv: { type: String, required: true }, // Store encrypted
  status: { 
    type: String, 
    enum: ['active', 'blocked', 'expired', 'stolen', 'lost', 'pending_activation'], 
    default: 'pending_activation' 
  },
  isPhysical: { type: Boolean, default: false },
  balance: { type: Number, default: 0 },
  creditLimit: { type: Number },
  availableCredit: { type: Number },
  issueDate: { type: Date, default: Date.now },
  activationDate: { type: Date },
  lastUsedDate: { type: Date },
  billingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String }
  },
  controls: { type: Schema.Types.ObjectId, ref: 'CardControls' },
  limits: { type: Schema.Types.ObjectId, ref: 'CardLimits' },
  pin: { type: String }, // Store encrypted
  isInternationalEnabled: { type: Boolean, default: false },
  isOnlineEnabled: { type: Boolean, default: true },
  isContactlessEnabled: { type: Boolean, default: true },
  isAtmEnabled: { type: Boolean, default: true },
  blockedReason: { type: String },
  blockedAt: { type: Date },
  replacementCardId: { type: String },
  currency: { type: String, required: true, default: 'USD' },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CardTokenSchema = new Schema({
  card: { type: Schema.Types.ObjectId, ref: 'Cards', required: true },
  token: { type: String, required: true, unique: true },
  tokenProvider: { type: String, enum: ['apple_pay', 'google_pay', 'samsung_pay', 'internal'], required: true },
  deviceId: { type: String },
  deviceType: { type: String },
  status: { type: String, enum: ['active', 'suspended', 'expired'], default: 'active' },
  expiryDate: { type: Date, required: true },
  lastUsedDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const CardTransactionSchema = new Schema({
  card: { type: Schema.Types.ObjectId, ref: 'Cards', required: true },
  transaction: { type: Schema.Types.ObjectId, ref: 'Transactions' },
  merchant: { type: Schema.Types.ObjectId, ref: 'Merchants' },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  transactionType: { 
    type: String, 
    enum: ['purchase', 'refund', 'withdrawal', 'cash_advance', 'fee', 'interest'], 
    required: true 
  },
  status: { type: String, enum: ['pending', 'completed', 'declined', 'reversed'], required: true },
  authorizationCode: { type: String },
  merchantName: { type: String, required: true },
  merchantCategory: { type: String },
  mcc: { type: String },
  location: {
    city: { type: String },
    country: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  isInternational: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  declineReason: { type: String },
  fraudScore: { type: Number },
  isFraudulent: { type: Boolean, default: false },
  disputeId: { type: Schema.Types.ObjectId, ref: 'Disputes' },
  createdAt: { type: Date, default: Date.now },
  settledAt: { type: Date }
});

const MerchantSchema = new Schema({
  merchantId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  legalName: { type: String },
  mcc: { type: String, required: true },
  category: { type: String, required: true },
  website: { type: String },
  logo: { type: String },
  location: {
    address: { type: String },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  isVerified: { type: Boolean, default: false },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  blockedReasons: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CardLimitSchema = new Schema({
  card: { type: Schema.Types.ObjectId, ref: 'Cards', required: true, unique: true },
  dailyLimit: { type: Number, required: true },
  monthlyLimit: { type: Number, required: true },
  perTransactionLimit: { type: Number, required: true },
  atmDailyLimit: { type: Number, required: true },
  atmMonthlyLimit: { type: Number, required: true },
  internationalLimit: { type: Number },
  onlineLimit: { type: Number },
  dailySpent: { type: Number, default: 0 },
  monthlySpent: { type: Number, default: 0 },
  atmDailySpent: { type: Number, default: 0 },
  atmMonthlySpent: { type: Number, default: 0 },
  resetDate: { type: Date, required: true },
  currency: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CardControlSchema = new Schema({
  card: { type: Schema.Types.ObjectId, ref: 'Cards', required: true, unique: true },
  allowInternational: { type: Boolean, default: false },
  allowOnline: { type: Boolean, default: true },
  allowAtm: { type: Boolean, default: true },
  allowContactless: { type: Boolean, default: true },
  allowMagStripe: { type: Boolean, default: true },
  blockedMerchantCategories: [{ type: String }],
  blockedCountries: [{ type: String }],
  allowedMerchantCategories: [{ type: String }],
  allowedCountries: [{ type: String }],
  velocityRules: {
    maxTransactionsPerHour: { type: Number, default: 10 },
    maxTransactionsPerDay: { type: Number, default: 50 }
  },
  requiresOtp: { type: Boolean, default: false },
  requiresBiometric: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
CardApplicationSchema.index({ user: 1, status: 1 });
CardApplicationSchema.index({ status: 1, createdAt: -1 });
CardSchema.index({ wallet: 1 });
CardSchema.index({ user: 1 });
CardSchema.index({ status: 1 });
CardSchema.index({ cardNumber: 1 }, { unique: true });
CardTokenSchema.index({ card: 1 });
CardTokenSchema.index({ token: 1 }, { unique: true });
CardTransactionSchema.index({ card: 1, createdAt: -1 });
CardTransactionSchema.index({ merchant: 1 });
MerchantSchema.index({ merchantId: 1 }, { unique: true });
MerchantSchema.index({ mcc: 1 });

export const CardApplications = mongoose.model('CardApplications', CardApplicationSchema);
export const Cards = mongoose.model('Cards', CardSchema);
export const CardTokens = mongoose.model('CardTokens', CardTokenSchema);
export const CardTransactions = mongoose.model('CardTransactions', CardTransactionSchema);
export const Merchants = mongoose.model('Merchants', MerchantSchema);
export const CardLimits = mongoose.model('CardLimits', CardLimitSchema);
export const CardControls = mongoose.model('CardControls', CardControlSchema);

export default Cards;
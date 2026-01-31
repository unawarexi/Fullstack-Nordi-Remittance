import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const { Schema } = mongoose;

// Schemas
const BankIntegrationSchema = new Schema({
  integrationId: { type: String, required: true, unique: true, default: uuidv4 },
  bankName: { type: String, required: true },
  bankCode: { type: String, required: true, unique: true },
  integrationType: { type: String, enum: ['core_banking', 'sponsor_bank', 'partner_bank'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'testing', 'deprecated'], default: 'testing' },
  apiBaseUrl: { type: String, required: true },
  apiVersion: { type: String, required: true },
  authMethod: { type: String, enum: ['api_key', 'oauth2', 'jwt', 'basic_auth', 'mutual_tls'], required: true },
  credentials: {
    apiKey: { type: String },
    apiSecret: { type: String },
    clientId: { type: String },
    clientSecret: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date },
    certificate: { type: String },
    privateKey: { type: String }
  },
  features: {
    accountCreation: { type: Boolean, default: false },
    transactions: { type: Boolean, default: false },
    balanceInquiry: { type: Boolean, default: false },
    statements: { type: Boolean, default: false },
    cardIssuance: { type: Boolean, default: false },
    loanOrigination: { type: Boolean, default: false }
  },
  rateLimits: {
    requestsPerMinute: { type: Number, required: true },
    requestsPerHour: { type: Number, required: true },
    requestsPerDay: { type: Number, required: true }
  },
  webhookUrl: { type: String },
  ipWhitelist: [{ type: String }],
  lastSyncAt: { type: Date },
  lastHealthCheckAt: { type: Date },
  healthCheckStatus: { type: String, enum: ['healthy', 'degraded', 'down'] },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PaymentGatewaySchema = new Schema({
  gatewayId: { type: String, required: true, unique: true, default: uuidv4 },
  provider: { 
    type: String, 
    enum: ['stripe', 'paypal', 'square', 'adyen', 'checkout', 'flutterwave', 'paystack', 'razorpay'], 
    required: true 
  },
  displayName: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'testing'], default: 'testing' },
  isDefault: { type: Boolean, default: false },
  supportedCurrencies: [{ type: String }],
  supportedCountries: [{ type: String }],
  paymentMethods: [{ type: String }],
  credentials: {
    publicKey: { type: String },
    secretKey: { type: String },
    merchantId: { type: String },
    webhookSecret: { type: String },
    environment: { type: String, enum: ['sandbox', 'production'], required: true }
  },
  fees: {
    percentageFee: { type: Number, required: true },
    fixedFee: { type: Number, required: true },
    currency: { type: String, required: true },
    internationalFeePercentage: { type: Number }
  },
  webhookUrl: { type: String, required: true },
  returnUrl: { type: String, required: true },
  cancelUrl: { type: String, required: true },
  features: {
    refunds: { type: Boolean, default: true },
    partialRefunds: { type: Boolean, default: true },
    disputes: { type: Boolean, default: true },
    subscriptions: { type: Boolean, default: false },
    payouts: { type: Boolean, default: false },
    threeDsEnabled: { type: Boolean, default: true }
  },
  lastTransactionAt: { type: Date },
  totalTransactions: { type: Number, default: 0 },
  totalVolume: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const WebhookSubscriptionSchema = new Schema({
  subscriptionId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users' },
  isGlobal: { type: Boolean, default: false },
  name: { type: String, required: true },
  url: { type: String, required: true },
  events: [{ type: String, required: true }],
  status: { type: String, enum: ['active', 'inactive', 'paused'], default: 'active' },
  authMethod: { type: String, enum: ['none', 'api_key', 'oauth2', 'hmac'], default: 'hmac' },
  credentials: {
    apiKey: { type: String },
    secret: { type: String },
    token: { type: String }
  },
  headers: { type: Map, of: String },
  retryPolicy: {
    maxAttempts: { type: Number, default: 3 },
    retryDelays: [{ type: Number }]
  },
  lastTriggeredAt: { type: Date },
  successCount: { type: Number, default: 0 },
  failureCount: { type: Number, default: 0 },
  lastSuccess: { type: Date },
  lastFailure: { type: Date },
  lastError: { type: String },
  ipWhitelist: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ThirdPartyAccountSchema = new Schema({
  accountId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users', required: true },
  provider: { type: String, enum: ['plaid', 'yodlee', 'finicity', 'mx', 'tink'], required: true },
  providerAccountId: { type: String, required: true },
  accessToken: { type: String, required: true },
  itemId: { type: String },
  institutionId: { type: String, required: true },
  institutionName: { type: String, required: true },
  accountType: { type: String, enum: ['checking', 'savings', 'credit_card', 'investment', 'loan', 'other'], required: true },
  accountNumber: { type: String, required: true },
  accountName: { type: String, required: true },
  currency: { type: String, required: true },
  balance: { type: Number },
  availableBalance: { type: Number },
  status: { type: String, enum: ['active', 'inactive', 'expired', 'error'], default: 'active' },
  lastSyncAt: { type: Date },
  syncStatus: { type: String, enum: ['success', 'failed', 'pending'] },
  syncError: { type: String },
  permissions: [{ type: String }],
  consentExpiresAt: { type: Date },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const APIKeySchema = new Schema({
  keyId: { type: String, required: true, unique: true, default: uuidv4 },
  user: { type: String, ref: 'Users' },
  name: { type: String, required: true },
  key: { type: String, required: true }, // Store hashed
  keyPrefix: { type: String, required: true },
  type: { type: String, enum: ['public', 'secret', 'restricted'], required: true },
  environment: { type: String, enum: ['sandbox', 'production'], required: true },
  status: { type: String, enum: ['active', 'inactive', 'revoked'], default: 'active' },
  permissions: [{ type: String }],
  ipWhitelist: [{ type: String }],
  allowedOrigins: [{ type: String }],
  rateLimit: {
    requestsPerMinute: { type: Number, required: true },
    requestsPerHour: { type: Number, required: true },
    requestsPerDay: { type: Number, required: true }
  },
  usage: {
    totalRequests: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
    lastIp: { type: String }
  },
  expiresAt: { type: Date },
  createdBy: { type: String, required: true },
  revokedAt: { type: Date },
  revokedBy: { type: String },
  revokeReason: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
BankIntegrationSchema.index({ bankCode: 1 }, { unique: true });
BankIntegrationSchema.index({ status: 1 });
PaymentGatewaySchema.index({ provider: 1, status: 1 });
PaymentGatewaySchema.index({ isDefault: 1 });
WebhookSubscriptionSchema.index({ user: 1, status: 1 });
WebhookSubscriptionSchema.index({ events: 1 });
ThirdPartyAccountSchema.index({ user: 1, status: 1 });
ThirdPartyAccountSchema.index({ provider: 1, providerAccountId: 1 });
APIKeySchema.index({ user: 1, status: 1 });
APIKeySchema.index({ key: 1 });
APIKeySchema.index({ keyPrefix: 1 });

export const BankIntegrations = mongoose.model('BankIntegrations', BankIntegrationSchema);
export const PaymentGateways = mongoose.model('PaymentGateways', PaymentGatewaySchema);
export const WebhookSubscriptions = mongoose.model('WebhookSubscriptions', WebhookSubscriptionSchema);
export const ThirdPartyAccounts = mongoose.model('ThirdPartyAccounts', ThirdPartyAccountSchema);
export const APIKeys = mongoose.model('APIKeys', APIKeySchema);

export default BankIntegrations;
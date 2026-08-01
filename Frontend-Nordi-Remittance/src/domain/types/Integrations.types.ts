// ============================================================================
// INTEGRATIONS TYPES — Mirrors IntergrationsModel.ts
// BankIntegration, PaymentGateway, WebhookSubscription,
// ThirdPartyAccount, APIKey
// ============================================================================

declare global {
  interface BankIntegration {
    integrationId: UUID;
    bankName: string;
    bankCode: string;
    integrationType: 'core_banking' | 'sponsor_bank' | 'partner_bank';
    status: 'active' | 'inactive' | 'testing' | 'deprecated';
    apiBaseUrl: string;
    apiVersion: string;
    authMethod: 'api_key' | 'oauth2' | 'jwt' | 'basic_auth' | 'mutual_tls';
    credentials: {
      apiKey?: string;
      apiSecret?: string;
      clientId?: string;
      clientSecret?: string;
      accessToken?: string;
      refreshToken?: string;
      tokenExpiresAt?: ISO8601Date;
      certificate?: string;
      privateKey?: string;
    };
    features: {
      accountCreation: boolean;
      transactions: boolean;
      balanceInquiry: boolean;
      statements: boolean;
      cardIssuance: boolean;
      loanOrigination: boolean;
    };
    rateLimits: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
    };
    webhookUrl?: string;
    ipWhitelist?: string[];
    lastSyncAt?: ISO8601Date;
    lastHealthCheckAt?: ISO8601Date;
    healthCheckStatus?: 'healthy' | 'degraded' | 'down';
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface PaymentGateway {
    gatewayId: UUID;
    provider: 'stripe' | 'paypal' | 'square' | 'adyen' | 'checkout' | 'flutterwave' | 'paystack' | 'razorpay';
    displayName: string;
    status: 'active' | 'inactive' | 'testing';
    isDefault: boolean;
    supportedCurrencies: string[];
    supportedCountries: string[];
    paymentMethods: string[];
    credentials: {
      publicKey?: string;
      secretKey?: string;
      merchantId?: string;
      webhookSecret?: string;
      environment: 'sandbox' | 'production';
    };
    fees: {
      percentageFee: number;
      fixedFee: number;
      currency: string;
      internationalFeePercentage?: number;
    };
    webhookUrl: string;
    returnUrl: string;
    cancelUrl: string;
    features: {
      refunds: boolean;
      partialRefunds: boolean;
      disputes: boolean;
      subscriptions: boolean;
      payouts: boolean;
      threeDsEnabled: boolean;
    };
    lastTransactionAt?: ISO8601Date;
    totalTransactions: number;
    totalVolume: number;
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface WebhookSubscription {
    subscriptionId: UUID;
    user?: UUID;
    isGlobal: boolean;
    name: string;
    url: string;
    events: string[];
    status: 'active' | 'inactive' | 'paused';
    authMethod: 'none' | 'api_key' | 'oauth2' | 'hmac';
    credentials?: {
      apiKey?: string;
      secret?: string;
      token?: string;
    };
    headers?: Record<string, string>;
    retryPolicy: {
      maxAttempts: number;
      retryDelays?: number[];
    };
    lastTriggeredAt?: ISO8601Date;
    successCount: number;
    failureCount: number;
    lastSuccess?: ISO8601Date;
    lastFailure?: ISO8601Date;
    lastError?: string;
    ipWhitelist?: string[];
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface ThirdPartyAccount {
    accountId: UUID;
    user: UUID;
    provider: 'plaid' | 'yodlee' | 'finicity' | 'mx' | 'tink';
    providerAccountId: string;
    accessToken: string;
    itemId?: string;
    institutionId: string;
    institutionName: string;
    accountType: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'other';
    accountNumber: string;
    accountName: string;
    currency: string;
    balance?: number;
    availableBalance?: number;
    status: 'active' | 'inactive' | 'expired' | 'error';
    lastSyncAt?: ISO8601Date;
    syncStatus?: 'success' | 'failed' | 'pending';
    syncError?: string;
    permissions?: string[];
    consentExpiresAt?: ISO8601Date;
    metadata?: Record<string, unknown>;
    createdAt: ISO8601Date;
    updatedAt: ISO8601Date;
  }

  interface Webhook extends Timestamps {
    id: UUID;
    userId: UUID;
    url: string;
    events: string[];
    secret: string;
    isActive: boolean;
    lastTriggeredAt?: ISO8601Date;
    failureCount: number;
  }

  interface ApiKey extends Timestamps {
    id: UUID;
    userId: UUID;
    name: string;
    key: string;
    prefix: string;
    keyPrefix?: string;
    type?: 'public' | 'secret' | 'restricted';
    environment?: 'sandbox' | 'production';
    permissions: string[];
    isActive: boolean;
    ipWhitelist?: string[];
    allowedOrigins?: string[];
    rateLimit?: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
    };
    usage?: {
      totalRequests: number;
      lastUsedAt?: ISO8601Date;
      lastIp?: string;
    };
    lastUsedAt?: ISO8601Date;
    expiresAt?: ISO8601Date;
    revokedAt?: ISO8601Date;
    revokedBy?: string;
    revokeReason?: string;
  }
}

export {};

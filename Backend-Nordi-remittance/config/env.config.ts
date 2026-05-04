// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

interface EnvConfig {
  // Server
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  HOST: string;
  API_VERSION: string;
  BASE_URL: string;

  // Database
  MONGODB_URI: string;

  // JWT
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  JWT_ISSUER: string;

  // Redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
  REDIS_DB: string;
  BULLMQ_REDIS_URL: string;

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;

  // Mail
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  SMTP_FROM_NAME: string;
  SMTP_FROM_EMAIL: string;

  // Security
  BCRYPT_ROUNDS: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  CORS_ORIGINS: string[];

  // Admin
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;

  // Feature Flags
  ENABLE_2FA: boolean;
  ENABLE_KYC_VERIFICATION: boolean;
  ENABLE_FRAUD_DETECTION: boolean;

  // Kafka
  KAFKA_BROKERS: string;
  KAFKA_CLIENT_ID: string;
  KAFKA_GROUP_ID: string;
  KAFKA_SSL: boolean;
  KAFKA_SASL_USERNAME?: string;
  KAFKA_SASL_PASSWORD?: string;

  // Monitoring
  SENTRY_DSN?: string;

  // Clerk Authentication
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_WEBHOOK_SECRET: string;

  // AI Agent
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  GOOGLE_AI_KEY?: string;
  HUGGINGFACE_API_KEY?: string;
  ML_SERVICE_URL: string;
  ENABLE_AI_AGENT: boolean;
}

function getEnvString(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}

function getEnvArray(key: string, defaultValue: string[] = []): string[] {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.split(",").map((s) => s.trim());
}

// ============================================================================
// CONFIGURATION OBJECT
// ============================================================================

export const env: EnvConfig = {
  // Server
  NODE_ENV: (process.env.NODE_ENV || "development") as EnvConfig["NODE_ENV"],
  PORT: getEnvNumber("PORT", 3000),
  HOST: getEnvString("HOST", "0.0.0.0"),
  API_VERSION: getEnvString("API_VERSION", "v1"),
  BASE_URL: getEnvString("BASE_URL", "http://localhost:3000"),

  // Database
  MONGODB_URI: getEnvString("MONGODB_URI"),

  // JWT
  JWT_SECRET: getEnvString(
    "JWT_SECRET",
    "your-super-secret-jwt-key-change-in-production",
  ),
  JWT_ACCESS_EXPIRY: getEnvString("JWT_ACCESS_EXPIRY", "15m"),
  JWT_REFRESH_EXPIRY: getEnvString("JWT_REFRESH_EXPIRY", "7d"),
  JWT_ISSUER: getEnvString("JWT_ISSUER", "nordea-remittance"),

  // Redis
  REDIS_HOST: getEnvString("REDIS_HOST", "localhost"),
  REDIS_PORT: getEnvNumber("REDIS_PORT", 6379),
  REDIS_PASSWORD: getEnvString("REDIS_PASSWORD", ""),
  REDIS_DB: getEnvString("REDIS_DB", "0"),
  BULLMQ_REDIS_URL: getEnvString("BULLMQ_REDIS_URL", ""),
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnvString("CLOUDINARY_CLOUD_NAME", ""),
  CLOUDINARY_API_KEY: getEnvString("CLOUDINARY_API_KEY", ""),
  CLOUDINARY_API_SECRET: getEnvString("CLOUDINARY_API_SECRET", ""),

  // Mail
  SMTP_HOST: getEnvString("SMTP_HOST", "smtp.gmail.com"),
  SMTP_PORT: getEnvNumber("SMTP_PORT", 587),
  SMTP_USER: getEnvString("SMTP_USER_EMAIL", ""),
  SMTP_PASSWORD: getEnvString("SMTP_USER_PASSWORD", ""),
  SMTP_FROM_NAME: getEnvString("SMTP_FROM_NAME", "Nordea Remittance"),
  SMTP_FROM_EMAIL: getEnvString("MAIL_FROM", "noreply@nordea.com"),

  // Security
  BCRYPT_ROUNDS: getEnvNumber("BCRYPT_ROUNDS", 12),
  RATE_LIMIT_WINDOW_MS: getEnvNumber("RATE_LIMIT_WINDOW_MS", 900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber("RATE_LIMIT_MAX_REQUESTS", 100),
  CORS_ORIGINS: getEnvArray("CORS_ORIGINS", [
    "http://localhost:3000",
    "http://localhost:5173",
  ]),

  // Admin
  ADMIN_EMAIL: getEnvString("ADMIN_EMAIL", "admin@nordea.com"),
  ADMIN_PASSWORD: getEnvString("ADMIN_PASSWORD", "admin123"),

  // Feature Flags
  ENABLE_2FA: getEnvBoolean("ENABLE_2FA", true),
  ENABLE_KYC_VERIFICATION: getEnvBoolean("ENABLE_KYC_VERIFICATION", true),
  ENABLE_FRAUD_DETECTION: getEnvBoolean("ENABLE_FRAUD_DETECTION", true),

  // Kafka
  KAFKA_BROKERS: getEnvString("KAFKA_BROKERS", "localhost:9092"),
  KAFKA_CLIENT_ID: getEnvString("KAFKA_CLIENT_ID", "nordi-remit-api"),
  KAFKA_GROUP_ID: getEnvString("KAFKA_GROUP_ID", "nordi-remit-group"),
  KAFKA_SSL: getEnvBoolean("KAFKA_SSL", false),
  KAFKA_SASL_USERNAME: process.env.KAFKA_SASL_USERNAME,
  KAFKA_SASL_PASSWORD: process.env.KAFKA_SASL_PASSWORD,

  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,

  // Clerk Authentication
  CLERK_SECRET_KEY: getEnvString("CLERK_SECRET_KEY", ""),
  CLERK_PUBLISHABLE_KEY: getEnvString("CLERK_PUBLISHABLE_KEY", ""),
  CLERK_WEBHOOK_SECRET: getEnvString("CLERK_WEBHOOK_SECRET", ""),

  // AI Agent
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_AI_KEY: process.env.GOOGLE_AI_KEY,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  ML_SERVICE_URL: getEnvString("ML_SERVICE_URL", "http://localhost:8000"),
  ENABLE_AI_AGENT: getEnvBoolean("ENABLE_AI_AGENT", true),
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const constants = {
  // API
  API_PREFIX: `/api/${env.API_VERSION}`,

  // Authentication
  ACCESS_TOKEN_COOKIE: "access_token",
  REFRESH_TOKEN_COOKIE: "refresh_token",
  SESSION_COOKIE: "session_id",

  // Token expiry in seconds
  ACCESS_TOKEN_EXPIRY_SECONDS: 15 * 60, // 15 minutes
  REFRESH_TOKEN_EXPIRY_SECONDS: 7 * 24 * 60 * 60, // 7 days
  VERIFICATION_TOKEN_EXPIRY_SECONDS: 24 * 60 * 60, // 24 hours
  PASSWORD_RESET_EXPIRY_SECONDS: 60 * 60, // 1 hour
  TWO_FACTOR_CODE_EXPIRY_SECONDS: 5 * 60, // 5 minutes

  // Rate limits
  AUTH_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  TRANSACTION_RATE_LIMIT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Password
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  PASSWORD_REGEX:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,

  // Login attempts
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 30,

  // KYC
  KYC_DOCUMENT_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  KYC_ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ],

  // Transactions
  MIN_TRANSACTION_AMOUNT: 0.01,
  MAX_TRANSACTION_AMOUNT: 1000000,
  DEFAULT_CURRENCY: "USD",
  SUPPORTED_CURRENCIES: [
    "USD",
    "EUR",
    "GBP",
    "NGN",
    "KES",
    "ZAR",
    "INR",
    "AUD",
    "CAD",
  ],

  // Account
  ACCOUNT_NUMBER_LENGTH: 10,
  WALLET_NUMBER_LENGTH: 12,

  // Card
  CARD_NUMBER_LENGTH: 16,
  CVV_LENGTH: 3,

  // Headers
  REQUEST_ID_HEADER: "x-request-id",
  CORRELATION_ID_HEADER: "x-correlation-id",
  CLIENT_IP_HEADER: "x-forwarded-for",

  // Error codes
  ERROR_CODES: {
    // Auth errors (1xxx)
    INVALID_CREDENTIALS: "E1001",
    TOKEN_EXPIRED: "E1002",
    TOKEN_INVALID: "E1003",
    UNAUTHORIZED: "E1004",
    FORBIDDEN: "E1005",
    ACCOUNT_LOCKED: "E1006",
    ACCOUNT_SUSPENDED: "E1007",
    EMAIL_NOT_VERIFIED: "E1008",
    TWO_FACTOR_REQUIRED: "E1009",
    TWO_FACTOR_INVALID: "E1010",
    SESSION_EXPIRED: "E1011",

    // Validation errors (2xxx)
    VALIDATION_ERROR: "E2001",
    INVALID_INPUT: "E2002",
    MISSING_REQUIRED_FIELD: "E2003",
    INVALID_FORMAT: "E2004",

    // User errors (3xxx)
    USER_NOT_FOUND: "E3001",
    USER_ALREADY_EXISTS: "E3002",
    EMAIL_ALREADY_EXISTS: "E3003",
    PHONE_ALREADY_EXISTS: "E3004",
    KYC_NOT_VERIFIED: "E3005",

    // Transaction errors (4xxx)
    INSUFFICIENT_BALANCE: "E4001",
    TRANSACTION_FAILED: "E4002",
    TRANSACTION_LIMIT_EXCEEDED: "E4003",
    INVALID_ACCOUNT: "E4004",
    DUPLICATE_TRANSACTION: "E4005",
    TRANSACTION_NOT_FOUND: "E4006",

    // Wallet errors (5xxx)
    WALLET_NOT_FOUND: "E5001",
    WALLET_SUSPENDED: "E5002",
    WALLET_FROZEN: "E5003",

    // Card errors (6xxx)
    CARD_NOT_FOUND: "E6001",
    CARD_BLOCKED: "E6002",
    CARD_EXPIRED: "E6003",

    // Loan errors (7xxx)
    LOAN_NOT_FOUND: "E7001",
    LOAN_APPLICATION_REJECTED: "E7002",

    // Security errors (8xxx)
    RATE_LIMIT_EXCEEDED: "E8001",
    FRAUD_DETECTED: "E8002",
    SUSPICIOUS_ACTIVITY: "E8003",
    IP_BLOCKED: "E8004",

    // Server errors (9xxx)
    INTERNAL_ERROR: "E9001",
    DATABASE_ERROR: "E9002",
    EXTERNAL_SERVICE_ERROR: "E9003",
    SERVICE_UNAVAILABLE: "E9004",
  },
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// ============================================================================
// ENVIRONMENT HELPERS
// ============================================================================

export function isProduction(): boolean {
  return env.NODE_ENV === "production";
}

export function isDevelopment(): boolean {
  return env.NODE_ENV === "development";
}

export function isTest(): boolean {
  return env.NODE_ENV === "test";
}

export default env;

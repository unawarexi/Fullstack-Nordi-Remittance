// ============================================================================
// REDIS SERVICE - Production Redis Cloud Integration
// ============================================================================
// High-performance caching, sessions, rate limiting, and pub/sub
// Using official 'redis' package with Redis Cloud

import { createClient, RedisClientType } from 'redis';
import { env } from '../config/env.config.js';
import { buildRedisOptions, type RedisConnectionOptions } from '../config/redis.config.js';
import Logger from '../logs/logger.js';


// ============================================================================
// TYPES
// ============================================================================

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// ============================================================================
// REDIS CLIENT SINGLETON
// ============================================================================

let redisClient: RedisClientType | null = null;
let isConnected = false;
let connectionPromise: Promise<void> | null = null;

/**
 * Initialize and get Redis client
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient && isConnected) {
    return redisClient;
  }

  if (connectionPromise) {
    await connectionPromise;
    return redisClient!;
  }

  connectionPromise = initializeRedis();
  await connectionPromise;
  return redisClient!;
}

/**
 * Initialize Redis connection using shared buildRedisOptions config
 */
async function initializeRedis(): Promise<void> {
  try {
    // Build connection options from shared config
    const opts = buildRedisOptions({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      db: env.REDIS_DB,
    });

    // buildRedisOptions returns either a string URL or a flat options object
    // node-redis's createClient expects { socket: { host, port }, password }
    const socketConfig =
      typeof opts === 'string'
        ? { url: opts }
        : {
            username: (opts as RedisConnectionOptions).username || 'default',
            password: (opts as RedisConnectionOptions).password || undefined,
            database: (opts as RedisConnectionOptions).db,
            socket: {
              host: (opts as RedisConnectionOptions).host || 'localhost',
              port: (opts as RedisConnectionOptions).port || 6379,
              reconnectStrategy: (retries: number) => {
                if (retries > 10) {
                  Logger.error('[Redis] Max reconnection attempts reached');
                  return new Error('Max reconnection attempts reached');
                }
                return Math.min(retries * 100, 3000);
              },
            },
          };

    redisClient = createClient(socketConfig);

    redisClient.on('error', (err) => {
      Logger.error(`[Redis] Client Error: ${err.message}`);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      Logger.info('[Redis] ✅ Connected to Redis Cloud');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      Logger.warn('[Redis] 🔄 Reconnecting...');
    });

    redisClient.on('end', () => {
      Logger.info('[Redis] Connection closed');
      isConnected = false;
    });

    await redisClient.connect();
    isConnected = true;
    Logger.info('[Redis] ✅ Redis Cloud connection established');
  } catch (error) {
    Logger.error('[Redis] Failed to connect', { error });
    isConnected = false;
    throw error;
  }
}

/**
 * Graceful shutdown
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient && isConnected) {
    await redisClient.quit();
    isConnected = false;
    redisClient = null;
    connectionPromise = null;
    Logger.info('[Redis] Disconnected');
  }
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected(): boolean {
  return isConnected;
}

/**
 * Get internal redis service object for middleware usage
 */
export function getRedisService() {
  return {
    getIsConnected: isRedisConnected,
    checkRateLimit,
    healthCheck,
  };
}

// ============================================================================
// CACHE KEYS - Centralized key management
// ============================================================================

export const CACHE_KEYS = {
    USER_STATS: (userId: string) => `remit:user:stats:${userId}`,
  // User related
  USER_PROFILE: (userId: string) => `remit:user:profile:${userId}`,
  USER_WALLETS: (userId: string) => `remit:user:wallets:${userId}`,
  USER_PERMISSIONS: (userId: string) => `remit:user:permissions:${userId}`,
  USER_SESSION: (userId: string, sessionId: string) => `remit:session:${userId}:${sessionId}`,
  USER_SESSIONS_LIST: (userId: string) => `remit:user:sessions:${userId}`,
  
  // Transaction related
  TRANSACTION: (txId: string) => `remit:transaction:${txId}`,
  USER_TRANSACTIONS: (userId: string) => `remit:user:transactions:${userId}`,
  PENDING_TRANSACTIONS: (userId: string) => `remit:user:pending:${userId}`,
  TRANSACTION_STATS: (userId: string) => `remit:user:tx_stats:${userId}`,
  
  // Wallet related
  WALLET: (walletId: string) => `remit:wallet:${walletId}`,
  WALLET_BALANCE: (walletId: string) => `remit:wallet:balance:${walletId}`,
  
  // Account related
  ACCOUNT: (accountId: string) => `remit:account:${accountId}`,
  USER_ACCOUNTS: (userId: string) => `remit:user:accounts:${userId}`,
  
  // Rate limiting
  RATE_LIMIT: (identifier: string) => `remit:ratelimit:${identifier}`,
  LOGIN_ATTEMPTS: (email: string) => `remit:login:attempts:${email}`,
  OTP_ATTEMPTS: (userId: string) => `remit:otp:attempts:${userId}`,
  
  // Security
  BLOCKED_IPS: () => `remit:security:blocked_ips`,
  FRAUD_SIGNALS: (userId: string) => `remit:fraud:signals:${userId}`,
  
  // Notifications
  USER_NOTIFICATIONS: (userId: string) => `remit:notifications:${userId}`,
  UNREAD_COUNT: (userId: string) => `remit:notifications:unread:${userId}`,
  
  // Cards
  USER_CARDS: (userId: string) => `remit:user:cards:${userId}`,
  CARD: (cardId: string) => `remit:card:${cardId}`,
  
  // Loans
  USER_LOANS: (userId: string) => `remit:user:loans:${userId}`,
  LOAN: (loanId: string) => `remit:loan:${loanId}`,
  
  // Investments
  USER_INVESTMENTS: (userId: string) => `remit:user:investments:${userId}`,
  INVESTMENT: (investmentId: string) => `remit:investment:${investmentId}`,
  
  // Admin
  ADMIN_STATS: () => `remit:admin:stats`,
  SYSTEM_SETTINGS: () => `remit:system:settings`,
  ALL_USERS_STATS: () => `remit:admin:all_users_stats`,
  
  // Exchange rates
  EXCHANGE_RATES: () => `remit:exchange:rates`,
  EXCHANGE_RATE: (from: string, to: string) => `remit:exchange:${from}:${to}`,
  
  // Verification tokens
  EMAIL_VERIFICATION: (token: string) => `remit:verify:email:${token}`,
  PASSWORD_RESET: (token: string) => `remit:verify:password:${token}`,
  TWO_FACTOR: (userId: string) => `remit:2fa:${userId}`,
  
  // KYC
  KYC_STATUS: (userId: string) => `remit:kyc:status:${userId}`,
};

// ============================================================================
// TTL CONSTANTS (in seconds)
// ============================================================================
export const CACHE_TTL = {
  USER_PROFILE: 300,        // 5 minutes
  USER_WALLETS: 60,         // 1 minute (balance changes frequently)
  USER_PERMISSIONS: 600,    // 10 minutes
  SESSION: 86400,           // 24 hours
  TRANSACTION: 300,         // 5 minutes
  TRANSACTION_LIST: 60,     // 1 minute
  WALLET_BALANCE: 30,       // 30 seconds
  ACCOUNT: 120,             // 2 minutes
  RATE_LIMIT: 900,          // 15 minutes
  LOGIN_ATTEMPTS: 1800,     // 30 minutes
  NOTIFICATIONS: 120,       // 2 minutes
  ADMIN_STATS: 300,         // 5 minutes
  EXCHANGE_RATES: 300,      // 5 minutes
  EMAIL_VERIFICATION: 86400, // 24 hours
  PASSWORD_RESET: 3600,     // 1 hour
  TWO_FACTOR: 300,          // 5 minutes
  CARDS: 180,               // 3 minutes
  LOANS: 300,               // 5 minutes
  INVESTMENTS: 300,         // 5 minutes
  KYC: 600,                 // 10 minutes
}


// ============================================================================
// CORE CACHE OPERATIONS
// ============================================================================

/**
 * Get cached value
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value as string) as T;
  } catch (error) {
    console.error(`[Redis] Cache get error for ${key}:`, error);
    return null;
  }
}

/**
 * Set cached value with TTL
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Redis] Cache set error for ${key}:`, error);
    return false;
  }
}

/**
 * Delete cached value
 */
export async function cacheDelete(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`[Redis] Cache delete error for ${key}:`, error);
    return false;
  }
}

/**
 * Delete multiple keys by pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    return await client.del(keys);
  } catch (error) {
    console.error(`[Redis] Cache delete pattern error for ${pattern}:`, error);
    return 0;
  }
}

/**
 * Get or set cached value (cache-aside pattern)
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }
  
  const freshData = await fetchFn();
  await cacheSet(key, freshData, ttlSeconds);
  return freshData;
}

/**
 * Check if key exists
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    return (await client.exists(key)) === 1;
  } catch (error) {
    console.error(`[Redis] Cache exists error for ${key}:`, error);
    return false;
  }
}

/**
 * Set key expiry
 */
export async function cacheExpire(key: string, ttlSeconds: number): Promise<boolean> {
  try {
    const client = await getRedisClient();
    return !!(await client.expire(key, ttlSeconds));
  } catch (error) {
    console.error(`[Redis] Cache expire error for ${key}:`, error);
    return false;
  }
}

// ============================================================================
// USER CACHING
// ============================================================================

/**
 * Cache user profile
 */
export async function cacheUserProfile(userId: string, profile: any): Promise<boolean> {
  return cacheSet(CACHE_KEYS.USER_PROFILE(userId), profile, CACHE_TTL.USER_PROFILE);
}

/**
 * Get cached user profile
 */
export async function getCachedUserProfile(userId: string): Promise<any | null> {
  return cacheGet(CACHE_KEYS.USER_PROFILE(userId));
}

/**
 * Invalidate user cache
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await Promise.all([
    cacheDelete(CACHE_KEYS.USER_PROFILE(userId)),
    cacheDelete(CACHE_KEYS.USER_WALLETS(userId)),
    cacheDelete(CACHE_KEYS.USER_PERMISSIONS(userId)),
    cacheDelete(CACHE_KEYS.USER_TRANSACTIONS(userId)),
    cacheDelete(CACHE_KEYS.TRANSACTION_STATS(userId)),
    cacheDelete(CACHE_KEYS.USER_ACCOUNTS(userId)),
    cacheDelete(CACHE_KEYS.USER_CARDS(userId)),
    cacheDelete(CACHE_KEYS.USER_LOANS(userId)),
    cacheDelete(CACHE_KEYS.USER_INVESTMENTS(userId)),
  ]);
}

/**
 * Cache user wallets
 */
export async function cacheUserWallets(userId: string, wallets: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.USER_WALLETS(userId), wallets, CACHE_TTL.USER_WALLETS);
}

/**
 * Get cached user wallets
 */
export async function getCachedUserWallets(userId: string): Promise<any[] | null> {
  return cacheGet(CACHE_KEYS.USER_WALLETS(userId));
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Create user session
 */
export async function createSession(
  userId: string,
  sessionId: string,
  sessionData: Record<string, any>
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const key = CACHE_KEYS.USER_SESSION(userId, sessionId);
    
    await client.setEx(key, CACHE_TTL.SESSION, JSON.stringify({
      ...sessionData,
      userId,
      sessionId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    }));
    
    // Add to user's session list
    await client.sAdd(CACHE_KEYS.USER_SESSIONS_LIST(userId), sessionId);
    await client.expire(CACHE_KEYS.USER_SESSIONS_LIST(userId), CACHE_TTL.SESSION);
    
    return true;
  } catch (error) {
    console.error(`[Redis] Create session error:`, error);
    return false;
  }
}

/**
 * Get session data
 */
export async function getSession(userId: string, sessionId?: string): Promise<Record<string, any> | null> {
  if (sessionId) {
    return cacheGet(CACHE_KEYS.USER_SESSION(userId, sessionId));
  }
  // Legacy support - get any active session
  const sessions = await getUserSessions(userId);
  return sessions[0] || null;
}

/**
 * Update session activity
 */
export async function updateSessionActivity(userId: string, sessionId: string): Promise<boolean> {
  try {
    const session = await getSession(userId, sessionId);
    if (!session) return false;
    
    session.lastActivity = new Date().toISOString();
    return cacheSet(CACHE_KEYS.USER_SESSION(userId, sessionId), session, CACHE_TTL.SESSION);
  } catch (error) {
    console.error(`[Redis] Update session error:`, error);
    return false;
  }
}

/**
 * Delete session (logout)
 */
export async function deleteSession(userId: string, sessionId?: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    
    if (sessionId) {
      await client.del(CACHE_KEYS.USER_SESSION(userId, sessionId));
      await client.sRem(CACHE_KEYS.USER_SESSIONS_LIST(userId), sessionId);
    } else {
      // Delete all sessions for user
      return deleteAllUserSessions(userId);
    }
    return true;
  } catch (error) {
    console.error(`[Redis] Delete session error:`, error);
    return false;
  }
}

/**
 * Delete all user sessions (logout all devices)
 */
export async function deleteAllUserSessions(userId: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const sessionIds = await client.sMembers(CACHE_KEYS.USER_SESSIONS_LIST(userId));
    
    if (sessionIds.length > 0) {
      const sessionKeys = sessionIds.map(sid => CACHE_KEYS.USER_SESSION(userId, sid));
      await client.del(sessionKeys);
    }
    
    await client.del(CACHE_KEYS.USER_SESSIONS_LIST(userId));
    return true;
  } catch (error) {
    console.error(`[Redis] Delete all sessions error:`, error);
    return false;
  }
}

/**
 * Get all active sessions for user
 */
export async function getUserSessions(userId: string): Promise<Record<string, any>[]> {
  try {
    const client = await getRedisClient();
    const sessionIds = await client.sMembers(CACHE_KEYS.USER_SESSIONS_LIST(userId));
    
    const sessions = await Promise.all(
      sessionIds.map(sid => getSession(userId, sid))
    );
    
    return sessions.filter(s => s !== null) as Record<string, any>[];
  } catch (error) {
    console.error(`[Redis] Get user sessions error:`, error);
    return [];
  }
}

/**
 * Set session (legacy compatibility)
 */
export async function setSession(userId: string, sessionData: Record<string, any>): Promise<boolean> {
  const sessionId = sessionData.sessionId || `session_${Date.now()}`;
  return createSession(userId, sessionId, sessionData);
}

/**
 * Refresh session TTL
 */
export async function refreshSession(userId: string): Promise<boolean> {
  const sessions = await getUserSessions(userId);
  if (sessions.length === 0) return false;
  
  const session = sessions[0];
  return updateSessionActivity(userId, session.sessionId);
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Check rate limit using sliding window
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    const client = await getRedisClient();
    const key = CACHE_KEYS.RATE_LIMIT(identifier);
    const windowSeconds = Math.ceil(windowMs / 1000);
    
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, windowSeconds);
    }
    
    const ttl = await client.ttl(key);
    const resetTime = Date.now() + (ttl > 0 ? ttl * 1000 : windowMs);
    const remaining = Math.max(0, limit - current);
    
    return {
      allowed: current <= limit,
      remaining,
      resetTime,
      retryAfter: current > limit ? ttl : undefined,
    };
  } catch (error) {
    console.error(`[Redis] Rate limit check error:`, error);
    return { allowed: true, remaining: limit, resetTime: Date.now() + windowMs };
  }
}

/**
 * Track login attempts
 */
export async function trackLoginAttempt(email: string, success: boolean): Promise<{ attempts: number; locked: boolean }> {
  try {
    const client = await getRedisClient();
    const key = CACHE_KEYS.LOGIN_ATTEMPTS(email.toLowerCase());
    
    if (success) {
      await client.del(key);
      return { attempts: 0, locked: false };
    }
    
    const attempts = await client.incr(key);
    if (attempts === 1) {
      await client.expire(key, CACHE_TTL.LOGIN_ATTEMPTS);
    }
    
    const maxAttempts = 5;
    return {
      attempts,
      locked: attempts >= maxAttempts,
    };
  } catch (error) {
    console.error(`[Redis] Track login attempt error:`, error);
    return { attempts: 0, locked: false };
  }
}

/**
 * Check if login is locked
 */
export async function isLoginLocked(email: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const key = CACHE_KEYS.LOGIN_ATTEMPTS(email.toLowerCase());
    const attempts = await client.get(key);
    return attempts !== null && parseInt(attempts as string, 10) >= 5;
  } catch (error) {
    return false;
  }
}

/**
 * Reset rate limit
 */
export async function resetRateLimit(identifier: string): Promise<boolean> {
  return cacheDelete(CACHE_KEYS.RATE_LIMIT(identifier));
}

// ============================================================================
// TRANSACTION CACHING
// ============================================================================

/**
 * Cache transaction
 */
export async function cacheTransaction(txId: string, transaction: any): Promise<boolean> {
  return cacheSet(CACHE_KEYS.TRANSACTION(txId), transaction, CACHE_TTL.TRANSACTION);
}

/**
 * Get cached transaction
 */
export async function getCachedTransaction(txId: string): Promise<any | null> {
  return cacheGet(CACHE_KEYS.TRANSACTION(txId));
}

/**
 * Cache user transactions list
 */
export async function cacheUserTransactions(userId: string, transactions: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.USER_TRANSACTIONS(userId), transactions, CACHE_TTL.TRANSACTION_LIST);
}

/**
 * Get cached user transactions
 */
export async function getCachedUserTransactions(userId: string): Promise<any[] | null> {
  return cacheGet(CACHE_KEYS.USER_TRANSACTIONS(userId));
}

/**
 * Invalidate user transaction cache
 */
export async function invalidateTransactionCache(userId: string, txId?: string): Promise<void> {
  const promises = [
    cacheDelete(CACHE_KEYS.USER_TRANSACTIONS(userId)),
    cacheDelete(CACHE_KEYS.PENDING_TRANSACTIONS(userId)),
    cacheDelete(CACHE_KEYS.TRANSACTION_STATS(userId)),
    cacheDelete(CACHE_KEYS.USER_WALLETS(userId)),
  ];
  
  if (txId) {
    promises.push(cacheDelete(CACHE_KEYS.TRANSACTION(txId)));
  }
  
  await Promise.all(promises);
}

// ============================================================================
// ACCOUNT CACHING
// ============================================================================

/**
 * Cache account
 */
export async function cacheAccount(accountId: string, account: any): Promise<boolean> {
  return cacheSet(CACHE_KEYS.ACCOUNT(accountId), account, CACHE_TTL.ACCOUNT);
}

/**
 * Get cached account
 */
export async function getCachedAccount(accountId: string): Promise<any | null> {
  return cacheGet(CACHE_KEYS.ACCOUNT(accountId));
}

/**
 * Cache user accounts
 */
export async function cacheUserAccounts(userId: string, accounts: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.USER_ACCOUNTS(userId), accounts, CACHE_TTL.ACCOUNT);
}

/**
 * Get cached user accounts
 */
export async function getCachedUserAccounts(userId: string): Promise<any[] | null> {
  return cacheGet(CACHE_KEYS.USER_ACCOUNTS(userId));
}

/**
 * Invalidate account cache
 */
export async function invalidateAccountCache(userId: string, accountId?: string): Promise<void> {
  const promises = [
    cacheDelete(CACHE_KEYS.USER_ACCOUNTS(userId)),
    cacheDelete(CACHE_KEYS.USER_WALLETS(userId)),
  ];
  
  if (accountId) {
    promises.push(cacheDelete(CACHE_KEYS.ACCOUNT(accountId)));
  }
  
  await Promise.all(promises);
}

// ============================================================================
// CARD CACHING
// ============================================================================

/**
 * Cache user cards
 */
export async function cacheUserCards(userId: string, cards: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.USER_CARDS(userId), cards, CACHE_TTL.CARDS);
}

/**
 * Get cached user cards
 */
export async function getCachedUserCards(userId: string): Promise<any[] | null> {
  return cacheGet(CACHE_KEYS.USER_CARDS(userId));
}

/**
 * Invalidate card cache
 */
export async function invalidateCardCache(userId: string): Promise<void> {
  await cacheDelete(CACHE_KEYS.USER_CARDS(userId));
}

// ============================================================================
// LOAN CACHING
// ============================================================================

/**
 * Cache user loans
 */
export async function cacheUserLoans(userId: string, loans: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.USER_LOANS(userId), loans, CACHE_TTL.LOANS);
}

/**
 * Get cached user loans
 */
export async function getCachedUserLoans(userId: string): Promise<any[] | null> {
  return cacheGet(CACHE_KEYS.USER_LOANS(userId));
}

/**
 * Invalidate loan cache
 */
export async function invalidateLoanCache(userId: string): Promise<void> {
  await cacheDelete(CACHE_KEYS.USER_LOANS(userId));
}

// ============================================================================
// INVESTMENT CACHING
// ============================================================================

/**
 * Cache user investments
 */
export async function cacheUserInvestments(userId: string, investments: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.USER_INVESTMENTS(userId), investments, CACHE_TTL.INVESTMENTS);
}

/**
 * Get cached user investments
 */
export async function getCachedUserInvestments(userId: string): Promise<any[] | null> {
  return cacheGet(CACHE_KEYS.USER_INVESTMENTS(userId));
}

/**
 * Invalidate investment cache
 */
export async function invalidateInvestmentCache(userId: string): Promise<void> {
  await cacheDelete(CACHE_KEYS.USER_INVESTMENTS(userId));
}

// ============================================================================
// NOTIFICATION CACHING
// ============================================================================

/**
 * Increment unread notification count
 */
export async function incrementUnreadCount(userId: string): Promise<number> {
  try {
    const client = await getRedisClient();
    const key = CACHE_KEYS.UNREAD_COUNT(userId);
    const count = await client.incr(key);
    await client.expire(key, CACHE_TTL.NOTIFICATIONS);
    return count;
  } catch (error) {
    console.error(`[Redis] Increment unread count error:`, error);
    return 0;
  }
}

/**
 * Reset unread notification count
 */
export async function resetUnreadCount(userId: string): Promise<boolean> {
  return cacheDelete(CACHE_KEYS.UNREAD_COUNT(userId));
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const client = await getRedisClient();
    const count = await client.get(CACHE_KEYS.UNREAD_COUNT(userId));
    return count ? parseInt(count as string, 10) : 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Cache user notifications
 */
export async function cacheUserNotifications(userId: string, notifications: any[]): Promise<boolean> {
  return cacheSet(CACHE_KEYS.USER_NOTIFICATIONS(userId), notifications, CACHE_TTL.NOTIFICATIONS);
}

/**
 * Get cached user notifications
 */
export async function getCachedUserNotifications(userId: string): Promise<any[] | null> {
  return cacheGet(CACHE_KEYS.USER_NOTIFICATIONS(userId));
}

/**
 * Invalidate notification cache
 */
export async function invalidateNotificationCache(userId: string): Promise<void> {
  await Promise.all([
    cacheDelete(CACHE_KEYS.USER_NOTIFICATIONS(userId)),
    cacheDelete(CACHE_KEYS.UNREAD_COUNT(userId)),
  ]);
}

// ============================================================================
// VERIFICATION TOKENS
// ============================================================================

/**
 * Store email verification token
 */
export async function storeEmailVerificationToken(token: string, userId: string): Promise<boolean> {
  return cacheSet(CACHE_KEYS.EMAIL_VERIFICATION(token), { userId, createdAt: Date.now() }, CACHE_TTL.EMAIL_VERIFICATION);
}

/**
 * Verify email token
 */
export async function verifyEmailToken(token: string): Promise<string | null> {
  const data = await cacheGet<{ userId: string }>(CACHE_KEYS.EMAIL_VERIFICATION(token));
  if (data) {
    await cacheDelete(CACHE_KEYS.EMAIL_VERIFICATION(token));
    return data.userId;
  }
  return null;
}

/**
 * Store password reset token
 */
export async function storePasswordResetToken(token: string, userId: string): Promise<boolean> {
  return cacheSet(CACHE_KEYS.PASSWORD_RESET(token), { userId, createdAt: Date.now() }, CACHE_TTL.PASSWORD_RESET);
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const data = await cacheGet<{ userId: string }>(CACHE_KEYS.PASSWORD_RESET(token));
  if (data) {
    await cacheDelete(CACHE_KEYS.PASSWORD_RESET(token));
    return data.userId;
  }
  return null;
}

/**
 * Store 2FA verification code
 */
export async function store2FACode(userId: string, code: string): Promise<boolean> {
  return cacheSet(CACHE_KEYS.TWO_FACTOR(userId), { code, createdAt: Date.now() }, CACHE_TTL.TWO_FACTOR);
}

/**
 * Verify 2FA code
 */
export async function verify2FACode(userId: string, code: string): Promise<boolean> {
  const data = await cacheGet<{ code: string }>(CACHE_KEYS.TWO_FACTOR(userId));
  if (data && data.code === code) {
    await cacheDelete(CACHE_KEYS.TWO_FACTOR(userId));
    return true;
  }
  return false;
}

// ============================================================================
// EXCHANGE RATES CACHING
// ============================================================================

/**
 * Cache exchange rates
 */
export async function cacheExchangeRates(rates: Record<string, number>): Promise<boolean> {
  return cacheSet(CACHE_KEYS.EXCHANGE_RATES(), rates, CACHE_TTL.EXCHANGE_RATES);
}

/**
 * Get cached exchange rates
 */
export async function getCachedExchangeRates(): Promise<Record<string, number> | null> {
  return cacheGet(CACHE_KEYS.EXCHANGE_RATES());
}

/**
 * Cache single exchange rate
 */
export async function cacheExchangeRate(from: string, to: string, rate: number): Promise<boolean> {
  return cacheSet(CACHE_KEYS.EXCHANGE_RATE(from, to), rate, CACHE_TTL.EXCHANGE_RATES);
}

/**
 * Get cached exchange rate
 */
export async function getCachedExchangeRate(from: string, to: string): Promise<number | null> {
  return cacheGet(CACHE_KEYS.EXCHANGE_RATE(from, to));
}

// ============================================================================
// ADMIN/SYSTEM CACHING
// ============================================================================

/**
 * Cache admin stats
 */
export async function cacheAdminStats(stats: any): Promise<boolean> {
  return cacheSet(CACHE_KEYS.ADMIN_STATS(), stats, CACHE_TTL.ADMIN_STATS);
}

/**
 * Get cached admin stats
 */
export async function getCachedAdminStats(): Promise<any | null> {
  return cacheGet(CACHE_KEYS.ADMIN_STATS());
}

/**
 * Invalidate admin stats cache
 */
export async function invalidateAdminStats(): Promise<boolean> {
  return cacheDelete(CACHE_KEYS.ADMIN_STATS());
}

/**
 * Cache system settings
 */
export async function cacheSystemSettings(settings: any): Promise<boolean> {
  return cacheSet(CACHE_KEYS.SYSTEM_SETTINGS(), settings, CACHE_TTL.ADMIN_STATS);
}

/**
 * Get cached system settings
 */
export async function getCachedSystemSettings(): Promise<any | null> {
  return cacheGet(CACHE_KEYS.SYSTEM_SETTINGS());
}

// ============================================================================
// SECURITY - IP BLOCKING
// ============================================================================

/**
 * Block IP address
 */
export async function blockIP(ip: string, durationSeconds: number = 3600): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.sAdd(CACHE_KEYS.BLOCKED_IPS(), ip);
    // Set individual key for expiry tracking
    await client.setEx(`remit:blocked_ip:${ip}`, durationSeconds, '1');
    return true;
  } catch (error) {
    console.error(`[Redis] Block IP error:`, error);
    return false;
  }
}

/**
 * Unblock IP address
 */
export async function unblockIP(ip: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    await client.sRem(CACHE_KEYS.BLOCKED_IPS(), ip);
    await client.del(`remit:blocked_ip:${ip}`);
    return true;
  } catch (error) {
    console.error(`[Redis] Unblock IP error:`, error);
    return false;
  }
}

/**
 * Check if IP is blocked
 */
export async function isIPBlocked(ip: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const exists = await client.exists(`remit:blocked_ip:${ip}`);
    return exists === 1;
  } catch (error) {
    return false;
  }
}

/**
 * Cache fraud signals for user
 */
export async function cacheFraudSignals(userId: string, signals: any): Promise<boolean> {
  return cacheSet(CACHE_KEYS.FRAUD_SIGNALS(userId), signals, CACHE_TTL.ADMIN_STATS);
}

/**
 * Get cached fraud signals
 */
export async function getCachedFraudSignals(userId: string): Promise<any | null> {
  return cacheGet(CACHE_KEYS.FRAUD_SIGNALS(userId));
}

// ============================================================================
// KYC CACHING
// ============================================================================

/**
 * Cache KYC status
 */
export async function cacheKycStatus(userId: string, status: any): Promise<boolean> {
  return cacheSet(CACHE_KEYS.KYC_STATUS(userId), status, CACHE_TTL.KYC);
}

/**
 * Get cached KYC status
 */
export async function getCachedKycStatus(userId: string): Promise<any | null> {
  return cacheGet(CACHE_KEYS.KYC_STATUS(userId));
}

/**
 * Invalidate KYC cache
 */
export async function invalidateKycCache(userId: string): Promise<void> {
  await cacheDelete(CACHE_KEYS.KYC_STATUS(userId));
}

// ============================================================================
// PUB/SUB
// ============================================================================

/**
 * Publish message to channel
 */
export async function publish(channel: string, message: any): Promise<number> {
  try {
    const client = await getRedisClient();
    return await client.publish(channel, JSON.stringify(message));
  } catch (error) {
    console.error(`[Redis] Publish error:`, error);
    return 0;
  }
}

/**
 * Subscribe placeholder (requires separate client for pub/sub)
 */
export function subscribe(channel: string, callback: (message: any) => void): void {
  console.log(`[Redis] Subscribe to ${channel} - Use WebSocket for real-time updates`);
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check Redis connection health
 */
export async function healthCheck(): Promise<{ status: string; latency?: number; connected: boolean }> {
  const start = Date.now();
  
  try {
    const client = await getRedisClient();
    await client.ping();
    return {
      status: 'healthy',
      latency: Date.now() - start,
      connected: isConnected,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
    };
  }
}

// ============================================================================
// DISTRIBUTED LOCKING
// ============================================================================

/**
 * Acquire distributed lock
 */
export async function acquireLock(lockName: string, ttlSeconds: number = 30): Promise<string | null> {
  try {
    const client = await getRedisClient();
    const lockId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const key = `remit:lock:${lockName}`;
    
    const result = await client.setNX(key, lockId);
    if (result) {
      await client.expire(key, ttlSeconds);
      return lockId;
    }
    return null;
  } catch (error) {
    console.error(`[Redis] Acquire lock error:`, error);
    return null;
  }
}

/**
 * Release distributed lock
 */
export async function releaseLock(lockName: string, lockId: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const key = `remit:lock:${lockName}`;
    
    const currentId = await client.get(key);
    if (currentId === lockId) {
      await client.del(key);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`[Redis] Release lock error:`, error);
    return false;
  }
}

/**
 * Execute with distributed lock
 */
export async function withLock<T>(
  lockName: string,
  fn: () => Promise<T>,
  options?: { ttl?: number; retries?: number; retryDelayMs?: number }
): Promise<T> {
  const { ttl = 30, retries = 3, retryDelayMs = 100 } = options || {};
  
  let lockId: string | null = null;
  let attempts = 0;
  
  while (!lockId && attempts < retries) {
    lockId = await acquireLock(lockName, ttl);
    if (!lockId) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }
  }
  
  if (!lockId) {
    throw new Error(`Failed to acquire lock: ${lockName}`);
  }
  
  try {
    return await fn();
  } finally {
    await releaseLock(lockName, lockId);
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  getRedisClient,
  disconnectRedis,
  isRedisConnected,
  CACHE_KEYS,
  CACHE_TTL,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
  cacheGetOrSet,
  cacheExists,
  cacheExpire,
  cacheUserProfile,
  getCachedUserProfile,
  invalidateUserCache,
  cacheUserWallets,
  getCachedUserWallets,
  createSession,
  getSession,
  setSession,
  updateSessionActivity,
  deleteSession,
  deleteAllUserSessions,
  getUserSessions,
  refreshSession,
  checkRateLimit,
  trackLoginAttempt,
  isLoginLocked,
  resetRateLimit,
  cacheTransaction,
  getCachedTransaction,
  cacheUserTransactions,
  getCachedUserTransactions,
  invalidateTransactionCache,
  cacheAccount,
  getCachedAccount,
  cacheUserAccounts,
  getCachedUserAccounts,
  invalidateAccountCache,
  cacheUserCards,
  getCachedUserCards,
  invalidateCardCache,
  cacheUserLoans,
  getCachedUserLoans,
  invalidateLoanCache,
  cacheUserInvestments,
  getCachedUserInvestments,
  invalidateInvestmentCache,
  incrementUnreadCount,
  resetUnreadCount,
  getUnreadCount,
  cacheUserNotifications,
  getCachedUserNotifications,
  invalidateNotificationCache,
  storeEmailVerificationToken,
  verifyEmailToken,
  storePasswordResetToken,
  verifyPasswordResetToken,
  store2FACode,
  verify2FACode,
  cacheExchangeRates,
  getCachedExchangeRates,
  cacheExchangeRate,
  getCachedExchangeRate,
  cacheAdminStats,
  getCachedAdminStats,
  invalidateAdminStats,
  cacheSystemSettings,
  getCachedSystemSettings,
  blockIP,
  unblockIP,
  isIPBlocked,
  cacheFraudSignals,
  getCachedFraudSignals,
  cacheKycStatus,
  getCachedKycStatus,
  invalidateKycCache,
  publish,
  subscribe,
  healthCheck,
  acquireLock,
  releaseLock,
  withLock,
};

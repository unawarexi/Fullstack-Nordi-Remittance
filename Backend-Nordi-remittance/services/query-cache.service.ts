// ============================================================================
// REDIS QUERY CACHE — High-frequency read-heavy query caching
// ============================================================================
// Provides a generic caching layer for MongoDB queries.
// TTL: 30-60 seconds for most queries. Invalidate on write.
// NEVER cache sensitive financial data without validation.
// ============================================================================

import { getRedisClient } from "./redis.service";

// Cache key prefixes
const CACHE_PREFIX = {
  DASHBOARD: "cache:dashboard",
  PLATFORM_STATS: "cache:platform_stats",
  USER_WALLETS: "cache:user_wallets",
  USER_PERMISSIONS: "cache:user_permissions",
  SYSTEM_SETTINGS: "cache:system_settings",
  ACTIVE_CARDS: "cache:active_cards",
  LOAN_STATS: "cache:loan_stats",
  FRAUD_STATS: "cache:fraud_stats",
} as const;

// Default TTLs in seconds
const TTL = {
  SHORT: 30, // 30 seconds — for frequently changing data
  MEDIUM: 60, // 60 seconds — for moderately changing data
  LONG: 300, // 5 minutes — for rarely changing data
  SETTINGS: 600, // 10 minutes — for system settings
} as const;

// ============================================================================
// GENERIC CACHE OPERATIONS WITH STAMPEDE PROTECTION
// ============================================================================

// Request Coalescing / Single-Flight Pattern map: deduplicates concurrent DB queries
const inFlightQueries = new Map<string, Promise<unknown>>();

/**
 * Get cached data or execute query with single-flight request coalescing and TTL jitter.
 * Protects MongoDB against cache stampede / thundering herd under concurrency.
 *
 * @param cacheKey - Unique cache key
 * @param queryFn - Async function that executes the MongoDB query
 * @param ttl - Base time to live in seconds (default: 30)
 * @returns Cached or freshly queried data
 */
export async function cacheQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = TTL.SHORT,
): Promise<T> {
  try {
    const redis = await getRedisClient();
    if (!redis) {
      // Redis unavailable — fall through to DB directly
      return await queryFn();
    }

    // 1. Try Redis cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string) as T;
    }

    // 2. Request Coalescing: if an identical query is currently in-flight, attach to its promise
    // instead of spawning a duplicate MongoDB connection under concurrent traffic
    if (inFlightQueries.has(cacheKey)) {
      return (await inFlightQueries.get(cacheKey)) as T;
    }

    // 3. Execute DB query and register promise as in-flight
    const queryPromise = (async () => {
      try {
        const result = await queryFn();
        
        // 4. TTL Jitter: Apply ±15% randomization to prevent synchronized expiration storms
        const jitteredTtl = Math.max(1, Math.floor(ttl * (0.85 + Math.random() * 0.3)));
        
        // Cache result asynchronously (non-blocking)
        redis
          .setEx(cacheKey, jitteredTtl, JSON.stringify(result))
          .catch((err: Error) =>
            console.error("Redis cache write error:", err.message),
          );

        return result;
      } finally {
        // Ensure in-flight tracking is removed upon query completion or failure
        inFlightQueries.delete(cacheKey);
      }
    })();

    inFlightQueries.set(cacheKey, queryPromise);
    return (await queryPromise) as T;
  } catch {
    // On any Redis error or failure, safely degrade by calling queryFn directly
    inFlightQueries.delete(cacheKey);
    return await queryFn();
  }
}

/**
 * Invalidate a specific cache key
 */
export async function invalidateCache(cacheKey: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (redis) {
      await redis.del(cacheKey);
    }
  } catch {
    // Silent fail — cache invalidation failure is not critical
  }
}

/**
 * Invalidate all cache keys matching a pattern
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    if (!redis) return;

    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch {
    // Silent fail
  }
}

// ============================================================================
// DASHBOARD CACHE — Admin Dashboard (high-frequency)
// ============================================================================

export function getDashboardCacheKey(): string {
  return CACHE_PREFIX.DASHBOARD;
}

export async function getCachedDashboard<T>(
  queryFn: () => Promise<T>,
): Promise<T> {
  return cacheQuery(CACHE_PREFIX.DASHBOARD, queryFn, TTL.SHORT);
}

export async function invalidateDashboardCache(): Promise<void> {
  await invalidateCache(CACHE_PREFIX.DASHBOARD);
}

// ============================================================================
// PLATFORM STATS CACHE — Statistics controller (high-frequency)
// ============================================================================

export function getPlatformStatsCacheKey(): string {
  return CACHE_PREFIX.PLATFORM_STATS;
}

export async function getCachedPlatformStats<T>(
  queryFn: () => Promise<T>,
): Promise<T> {
  return cacheQuery(CACHE_PREFIX.PLATFORM_STATS, queryFn, TTL.SHORT);
}

export async function invalidatePlatformStatsCache(): Promise<void> {
  await invalidateCache(CACHE_PREFIX.PLATFORM_STATS);
}

// ============================================================================
// USER WALLETS CACHE — Per-user wallet data
// ============================================================================

export function getUserWalletsCacheKey(userId: string): string {
  return `${CACHE_PREFIX.USER_WALLETS}:${userId}`;
}

export async function getCachedUserWallets<T>(
  userId: string,
  queryFn: () => Promise<T>,
): Promise<T> {
  return cacheQuery(getUserWalletsCacheKey(userId), queryFn, TTL.MEDIUM);
}

export async function invalidateUserWalletsCache(
  userId: string,
): Promise<void> {
  await invalidateCache(getUserWalletsCacheKey(userId));
}

// ============================================================================
// USER PERMISSIONS CACHE — Per-user permissions (rarely changes)
// ============================================================================

export function getUserPermissionsCacheKey(userId: string): string {
  return `${CACHE_PREFIX.USER_PERMISSIONS}:${userId}`;
}

export async function getCachedUserPermissions<T>(
  userId: string,
  queryFn: () => Promise<T>,
): Promise<T> {
  return cacheQuery(getUserPermissionsCacheKey(userId), queryFn, TTL.LONG);
}

export async function invalidateUserPermissionsCache(
  userId: string,
): Promise<void> {
  await invalidateCache(getUserPermissionsCacheKey(userId));
}

// ============================================================================
// SYSTEM SETTINGS CACHE — Rarely changes, high read frequency
// ============================================================================

export function getSystemSettingsCacheKey(category?: string): string {
  return category
    ? `${CACHE_PREFIX.SYSTEM_SETTINGS}:${category}`
    : CACHE_PREFIX.SYSTEM_SETTINGS;
}

export async function getCachedSystemSettings<T>(
  queryFn: () => Promise<T>,
  category?: string,
): Promise<T> {
  return cacheQuery(getSystemSettingsCacheKey(category), queryFn, TTL.SETTINGS);
}

export async function invalidateSystemSettingsCache(): Promise<void> {
  await invalidateCachePattern(`${CACHE_PREFIX.SYSTEM_SETTINGS}*`);
}

// ============================================================================
// WRITE-THROUGH INVALIDATION HELPERS
// ============================================================================

/**
 * Call this after any transaction write (create, update, cancel)
 * to invalidate relevant caches.
 */
export async function onTransactionWrite(userId: string): Promise<void> {
  await Promise.all([
    invalidateDashboardCache(),
    invalidatePlatformStatsCache(),
    invalidateUserWalletsCache(userId),
  ]);
}

/**
 * Call this after any user write (create, update, delete)
 */
export async function onUserWrite(userId: string): Promise<void> {
  await Promise.all([
    invalidateDashboardCache(),
    invalidatePlatformStatsCache(),
    invalidateUserPermissionsCache(userId),
  ]);
}

/**
 * Call this after wallet operations
 */
export async function onWalletWrite(userId: string): Promise<void> {
  await Promise.all([
    invalidateUserWalletsCache(userId),
    invalidateDashboardCache(),
  ]);
}

/**
 * Call this after system settings change
 */
export async function onSystemSettingsWrite(): Promise<void> {
  await invalidateSystemSettingsCache();
}

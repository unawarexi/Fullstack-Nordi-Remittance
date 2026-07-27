// ============================================================================
// Shared Redis connection helper
// Builds consistent connection options for plain Redis and BullMQ
// ============================================================================
import Redis, { type RedisOptions } from 'ioredis';
import { createRetryStrategy } from '../core/network/retry.ts';

// ============================================================================
// TYPES
// ============================================================================

export interface RedisConnectionParams {
  url?: string;
  host?: string;
  port?: string | number;
  password?: string;
  db?: string | number;
  tls?: boolean;
}

export interface RedisConnectionOptions {
  host?: string;
  port?: number;
  password?: string;
  username?: string;
  db?: number;
  tls?: Record<string, never> | undefined;
}

interface RedisLogger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

interface CreateClientOverrides extends Partial<RedisOptions> {
  logger?: RedisLogger;
}

// ============================================================================
// BUILD REDIS OPTIONS
// ============================================================================

/**
 * Normalise raw env / param values into a flat ioredis-compatible config object.
 * Accepts either a connection URL *or* individual host/port/password/db/tls params.
 */
export function buildRedisOptions(
  params: RedisConnectionParams = {},
): RedisConnectionOptions | string {
  const { url, host, port, password, db, tls } = params;

  const parseDb = (val?: string | number) => {
    if (val == null) return undefined;
    const num = parseInt(String(val), 10);
    return !isNaN(num) ? num : undefined;
  };

  if (url) {
    try {
      const u = new URL(url);
      const dbNum = u.pathname.length > 1 ? parseDb(u.pathname.slice(1)) : undefined;
      return {
        host: u.hostname,
        port: u.port ? parseInt(u.port, 10) : 6379,
        password: u.password ? decodeURIComponent(u.password) : undefined,
        username: u.username ? decodeURIComponent(u.username) : undefined,
        db: dbNum,
        tls: tls ? {} : undefined,
      };
    } catch {
      // If URL parsing fails, return the raw string — ioredis can handle it
      return url;
    }
  }

  return {
    host,
    port: port != null ? parseInt(String(port), 10) : undefined,
    password,
    db: parseDb(db),
    tls: tls ? {} : undefined,
  };
}

export default buildRedisOptions;

// ============================================================================
// DEFAULT LOGGER
// ============================================================================

const defaultLogger: RedisLogger = {
  info: (...args: unknown[]) => console.info(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};

// ============================================================================
// CREATE IOREDIS CLIENT
// ============================================================================

/**
 * Create a fully-configured ioredis client with retry strategy and lifecycle
 * logging.  Used by BullMQ and any service that needs an ioredis connection.
 *
 * @param opts      - Raw connection params or a Redis URL string
 * @param name      - Human-readable label for log messages
 * @param overrides - Extra ioredis options and/or a custom logger
 */
export function createIoredisClient(
  opts: RedisConnectionParams | string = {},
  name: string = 'main',
  overrides: CreateClientOverrides = {},
): Redis {
  const logger: RedisLogger = overrides.logger || defaultLogger;
  const { logger: _omit, ...redisOverrides } = overrides;

  const connection: RedisConnectionOptions | string =
    typeof opts === 'string' ? opts : buildRedisOptions(opts);

  const options: Partial<RedisOptions> = {
    maxRetriesPerRequest: 3,
    keepAlive: 10000,
    family: 4,
    retryStrategy: createRetryStrategy({
      maxRetries: 10,
      baseDelay: 200,
      maxDelay: 5000,
    }),
    lazyConnect: true,
    enableReadyCheck: true,
    ...redisOverrides,
  };

  const redis: Redis =
    typeof connection === 'string'
      ? new Redis(connection, options)
      : new Redis({ ...connection, ...options });

  redis.on('connect', () => logger.info(`Redis [${name}] connected`));
  redis.on('ready', () => logger.info(`Redis [${name}] ready`));
  redis.on('error', (err: Error) => logger.error(`Redis [${name}] error`, err));
  redis.on('close', () => logger.warn(`Redis [${name}] connection closed`));

  return redis;
}

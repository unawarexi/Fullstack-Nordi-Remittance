// ============================================================================
// Nordi-Remittance — Server Init & Lifecycle
// Service bootstrapping, graceful shutdown, and process error handlers
// ============================================================================

import type { Server } from 'http';
import { connectDB, disconnectDB } from './config/dbconfig.js';
import { env } from './config/env.config.js';
import Logger from './logs/logger.js';

// Services
import { initializeWebSocket, disconnectWebSocket } from './services/websocket.service.js';
import { getRedisClient, disconnectRedis } from './services/redis.service.js';
import { startWorkers } from './services/workers.js';
import { disconnectBullMQ } from './services/bullmq.service.js';
import { initializeKafka, getKafkaService } from './services/kafka.service.js';

// Seeders
import { runSeeders } from './scripts/seedAdmin.js';

// Observability
import { initializeSentry } from './logs/sentry.logs.js';
import { initializeElk } from './logs/elkstack.logs.js';

// ============================================================================
// SERVICE STATUS TRACKER
// ============================================================================

export type ServiceHealth = 'up' | 'degraded' | 'down';

export const serviceStatus: Record<string, ServiceHealth> = {
  database: 'down',
  redis: 'down',
  kafka: 'down',
  bullmq: 'down',
  websocket: 'down',
  elk: 'down',
  sentry: 'down',
};

// ============================================================================
// SERVICE BOOTSTRAP — resilient init with isolated error handling
// ============================================================================

/**
 * Attempt to initialise a non-critical service.  On failure the service is
 * marked as `down` in `serviceStatus` and a warning is logged — the server
 * continues to start.
 */
async function initOptionalService(
  name: string,
  key: string,
  fn: () => unknown | Promise<unknown>,
  failureNote: string,
): Promise<void> {
  try {
    await fn();
    serviceStatus[key] = 'up';
  } catch (error) {
    serviceStatus[key] = 'down';
    Logger.warn(`[Startup] ${name} failed — ${failureNote}`, { error });
  }
}

/**
 * Bootstrap every service the server depends on.
 *
 * **MongoDB is the only hard dependency** — if it fails the process exits.
 * Every other service is wrapped in `initOptionalService` so a single
 * unavailable dependency never takes down the whole backend.
 */
export async function bootstrapServices(server: Server): Promise<void> {
  // ── Sentry (non-critical) ──────────────────────────────────────────────
  await initOptionalService(
    'Sentry',
    'sentry',
    () => initializeSentry(),
    'continuing without error tracking',
  );

  // ── MongoDB (CRITICAL) ─────────────────────────────────────────────────
  try {
    await connectDB();
    serviceStatus.database = 'up';
  } catch (error) {
    serviceStatus.database = 'down';
    Logger.error('[Startup] MongoDB connection failed — cannot start server', { error });
    process.exit(1);
  }

  // ── ELK Stack (non-critical) ───────────────────────────────────────────
  await initOptionalService(
    'ELK Stack',
    'elk',
    () => initializeElk(),
    'continuing without centralised logging',
  );

  // ── Database seeders (non-critical) ────────────────────────────────────
  try {
    await runSeeders();
  } catch (error) {
    Logger.warn('[Startup] Database seeding failed — continuing', { error });
  }

  // ── WebSocket (non-critical) ───────────────────────────────────────────
  await initOptionalService(
    'WebSocket',
    'websocket',
    () => initializeWebSocket(server),
    'real-time features unavailable',
  );

  // ── Redis (non-critical) ───────────────────────────────────────────────
  await initOptionalService(
    'Redis',
    'redis',
    () => getRedisClient(),
    'caching / sessions degraded',
  );

  // ── Kafka (non-critical) ───────────────────────────────────────────────
  if (env.KAFKA_BROKERS) {
    await initOptionalService(
      'Kafka',
      'kafka',
      () => initializeKafka(),
      'event streaming unavailable',
    );
  } else {
    serviceStatus.kafka = 'down';
    Logger.warn('[Startup] KAFKA_BROKERS not set — Kafka disabled');
  }

  // ── BullMQ Workers (non-critical) ──────────────────────────────────────
  await initOptionalService(
    'BullMQ Workers',
    'bullmq',
    () => startWorkers(),
    'background jobs unavailable',
  );
}

// ============================================================================
// STARTUP BANNER
// ============================================================================

export function printStartupBanner(port: number, apiPrefix: string): void {
  Logger.info('═'.repeat(60));
  Logger.info('  NORDI-REMITTANCE BACKEND');
  Logger.info('═'.repeat(60));
  Logger.info(`  Environment : ${env.NODE_ENV}`);
  Logger.info(`  Port        : ${port}`);
  Logger.info(`  API Base    : ${apiPrefix}`);
  Logger.info(`  Health      : http://localhost:${port}/health`);
  Logger.info('─'.repeat(60));

  for (const [name, status] of Object.entries(serviceStatus)) {
    const icon = status === 'up' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
    Logger.info(`  ${icon}  ${name}: ${status}`);
  }

  Logger.info('═'.repeat(60));
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

let isShuttingDown = false;

/**
 * Orderly teardown of every connected service.
 * Idempotent — repeated signals are ignored.
 */
export async function gracefulShutdown(
  signal: string,
  server: Server,
): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  Logger.info(`${signal} received — starting graceful shutdown…`);

  // 1. Stop accepting new HTTP connections
  server.close(() => Logger.info('HTTP server closed'));

  // 2. Tear down services in reverse-init order
  const shutdownSteps: Array<{ name: string; fn: () => unknown | Promise<unknown> }> = [
    { name: 'WebSocket', fn: async () => { await disconnectWebSocket(); } },
    { name: 'BullMQ',    fn: async () => { await disconnectBullMQ(); } },
    { name: 'Redis',     fn: async () => { await disconnectRedis(); } },
    {
      name: 'Kafka',
      fn: async () => {
        const kafka = getKafkaService();
        await kafka.disconnect();
      },
    },
    { name: 'MongoDB',   fn: async () => { await disconnectDB(); } },
  ];

  for (const step of shutdownSteps) {
    try {
      await step.fn();
      Logger.info(`${step.name} disconnected`);
    } catch (error) {
      Logger.error(`Error disconnecting ${step.name}`, { error });
    }
  }

  Logger.info('Graceful shutdown completed');
  process.exit(0);
}

// ============================================================================
// PROCESS ERROR HANDLERS
// ============================================================================

/**
 * Wire up process-level signal and error handlers.
 * Call once during server startup.
 */
export function registerProcessHandlers(server: Server): void {
  // Shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
  process.on('SIGINT', () => gracefulShutdown('SIGINT', server));

  // Uncaught exceptions — attempt graceful shutdown then exit
  process.on('uncaughtException', (error: Error) => {
    Logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    gracefulShutdown('uncaughtException', server);
  });

  // Unhandled rejections — log but don't kill the process
  process.on('unhandledRejection', (reason: unknown) => {
    Logger.error('Unhandled Rejection', { reason });
  });
}

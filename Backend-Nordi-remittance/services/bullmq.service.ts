// ============================================================================
// Nordi-Remittance — BullMQ Service
// Job queues for emails, notifications, transactions, KYC, fraud, and cleanup
// ============================================================================

import { Queue, Worker, type Processor, type WorkerOptions, type JobsOptions } from "bullmq";
import { env } from "../config/env.config";
import { BullQueues } from "../config/constants";
import { createIoredisClient } from "../config/redis.config";
import { createLogger } from "../logs/logger";

const log = createLogger("BullMQ");

type QueueName = keyof typeof BullQueues;

const queues: Partial<Record<QueueName, Queue>> = {};
const workers: Partial<Record<QueueName, Worker>> = {};

// ============================================================================
// REDIS CONNECTION FOR BULLMQ
// Uses shared buildRedisOptions from redis.config.ts
// BullMQ requires maxRetriesPerRequest: null (ioredis-style config)
// ============================================================================

let sharedBullConnection: any = null;

function getConnection() {
  if (sharedBullConnection) return sharedBullConnection;

  sharedBullConnection = createIoredisClient(
    env.BULLMQ_REDIS_URL
      ? env.BULLMQ_REDIS_URL
      : {
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          password: env.REDIS_PASSWORD,
          db: env.REDIS_DB,
        },
    "BullMQ",
    {
      maxRetriesPerRequest: null as any, // REQUIRED BY BULLMQ FOR BLOCKING JOBS
      keepAlive: 10000,                  // Prevents Redis Cloud proxy from killing idle job sockets
      family: 4,                         // Forces IPv4 to avoid DNS fallback timeouts
      enableReadyCheck: false,           // Prevents command blocking issues during job polling
    },
  );

  return sharedBullConnection;
}

// ============================================================================
// INITIALIZATION — creates all queues defined in BullQueues constant
// ============================================================================

export function initQueues(): Partial<Record<QueueName, Queue>> {
  const connection = getConnection();

  for (const [name, queueName] of Object.entries(BullQueues) as [QueueName, string][]) {
    queues[name] = new Queue(queueName, {
      connection,
      defaultJobOptions: {
        removeOnComplete: { age: 3600, count: 1000 },
        removeOnFail: { age: 86400, count: 5000 },
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
      },
    });
  }

  log.success("BullMQ queues initialized", {
    queues: Object.keys(BullQueues) as unknown as Record<string, unknown>,
  });
  return queues;
}

// ============================================================================
// ADD JOB
// ============================================================================

export async function addJob<T = unknown>(
  queueName: QueueName,
  jobName: string,
  data: T,
  options: JobsOptions = {},
) {
  const queue = queues[queueName];
  if (!queue) throw new Error(`Queue "${queueName}" not initialised — call initQueues() first`);

  const job = await queue.add(jobName, data, options);
  log.debug(`Job added: ${queueName}/${jobName}`, { jobId: job.id } as Record<string, unknown>);
  return job;
}

// ============================================================================
// REGISTER WORKER
// ============================================================================

export function registerWorker(
  queueName: QueueName,
  processor: Processor,
  options: Partial<WorkerOptions> & { concurrency?: number } = {},
): Worker {
  const connection = getConnection();
  const bullQueueName = BullQueues[queueName];
  if (!bullQueueName) throw new Error(`Queue "${queueName}" not found in BullQueues`);

  const { concurrency = 5, ...rest } = options;

  const worker = new Worker(bullQueueName, processor, {
    connection,
    concurrency,
    ...rest,
  });

  worker.on("completed", (job) => {
    log.debug(`Job completed: ${bullQueueName}/${job.name}`, { jobId: job.id } as Record<string, unknown>);
  });

  worker.on("failed", (job, err) => {
    log.error(`Job failed: ${bullQueueName}/${job?.name}`, {
      jobId: job?.id,
      error: err.message,
    } as Record<string, unknown>);
  });

  workers[queueName] = worker;
  log.info(`Worker registered: ${bullQueueName}`);
  return worker;
}

// ============================================================================
// GETTERS
// ============================================================================

export function getQueue(name: QueueName): Queue | undefined {
  return queues[name];
}

// ============================================================================
// REMOVE JOB BY ID
// ============================================================================

export async function removeJob(queueName: QueueName, jobId: string): Promise<void> {
  const queue = queues[queueName];
  if (!queue) return;

  try {
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      log.debug(`Job removed: ${queueName}/${jobId}`);
    }
  } catch (err) {
    log.debug(`Could not remove job ${queueName}/${jobId}`, {
      error: (err as Error).message,
    } as Record<string, unknown>);
  }
}

// ============================================================================
// GRACEFUL DISCONNECT
// ============================================================================

export async function disconnectBullMQ(): Promise<void> {
  for (const worker of Object.values(workers) as Worker[]) {
    await worker.close();
  }
  for (const queue of Object.values(queues) as Queue[]) {
    await queue.close();
  }
  if (sharedBullConnection) {
    await sharedBullConnection.quit().catch(() => {});
    sharedBullConnection = null;
  }
  log.info("BullMQ disconnected");
}

export default {
  initQueues,
  addJob,
  removeJob,
  registerWorker,
  getQueue,
  disconnectBullMQ,
};
// ============================================================================
// Nordi-Remittance — Kafka Service
// Production-grade message bus for heavy processing & event-driven architecture
// ============================================================================

import {
  Kafka,
  Producer,
  Consumer,
  Admin,
  logLevel,
  CompressionTypes,
  EachMessagePayload,
  KafkaMessage,
} from "kafkajs";
import { env } from "../config/env.config.js";
import Logger from "../logs/logger.js";
import crypto from "crypto";

// ============================================================================
// TOPICS
// ============================================================================

export const KafkaTopics = {
  // Transactions
  TRANSACTION_INITIATED: "nordi.transaction.initiated",
  TRANSACTION_PROCESSED: "nordi.transaction.processed",
  TRANSACTION_COMPLETED: "nordi.transaction.completed",
  TRANSACTION_FAILED: "nordi.transaction.failed",

  // KYC & Compliance
  KYC_SUBMITTED: "nordi.kyc.submitted",
  KYC_VERIFIED: "nordi.kyc.verified",
  KYC_REJECTED: "nordi.kyc.rejected",
  FRAUD_ALERT: "nordi.security.fraud_alert",

  // User Lifecycle
  USER_REGISTERED: "nordi.user.registered",
  USER_LOGGED_IN: "nordi.user.login",
  USER_DELETED: "nordi.user.deleted",

  // Notifications
  NOTIFICATIONS_PUSH: "nordi.notifications.push",
  NOTIFICATIONS_EMAIL: "nordi.notifications.email",

  // Documents and Audit
  DOCUMENT_EVENTS: "nordi.document.events",
  AUDIT_EVENTS: "nordi.audit.events",
  ANALYTICS_EVENTS: "nordi.analytics.events",
  NOTIFICATIONS_SMS: "nordi.notifications.sms",

  // Dead letter queue
  DLQ: "nordi.dlq",
} as const;

export type KafkaTopic = (typeof KafkaTopics)[keyof typeof KafkaTopics];

// ============================================================================
// TYPES
// ============================================================================

export interface KafkaEvent<T = unknown> {
  eventId: string;
  topic: KafkaTopic;
  timestamp: number;
  source: string;
  payload: T;
  metadata?: Record<string, string>;
  retryCount?: number;
}

interface ConsumerHandler {
  topic: KafkaTopic | KafkaTopic[];
  groupId?: string;
  handler: (event: KafkaEvent, rawMessage: KafkaMessage) => Promise<void>;
  options?: {
    maxRetries?: number;
    retryDelayMs?: number;
    batchSize?: number;
  };
}

// ============================================================================
// KAFKA SERVICE
// ============================================================================

class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumers: Map<string, Consumer> = new Map();
  private admin: Admin | null = null;
  private isProducerConnected = false;
  private isShuttingDown = false;

  constructor() {
    const brokers = env.KAFKA_BROKERS.split(",").map((b: string) => b.trim());

    this.kafka = new Kafka({
      clientId: env.KAFKA_CLIENT_ID,
      brokers,
      logLevel: env.NODE_ENV === "production" ? logLevel.WARN : logLevel.INFO,
      retry: {
        initialRetryTime: 300,
        retries: 10,
        maxRetryTime: 30000,
        factor: 2,
      },
      ...(env.KAFKA_SSL && {
        ssl: true,
        sasl: {
          mechanism: "plain" as const,
          username: env.KAFKA_SASL_USERNAME || "",
          password: env.KAFKA_SASL_PASSWORD || "",
        },
      }),
    });

    this.setupGracefulShutdown();
  }

  // --------------------------------------------------------------------------
  // ADMIN — Topic Management
  // --------------------------------------------------------------------------

  async ensureTopics(): Promise<void> {
    try {
      this.admin = this.kafka.admin();
      await this.admin.connect();

      const existingTopics = await this.admin.listTopics();
      const allTopics = Object.values(KafkaTopics);
      const missingTopics = allTopics.filter(
        (t) => !existingTopics.includes(t),
      );

      if (missingTopics.length > 0) {
        await this.admin.createTopics({
          waitForLeaders: true,
          topics: missingTopics.map((topic) => ({
            topic,
            numPartitions: 3,
            replicationFactor: env.NODE_ENV === "production" ? 3 : 1,
            configEntries: [
              {
                name: "retention.ms",
                value: topic === KafkaTopics.DLQ ? "604800000" : "86400000",
              },
              { name: "cleanup.policy", value: "delete" },
            ],
          })),
        });
        Logger.info(`[Kafka] Created topics: ${missingTopics.join(", ")}`);
      }

      await this.admin.disconnect();
    } catch (error) {
      Logger.error("[Kafka] Failed to ensure topics", { error });
    }
  }

  // --------------------------------------------------------------------------
  // PRODUCER
  // --------------------------------------------------------------------------

  async connectProducer(): Promise<void> {
    if (this.isProducerConnected) return;

    try {
      this.producer = this.kafka.producer({
        idempotent: true,
        maxInFlightRequests: 5,
        transactionTimeout: 30000,
        allowAutoTopicCreation: false,
      });

      this.producer.on("producer.connect", () => {
        Logger.info("[Kafka] Producer connected");
        this.isProducerConnected = true;
      });

      this.producer.on("producer.disconnect", () => {
        Logger.warn("[Kafka] Producer disconnected");
        this.isProducerConnected = false;
      });

      await this.producer.connect();
    } catch (error) {
      Logger.error("[Kafka] Producer connection failed", { error });
      throw error;
    }
  }

  async publish<T>(
    topic: KafkaTopic,
    payload: T,
    key?: string,
    headers?: Record<string, string>,
  ): Promise<void> {
    if (!this.producer || !this.isProducerConnected) {
      await this.connectProducer();
    }

    const event: KafkaEvent<T> = {
      eventId: crypto.randomUUID(),
      topic,
      timestamp: Date.now(),
      source: env.KAFKA_CLIENT_ID,
      payload,
      metadata: headers,
    };

    try {
      await this.producer!.send({
        topic,
        compression: CompressionTypes.GZIP,
        messages: [
          {
            key: key || event.eventId,
            value: JSON.stringify(event),
            headers: {
              "event-id": event.eventId,
              source: event.source,
              timestamp: String(event.timestamp),
              ...headers,
            },
          },
        ],
      });
    } catch (error) {
      Logger.error(`[Kafka] Failed to publish to ${topic}`, { error });
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // CONSUMER
  // --------------------------------------------------------------------------

  async subscribe(config: ConsumerHandler): Promise<void> {
    const groupId = config.groupId || env.KAFKA_GROUP_ID;
    const maxRetries = config.options?.maxRetries ?? 3;
    const retryDelayMs = config.options?.retryDelayMs ?? 1000;

    try {
      const consumer = this.kafka.consumer({
        groupId,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        maxWaitTimeInMs: 5000,
        retry: { retries: 5 },
      });

      await consumer.connect();
      Logger.info(`[Kafka] Consumer "${groupId}" connected`);

      const topics = Array.isArray(config.topic)
        ? config.topic
        : [config.topic];
      for (const topic of topics) {
        await consumer.subscribe({ topic, fromBeginning: false });
      }

      await consumer.run({
        autoCommit: true,
        autoCommitInterval: 5000,
        eachMessage: async ({
          topic,
          partition,
          message,
        }: EachMessagePayload) => {
          const raw = message.value?.toString();
          if (!raw) return;

          let event: KafkaEvent;
          try {
            event = JSON.parse(raw);
          } catch {
            Logger.error(`[Kafka] Invalid JSON in ${topic}[${partition}]`);
            return;
          }

          try {
            await config.handler(event, message);
          } catch (error) {
            const retryCount = event.retryCount || 0;
            Logger.error(
              `[Kafka] Handler error on ${topic} (retry ${retryCount}/${maxRetries})`,
              { error },
            );

            if (retryCount < maxRetries) {
              await new Promise((r) =>
                setTimeout(r, retryDelayMs * (retryCount + 1)),
              );
              event.retryCount = retryCount + 1;
              await this.publish(
                topic as KafkaTopic,
                event.payload,
                message.key?.toString(),
                {
                  "retry-count": String(event.retryCount),
                  "original-event-id": event.eventId,
                },
              );
            } else {
              await this.publishToDLQ(event, topic, error);
            }
          }
        },
      });

      this.consumers.set(groupId, consumer);
    } catch (error) {
      Logger.error(`[Kafka] Consumer "${groupId}" failed to start`, { error });
      throw error;
    }
  }

  private async publishToDLQ(
    event: KafkaEvent,
    originalTopic: string,
    error: unknown,
  ): Promise<void> {
    try {
      await this.publish(KafkaTopics.DLQ, {
        originalTopic,
        originalEvent: event,
        error: error instanceof Error ? error.message : String(error),
        failedAt: new Date().toISOString(),
      });
      Logger.warn(
        `[Kafka] Event ${event.eventId} sent to DLQ from ${originalTopic}`,
      );
    } catch (dlqError) {
      Logger.error("[Kafka] Failed to publish to DLQ", { error: dlqError });
    }
  }

  // --------------------------------------------------------------------------
  // HEALTH & LIFECYCLE
  // --------------------------------------------------------------------------

  async healthCheck(): Promise<{
    connected: boolean;
    brokers: number;
    topics: string[];
  }> {
    try {
      const admin = this.kafka.admin();
      await admin.connect();
      const metadata = await admin.describeCluster();
      const topics = await admin.listTopics();
      await admin.disconnect();

      return {
        connected: true,
        brokers: metadata.brokers.length,
        topics: topics.filter((t) => t.startsWith("nordi.")),
      };
    } catch {
      return { connected: false, brokers: 0, topics: [] };
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      Logger.info("[Kafka] Shutting down...");

      for (const [groupId, consumer] of this.consumers) {
        try {
          await consumer.disconnect();
          Logger.info(`[Kafka] Consumer "${groupId}" disconnected`);
        } catch (error) {
          Logger.error(
            `[Kafka] Error disconnecting consumer "${groupId}"`,
            { error },
          );
        }
      }

      if (this.producer) {
        try {
          await this.producer.disconnect();
        } catch (error) {
          Logger.error("[Kafka] Error disconnecting producer", { error });
        }
      }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  }

  async disconnect(): Promise<void> {
    for (const [, consumer] of this.consumers) {
      await consumer.disconnect();
    }
    this.consumers.clear();

    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
      this.isProducerConnected = false;
    }
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let kafkaServiceInstance: KafkaService | null = null;

export function getKafkaService(): KafkaService {
  if (!kafkaServiceInstance) {
    kafkaServiceInstance = new KafkaService();
  }
  return kafkaServiceInstance;
}

export async function initializeKafka(): Promise<KafkaService> {
  const service = getKafkaService();
  await service.ensureTopics();
  await service.connectProducer();
  Logger.info("[Kafka] ✅ Initialized successfully");
  return service;
}

export { KafkaService };
export default KafkaService;

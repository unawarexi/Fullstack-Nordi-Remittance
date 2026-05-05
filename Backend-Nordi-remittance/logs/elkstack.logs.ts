// ============================================================================
// Nordi Remittance — ELK Stack Integration
// Elasticsearch + Logstash + Kibana observability layer
//
// Architecture:
//   Winston logger → NordiElkTransport → Elasticsearch REST API (via axios)
//   All log lines are also written to JSON files for Filebeat pickup.
//
// Index pattern: nordi-logs-YYYY.MM.DD  (daily rotation, matches standard ELK)
// ============================================================================

import axios, { AxiosInstance } from "axios";
import Transport from "winston-transport";
import winston from "winston";
import { env } from "../config/env.config.js";
import { addElkTransport } from "./logger.js";
import { createLogger } from "./logger.js";

const log = createLogger("ELK");

// ============================================================================
// TYPES
// ============================================================================

export interface ElkLogDocument {
  "@timestamp": string;
  service: string;
  environment: string;
  level: string;
  message: string;
  context?: string;
  requestId?: string;
  userId?: string;
  transactionId?: string;
  walletId?: string;
  fraudCaseId?: string;
  kycId?: string;
  ipAddress?: string;
  meta?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface TransactionLogData {
  transactionId: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  senderId?: string;
  recipientId?: string;
  walletId?: string;
  fee?: number;
  exchangeRate?: number;
  durationMs?: number;
  meta?: Record<string, unknown>;
}

export interface FraudSignalData {
  fraudCaseId?: string;
  transactionId?: string;
  userId?: string;
  severity: "low" | "medium" | "high" | "critical";
  signalType: string;
  score?: number;
  flags?: string[];
  action?: string;
  meta?: Record<string, unknown>;
}

export interface KycEventData {
  kycId?: string;
  userId: string;
  event:
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "expired"
    | "document_uploaded";
  tier?: number;
  provider?: string;
  country?: string;
  rejectionReason?: string;
  meta?: Record<string, unknown>;
}

export interface SecurityEventData {
  userId?: string;
  event: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  severity?: "info" | "warn" | "critical";
  meta?: Record<string, unknown>;
}

// ============================================================================
// DAILY INDEX HELPER
// ============================================================================

function dailyIndex(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return `${env.ELASTICSEARCH_INDEX}-${yyyy}.${mm}.${dd}`;
}

// ============================================================================
// ELASTICSEARCH CLIENT
// ============================================================================

class ElkClient {
  private client: AxiosInstance | null = null;
  private connected = false;

  initialize(): void {
    if (!env.ELASTICSEARCH_URL) return;

    const auth =
      env.ELASTICSEARCH_USERNAME && env.ELASTICSEARCH_PASSWORD
        ? {
            username: env.ELASTICSEARCH_USERNAME,
            password: env.ELASTICSEARCH_PASSWORD,
          }
        : undefined;

    this.client = axios.create({
      baseURL: env.ELASTICSEARCH_URL,
      timeout: 5000,
      headers: { "Content-Type": "application/json" },
      auth,
    });
  }

  async connect(): Promise<boolean> {
    if (!this.client) return false;
    try {
      const res = await this.client.get("/_cluster/health");
      const status: string = res.data?.status ?? "red";
      this.connected = status === "green" || status === "yellow";
      return this.connected;
    } catch {
      this.connected = false;
      return false;
    }
  }

  async index(doc: ElkLogDocument): Promise<void> {
    if (!this.client || !this.connected) return;
    try {
      await this.client.post(`/${dailyIndex()}/_doc`, doc);
    } catch {
      // Fire-and-forget: never let ELK errors crash the application
    }
  }

  async bulkIndex(docs: ElkLogDocument[]): Promise<void> {
    if (!this.client || !this.connected || docs.length === 0) return;
    try {
      const body = docs.flatMap((doc) => [
        { index: { _index: dailyIndex() } },
        doc,
      ]);
      await this.client.post("/_bulk", body.map((l) => JSON.stringify(l)).join("\n") + "\n", {
        headers: { "Content-Type": "application/x-ndjson" },
      });
    } catch {
      // Fire-and-forget
    }
  }

  async clusterHealth(): Promise<Record<string, unknown> | null> {
    if (!this.client) return null;
    try {
      const res = await this.client.get("/_cluster/health");
      return res.data as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  async ensureIndexTemplate(): Promise<void> {
    if (!this.client || !this.connected) return;
    const templateName = "nordi-logs-template";
    try {
      // Only create if it doesn't exist
      await this.client.get(`/_index_template/${templateName}`);
    } catch {
      // Template not found — create it
      try {
        await this.client.put(`/_index_template/${templateName}`, {
          index_patterns: [`${env.ELASTICSEARCH_INDEX}-*`],
          template: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 1,
              "index.lifecycle.name": "nordi-logs-policy",
            },
            mappings: {
              properties: {
                "@timestamp": { type: "date" },
                service: { type: "keyword" },
                environment: { type: "keyword" },
                level: { type: "keyword" },
                message: { type: "text", fields: { keyword: { type: "keyword" } } },
                context: { type: "keyword" },
                requestId: { type: "keyword" },
                userId: { type: "keyword" },
                transactionId: { type: "keyword" },
                walletId: { type: "keyword" },
                fraudCaseId: { type: "keyword" },
                kycId: { type: "keyword" },
                ipAddress: { type: "ip", ignore_malformed: true },
                meta: { type: "object", enabled: false },
                "error.message": { type: "text" },
                "error.stack": { type: "text", index: false },
                "error.code": { type: "keyword" },
              },
            },
          },
        });
      } catch {
        // Non-fatal — the index will still be created, just without the template
      }
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  markDisconnected(): void {
    this.connected = false;
  }
}

// Singleton client
const elkClient = new ElkClient();

// ============================================================================
// CUSTOM WINSTON TRANSPORT
// Plugged into the winston Logger via addElkTransport() at startup
// ============================================================================

class NordiElkTransport extends Transport {
  // Small in-memory buffer so bursts don't hammer ES with individual POSTs
  private buffer: ElkLogDocument[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly FLUSH_INTERVAL_MS = 2000;
  private readonly MAX_BUFFER_SIZE = 50;

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
    this.scheduleFlush();
  }

  log(info: winston.Logform.TransformableInfo, callback: () => void): void {
    setImmediate(() => this.emit("logged", info));

    const meta = (info.meta as Record<string, unknown>) ?? {};
    const doc: ElkLogDocument = {
      "@timestamp": new Date().toISOString(),
      service: "nordi-remittance-api",
      environment: process.env.NODE_ENV ?? "development",
      level: info.level as string,
      message: info.message as string,
      context: meta.context as string | undefined,
      requestId: meta.requestId as string | undefined,
      userId: meta.userId as string | undefined,
      transactionId: meta.transactionId as string | undefined,
      walletId: meta.walletId as string | undefined,
      fraudCaseId: meta.fraudCaseId as string | undefined,
      kycId: meta.kycId as string | undefined,
      ipAddress: meta.ipAddress as string | undefined,
      meta: Object.keys(meta).length > 0 ? meta : undefined,
    };

    if (info.level === "error" && info[Symbol.for("splat")]) {
      const splat = info[Symbol.for("splat")] as unknown[];
      const err = splat?.[0];
      if (err instanceof Error) {
        doc.error = {
          message: err.message,
          stack: err.stack,
          code: (err as NodeJS.ErrnoException).code,
        };
      }
    }

    this.buffer.push(doc);
    if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
      void this.flush();
    }

    callback();
  }

  private scheduleFlush(): void {
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, this.FLUSH_INTERVAL_MS);
    // Don't keep the process alive for flushing
    if (this.flushTimer.unref) this.flushTimer.unref();
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.buffer.length);
    await elkClient.bulkIndex(batch);
  }

  async close(): Promise<void> {
    if (this.flushTimer) clearInterval(this.flushTimer);
    await this.flush(); // drain remaining buffer on graceful shutdown
  }
}

// ============================================================================
// INITIALISATION
// Call this once at application startup (before routes)
// ============================================================================

export async function initializeElk(): Promise<void> {
  if (!env.ELASTICSEARCH_URL) {
    log.info(
      "ELASTICSEARCH_URL not set — ELK transport disabled. " +
        "JSON logs are still written to logs/all.log for Filebeat.",
    );
    return;
  }

  elkClient.initialize();
  const reachable = await elkClient.connect();

  if (!reachable) {
    log.warn("Elasticsearch not reachable at startup — ELK transport disabled.", {
      url: env.ELASTICSEARCH_URL,
    });
    return;
  }

  await elkClient.ensureIndexTemplate();

  const transport = new NordiElkTransport({ level: "info" });
  addElkTransport(transport);

  log.info("ELK transport connected.", {
    url: env.ELASTICSEARCH_URL,
    index: dailyIndex(),
  });
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function checkElkHealth(): Promise<{
  connected: boolean;
  status?: string;
  clusterName?: string;
  activeShards?: number;
}> {
  if (!env.ELASTICSEARCH_URL) return { connected: false };

  const health = await elkClient.clusterHealth();
  if (!health) return { connected: false };

  return {
    connected: true,
    status: health.status as string,
    clusterName: health.cluster_name as string,
    activeShards: health.active_shards as number,
  };
}

// ============================================================================
// STRUCTURED BUSINESS-EVENT LOGGERS
// These index directly (bypassing the winston buffer) for high-priority events
// so they appear in Kibana immediately.
// ============================================================================

export async function logTransaction(data: TransactionLogData): Promise<void> {
  await elkClient.index({
    "@timestamp": new Date().toISOString(),
    service: "nordi-remittance-api",
    environment: process.env.NODE_ENV ?? "development",
    level: "info",
    message: `Transaction ${data.status}: ${data.type} ${data.amount} ${data.currency}`,
    transactionId: data.transactionId,
    walletId: data.walletId,
    userId: data.senderId,
    meta: data as unknown as Record<string, unknown>,
  });
}

export async function logFraudSignal(signal: FraudSignalData): Promise<void> {
  await elkClient.index({
    "@timestamp": new Date().toISOString(),
    service: "nordi-remittance-api",
    environment: process.env.NODE_ENV ?? "development",
    level: signal.severity === "critical" || signal.severity === "high" ? "error" : "warn",
    message: `Fraud signal [${signal.severity}]: ${signal.signalType}`,
    transactionId: signal.transactionId,
    fraudCaseId: signal.fraudCaseId,
    userId: signal.userId,
    meta: signal as unknown as Record<string, unknown>,
  });
}

export async function logKycEvent(data: KycEventData): Promise<void> {
  await elkClient.index({
    "@timestamp": new Date().toISOString(),
    service: "nordi-remittance-api",
    environment: process.env.NODE_ENV ?? "development",
    level: "info",
    message: `KYC ${data.event} for user ${data.userId}`,
    kycId: data.kycId,
    userId: data.userId,
    meta: data as unknown as Record<string, unknown>,
  });
}

export async function logSecurityEvent(data: SecurityEventData): Promise<void> {
  await elkClient.index({
    "@timestamp": new Date().toISOString(),
    service: "nordi-remittance-api",
    environment: process.env.NODE_ENV ?? "development",
    level: data.severity === "critical" ? "error" : data.severity ?? "info",
    message: `Security event: ${data.event}`,
    userId: data.userId,
    requestId: data.requestId,
    ipAddress: data.ipAddress,
    meta: data as unknown as Record<string, unknown>,
  });
}

export async function logError(
  error: Error,
  context: {
    requestId?: string;
    userId?: string;
    transactionId?: string;
    action?: string;
    meta?: Record<string, unknown>;
  } = {},
): Promise<void> {
  await elkClient.index({
    "@timestamp": new Date().toISOString(),
    service: "nordi-remittance-api",
    environment: process.env.NODE_ENV ?? "development",
    level: "error",
    message: error.message,
    requestId: context.requestId,
    userId: context.userId,
    transactionId: context.transactionId,
    meta: context.meta,
    error: {
      message: error.message,
      stack: error.stack,
      code: (error as NodeJS.ErrnoException).code,
    },
  });
}


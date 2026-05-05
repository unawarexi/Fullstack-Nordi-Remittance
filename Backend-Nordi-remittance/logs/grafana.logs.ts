
// ============================================================================
// Nordi Remittance — Grafana Dashboard Config & Health Endpoints
// Dashboard provisioning, system health checks, and K8s probes
// ============================================================================

import os from "os";
import mongoose from "mongoose";
import { getRedisClient } from "../services/redis.service.js";
import { checkElkHealth } from "./elkstack.logs.js";
import { createLogger } from "./logger.js";
import type { Request, Response } from "express";

const log = createLogger("Health");

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

export async function healthCheckEndpoint(_req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const services: Record<string, { status: string; latencyMs?: number; reason?: string }> = {};

  // --- Redis Health ---
  try {
    const redis = await getRedisClient();
    const redisStart = Date.now();
    await redis.ping();
    services.redis = { status: "up", latencyMs: Date.now() - redisStart };
  } catch (err) {
    services.redis = { status: "down", reason: (err as Error).message };
  }

  // --- MongoDB Health ---
  try {
    const dbStart = Date.now();
    const state = mongoose.connection.readyState;
    // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    if (state === 1) {
      await mongoose.connection.db?.command({ ping: 1 });
      services.mongodb = { status: "up", latencyMs: Date.now() - dbStart };
    } else {
      const stateLabel = ["disconnected", "connected", "connecting", "disconnecting"][state] ?? "unknown";
      services.mongodb = { status: "down", reason: `mongoose readyState=${stateLabel}` };
    }
  } catch (err) {
    services.mongodb = { status: "down", reason: (err as Error).message };
  }

  // --- Elasticsearch / ELK Health ---
  try {
    const elk = await checkElkHealth();
    if (elk.connected) {
      services.elasticsearch = { status: elk.status === "red" ? "degraded" : "up" };
    } else {
      services.elasticsearch = { status: "unavailable" };
    }
  } catch {
    services.elasticsearch = { status: "unavailable" };
  }

  // --- System Info ---
  const mem = process.memoryUsage();
  const system = {
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch(),
    cpuCount: os.cpus().length,
    memoryUsage: {
      heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(2),
      rssMB: (mem.rss / 1024 / 1024).toFixed(2),
      externalMB: (mem.external / 1024 / 1024).toFixed(2),
      percentUsed: ((mem.heapUsed / mem.heapTotal) * 100).toFixed(1),
    },
    loadAverage: os.loadavg().map((v) => parseFloat(v.toFixed(2))),
    freeMemoryMB: (os.freemem() / 1024 / 1024).toFixed(2),
    totalMemoryMB: (os.totalmem() / 1024 / 1024).toFixed(2),
  };

  // --- Overall Status ---
  const statuses = Object.values(services).map((s) => s.status);
  const allUp = statuses.every((s) => s === "up");
  const anyDown = statuses.some((s) => s === "down");
  const overallStatus = allUp ? "healthy" : anyDown ? "unhealthy" : "degraded";

  const healthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version ?? "0.0.0",
    environment: process.env.NODE_ENV ?? "development",
    services,
    system,
  };

  const statusCode = overallStatus === "healthy" ? 200 : 503;
  res.status(statusCode).json(healthResponse);

  log.debug("Health check completed", {
    duration: `${Date.now() - startTime}ms`,
    status: overallStatus,
  });
}

// ============================================================================
// K8S PROBES
// ============================================================================

export function livenessProbe(_req: Request, res: Response): void {
  res.status(200).json({ status: "alive", uptime: Math.floor(process.uptime()) });
}

export async function readinessProbe(_req: Request, res: Response): Promise<void> {
  const checks: Array<{ name: string; ok: boolean; reason?: string }> = [];

  try {
    const redis = await getRedisClient();
    const pong = await redis.ping();
    checks.push({ name: "redis", ok: pong === "PONG" });
  } catch (err) {
    checks.push({ name: "redis", ok: false, reason: (err as Error).message });
  }

  const mongoState = mongoose.connection.readyState;
  checks.push({
    name: "mongodb",
    ok: mongoState === 1,
    reason: mongoState !== 1 ? `readyState=${mongoState}` : undefined,
  });

  const allReady = checks.every((c) => c.ok);
  if (allReady) {
    res.status(200).json({ status: "ready", checks });
  } else {
    const failed = checks.reduce((acc: string[], c) => { if (!c.ok) acc.push(c.name); return acc; }, []);
    res.status(503).json({ status: "not ready", checks, failed });
  }
}

// ============================================================================
// GRAFANA DASHBOARD PROVISIONING CONFIG
// Metric names match the nordi_ prefix defined in prometheus.logs.ts.
// ============================================================================

export function getGrafanaDashboardConfig() {
  return {
    dashboard: {
      id: null,
      uid: "nordi-api-overview",
      title: "Nordi Remittance — API Overview",
      tags: ["nordi", "api", "production", "remittance"],
      timezone: "browser",
      refresh: "30s",
      time: { from: "now-1h", to: "now" },
      panels: [
        // Row 1: HTTP Layer
        {
          title: "Request Rate (req/s)",
          type: "timeseries",
          gridPos: { h: 8, w: 8, x: 0, y: 0 },
          targets: [{ expr: "rate(nordi_http_requests_total[5m])", legendFormat: "{{method}} {{route}}" }],
        },
        {
          title: "HTTP Response Time p95 (s)",
          type: "timeseries",
          gridPos: { h: 8, w: 8, x: 8, y: 0 },
          targets: [
            { expr: "histogram_quantile(0.95, rate(nordi_http_request_duration_seconds_bucket[5m]))", legendFormat: "p95" },
            { expr: "histogram_quantile(0.50, rate(nordi_http_request_duration_seconds_bucket[5m]))", legendFormat: "p50" },
          ],
        },
        {
          title: "HTTP Error Rate (%)",
          type: "stat",
          gridPos: { h: 8, w: 8, x: 16, y: 0 },
          targets: [{ expr: "rate(nordi_http_requests_total{status_code=~\"5..\"}[5m]) / rate(nordi_http_requests_total[5m]) * 100", legendFormat: "5xx %" }],
        },
        // Row 2: Transactions
        {
          title: "Transaction Rate (tx/s)",
          type: "timeseries",
          gridPos: { h: 8, w: 8, x: 0, y: 8 },
          targets: [{ expr: "rate(nordi_transactions_total[5m])", legendFormat: "{{type}} / {{status}}" }],
        },
        {
          title: "Transaction Processing Time p95 (s)",
          type: "timeseries",
          gridPos: { h: 8, w: 8, x: 8, y: 8 },
          targets: [{ expr: "histogram_quantile(0.95, rate(nordi_transaction_processing_seconds_bucket[5m]))", legendFormat: "{{type}} p95" }],
        },
        {
          title: "Transaction Volume by Currency",
          type: "timeseries",
          gridPos: { h: 8, w: 8, x: 16, y: 8 },
          targets: [{ expr: "rate(nordi_transaction_volume_total[5m])", legendFormat: "{{currency}} {{type}}" }],
        },
        // Row 3: KYC & Errors
        {
          title: "KYC Pipeline",
          type: "timeseries",
          gridPos: { h: 8, w: 8, x: 0, y: 16 },
          targets: [
            { expr: "rate(nordi_kyc_submissions_total[5m])", legendFormat: "submissions/s" },
            { expr: "rate(nordi_kyc_results_total{status=\"approved\"}[5m])", legendFormat: "approved/s" },
            { expr: "rate(nordi_kyc_results_total{status=\"rejected\"}[5m])", legendFormat: "rejected/s" },
          ],
        },
        {
          title: "Application Errors by Type",
          type: "timeseries",
          gridPos: { h: 8, w: 8, x: 8, y: 16 },
          targets: [{ expr: "rate(nordi_errors_total[5m])", legendFormat: "{{type}} / {{code}}" }],
        },
        {
          title: "Active User Sessions",
          type: "gauge",
          gridPos: { h: 8, w: 8, x: 16, y: 16 },
          targets: [{ expr: "nordi_active_sessions", legendFormat: "sessions" }],
        },
        // Row 4: Real-time & Users
        {
          title: "WebSocket Connections",
          type: "gauge",
          gridPos: { h: 8, w: 6, x: 0, y: 24 },
          targets: [{ expr: "nordi_ws_connections", legendFormat: "connections" }],
        },
        {
          title: "WS Messages In/Out (msg/s)",
          type: "timeseries",
          gridPos: { h: 8, w: 10, x: 6, y: 24 },
          targets: [
            { expr: "rate(nordi_ws_messages_in_total[1m])", legendFormat: "in" },
            { expr: "rate(nordi_ws_messages_out_total[1m])", legendFormat: "out" },
          ],
        },
        {
          title: "User Registrations by Country",
          type: "timeseries",
          gridPos: { h: 8, w: 8, x: 16, y: 24 },
          targets: [{ expr: "rate(nordi_user_registrations_total[5m])", legendFormat: "{{country}}" }],
        },
        // Row 5: Node.js / System
        {
          title: "Heap Usage (MB)",
          type: "timeseries",
          gridPos: { h: 8, w: 12, x: 0, y: 32 },
          targets: [
            { expr: "nordi_nodejs_heap_size_used_bytes / 1024 / 1024", legendFormat: "Heap Used MB" },
            { expr: "nordi_nodejs_heap_size_total_bytes / 1024 / 1024", legendFormat: "Heap Total MB" },
          ],
        },
        {
          title: "Event Loop Lag (ms)",
          type: "timeseries",
          gridPos: { h: 8, w: 6, x: 12, y: 32 },
          targets: [{ expr: "nordi_nodejs_eventloop_lag_seconds * 1000", legendFormat: "lag ms" }],
        },
        {
          title: "DB Query Duration p95 (s)",
          type: "timeseries",
          gridPos: { h: 8, w: 6, x: 18, y: 32 },
          targets: [{ expr: "histogram_quantile(0.95, rate(nordi_db_query_duration_seconds_bucket[5m]))", legendFormat: "{{operation}} {{model}}" }],
        },
      ],
    },
    overwrite: true,
  };
}

export default {
  healthCheckEndpoint,
  livenessProbe,
  readinessProbe,
  getGrafanaDashboardConfig,
};
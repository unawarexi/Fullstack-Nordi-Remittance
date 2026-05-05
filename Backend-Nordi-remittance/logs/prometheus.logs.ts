// ============================================================================
// Nordi-Remittance — Prometheus Metrics
// HTTP metrics, transaction/kyc/user business metrics, system metrics
// ============================================================================

import { Request, Response, NextFunction } from "express";
import client, {
  Counter,
  Histogram,
  Gauge,
  Summary,
  Registry,
  collectDefaultMetrics,
} from "prom-client";

// ============================================================================
// REGISTRY
// ============================================================================

const register = new Registry();

// Collect default Node.js metrics (CPU, memory, event loop, GC)
collectDefaultMetrics({
  register,
  prefix: "nordi_",
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ============================================================================
// HTTP METRICS
// ============================================================================

const httpRequestDuration = new Histogram({
  name: "nordi_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

const httpRequestsTotal = new Counter({
  name: "nordi_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpActiveRequests = new Gauge({
  name: "nordi_http_active_requests",
  help: "Number of currently active HTTP requests",
  registers: [register],
});

const httpRequestSize = new Summary({
  name: "nordi_http_request_size_bytes",
  help: "Size of HTTP request bodies",
  labelNames: ["method", "route"],
  registers: [register],
});

const httpResponseSize = new Summary({
  name: "nordi_http_response_size_bytes",
  help: "Size of HTTP response bodies",
  labelNames: ["method", "route"],
  registers: [register],
});

// ============================================================================
// TRANSACTION METRICS
// ============================================================================

export const transactionMetrics = {
  total: new Counter({
    name: "nordi_transactions_total",
    help: "Total number of transactions",
    labelNames: ["type", "status", "currency"],
    registers: [register],
  }),
  volume: new Counter({
    name: "nordi_transaction_volume_total",
    help: "Total volume of processed transactions",
    labelNames: ["type", "currency"],
    registers: [register],
  }),
  duration: new Histogram({
    name: "nordi_transaction_processing_seconds",
    help: "Time taken to process transactions",
    labelNames: ["type"],
    buckets: [0.1, 0.5, 1, 2.5, 5, 10, 30],
    registers: [register],
  }),
  fees: new Counter({
    name: "nordi_transaction_fees_total",
    help: "Total fees collected from transactions",
    labelNames: ["currency"],
    registers: [register],
  }),
};

// ============================================================================
// KYC METRICS
// ============================================================================

export const kycMetrics = {
  submissions: new Counter({
    name: "nordi_kyc_submissions_total",
    help: "Total KYC submissions",
    registers: [register],
  }),
  results: new Counter({
    name: "nordi_kyc_results_total",
    help: "Total KYC outcomes",
    labelNames: ["status"], // approved, rejected, pending
    registers: [register],
  }),
};

// ============================================================================
// USER METRICS
// ============================================================================

export const userMetrics = {
  activeSessions: new Gauge({
    name: "nordi_active_sessions",
    help: "Current number of active user sessions",
    registers: [register],
  }),
  registrations: new Counter({
    name: "nordi_user_registrations_total",
    help: "Total number of new user registrations",
    labelNames: ["country"],
    registers: [register],
  }),
  logins: new Counter({
    name: "nordi_user_logins_total",
    help: "Total number of user logins",
    labelNames: ["status"], // success, failure
    registers: [register],
  }),
};

// ============================================================================
// WEBSOCKET METRICS
// ============================================================================

export const wsMetrics = {
  connections: new Gauge({
    name: "nordi_ws_connections",
    help: "Active WebSocket connections",
    registers: [register],
  }),
  messagesIn: new Counter({
    name: "nordi_ws_messages_in_total",
    help: "Total WebSocket messages received",
    registers: [register],
  }),
  messagesOut: new Counter({
    name: "nordi_ws_messages_out_total",
    help: "Total WebSocket messages sent",
    registers: [register],
  }),
};

// ============================================================================
// ERROR METRICS
// ============================================================================

export const errorMetrics = {
  total: new Counter({
    name: "nordi_errors_total",
    help: "Total application errors",
    labelNames: ["type", "code"],
    registers: [register],
  }),
};

// ============================================================================
// DATABASE METRICS
// ============================================================================

export const dbMetrics = {
  queryDuration: new Histogram({
    name: "nordi_db_query_duration_seconds",
    help: "Database query duration in seconds",
    labelNames: ["operation", "model"],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
    registers: [register],
  }),
};

// ============================================================================
// MIDDLEWARE — Record HTTP metrics
// ============================================================================

function normalizeRoute(path: string): string {
  return path
    .replace(/\/[a-f0-9]{24}/gi, "/:id") // MongoDB-style IDs
    .replace(/\/[a-f0-9-]{36}/gi, "/:uuid") // UUIDs
    .replace(/\/\d+/g, "/:id") // Numeric IDs
    .replace(/\?.*$/, ""); // Strip query params
}

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Skip metrics endpoint itself
  if (req.path === "/metrics") return next();

  const start = process.hrtime.bigint();
  httpActiveRequests.inc();

  res.on("finish", () => {
    const durationNs = Number(process.hrtime.bigint() - start);
    const durationS = durationNs / 1e9;
    const route = normalizeRoute(req.route?.path || req.path || "unknown");
    const statusCode = String(res.statusCode);

    httpRequestDuration.observe(
      { method: req.method, route, status_code: statusCode },
      durationS,
    );
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });
    httpActiveRequests.dec();

    // Record request size
    const contentLength = req.headers["content-length"];
    if (contentLength) {
      httpRequestSize.observe({ method: req.method, route }, parseInt(contentLength));
    }

    // Record response size
    const resContentLength = res.getHeader("content-length");
    if (resContentLength) {
      httpResponseSize.observe(
        { method: req.method, route },
        Number(resContentLength),
      );
    }
  });

  next();
}

// ============================================================================
// /metrics ENDPOINT
// ============================================================================

export async function metricsEndpoint(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end("Error collecting metrics");
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { register, client };
export default {
  register,
  metricsMiddleware,
  metricsEndpoint,
  transactionMetrics,
  kycMetrics,
  userMetrics,
  wsMetrics,
  errorMetrics,
  dbMetrics,
};

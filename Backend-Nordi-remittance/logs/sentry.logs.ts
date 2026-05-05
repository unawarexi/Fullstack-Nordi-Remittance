// ============================================================================
// Nordi-Remittance — Sentry Error Tracking & Performance Monitoring
// ============================================================================

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { env, isProduction } from "../config/env.config.js";
import Logger from "./logger.js";

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initializeSentry(): void {
  if (!env.SENTRY_DSN) {
    Logger.warn("[Sentry] SENTRY_DSN not set — Sentry disabled");
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    release: process.env.npm_package_version || "0.0.0",
    serverName: env.KAFKA_CLIENT_ID || "nordi-remittance-api",

    integrations: [
      // HTTP tracing
      Sentry.httpIntegration(),
      // Express middleware tracing
      Sentry.expressIntegration(),
      // Profiling
      nodeProfilingIntegration(),
      // MongoDB query tracing via mongodbIntegration
      Sentry.mongoIntegration(),
    ],

    // Performance sampling
    tracesSampleRate: isProduction() ? 0.2 : 1.0,
    profilesSampleRate: isProduction() ? 0.1 : 1.0,

    // Only send errors in production & staging
    enabled: env.NODE_ENV !== "test",

    // Filter out noisy errors
    beforeSend(event, hint) {
      const error = hint?.originalException;

      // Don't send 4xx client errors to Sentry
      if (error && typeof error === "object" && "statusCode" in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        if (statusCode >= 400 && statusCode < 500) {
          return null;
        }
      }

      return event;
    },

    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Filter out health check noise
      if (
        breadcrumb.category === "http" &&
        breadcrumb.data?.url?.includes("/health")
      ) {
        return null;
      }
      if (
        breadcrumb.category === "http" &&
        breadcrumb.data?.url?.includes("/metrics")
      ) {
        return null;
      }
      return breadcrumb;
    },
  });

  Logger.info(`[Sentry] Sentry initialized (env: ${env.NODE_ENV})`);
}

// ============================================================================
// EXPRESS HANDLERS (Sentry v10)
// ============================================================================

// export function sentryRequestHandler() {
//   return Sentry.Handlers.requestHandler({
//     // Include user info
//     user: ["id", "email", "role"],
//     // Include IP for geo-tracking rides
//     ip: true,
//   });
// }

// /** Must be the FIRST error handler — before custom error handlers */
// export function sentryErrorHandler() {
//   return Sentry.Handlers.errorHandler({
//     shouldHandleError(error) {
//       // Only report 5xx errors to Sentry
//       const statusCode = (error as any).statusCode || 500;
//       return statusCode >= 500;
//     },
//   });
// }

// /** Tracing handler for performance monitoring */
// export function sentryTracingHandler() {
//   return Sentry.Handlers.tracingHandler();
// }

import type { Application } from "express";

/** Must be called AFTER all middlewares/routes are defined to catch errors */
export function setupSentryExpress(app: Application) {
  Sentry.setupExpressErrorHandler(app);
}

// ============================================================================
// HELPERS — Use throughout the application
// ============================================================================

/**
 * Capture an exception with optional context.
 */
export function captureException(
  error: Error | unknown,
  context?: {
    userId?: string;
    transactionId?: string;
    walletId?: string;
    fraudCaseId?: string;
    kycId?: string;
    action?: string;
    extra?: Record<string, unknown>;
  },
): void {
  Sentry.withScope((scope) => {
    if (context?.userId) scope.setUser({ id: context.userId });
    if (context?.transactionId) scope.setTag("transactionId", context.transactionId);
    if (context?.walletId) scope.setTag("walletId", context.walletId);
    if (context?.fraudCaseId) scope.setTag("fraudCaseId", context.fraudCaseId);
    if (context?.kycId) scope.setTag("kycId", context.kycId);
    if (context?.action) scope.setTag("action", context.action);
    if (context?.extra) scope.setExtras(context.extra);

    Sentry.captureException(error);
  });
}

/**
 * Capture an informational message.
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  tags?: Record<string, string>,
): void {
  Sentry.withScope((scope) => {
    if (tags) {
      Object.entries(tags).forEach(([k, v]) => scope.setTag(k, v));
    }
    Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context for the current scope.
 */
export function setUserContext(
  userId: string,
  email?: string,
  role?: string,
): void {
  Sentry.setUser({ id: userId, email, role });
}

/**
 * Add a breadcrumb for debugging flow.
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: Sentry.SeverityLevel = "info",
): void {
  Sentry.addBreadcrumb({ category, message, data, level });
}

/**
 * Flush all pending events (call before process exit).
 */
export async function flushSentry(timeoutMs: number = 2000): Promise<void> {
  await Sentry.flush(timeoutMs);
}

export default Sentry;

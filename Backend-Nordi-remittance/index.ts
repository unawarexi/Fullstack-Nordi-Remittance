// ============================================================================
// Nordi-Remittance — Main Entry Point
// ============================================================================
// This file is deliberately minimal.  It wires together:
//   1. Express middleware pipeline
//   2. Health & observability endpoints
//   3. Module registry (route loader)
//   4. Server lifecycle (init-setup.ts)
// ============================================================================

import express, { type Express, type Request, type Response } from 'express';
import http from 'http';
import cookieParser from 'cookie-parser';
import compression from 'compression';

// Configuration
import { env, HttpStatus } from './config/env.config.js';
import Logger from './logs/logger.js';

// Middleware
import {
  corsMiddleware,
  helmetMiddleware,
  ipBlockingMiddleware,
} from './middleware/security.middleware.js';
import {
  requestIdMiddleware,
  clientIpMiddleware,
  deviceInfoMiddleware,
  requestLoggingMiddleware,
  errorHandler,
  notFoundHandler,
} from './middleware/core.middleware.js';

// Observability
import { metricsMiddleware, metricsEndpoint } from './logs/prometheus.logs.js';
import { healthCheckEndpoint, livenessProbe, readinessProbe } from './logs/grafana.logs.js';
import { setupSentryExpress } from './logs/sentry.logs.js';

// Module Registry & Lifecycle
import { registerModules, buildEndpointMap } from './module-registry.js';
import {
  bootstrapServices,
  registerProcessHandlers,
  printStartupBanner,
  serviceStatus,
} from './init-setup.js';

// ============================================================================
// EXPRESS APP & HTTP SERVER
// ============================================================================

const app: Express = express();
const server = http.createServer(app);

// ============================================================================
// CONSTANTS
// ============================================================================

const API_PREFIX = '/api/v1';
const PORT = env.PORT || 5000;

// ============================================================================
// MIDDLEWARE PIPELINE
// ============================================================================

// Trust proxy (nginx, ALB, etc.)
app.set('trust proxy', 1);

// Security headers
app.use(helmetMiddleware);

// CORS
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing
app.use(cookieParser(env.JWT_SECRET));

// Compression
app.use(compression());

// Request tracking
app.use(requestIdMiddleware);
app.use(clientIpMiddleware);
app.use(deviceInfoMiddleware);

// IP blocking
app.use(ipBlockingMiddleware);

// Request logging (skip during tests)
if (env.NODE_ENV !== 'test') {
  app.use(requestLoggingMiddleware);
}

// Prometheus HTTP metrics
app.use(metricsMiddleware);

// ============================================================================
// HEALTH & OBSERVABILITY ENDPOINTS
// ============================================================================

app.get('/health', (_req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    services: serviceStatus,
  });
});

app.get('/health/live', livenessProbe);
app.get('/health/ready', readinessProbe);
app.get('/health/detailed', healthCheckEndpoint);
app.get('/metrics', metricsEndpoint);

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer(): Promise<void> {
  // 1. Bootstrap infrastructure services (DB, Redis, Kafka, etc.)
  await bootstrapServices(server);

  // 2. Register all API route modules
  const registered = await registerModules(app, API_PREFIX);

  // 3. API index / documentation endpoint (built from registered modules)
  const endpointMap = buildEndpointMap(API_PREFIX, registered);

  app.get(API_PREFIX, (_req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({
      name: 'Nordi Remittance API',
      version: '1.0.0',
      description: 'Online Banking and Remittance Platform API',
      documentation: `${env.FRONTEND_URL}/docs`,
      endpoints: endpointMap,
      healthCheck: '/health',
    });
  });

  // 4. Sentry error handler (must be before custom error handler)
  setupSentryExpress(app);

  // 5. 404 + global error handler (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  // 6. Wire process-level signal and crash handlers
  registerProcessHandlers(server);

  // 7. Start listening
  server.listen(PORT, () => {
    printStartupBanner(PORT, API_PREFIX);
  });
}

// ============================================================================
// LAUNCH
// ============================================================================

startServer();

// ============================================================================
// EXPORTS (testing)
// ============================================================================

export { app, server };

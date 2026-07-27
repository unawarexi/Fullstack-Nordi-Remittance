// ============================================================================
// Nordi-Remittance — Module Registry
// Declarative route registration with graceful error isolation
// ============================================================================

import { type Express, type Router } from 'express';
import { createLogger } from './logs/logger.js';

const log = createLogger('ModuleRegistry');

// ============================================================================
// TYPES
// ============================================================================

interface RouteModule {
  /** Human-readable label (used in logs and the API index endpoint) */
  name: string;
  /** URL prefix mounted under the API base (e.g. "/auth") */
  prefix: string;
  /** Lazy import that resolves to the module's default-exported Router */
  loader: () => Promise<{ default: Router }>;
  /** Set to false to temporarily disable a module without deleting it */
  enabled?: boolean;
}

interface RegisteredRoute {
  name: string;
  prefix: string;
}

// ============================================================================
// ROUTE DEFINITIONS
// All Nordi-Remittance API modules listed in mount order.
// To add a new module: append an entry and create the route file.
// To disable a module: set  enabled: false  — no code deletion needed.
// ============================================================================

const ROUTE_MODULES: RouteModule[] = [
  // ── Authentication & Identity ─────────────────────────────────────────
  {
    name: 'Auth',
    prefix: '/auth',
    loader: () => import('./routes/Auth.routes.js'),
  },
  {
    name: 'Users',
    prefix: '/users',
    loader: () => import('./routes/User.routes.js'),
  },
  {
    name: 'KYC',
    prefix: '/kyc',
    loader: () => import('./routes/Kyc.routes.js'),
  },

  // ── Core Banking ──────────────────────────────────────────────────────
  {
    name: 'Accounts',
    prefix: '/accounts',
    loader: () => import('./routes/Account.routes.js'),
  },
  {
    name: 'Transactions',
    prefix: '/transactions',
    loader: () => import('./routes/Transaction.routes.js'),
  },
  {
    name: 'Secure Transfer',
    prefix: '/transactions/secure-transfer',
    loader: () => import('./routes/TransferVerification.routes.js'),
  },
  {
    name: 'Cards',
    prefix: '/cards',
    loader: () => import('./routes/Card.routes.js'),
  },

  // ── Financial Products ────────────────────────────────────────────────
  {
    name: 'Loans',
    prefix: '/loans',
    loader: () => import('./routes/Loan.routes.js'),
  },
  {
    name: 'Investments',
    prefix: '/investments',
    loader: () => import('./routes/Investment.routes.js'),
  },

  // ── Administration ────────────────────────────────────────────────────
  {
    name: 'Admin',
    prefix: '/admin',
    loader: () => import('./routes/Admin.routes.js'),
  },
  {
    name: 'Admin Operations',
    prefix: '/admin/operations',
    loader: () => import('./routes/AdminOperations.routes.js'),
  },
  {
    name: 'Statistics',
    prefix: '/statistics',
    loader: () => import('./routes/Statistics.routes.js'),
  },

  // ── Security & Compliance ─────────────────────────────────────────────
  {
    name: 'Fraud Detection',
    prefix: '/fraud',
    loader: () => import('./routes/Fraud.routes.js'),
  },
  {
    name: 'Security',
    prefix: '/security',
    loader: () => import('./routes/Security.routes.js'),
  },

  // ── Communication ─────────────────────────────────────────────────────
  {
    name: 'Notifications',
    prefix: '/notifications',
    loader: () => import('./routes/Notification.routes.js'),
  },

  // ── Content & Documents ───────────────────────────────────────────────
  {
    name: 'Attachments',
    prefix: '/attachments',
    loader: () => import('./routes/Attachment.routes.js'),
  },
  {
    name: 'Legal',
    prefix: '/legal',
    loader: () => import('./routes/Legal.routes.js'),
  },

  // ── Integrations & AI ─────────────────────────────────────────────────
  {
    name: 'Integrations',
    prefix: '/integrations',
    loader: () => import('./routes/Integrations.routes.js'),
  },
  {
    name: 'AI Agent',
    prefix: '/ai',
    loader: () => import('./routes/AiAgent.routes.js'),
  },

  // ── Disabled modules (uncomment to enable) ────────────────────────────
  // {
  //   name: 'Permissions',
  //   prefix: '/permissions',
  //   loader: () => import('./routes/Permission.routes.js'),
  //   enabled: false,
  // },
];

// ============================================================================
// REGISTRATION
// ============================================================================

/**
 * Walk through every declared module, lazily import its Router, and mount it
 * on the Express app.  Each module is isolated — a broken import or missing
 * default export will log a warning but never crash the server.
 *
 * @returns Array of successfully registered routes (name + prefix).
 */
export async function registerModules(
  app: Express,
  apiPrefix: string,
): Promise<RegisteredRoute[]> {
  const registered: RegisteredRoute[] = [];

  for (const mod of ROUTE_MODULES) {
    // Skip explicitly disabled modules
    if (mod.enabled === false) {
      log.debug(`Module skipped (disabled): ${mod.name}`);
      continue;
    }

    try {
      const routeModule = await mod.loader();

      if (!routeModule?.default) {
        log.warn(`Module "${mod.name}" has no default export — skipping`);
        continue;
      }

      app.use(`${apiPrefix}${mod.prefix}`, routeModule.default);
      registered.push({ name: mod.name, prefix: mod.prefix });
      log.debug(`Module registered: ${mod.name} → ${apiPrefix}${mod.prefix}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn(`Failed to load module "${mod.name}": ${message}`);
    }
  }

  log.info(`${registered.length}/${ROUTE_MODULES.length} modules registered`);
  return registered;
}

/**
 * Build a { name: fullPath } map of all registered routes.
 * Useful for the API index / documentation endpoint.
 */
export function buildEndpointMap(
  apiPrefix: string,
  registered: RegisteredRoute[],
): Record<string, string> {
  const endpoints: Record<string, string> = {};
  for (const route of registered) {
    // camelCase key from the module name  (e.g. "Secure Transfer" → "secureTransfer")
    const key = route.name
      .split(/\s+/)
      .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
      .join('');
    endpoints[key] = `${apiPrefix}${route.prefix}`;
  }
  return endpoints;
}

export default registerModules;

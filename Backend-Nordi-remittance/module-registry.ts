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
    loader: () => import('./modules/auth/auth.routes.js'),
  },
  {
    name: 'Users',
    prefix: '/users',
    loader: () => import('./modules/users/users.routes.js'),
  },
  {
    name: 'KYC',
    prefix: '/kyc',
    loader: () => import('./modules/kyc/kyc.routes.js'),
  },

  // ── Core Banking ──────────────────────────────────────────────────────
  {
    name: 'Accounts',
    prefix: '/accounts',
    loader: () => import('./modules/accounts/accounts.routes.js'),
  },
  {
    name: 'Transactions',
    prefix: '/transactions',
    loader: () => import('./modules/transactions/transactions.routes.js'),
  },
  {
    name: 'Secure Transfer',
    prefix: '/transactions/secure-transfer',
    loader: () => import('./modules/transfer-verification/transfer-verification.routes.js'),
  },
  {
    name: 'Cards',
    prefix: '/cards',
    loader: () => import('./modules/cards/cards.routes.js'),
  },

  // ── Financial Products ────────────────────────────────────────────────
  {
    name: 'Loans',
    prefix: '/loans',
    loader: () => import('./modules/loans/loans.routes.js'),
  },
  {
    name: 'Investments',
    prefix: '/investments',
    loader: () => import('./modules/investments/investments.routes.js'),
  },

  // ── Administration ────────────────────────────────────────────────────
  {
    name: 'Admin',
    prefix: '/admin',
    loader: () => import('./modules/admin/admin.routes.js'),
  },
  {
    name: 'Admin Operations',
    prefix: '/admin/operations',
    loader: () => import('./modules/admin/admin-operations.routes.js'),
  },
  {
    name: 'Statistics',
    prefix: '/statistics',
    loader: () => import('./modules/statistics/statistics.routes.js'),
  },

  // ── Security & Compliance ─────────────────────────────────────────────
  {
    name: 'Fraud Detection',
    prefix: '/fraud',
    loader: () => import('./modules/fraud-security/fraud.routes.js'),
  },
  {
    name: 'Security',
    prefix: '/security',
    loader: () => import('./modules/fraud-security/security.routes.js'),
  },

  // ── Communication ─────────────────────────────────────────────────────
  {
    name: 'Notifications',
    prefix: '/notifications',
    loader: () => import('./modules/notifications/notifications.routes.js'),
  },

  // ── Content & Documents ───────────────────────────────────────────────
  {
    name: 'Attachments',
    prefix: '/attachments',
    loader: () => import('./modules/attachments/attachments.routes.js'),
  },
  {
    name: 'Legal',
    prefix: '/legal',
    loader: () => import('./modules/legal/legal.routes.js'),
  },

  // ── Integrations & AI ─────────────────────────────────────────────────
  {
    name: 'Integrations',
    prefix: '/integrations',
    loader: () => import('./modules/integrations/integrations.routes.js'),
  },
  {
    name: 'AI Agent',
    prefix: '/ai',
    loader: () => import('./modules/ai-agent/ai-agent.routes.js'),
  },

  // ── Disabled modules (uncomment to enable) ────────────────────────────
  // {
  //   name: 'Permissions',
  //   prefix: '/permissions',
  //   loader: () => import('./modules/permissions/permissions.routes.js'),
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

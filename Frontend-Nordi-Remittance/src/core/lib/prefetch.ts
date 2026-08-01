// ============================================================================
// PREFETCH — Route-based optimistic prefetching utilities
//
// Strategies:
// • On auth success → prefetch dashboard data for the user's role
// • On route hover/focus → prefetch data for the target route
// • On idle → prefetch adjacent route data via requestIdleCallback
// ============================================================================

import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Client dashboard prefetch ───────────────────────────────────────────────

export async function prefetchClientDashboard(qc: QueryClient): Promise<void> {
  try {
    const prefetches: Promise<void>[] = [];

    // Wallets
    prefetches.push(
      import('@domain/repository/accounts.repository').then(({ AccountsRepository }) =>
        qc.prefetchQuery({
          queryKey: ['accounts', 'wallets'],
          queryFn: () => AccountsRepository.getWallets().then((r: any) => r.data || []),
          staleTime: 5 * 60 * 1000,
        }),
      ),
    );

    // Notifications count
    prefetches.push(
      import('@domain/repository/notifications.repository').then(({ NotificationsRepository }) =>
        qc.prefetchQuery({
          queryKey: queryKeys.notifications.unreadCount(),
          queryFn: () => NotificationsRepository.getUnreadCount().then((r: any) => r),
          staleTime: 2 * 60 * 1000,
        }),
      ),
    );

    // Dashboard overview
    prefetches.push(
      import('@domain/repository/statistics.repository').then(({ StatisticsRepository }) =>
        qc.prefetchQuery({
          queryKey: queryKeys.statistics.dashboard(),
          queryFn: () => StatisticsRepository.getDashboardOverview().then((r: any) => r),
          staleTime: 5 * 60 * 1000,
        }),
      ),
    );

    // User profile
    prefetches.push(
      import('@domain/repository/users.repository').then(({ UsersRepository }) =>
        qc.prefetchQuery({
          queryKey: queryKeys.users.profile(),
          queryFn: () => UsersRepository.getProfile().then((r: any) => r),
          staleTime: 10 * 60 * 1000,
        }),
      ),
    );

    // Security 2FA status
    prefetches.push(
      import('@domain/repository/security.repository').then(({ SecurityRepository }) =>
        qc.prefetchQuery({
          queryKey: queryKeys.security.twoFactorStatus(),
          queryFn: () => SecurityRepository.getSettings().then((r: any) => {
            const settings = r.data as any;
            return {
              enabled: settings?.twoFactorEnabled ?? false,
              method: settings?.twoFactorMethod ?? null,
            };
          }),
          staleTime: 10 * 60 * 1000,
        }),
      ),
    );

    // Fire all prefetches in parallel — errors are swallowed (it's just prefetch)
    await Promise.allSettled(prefetches);
  } catch {
    // Prefetch failures are silently ignored — it's an optimistic enhancement
  }
}

// ─── Admin dashboard prefetch ────────────────────────────────────────────────

export async function prefetchAdminDashboard(qc: QueryClient): Promise<void> {
  try {
    const prefetches: Promise<void>[] = [];

    prefetches.push(
      import('@domain/repository/admin.repository').then(({ AdminRepository }) =>
        qc.prefetchQuery({
          queryKey: queryKeys.admin.dashboard(),
          queryFn: () => AdminRepository.getDashboardStats().then((r: any) => r.data),
          staleTime: 5 * 60 * 1000,
        }),
      ),
    );

    prefetches.push(
      import('@domain/repository/admin.repository').then(({ AdminRepository }) =>
        qc.prefetchQuery({
          queryKey: ["admin", "analytics"],
          queryFn: () => AdminRepository.getAnalytics().then((r: any) => r.data),
          staleTime: 5 * 60 * 1000,
        }),
      ),
    );

    await Promise.allSettled(prefetches);
  } catch {
    // Silent
  }
}

// ─── Route-based prefetch map ────────────────────────────────────────────────

const ROUTE_PREFETCH_MAP: Record<string, (qc: QueryClient) => Promise<void>> = {
  '/customer/dashboard': prefetchClientDashboard,
  '/admin/dashboard': prefetchAdminDashboard,
  '/customer/cards': async (qc) => {
    const { CardsRepository } = await import('@domain/repository/cards.repository');
    await qc.prefetchQuery({
      queryKey: queryKeys.cards.list(),
      queryFn: () => CardsRepository.getAll().then((r: any) => r),
      staleTime: 5 * 60 * 1000,
    });
  },
  '/customer/loans': async (qc) => {
    const { LoansRepository } = await import('@domain/repository/loans.repository');
    await qc.prefetchQuery({
      queryKey: queryKeys.loans.list(),
      queryFn: () => LoansRepository.getAll().then((r: any) => r),
      staleTime: 5 * 60 * 1000,
    });
  },
  '/customer/investments': async (qc) => {
    const { InvestmentsRepository } = await import('@domain/repository/investments.repository');
    await qc.prefetchQuery({
      queryKey: queryKeys.investments.list(),
      queryFn: () => InvestmentsRepository.getAll().then((r: any) => r),
      staleTime: 5 * 60 * 1000,
    });
  },
};

/**
 * Prefetch data for a specific route.
 * Call on link hover or route focus for instant navigation feel.
 */
export function prefetchRoute(qc: QueryClient, routeKey: string): void {
  const prefetcher = ROUTE_PREFETCH_MAP[routeKey];
  if (prefetcher) {
    prefetcher(qc).catch(() => {
      /* silent — optimistic only */
    });
  }
}

/**
 * Idle prefetch — call after initial page load to warm the cache
 * for routes the user is likely to visit next.
 */
export function prefetchOnIdle(qc: QueryClient, role: 'user' | 'admin'): void {
  const idleFn = () => {
    if (role === 'user') {
      prefetchClientDashboard(qc).catch(() => {});
    } else {
      prefetchAdminDashboard(qc).catch(() => {});
    }
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(idleFn, { timeout: 5000 });
  } else {
    // Fallback for Safari
    setTimeout(idleFn, 2000);
  }
}

// ============================================================================
// WEBSOCKET HOOKS — React hooks for real-time event subscriptions
// ============================================================================

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../core/socket/socket.client";
import { useSocketStore } from "../store/socket.store";
import { useToastStore } from "../store/toast.store";
import { useAuthStore } from "../store/auth.store";
import { WS, type WSEventName } from "../core/constants/ws-events";

// ============================================================================
// GENERIC: useSocketEvent — subscribe to any WS event with auto-cleanup
// ============================================================================

/**
 * Subscribe to a single WebSocket event. Handler is stable-referenced via
 * useRef so re-renders don't cause resubscriptions.
 *
 * @example
 * useSocketEvent(WS.TRANSACTION.RECEIVED, (data) => {
 *   console.log('Got money!', data);
 * });
 */
export function useSocketEvent<T = unknown>(
  event: WSEventName | string,
  handler: (data: T) => void,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const isConnected = useSocketStore((s) => s.isConnected);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected) return;

    const listener = (data: T) => {
      useSocketStore.getState().touchLastEvent();
      handlerRef.current(data);
    };

    socket.on(event, listener as (...args: unknown[]) => void);
    return () => {
      socket.off(event, listener as (...args: unknown[]) => void);
    };
  }, [event, isConnected]);
}

/**
 * Subscribe to multiple events with one handler.
 */
export function useSocketEvents<T = unknown>(
  events: (WSEventName | string)[],
  handler: (event: string, data: T) => void,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const isConnected = useSocketStore((s) => s.isConnected);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isConnected) return;

    const listeners = events.map((evt) => {
      const listener = (data: T) => {
        useSocketStore.getState().touchLastEvent();
        handlerRef.current(evt, data);
      };
      socket.on(evt, listener as (...args: unknown[]) => void);
      return { evt, listener };
    });

    return () => {
      listeners.forEach(({ evt, listener }) => {
        socket.off(evt, listener as (...args: unknown[]) => void);
      });
    };
  }, [events.join(","), isConnected]);
}

// ============================================================================
// DOMAIN: useRealtimeBalances — auto-invalidate wallet/balance queries
// ============================================================================

/**
 * Listens for balance-affecting events and invalidates relevant TanStack
 * Query caches so the UI auto-refreshes.
 */
export function useRealtimeBalances() {
  const queryClient = useQueryClient();

  const invalidateAccounts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  }, [queryClient]);

  // Balance / wallet events
  useSocketEvent(WS.ACCOUNT.BALANCE_UPDATED, invalidateAccounts);
  useSocketEvent(WS.ACCOUNT.WALLET_STATUS_CHANGED, invalidateAccounts);
  useSocketEvent(WS.ACCOUNT.WALLET_UPDATED, invalidateAccounts);
  useSocketEvent(WS.ADMIN.WALLET_FUND, invalidateAccounts);
  useSocketEvent(WS.ADMIN.WALLET_DEBIT, invalidateAccounts);

  // Incoming transactions affect balances
  useSocketEvent(WS.TRANSACTION.RECEIVED, invalidateAccounts);
  useSocketEvent(WS.TRANSACTION.COMPLETED, invalidateAccounts);
  useSocketEvent(WS.TRANSACTION.APPROVED, invalidateAccounts);
  useSocketEvent(WS.TRANSACTION.REVERSED, invalidateAccounts);
}

// ============================================================================
// DOMAIN: useRealtimeTransactions — auto-invalidate transaction queries
// ============================================================================

export function useRealtimeTransactions() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
  }, [queryClient]);

  useSocketEvent(WS.TRANSACTION.CREATED, invalidate);
  useSocketEvent(WS.TRANSACTION.COMPLETED, invalidate);
  useSocketEvent(WS.TRANSACTION.FAILED, invalidate);
  useSocketEvent(WS.TRANSACTION.CANCELLED, invalidate);
  useSocketEvent(WS.TRANSACTION.REVERSED, invalidate);
  useSocketEvent(WS.TRANSACTION.STATUS_UPDATED, invalidate);
  useSocketEvent(WS.TRANSACTION.RECEIVED, invalidate);
  useSocketEvent(WS.TRANSACTION.APPROVED, invalidate);
  useSocketEvent(WS.TRANSACTION.REJECTED, invalidate);
}

// ============================================================================
// DOMAIN: useRealtimeCards — auto-invalidate card queries
// ============================================================================

export function useRealtimeCards() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["cards"] });
  }, [queryClient]);

  useSocketEvent(WS.CARD.CREATED, invalidate);
  useSocketEvent(WS.CARD.ACTIVATED, invalidate);
  useSocketEvent(WS.CARD.BLOCKED, invalidate);
  useSocketEvent(WS.CARD.UNBLOCKED, invalidate);
  useSocketEvent(WS.CARD.REPORTED, invalidate);
  useSocketEvent(WS.CARD.LIMITS_UPDATED, invalidate);
  useSocketEvent(WS.CARD.CONTROLS_UPDATED, invalidate);
}

// ============================================================================
// DOMAIN: useRealtimeLoans — auto-invalidate loan queries
// ============================================================================

export function useRealtimeLoans() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["loans"] });
  }, [queryClient]);

  useSocketEvent(WS.LOAN.APPLICATION_SUBMITTED, invalidate);
  useSocketEvent(WS.LOAN.APPLICATION_REVIEWED, invalidate);
  useSocketEvent(WS.LOAN.DISBURSED, invalidate);
  useSocketEvent(WS.LOAN.PAYMENT_MADE, invalidate);
}

// ============================================================================
// DOMAIN: useRealtimeInvestments — auto-invalidate investment queries
// ============================================================================

export function useRealtimeInvestments() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["investments"] });
  }, [queryClient]);

  useSocketEvent(WS.INVESTMENT.ACCOUNT_CREATED, invalidate);
  useSocketEvent(WS.INVESTMENT.PURCHASED, invalidate);
  useSocketEvent(WS.INVESTMENT.SOLD, invalidate);
  useSocketEvent(WS.INVESTMENT.SAVINGS_GOAL_CREATED, invalidate);
  useSocketEvent(WS.INVESTMENT.SAVINGS_GOAL_DEPOSIT, invalidate);
  useSocketEvent(WS.INVESTMENT.SAVINGS_GOAL_WITHDRAWAL, invalidate);
  useSocketEvent(WS.INVESTMENT.SAVINGS_GOAL_DELETED, invalidate);
}

// ============================================================================
// DOMAIN: useRealtimeNotifications — show toasts + invalidate cache
// ============================================================================

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  useSocketEvent<{ title?: string; message?: string }>(
    WS.NOTIFICATION.NEW,
    (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showToast(data.message || data.title || "New notification", "info");
    },
  );

  // Multi-device sync: another tab marked all read
  useSocketEvent(WS.NOTIFICATION.ALL_READ, () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  });
}

// ============================================================================
// DOMAIN: useRealtimeSecurity — session & 2FA events
// ============================================================================

export function useRealtimeSecurity() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const logout = useAuthStore((s) => s.logout);

  // All sessions revoked → force logout on this device
  useSocketEvent(WS.SECURITY.ALL_SESSIONS_REVOKED, () => {
    showToast("All sessions have been revoked. You have been logged out.", "warning");
    logout();
  });

  // Single session revoked → could be this device
  useSocketEvent<{ sessionId?: string }>(WS.SECURITY.SESSION_REVOKED, () => {
    queryClient.invalidateQueries({ queryKey: ["security", "sessions"] });
  });

  // 2FA changes
  useSocketEvent(WS.SECURITY.TWO_FA_ENABLED, () => {
    queryClient.invalidateQueries({ queryKey: ["security"] });
  });

  useSocketEvent(WS.SECURITY.TWO_FA_DISABLED, () => {
    queryClient.invalidateQueries({ queryKey: ["security"] });
  });

  useSocketEvent(WS.SECURITY.TRUSTED_DEVICE_ADDED, () => {
    queryClient.invalidateQueries({ queryKey: ["security", "devices"] });
  });

  useSocketEvent(WS.SECURITY.TRUSTED_DEVICE_REMOVED, () => {
    queryClient.invalidateQueries({ queryKey: ["security", "devices"] });
  });
}

// ============================================================================
// DOMAIN: useAdminRealtimeEvents — admin-specific real-time updates
// ============================================================================

/**
 * For admin dashboards: listens for system-wide events that admins need
 * to react to (user status changes, KYC uploads, fraud signals, etc.)
 */
export function useAdminRealtimeEvents() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  // User management
  useSocketEvent<{ userId?: string; status?: string }>(
    WS.ADMIN.USER_STATUS_CHANGED,
    (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast(`User status changed to ${data.status || "updated"}`, "info");
    },
  );

  // System settings broadcast
  useSocketEvent(WS.ADMIN.SETTING_UPDATED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
  });

  // KYC document uploads — admin needs to review
  useSocketEvent<{ userId?: string; documentType?: string }>(
    WS.KYC.DOCUMENT_UPLOADED,
    (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      showToast(
        `New KYC document uploaded${data.documentType ? `: ${data.documentType}` : ""}`,
        "info",
      );
    },
  );

  // Fraud signals
  useSocketEvent(WS.FRAUD.CASE_CREATED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "fraud"] });
    queryClient.invalidateQueries({ queryKey: ["fraud"] });
    showToast("New fraud case created", "warning");
  });

  useSocketEvent(WS.FRAUD.SIGNAL_UPDATED, () => {
    queryClient.invalidateQueries({ queryKey: ["fraud"] });
  });

  // Disputes
  useSocketEvent(WS.DISPUTE.CREATED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    queryClient.invalidateQueries({ queryKey: ["legal"] });
  });

  // Loan applications — admin needs to review
  useSocketEvent(WS.LOAN.APPLICATION_SUBMITTED, () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "loans"] });
    queryClient.invalidateQueries({ queryKey: ["loans"] });
    showToast("New loan application submitted", "info");
  });

  // Permission changes
  useSocketEvent(WS.PERMISSION.UPDATED, () => {
    queryClient.invalidateQueries({ queryKey: ["permissions"] });
  });

  useSocketEvent(WS.PERMISSION.BULK_UPDATED, () => {
    queryClient.invalidateQueries({ queryKey: ["permissions"] });
  });
}

// ============================================================================
// DOMAIN: useUserRealtimeEvents — user-facing real-time updates
// ============================================================================

/**
 * For user dashboards: listens for events the user cares about
 * (account funded, KYC approved, card updates, permission changes).
 */
export function useUserRealtimeEvents() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);
  const updateUser = useAuthStore((s) => s.updateUser);

  // Admin funded the user's wallet
  useSocketEvent<{ walletId?: string; amount?: number; currency?: string }>(
    WS.ADMIN.WALLET_FUND,
    (data) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      showToast(
        data.amount
          ? `Your account has been credited ${data.currency || ""} ${data.amount}`
          : "Your account has been funded",
        "success",
      );
    },
  );

  // Admin changed user status (suspended / activated)
  useSocketEvent<{ status?: string }>(
    WS.ADMIN.USER_STATUS_CHANGED,
    (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      if (data.status === "suspended") {
        showToast("Your account has been suspended. Contact support.", "error");
      } else if (data.status === "active") {
        showToast("Your account is now active!", "success");
      }
    },
  );

  // KYC reviewed by admin
  useSocketEvent<{ status?: string }>(WS.KYC.STATUS_UPDATED, (data) => {
    queryClient.invalidateQueries({ queryKey: ["kyc"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    if (data.status) {
      updateUser({ kycStatus: data.status });
    }
    showToast(
      data.status === "verified"
        ? "Your identity has been verified!"
        : `KYC status updated: ${data.status}`,
      data.status === "verified" ? "success" : "info",
    );
  });

  // Permission changes pushed by admin
  useSocketEvent<{ permissions?: string[] }>(WS.PERMISSION.UPDATED, () => {
    queryClient.invalidateQueries({ queryKey: ["permissions"] });
    showToast("Your permissions have been updated", "info");
  });

  // Transfer events
  useSocketEvent(WS.TRANSFER.INITIATED, () => {
    queryClient.invalidateQueries({ queryKey: ["transfers"] });
  });

  useSocketEvent(WS.TRANSFER.CANCELLED, () => {
    queryClient.invalidateQueries({ queryKey: ["transfers"] });
  });

  // Dispute updates
  useSocketEvent<{ status?: string }>(WS.DISPUTE.STATUS_UPDATED, (data) => {
    queryClient.invalidateQueries({ queryKey: ["legal"] });
    showToast(`Dispute status updated: ${data.status || "updated"}`, "info");
  });

  // External integrations
  useSocketEvent(WS.INTEGRATION.EXTERNAL_ACCOUNT_LINKED, () => {
    queryClient.invalidateQueries({ queryKey: ["integrations"] });
    showToast("External account linked successfully", "success");
  });

  useSocketEvent(WS.INTEGRATION.EXTERNAL_ACCOUNT_UNLINKED, () => {
    queryClient.invalidateQueries({ queryKey: ["integrations"] });
  });
}

// ============================================================================
// COMPOSITE: useRealtimeUpdates — activate all relevant subscriptions
// ============================================================================

/**
 * Drop-in composite hook — activates balance, transaction, card, loan,
 * investment, notification and security subscriptions.
 * Use in the authenticated layout shell so all pages benefit.
 */
export function useRealtimeUpdates(role?: string) {
  // Core subscriptions (both user & admin)
  useRealtimeBalances();
  useRealtimeTransactions();
  useRealtimeCards();
  useRealtimeLoans();
  useRealtimeInvestments();
  useRealtimeNotifications();
  useRealtimeSecurity();

  // Role-specific subscriptions
  if (role === "admin") {
    useAdminRealtimeEvents();
  } else {
    useUserRealtimeEvents();
  }
}

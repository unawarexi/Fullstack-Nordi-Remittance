// ============================================================================
// useNotificationsDomain — Domain use-case hook for Notifications
//
// Wraps raw @hooks/queries with response normalization and typed returns.
// Components import from HERE, never from @hooks/queries.
// ============================================================================

import { useMemo } from "react";
import {
  useNotifications,
  useNotification,
  useUnreadNotificationsCount,
  useUnreadNotifications,
  useNotificationPreferences,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
  useUpdateNotificationPreferences,
  useRegisterPushToken,
  useUnregisterPushToken,
  useSendTestNotification,
} from "@hooks/api-queries/useNotifications";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Response Unwrappers ─────────────────────────────────────────────────────
const extractArray = (d: unknown, ...keys: string[]): any[] => {
  if (Array.isArray(d)) return d;
  if (!d || typeof d !== "object") return [];
  const obj = d as Record<string, any>;
  for (const k of keys) {
    if (Array.isArray(obj[k])) return obj[k];
  }
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.data && typeof obj.data === "object") {
    for (const k of keys) {
      if (Array.isArray(obj.data[k])) return obj.data[k];
    }
    if (Array.isArray(obj.data.data)) return obj.data.data;
  }
  return [];
};

const extractObject = (d: unknown, ...keys: string[]): Record<string, any> => {
  if (!d || typeof d !== "object") return {};
  const obj = d as Record<string, any>;
  for (const k of keys) {
    if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) return obj[k];
  }
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) return obj.data;
  return obj;
};

const extractPagination = (d: unknown): PaginationMeta | null => {
  if (!d || typeof d !== "object") return null;
  const obj = d as Record<string, any>;
  return obj.pagination || obj.data?.pagination || obj.meta || null;
};

// ============================================================================
// QUERIES
// ============================================================================

/** All notifications (paginated) */
export function useClientNotifications(filters?: { type?: NotificationType; page?: number; limit?: number }) {
  const { data: raw, isLoading, error, refetch } = useNotifications(filters as any);

  const result = useMemo(() => {
    const notifications = extractArray(raw, "notifications");
    const pagination = extractPagination(raw);
    return { notifications, pagination };
  }, [raw]);

  return { ...result, isLoading, error, refetch };
}

/** Single notification */
export function useClientNotification(notificationId: UUID) {
  const { data: raw, isLoading, error } = useNotification(notificationId);
  const notification = useMemo(() => extractObject(raw, "notification"), [raw]);
  return { notification, isLoading, error };
}

/** Unread notifications count */
export function useClientUnreadCount() {
  const { data: raw, isLoading, error } = useUnreadNotificationsCount();
  const count = useMemo(() => {
    if (typeof raw === "number") return raw;
    if (raw && typeof raw === "object") {
      const obj = raw as Record<string, any>;
      return typeof obj.count === "number" ? obj.count : 0;
    }
    return 0;
  }, [raw]);
  return { count, isLoading, error };
}

/** Unread notifications list */
export function useClientUnreadNotifications(limit = 5) {
  const { data: raw, isLoading, error } = useUnreadNotifications(limit);
  const notifications = useMemo(() => extractArray(raw, "notifications"), [raw]);
  return { notifications, isLoading, error };
}

/** Notification preferences */
export function useClientNotificationPreferences() {
  const { data: raw, isLoading, error } = useNotificationPreferences();
  const preferences = useMemo(() => extractObject(raw, "preferences"), [raw]);
  return { preferences, isLoading, error };
}

// ============================================================================
// MUTATIONS (pass-through)
// ============================================================================

export {
  useMarkNotificationAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
  useUpdateNotificationPreferences,
  useRegisterPushToken,
  useUnregisterPushToken,
  useSendTestNotification,
};

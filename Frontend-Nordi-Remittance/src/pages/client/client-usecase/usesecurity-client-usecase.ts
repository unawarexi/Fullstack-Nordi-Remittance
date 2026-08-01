// ============================================================================
// useSecurityDomain — Domain use-case hook for Security management
//
// Wraps raw @hooks/queries with response normalization and typed returns.
// Components import from HERE, never from @hooks/queries.
// ============================================================================

import { useMemo } from "react";
import {
  useSecuritySettings,
  useTwoFactorStatus,
  useActiveSessions,
  useTrustedDevices,
  useSecurityActivityLog,
  useLoginHistory,
  useTransactionPinStatus,
  useEnable2FA,
  useConfirm2FA,
  useDisable2FA,
  useGenerateBackupCodes,
  useRevokeSession,
  useRevokeAllOtherSessions,
  useAddTrustedDevice,
  useRemoveTrustedDevice,
  useRemoveAllTrustedDevices,
  useSetTransactionPin,
  useChangeTransactionPin,
  useResetTransactionPin,
  useConfirmTransactionPinReset,
  useUpdateSecuritySettings,
  useVerifyIdentity,
  useRequestSecurityReview,
} from "@hooks/api-queries/useSecurity";

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

/** Security settings */
export function useClientSecuritySettings() {
  const { data: raw, isLoading, error, refetch } = useSecuritySettings();

  const settings = useMemo(() => {
    const s = extractObject(raw, "settings", "securitySettings");
    return {
      loginNotifications: s.loginNotifications ?? true,
      transactionNotifications: s.transactionNotifications ?? true,
      failedLoginNotifications: s.failedLoginNotifications ?? true,
      newDeviceNotifications: s.newDeviceNotifications ?? true,
      sessionTimeout: s.sessionTimeout ?? 30,
      requirePinForTransfer: s.requirePinForTransfer ?? false,
      requirePinAmount: s.requirePinAmount ?? 0,
      securityScore: s.securityScore ?? 0,
      _raw: s,
    };
  }, [raw]);

  return { settings, isLoading, error, refetch };
}

/** Two-factor auth status */
export function useClientTwoFactorStatus() {
  const { data: raw, isLoading, error } = useTwoFactorStatus();
  const tfa = useMemo(() => {
    if (!raw || typeof raw !== "object") return { enabled: false, method: "" };
    const obj = raw as Record<string, any>;
    return {
      enabled: !!obj.enabled || !!obj.isEnabled || !!obj.twoFactorEnabled,
      method: obj.method || obj.twoFactorMethod || "",
    };
  }, [raw]);
  return { tfa, isLoading, error };
}

/** Active sessions */
export function useClientActiveSessions() {
  const { data: raw, isLoading, error, refetch } = useActiveSessions();
  const sessions = useMemo(() => extractArray(raw, "sessions", "activeSessions"), [raw]);
  return { sessions, isLoading, error, refetch };
}

/** Trusted devices */
export function useClientTrustedDevices() {
  const { data: raw, isLoading, error, refetch } = useTrustedDevices();
  const devices = useMemo(() => extractArray(raw, "devices", "trustedDevices"), [raw]);
  return { devices, isLoading, error, refetch };
}

/** Security activity log (paginated) */
export function useClientSecurityActivityLog(params?: { page?: number; limit?: number }) {
  const { data: raw, isLoading, error } = useSecurityActivityLog(params);

  const result = useMemo(() => {
    const events = extractArray(raw, "events", "activities", "logs");
    const pagination = extractPagination(raw);
    return { events, pagination };
  }, [raw]);

  return { ...result, isLoading, error };
}

/** Login history (paginated) */
export function useClientLoginHistory(params?: { page?: number; limit?: number }) {
  const { data: raw, isLoading, error } = useLoginHistory(params);

  const result = useMemo(() => {
    const history = extractArray(raw, "history", "loginHistory", "logins");
    const pagination = extractPagination(raw);
    return { history, pagination };
  }, [raw]);

  return { ...result, isLoading, error };
}

/** Transaction PIN status */
export function useClientTransactionPinStatus() {
  const { data: raw, isLoading, error } = useTransactionPinStatus();
  const pinStatus = useMemo(() => extractObject(raw, "pinStatus"), [raw]);
  return { pinStatus, isLoading, error };
}

// ============================================================================
// MUTATIONS (pass-through)
// ============================================================================

export {
  useEnable2FA,
  useConfirm2FA,
  useDisable2FA,
  useGenerateBackupCodes,
  useRevokeSession,
  useRevokeAllOtherSessions,
  useAddTrustedDevice,
  useRemoveTrustedDevice,
  useRemoveAllTrustedDevices,
  useSetTransactionPin,
  useChangeTransactionPin,
  useResetTransactionPin,
  useConfirmTransactionPinReset,
  useUpdateSecuritySettings,
  useVerifyIdentity,
  useRequestSecurityReview,
};

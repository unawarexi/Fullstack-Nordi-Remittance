// ============================================================================
// useProfileDomain — Domain use-case hook for User Profile management
//
// Wraps raw @hooks/queries with response normalization and typed returns.
// Components import from HERE, never from @hooks/queries.
// ============================================================================

import { useMemo } from "react";
import {
  useUserProfile,
  useUserAddress,
  useUserEmployment,
  useUserBankAccounts,
  useUserNotificationPreferences,
  useUserReferralStats,
  useReferredUsers,
  useUpdateProfile,
  useUpdateAvatar,
  useDeleteAvatar,
  useUpdateAddress,
  useUpdateEmployment,
  useAddBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useSetPrimaryBankAccount,
  useVerifyBankAccount,
  useUpdateUserNotificationPreferences,
  useDeleteUserAccount,
  useExportUserData,
} from "@hooks/queries/useUsers";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Response Unwrappers ─────────────────────────────────────────────────────
const extractArray = (d: unknown, ...keys: string[]): any[] => {
  if (Array.isArray(d)) return d;
  if (!d || typeof d !== "object") return [];
  const obj = d as Record<string, any>;
  for (const k of keys) { if (Array.isArray(obj[k])) return obj[k]; }
  if (Array.isArray(obj.data)) return obj.data;
  if (obj.data && typeof obj.data === "object") {
    for (const k of keys) { if (Array.isArray(obj.data[k])) return obj.data[k]; }
    if (Array.isArray(obj.data.data)) return obj.data.data;
  }
  return [];
};

const extractObject = (d: unknown, ...keys: string[]): Record<string, any> => {
  if (!d || typeof d !== "object") return {};
  const obj = d as Record<string, any>;
  for (const k of keys) { if (obj[k] && typeof obj[k] === "object" && !Array.isArray(obj[k])) return obj[k]; }
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) return obj.data;
  return obj;
};

// ============================================================================
// QUERIES
// ============================================================================

/** User profile (unwraps { user: {...}, wallets: [...], permissions: {...} }) */
export function useClientProfile() {
  const { data: raw, isLoading, error, refetch } = useUserProfile();

  const result = useMemo(() => {
    const obj = (raw && typeof raw === "object") ? raw as Record<string, any> : {};
    // Backend returns { user: { profilePicture, ... }, wallets, permissions }
    const user = obj.user || obj;
    const wallets = extractArray(obj, "wallets");
    const permissions = obj.permissions || {};

    return {
      user: {
        id: user._id || user.id || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        middleName: user.middleName || "",
        email: user.email || "",
        phone: user.mobileNumber || user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        nationality: user.nationality || "",
        profilePicture: user.profilePicture || user.avatar || "",
        kycStatus: user.kycStatus || "pending",
        emailVerified: !!user.emailVerified,
        phoneVerified: !!user.phoneVerified,
        status: user.status || user.accountStatus || "active",
        role: user.role || "user",
        twoFactorEnabled: !!user.twoFactorEnabled || !!user.enableTwoFactor,
        accountType: user.accountType || "",
        _raw: user,
      },
      wallets,
      permissions,
    };
  }, [raw]);

  return { ...result, isLoading, error, refetch };
}

/** User address */
export function useClientAddress() {
  const { data: raw, isLoading, error } = useUserAddress();
  const address = useMemo(() => extractObject(raw, "address"), [raw]);
  return { address, isLoading, error };
}

/** User employment info */
export function useClientEmployment() {
  const { data: raw, isLoading, error } = useUserEmployment();
  const employment = useMemo(() => extractObject(raw, "employment"), [raw]);
  return { employment, isLoading, error };
}

/** User bank accounts */
export function useClientBankAccounts() {
  const { data: raw, isLoading, error, refetch } = useUserBankAccounts();
  const accounts = useMemo(() => extractArray(raw, "bankAccounts", "accounts"), [raw]);
  return { accounts, isLoading, error, refetch };
}

/** User notification preferences */
export function useClientNotificationPreferences() {
  const { data: raw, isLoading, error } = useUserNotificationPreferences();
  const preferences = useMemo(() => extractObject(raw, "preferences", "notificationPreferences"), [raw]);
  return { preferences, isLoading, error };
}

/** Referral stats */
export function useClientReferralStats() {
  const { data: raw, isLoading, error } = useUserReferralStats();
  const stats = useMemo(() => extractObject(raw, "referral", "stats"), [raw]);
  return { stats, isLoading, error };
}

/** Referred users */
export function useClientReferredUsers(params?: { page?: number; limit?: number }) {
  const { data: raw, isLoading, error } = useReferredUsers(params);
  const users = useMemo(() => extractArray(raw, "users", "referredUsers"), [raw]);
  return { users, isLoading, error };
}

// ============================================================================
// MUTATIONS (pass-through)
// ============================================================================

export {
  useUpdateProfile,
  useUpdateAvatar,
  useDeleteAvatar,
  useUpdateAddress,
  useUpdateEmployment,
  useAddBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useSetPrimaryBankAccount,
  useVerifyBankAccount,
  useUpdateUserNotificationPreferences,
  useDeleteUserAccount,
  useExportUserData,
};

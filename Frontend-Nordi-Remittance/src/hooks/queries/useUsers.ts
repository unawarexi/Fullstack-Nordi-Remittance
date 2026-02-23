import { usersApi } from '../../core/api/endpoints/users.api';
import { useToastStore } from '../../store/toast.store';
import { queryKeys } from '../../core/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ============================================================================
// USERS HOOKS - TanStack Query hooks for user profile management
// ============================================================================


// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get current user profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: async () => {
      const response = await usersApi.getProfile();
      return response.data;
    },
  });
};

/**
 * Get user addresses
 */
export const useUserAddress = () => {
  return useQuery({
    queryKey: queryKeys.users.address(),
    queryFn: async () => {
      const response = await usersApi.getAddress();
      return response.data;
    },
  });
};

/**
 * Get user employment info
 */
export const useUserEmployment = () => {
  return useQuery({
    queryKey: queryKeys.users.employment(),
    queryFn: async () => {
      const response = await usersApi.getEmployment();
      return response.data;
    },
  });
};

/**
 * Get user bank accounts
 */
export const useUserBankAccounts = () => {
  return useQuery({
    queryKey: queryKeys.users.bankAccounts(),
    queryFn: async () => {
      const response = await usersApi.getBankAccounts();
      return response.data;
    },
  });
};

/**
 * Get user notification preferences
 */
export const useUserNotificationPreferences = () => {
  return useQuery({
    queryKey: queryKeys.users.notificationPreferences(),
    queryFn: async () => {
      const response = await usersApi.getNotificationPreferences();
      return response.data;
    },
  });
};

/**
 * Get user referral stats
 */
export const useUserReferralStats = () => {
  return useQuery({
    queryKey: queryKeys.users.referrals(),
    queryFn: async () => {
      const response = await usersApi.getReferralStats();
      return response.data;
    },
  });
};

/**
 * Get referred users list
 */
export const useReferredUsers = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [...queryKeys.users.referrals(), "users", params],
    queryFn: async () => {
      const response = await usersApi.getReferredUsers(params);
      return response;
    },
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Update profile mutation
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      firstName?: string;
      lastName?: string;
      middleName?: string;
      phone?: string;
      dateOfBirth?: string;
      gender?: "male" | "female" | "other" | "prefer_not_to_say";
    }) => {
      const response = await usersApi.updateProfile(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      showToast("Profile updated successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update profile", "error");
    },
  });
};

/**
 * Update avatar mutation
 */
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (file: File) => {
      const response = await usersApi.updateAvatar(file);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      showToast("Avatar updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update avatar", "error");
    },
  });
};

/**
 * Delete avatar mutation
 */
export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await usersApi.deleteAvatar();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      showToast("Avatar removed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to remove avatar", "error");
    },
  });
};

/**
 * Update address mutation
 */
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    }) => {
      const response = await usersApi.updateAddress(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.address() });
      showToast("Address updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update address", "error");
    },
  });
};

/**
 * Update employment info mutation
 */
export const useUpdateEmployment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      status?:
        | "employed"
        | "self_employed"
        | "unemployed"
        | "retired"
        | "student";
      employer?: string;
      jobTitle?: string;
      industry?: string;
      annualIncome?: number;
      sourceOfFunds?: string;
    }) => {
      const response = await usersApi.updateEmployment(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.employment() });
      showToast("Employment info updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update employment info", "error");
    },
  });
};

/**
 * Add bank account mutation
 */
export const useAddBankAccount = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      routingNumber?: string;
      swiftCode?: string;
      iban?: string;
      currency: string;
      isPrimary?: boolean;
    }) => {
      const response = await usersApi.addBankAccount(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.bankAccounts(),
      });
      showToast("Bank account added", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to add bank account", "error");
    },
  });
};

/**
 * Update bank account mutation
 */
export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      accountId,
      data,
    }: {
      accountId: UUID;
      data: Partial<{
        bankName: string;
        accountNumber: string;
        accountName: string;
        routingNumber: string;
        swiftCode: string;
        iban: string;
        currency: string;
        isPrimary: boolean;
      }>;
    }) => {
      const response = await usersApi.updateBankAccount(accountId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.bankAccounts(),
      });
      showToast("Bank account updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update bank account", "error");
    },
  });
};

/**
 * Delete bank account mutation
 */
export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (accountId: UUID) => {
      const response = await usersApi.deleteBankAccount(accountId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.bankAccounts(),
      });
      showToast("Bank account removed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to remove bank account", "error");
    },
  });
};

/**
 * Set primary bank account mutation
 */
export const useSetPrimaryBankAccount = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (accountId: UUID) => {
      const response = await usersApi.setPrimaryBankAccount(accountId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.bankAccounts(),
      });
      showToast("Primary bank account set", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to set primary bank account", "error");
    },
  });
};

/**
 * Verify bank account mutation
 */
export const useVerifyBankAccount = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      accountId,
      amounts,
    }: {
      accountId: UUID;
      amounts: [number, number];
    }) => {
      const response = await usersApi.verifyBankAccount(accountId, amounts);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.bankAccounts(),
      });
      showToast("Bank account verified", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Verification failed", "error");
    },
  });
};

/**
 * Update user notification preferences mutation
 */
export const useUpdateUserNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      email?: {
        transactions?: boolean;
        security?: boolean;
        marketing?: boolean;
        account?: boolean;
      };
      push?: {
        transactions?: boolean;
        security?: boolean;
        marketing?: boolean;
        account?: boolean;
      };
      sms?: {
        transactions?: boolean;
        security?: boolean;
      };
    }) => {
      const response = await usersApi.updateNotificationPreferences(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.notificationPreferences(),
      });
      showToast("Preferences updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update preferences", "error");
    },
  });
};

/**
 * Delete account mutation
 */
export const useDeleteUserAccount = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (password: string) => {
      const response = await usersApi.deleteAccount(password);
      return response.data;
    },
    onSuccess: () => {
      showToast("Account deletion requested", "info");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete account", "error");
    },
  });
};

/**
 * Export user data mutation (GDPR)
 */
export const useExportUserData = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await usersApi.exportData();
      return response.data;
    },
    onSuccess: () => {
      showToast(
        "Data export started. You will be notified when ready.",
        "success",
      );
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to export data", "error");
    },
  });
};

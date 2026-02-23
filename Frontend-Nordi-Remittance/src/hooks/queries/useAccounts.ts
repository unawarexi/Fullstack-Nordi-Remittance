import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsApi } from "../../core/api/endpoints/accounts.api";
declare const useToastStore: any; // Fallback if auto-imported
declare const queryKeys: any; // Fallback if auto-imported

// ============================================================================
// WALLET QUERIES
// ============================================================================

export const useWallets = () => {
  return useQuery({
    queryKey: ["accounts", "wallets"],
    queryFn: async () => {
      const response = await accountsApi.getWallets();
      return response.data || [];
    },
  });
};

export const useWallet = (walletId: UUID) => {
  return useQuery({
    queryKey: ["accounts", "wallets", walletId],
    queryFn: async () => {
      const response = await accountsApi.getWalletById(walletId);
      return response.data;
    },
    enabled: !!walletId,
  });
};

export const useBalanceHistory = (
  walletId: UUID,
  params?: { page?: number; limit?: number },
) => {
  return useQuery({
    queryKey: ["accounts", "wallets", walletId, "history", params],
    queryFn: async () => {
      const response = await accountsApi.getBalanceHistory(walletId, params);
      return response.data;
    },
    enabled: !!walletId,
  });
};

export const useAccountLimits = () => {
  return useQuery({
    queryKey: ["accounts", "limits"],
    queryFn: async () => {
      const response = await accountsApi.getAccountLimits();
      return response.data || [];
    },
  });
};

export const useAccountSummary = () => {
  return useQuery({
    queryKey: ["accounts", "summary"],
    queryFn: async () => {
      const response = await accountsApi.getAccountSummary();
      return response.data;
    },
  });
};

// ============================================================================
// BENEFICIARY QUERIES & MUTATIONS
// ============================================================================

export const useBeneficiaries = () => {
  return useQuery({
    queryKey: ["accounts", "beneficiaries"],
    queryFn: async () => {
      const response = await accountsApi.getBeneficiaries();
      return response.data || [];
    },
  });
};

export const useAddBeneficiary = () => {
  const queryClient = useQueryClient();
  const { showToast } =
    typeof useToastStore === "function"
      ? useToastStore()
      : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await accountsApi.addBeneficiary(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts", "beneficiaries"],
      });
      showToast("Beneficiary added successfully", "success");
    },
  });
};

export const useRemoveBeneficiary = () => {
  const queryClient = useQueryClient();
  const { showToast } =
    typeof useToastStore === "function"
      ? useToastStore()
      : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async (beneficiaryId: UUID) => {
      const response = await accountsApi.removeBeneficiary(beneficiaryId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts", "beneficiaries"],
      });
      showToast("Beneficiary removed", "success");
    },
  });
};

// ============================================================================
// WALLET MUTATIONS
// ============================================================================

export const useCreateWallet = () => {
  const queryClient = useQueryClient();
  const { showToast } =
    typeof useToastStore === "function"
      ? useToastStore()
      : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async (data: {
      walletType?: "personal" | "business";
      currency: Currency;
    }) => {
      const response = await accountsApi.createWallet(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", "wallets"] });
      showToast("Wallet created successfully", "success");
    },
  });
};

export const useUpdateWallet = () => {
  const queryClient = useQueryClient();
  const { showToast } =
    typeof useToastStore === "function"
      ? useToastStore()
      : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async ({
      walletId,
      data,
    }: {
      walletId: UUID;
      data: Partial<Wallet>;
    }) => {
      const response = await accountsApi.updateWallet(walletId, data);
      return response.data;
    },
    onSuccess: (_, { walletId }) => {
      queryClient.invalidateQueries({ queryKey: ["accounts", "wallets"] });
      queryClient.invalidateQueries({
        queryKey: ["accounts", "wallets", walletId],
      });
      showToast("Wallet updated successfully", "success");
    },
  });
};

export const useCloseWallet = () => {
  const queryClient = useQueryClient();
  const { showToast } =
    typeof useToastStore === "function"
      ? useToastStore()
      : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async (walletId: UUID) => {
      const response = await accountsApi.closeWallet(walletId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", "wallets"] });
      showToast("Wallet closed successfully", "success");
    },
  });
};

// ============================================================================
// ADMIN ROUTES
// ============================================================================

export const useAdminWallets = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["accounts", "admin", "wallets", params],
    queryFn: async () => {
      const response = await accountsApi.getAllWallets(params);
      return response.data;
    },
  });
};

export const useAdminUpdateWalletStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } =
    typeof useToastStore === "function"
      ? useToastStore()
      : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async ({
      walletId,
      data,
    }: {
      walletId: UUID;
      data: { status: "active" | "suspended" | "closed"; reason: string };
    }) => {
      const response = await accountsApi.updateWalletStatus(walletId, data);
      return response.data;
    },
    onSuccess: (_, { walletId }) => {
      queryClient.invalidateQueries({
        queryKey: ["accounts", "admin", "wallets"],
      });
      queryClient.invalidateQueries({
        queryKey: ["accounts", "wallets", walletId],
      });
      showToast("Wallet status updated", "success");
    },
  });
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountsRepository } from "../../domain/repository/accounts.repository";
import { useToastStore } from "../../store/toast.store";
import { queryKeys } from "../../core/lib/queryClient";

// ============================================================================
// WALLET QUERIES
// ============================================================================

export const useWallets = () => {
  return useQuery({
    queryKey: ["accounts", "wallets"],
    queryFn: async () => {
      const response = await AccountsRepository.getWallets();
      return response.data || [];
    },
  });
};

export const useWallet = (walletId: UUID) => {
  return useQuery({
    queryKey: ["accounts", "wallets", walletId],
    queryFn: async () => {
      const response = await AccountsRepository.getWalletById(walletId);
      return response.data;
    },
    enabled: !!walletId,
  });
};

export const useBalanceHistory = (walletId: UUID, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["accounts", "wallets", walletId, "history", params],
    queryFn: async () => {
      const response = await AccountsRepository.getBalanceHistory(walletId, params);
      return response.data;
    },
    enabled: !!walletId,
  });
};

export const useAccountLimits = () => {
  return useQuery({
    queryKey: ["accounts", "limits"],
    queryFn: async () => {
      const response = await AccountsRepository.getAccountLimits();
      return response.data || [];
    },
  });
};

export const useAccountSummary = () => {
  return useQuery({
    queryKey: ["accounts", "summary"],
    queryFn: async () => {
      const response = await AccountsRepository.getAccountSummary();
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
      const response = await AccountsRepository.getBeneficiaries();
      return response.data || [];
    },
  });
};

export const useAddBeneficiary = () => {
  const queryClient = useQueryClient();
  const { showToast } = typeof useToastStore === "function" ? useToastStore() : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await AccountsRepository.addBeneficiary(data);
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
  const { showToast } = typeof useToastStore === "function" ? useToastStore() : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async (beneficiaryId: UUID) => {
      const response = await AccountsRepository.removeBeneficiary(beneficiaryId);
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
  const { showToast } = typeof useToastStore === "function" ? useToastStore() : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async (data: { walletType?: "personal" | "business"; currency: Currency }) => {
      const response = await AccountsRepository.createWallet(data);
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
  const { showToast } = typeof useToastStore === "function" ? useToastStore() : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async ({ walletId, data }: { walletId: UUID; data: Partial<Wallet> }) => {
      const response = await AccountsRepository.updateWallet(walletId, data);
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
  const { showToast } = typeof useToastStore === "function" ? useToastStore() : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async (walletId: UUID) => {
      const response = await AccountsRepository.closeWallet(walletId);
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
      const response = await AccountsRepository.getAllWallets(params);
      return response.data;
    },
  });
};

export const useAdminUpdateWalletStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = typeof useToastStore === "function" ? useToastStore() : { showToast: (m: string) => alert(m) };

  return useMutation({
    mutationFn: async ({
      walletId,
      data,
    }: {
      walletId: UUID;
      data: { status: "active" | "suspended" | "closed"; reason: string };
    }) => {
      const response = await AccountsRepository.updateWalletStatus(walletId, data);
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

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TransactionFiltersState } from "../pages/admin/admin-usecase/useadmin-transaction-usecase";

interface TransactionState {
  // Caching
  cachedTransactions: Record<string, any>;
  
  // Filter States (Persisted for seamless navigation)
  globalFilters: TransactionFiltersState;
  
  // Actions
  setCachedTransaction: (transactionId: string, data: any) => void;
  updateGlobalFilters: (filters: Partial<TransactionFiltersState>) => void;
  resetGlobalFilters: () => void;
  clearCache: () => void;
}

const DEFAULT_FILTERS: TransactionFiltersState = {
  search: "",
  status: "all",
  type: "all",
  timeRange: "all",
  sortBy: "createdAt",
  sortDir: "desc",
};

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      cachedTransactions: {},
      globalFilters: DEFAULT_FILTERS,

      setCachedTransaction: (transactionId, data) =>
        set((state) => ({
          cachedTransactions: {
            ...state.cachedTransactions,
            [transactionId]: data,
          },
        })),

      updateGlobalFilters: (filters) =>
        set((state) => ({
          globalFilters: { ...state.globalFilters, ...filters },
        })),

      resetGlobalFilters: () =>
        set(() => ({
          globalFilters: DEFAULT_FILTERS,
        })),

      clearCache: () => set({ cachedTransactions: {} }),
    }),
    {
      name: "nordi-transaction-store",
      partialize: (state) => ({ globalFilters: state.globalFilters }), // Only persist filters across reloads
    }
  )
);

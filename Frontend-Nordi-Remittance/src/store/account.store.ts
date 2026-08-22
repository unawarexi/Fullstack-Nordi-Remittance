// ============================================================================
// account.store.ts — UI state for Accounts
// ============================================================================

import { create } from "zustand";

/**
 * Single switch for the "Dev preview" approve/reject buttons rendered on
 * pending applications. Flip to `false` once the backend has real admin approval.
 */
export const SHOW_APPLICATION_DEV_PREVIEW = true;

interface AccountState {
  // Pure UI states
  isApplicationModalOpen: boolean;
  setApplicationModalOpen: (isOpen: boolean) => void;
  
  selectedWalletId: string | null;
  setSelectedWalletId: (id: string | null) => void;

  cachedAccounts: Record<string, any>;
  cacheAccounts: (accounts: any[]) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  isApplicationModalOpen: false,
  setApplicationModalOpen: (isOpen) => set({ isApplicationModalOpen: isOpen }),
  
  selectedWalletId: null,
  setSelectedWalletId: (id) => set({ selectedWalletId: id }),

  cachedAccounts: {},
  cacheAccounts: (accounts) => set((state) => {
    const newCache = { ...state.cachedAccounts };
    accounts.forEach(acc => {
      newCache[acc.id] = acc;
    });
    return { cachedAccounts: newCache };
  }),
}));

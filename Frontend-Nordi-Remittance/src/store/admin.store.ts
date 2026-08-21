// ============================================================================
// admin.store.ts — UI state for Admin
// ============================================================================

import { create } from "zustand";

interface AdminState {
  // Pure UI states
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;

  selectedWalletId: string | null;
  setSelectedWalletId: (id: string | null) => void;

  isActionModalOpen: boolean;
  setActionModalOpen: (isOpen: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),

  selectedWalletId: null,
  setSelectedWalletId: (id) => set({ selectedWalletId: id }),

  isActionModalOpen: false,
  setActionModalOpen: (isOpen) => set({ isActionModalOpen: isOpen }),
}));

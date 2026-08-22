// ============================================================================
// admin.store.ts — UI state for Admin
// ============================================================================

import { create } from "zustand";

export interface ModuleUIState {
  search: string;
  statusFilter: string;
  typeFilter: string;
  roleFilter: string;
  activeTab: string;
  page: number;
}

const defaultModuleState: ModuleUIState = {
  search: "",
  statusFilter: "all",
  typeFilter: "all",
  roleFilter: "all",
  activeTab: "users",
  page: 1,
};

interface AdminState {
  // Module states
  accountsState: ModuleUIState;
  applicationsState: ModuleUIState;
  adminsState: ModuleUIState;
  operationsState: ModuleUIState;
  
  setModuleState: (module: 'accountsState' | 'applicationsState' | 'adminsState' | 'operationsState', state: Partial<ModuleUIState>) => void;
  resetModuleState: (module: 'accountsState' | 'applicationsState' | 'adminsState' | 'operationsState') => void;

  // Pure UI states
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;

  selectedWalletId: string | null;
  setSelectedWalletId: (id: string | null) => void;

  isActionModalOpen: boolean;
  setActionModalOpen: (isOpen: boolean) => void;

  expandedId: string | null;
  setExpandedId: (id: string | null) => void;

  rejectDialogId: string | null;
  setRejectDialogId: (id: string | null) => void;

  rejectReason: string;
  setRejectReason: (reason: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  accountsState: { ...defaultModuleState },
  applicationsState: { ...defaultModuleState },
  adminsState: { ...defaultModuleState },
  operationsState: { ...defaultModuleState },

  setModuleState: (module, state) => set((prev) => ({
    [module]: { ...prev[module], ...state },
  })),
  resetModuleState: (module) => set({
    [module]: { ...defaultModuleState },
  }),

  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),

  selectedWalletId: null,
  setSelectedWalletId: (id) => set({ selectedWalletId: id }),

  isActionModalOpen: false,
  setActionModalOpen: (isOpen) => set({ isActionModalOpen: isOpen }),

  expandedId: null,
  setExpandedId: (id) => set({ expandedId: id }),

  rejectDialogId: null,
  setRejectDialogId: (id) => set({ rejectDialogId: id }),

  rejectReason: "",
  setRejectReason: (reason) => set({ rejectReason: reason }),
}));

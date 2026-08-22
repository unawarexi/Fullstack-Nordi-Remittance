// ============================================================================
// admin-users.store.ts — UI state for Admin User Management
// ============================================================================

import { create } from "zustand";

interface AdminUsersState {
  // ── List-view filters ──────────────────────────────────────────────────────
  search: string;
  statusFilter: AdminUserStatusFilter;
  kycFilter: AdminKycStatusFilter;
  page: number;

  // ── Detail view ────────────────────────────────────────────────────────────
  expandedUserId: string | null;
  confirmAction: { type: string; visible: boolean } | null;

  // ── Create-user wizard ─────────────────────────────────────────────────────
  createStep: number;
  selectedCountry: string | null;
  filePreviews: AdminFilePreviews;
  showSuccess: boolean;
  showError: boolean;

  // ── Actions ────────────────────────────────────────────────────────────────
  setSearch: (v: string) => void;
  setStatusFilter: (v: AdminUserStatusFilter) => void;
  setKycFilter: (v: AdminKycStatusFilter) => void;
  setPage: (v: number) => void;
  setExpandedUserId: (v: string | null) => void;
  setConfirmAction: (v: { type: string; visible: boolean } | null) => void;
  setCreateStep: (v: number) => void;
  setSelectedCountry: (v: string | null) => void;
  setFilePreviews: (v: AdminFilePreviews) => void;
  updateFilePreview: (key: keyof AdminFilePreviews, value: string | null) => void;
  setShowSuccess: (v: boolean) => void;
  setShowError: (v: boolean) => void;
  resetFilters: () => void;
  resetCreateWizard: () => void;
}

const INITIAL_PREVIEWS: AdminFilePreviews = {
  profilePicture: null,
  governmentId: null,
  proofOfAddress: null,
  selfieWithId: null,
  signature: null,
};

export const useAdminUsersStore = create<AdminUsersState>((set) => ({
  // List defaults
  search: "",
  statusFilter: "all",
  kycFilter: "all",
  page: 1,

  // Detail defaults
  expandedUserId: null,
  confirmAction: null,

  // Create defaults
  createStep: 1,
  selectedCountry: null,
  filePreviews: { ...INITIAL_PREVIEWS },
  showSuccess: false,
  showError: false,

  // Actions
  setSearch: (v) => set({ search: v, page: 1 }),
  setStatusFilter: (v) => set({ statusFilter: v, page: 1 }),
  setKycFilter: (v) => set({ kycFilter: v, page: 1 }),
  setPage: (v) => set({ page: v }),
  setExpandedUserId: (v) => set({ expandedUserId: v }),
  setConfirmAction: (v) => set({ confirmAction: v }),
  setCreateStep: (v) => set({ createStep: v }),
  setSelectedCountry: (v) => set({ selectedCountry: v }),
  setFilePreviews: (v) => set({ filePreviews: v }),
  updateFilePreview: (key, value) =>
    set((state) => ({
      filePreviews: { ...state.filePreviews, [key]: value },
    })),
  setShowSuccess: (v) => set({ showSuccess: v }),
  setShowError: (v) => set({ showError: v }),

  resetFilters: () =>
    set({ search: "", statusFilter: "all", kycFilter: "all", page: 1 }),

  resetCreateWizard: () =>
    set({
      createStep: 1,
      selectedCountry: null,
      filePreviews: { ...INITIAL_PREVIEWS },
      showSuccess: false,
      showError: false,
    }),
}));

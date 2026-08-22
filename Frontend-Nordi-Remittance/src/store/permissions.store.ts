import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PermissionsState {
  // Original Auth Permissions State
  adminPermissions: AdminPermissions | null;
  setAdminPermissions: (permissions: AdminPermissions | null) => void;
  hasPermission: (permissionKey: keyof AdminPermissions) => boolean;
  clearPermissions: () => void;

  // UI State for the Permissions Settings Page
  activeTab: "admin" | "user";
  setActiveTab: (tab: "admin" | "user") => void;

  selectedAdminId: string | null;
  setSelectedAdminId: (id: string | null) => void;

  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  adminPage: number;
  setAdminPage: (page: number) => void;

  userPage: number;
  setUserPage: (page: number) => void;

  localAdminPerms: Record<string, boolean>;
  setLocalAdminPerms: (
    perms: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) => void;

  localUserPerms: Record<string, boolean>;
  setLocalUserPerms: (
    perms: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>),
  ) => void;
}

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      // Original Auth Permissions State
      adminPermissions: null,

      setAdminPermissions: (permissions) => {
        set({ adminPermissions: permissions });
      },

      hasPermission: (permissionKey) => {
        const perms = get().adminPermissions;
        if (!perms) return false;
        return Boolean(perms[permissionKey]);
      },

      clearPermissions: () => {
        set({ adminPermissions: null });
      },

      // UI State for the Permissions Settings Page
      activeTab: "admin",
      setActiveTab: (tab) => set({ activeTab: tab }),

      selectedAdminId: null,
      setSelectedAdminId: (id) => set({ selectedAdminId: id }),

      selectedUserId: null,
      setSelectedUserId: (id) => set({ selectedUserId: id }),

      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      adminPage: 1,
      setAdminPage: (page) => set({ adminPage: page }),

      userPage: 1,
      setUserPage: (page) => set({ userPage: page }),

      localAdminPerms: {},
      setLocalAdminPerms: (perms) =>
        set((state) => ({
          localAdminPerms: typeof perms === "function" ? perms(state.localAdminPerms) : perms,
        })),

      localUserPerms: {},
      setLocalUserPerms: (perms) =>
        set((state) => ({
          localUserPerms: typeof perms === "function" ? perms(state.localUserPerms) : perms,
        })),
    }),
    {
      name: "admin-permissions-storage",
      partialize: (state) => ({
        // We only persist the logged-in admin's permissions
        // We don't persist UI state to avoid stale selections across sessions
        adminPermissions: state.adminPermissions,
      }),
    },
  ),
);

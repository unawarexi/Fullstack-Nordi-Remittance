// ============================================================================
// UI STORE - Zustand store for UI state (Client State Only)
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// TYPES
// ============================================================================

type ThemeMode = 'light' | 'dark' | 'system';
type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'KES' | 'GHS' | 'ZAR';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  activeSection: string | null;
}

interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: unknown;
}

interface UIPreferences {
  theme: ThemeMode;
  currency: Currency;
  language: string;
  compactMode: boolean;
  showBalances: boolean;
  animations: boolean;
}

interface UIState {
  // Sidebar
  sidebar: SidebarState;
  
  // Modal
  modal: ModalState;
  
  // Sheets
  activeSheet: string | null;
  sheetData: unknown;
  
  // Preferences
  preferences: UIPreferences;
  
  // Global loading
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Command palette
  isCommandPaletteOpen: boolean;
  
  // Search
  isSearchOpen: boolean;
  searchQuery: string;
  
  // Notifications panel
  isNotificationsPanelOpen: boolean;
  
  // Quick actions
  isQuickActionsOpen: boolean;
}

interface UIActions {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setActiveSection: (section: string | null) => void;
  
  // Modal actions
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
  
  // Sheet actions
  openSheet: (sheet: string, data?: unknown) => void;
  closeSheet: () => void;
  
  // Preference actions
  setTheme: (theme: ThemeMode) => void;
  setCurrency: (currency: Currency) => void;
  setLanguage: (language: string) => void;
  toggleCompactMode: () => void;
  toggleShowBalances: () => void;
  toggleAnimations: () => void;
  updatePreferences: (preferences: Partial<UIPreferences>) => void;
  
  // Global loading actions
  setGlobalLoading: (loading: boolean, message?: string | null) => void;
  
  // Command palette actions
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // Search actions
  toggleSearch: () => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  
  // Notifications panel actions
  toggleNotificationsPanel: () => void;
  setNotificationsPanelOpen: (open: boolean) => void;
  
  // Quick actions
  toggleQuickActions: () => void;
  setQuickActionsOpen: (open: boolean) => void;
  
  // Reset
  resetUI: () => void;
}

type UIStore = UIState & UIActions;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const defaultPreferences: UIPreferences = {
  theme: 'system',
  currency: 'USD',
  language: 'en',
  compactMode: false,
  showBalances: true,
  animations: true,
};

const defaultSidebar: SidebarState = {
  isCollapsed: false,
  isMobileOpen: false,
  activeSection: null,
};

const defaultModal: ModalState = {
  isOpen: false,
  type: null,
  data: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebar: defaultSidebar,
      modal: defaultModal,
      activeSheet: null,
      sheetData: null,
      preferences: defaultPreferences,
      globalLoading: false,
      loadingMessage: null,
      isCommandPaletteOpen: false,
      isSearchOpen: false,
      searchQuery: '',
      isNotificationsPanelOpen: false,
      isQuickActionsOpen: false,

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            isCollapsed: !state.sidebar.isCollapsed,
          },
        }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set((state) => ({
          sidebar: { ...state.sidebar, isCollapsed: collapsed },
        }));
      },

      toggleMobileSidebar: () => {
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            isMobileOpen: !state.sidebar.isMobileOpen,
          },
        }));
      },

      setMobileSidebarOpen: (open: boolean) => {
        set((state) => ({
          sidebar: { ...state.sidebar, isMobileOpen: open },
        }));
      },

      setActiveSection: (section: string | null) => {
        set((state) => ({
          sidebar: { ...state.sidebar, activeSection: section },
        }));
      },

      // Modal actions
      openModal: (type: string, data?: unknown) => {
        set({
          modal: { isOpen: true, type, data: data ?? null },
        });
      },

      closeModal: () => {
        set({
          modal: defaultModal,
        });
      },

      // Sheet actions
      openSheet: (sheet: string, data?: unknown) => {
        set({
          activeSheet: sheet,
          sheetData: data ?? null,
        });
      },

      closeSheet: () => {
        set({
          activeSheet: null,
          sheetData: null,
        });
      },

      // Preference actions
      setTheme: (theme: ThemeMode) => {
        set((state) => ({
          preferences: { ...state.preferences, theme },
        }));
      },

      setCurrency: (currency: Currency) => {
        set((state) => ({
          preferences: { ...state.preferences, currency },
        }));
      },

      setLanguage: (language: string) => {
        set((state) => ({
          preferences: { ...state.preferences, language },
        }));
      },

      toggleCompactMode: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            compactMode: !state.preferences.compactMode,
          },
        }));
      },

      toggleShowBalances: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            showBalances: !state.preferences.showBalances,
          },
        }));
      },

      toggleAnimations: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            animations: !state.preferences.animations,
          },
        }));
      },

      updatePreferences: (preferences: Partial<UIPreferences>) => {
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        }));
      },

      // Global loading actions
      setGlobalLoading: (loading: boolean, message: string | null = null) => {
        set({
          globalLoading: loading,
          loadingMessage: loading ? message : null,
        });
      },

      // Command palette actions
      toggleCommandPalette: () => {
        set((state) => ({
          isCommandPaletteOpen: !state.isCommandPaletteOpen,
        }));
      },

      setCommandPaletteOpen: (open: boolean) => {
        set({ isCommandPaletteOpen: open });
      },

      // Search actions
      toggleSearch: () => {
        set((state) => ({
          isSearchOpen: !state.isSearchOpen,
          searchQuery: state.isSearchOpen ? '' : state.searchQuery,
        }));
      },

      setSearchOpen: (open: boolean) => {
        set({
          isSearchOpen: open,
          searchQuery: open ? get().searchQuery : '',
        });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // Notifications panel actions
      toggleNotificationsPanel: () => {
        set((state) => ({
          isNotificationsPanelOpen: !state.isNotificationsPanelOpen,
        }));
      },

      setNotificationsPanelOpen: (open: boolean) => {
        set({ isNotificationsPanelOpen: open });
      },

      // Quick actions
      toggleQuickActions: () => {
        set((state) => ({
          isQuickActionsOpen: !state.isQuickActionsOpen,
        }));
      },

      setQuickActionsOpen: (open: boolean) => {
        set({ isQuickActionsOpen: open });
      },

      // Reset
      resetUI: () => {
        set({
          sidebar: defaultSidebar,
          modal: defaultModal,
          activeSheet: null,
          sheetData: null,
          globalLoading: false,
          loadingMessage: null,
          isCommandPaletteOpen: false,
          isSearchOpen: false,
          searchQuery: '',
          isNotificationsPanelOpen: false,
          isQuickActionsOpen: false,
        });
      },
    }),
    {
      name: 'remit-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist preferences and sidebar state
        preferences: state.preferences,
        sidebar: {
          isCollapsed: state.sidebar.isCollapsed,
        },
      }),
    }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectTheme = (state: UIStore) => state.preferences.theme;
export const selectCurrency = (state: UIStore) => state.preferences.currency;
export const selectShowBalances = (state: UIStore) => state.preferences.showBalances;
export const selectIsSidebarCollapsed = (state: UIStore) => state.sidebar.isCollapsed;
export const selectIsModalOpen = (state: UIStore) => state.modal.isOpen;
export const selectModalType = (state: UIStore) => state.modal.type;

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

export const useTheme = () => {
  const theme = useUIStore(selectTheme);
  const setTheme = useUIStore((state) => state.setTheme);
  return { theme, setTheme };
};

export const useSidebar = () => {
  const sidebar = useUIStore((state) => state.sidebar);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);
  const setMobileSidebarOpen = useUIStore((state) => state.setMobileSidebarOpen);

  return {
    ...sidebar,
    toggleSidebar,
    toggleMobileSidebar,
    setMobileSidebarOpen,
  };
};

export const useModal = () => {
  const modal = useUIStore((state) => state.modal);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);

  return {
    ...modal,
    openModal,
    closeModal,
  };
};

export const usePreferences = () => {
  const preferences = useUIStore((state) => state.preferences);
  const updatePreferences = useUIStore((state) => state.updatePreferences);
  const toggleShowBalances = useUIStore((state) => state.toggleShowBalances);
  const toggleCompactMode = useUIStore((state) => state.toggleCompactMode);
  const setCurrency = useUIStore((state) => state.setCurrency);

  return {
    ...preferences,
    updatePreferences,
    toggleShowBalances,
    toggleCompactMode,
    setCurrency,
  };
};

// ============================================================================
// THEME STORE - Zustand store for theme management
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ========================
// TYPES
// ========================
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDarkMode: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
  initializeTheme: () => void;
}

// ========================
// HELPER FUNCTIONS
// ========================
const getSystemPreference = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const applyTheme = (isDark: boolean) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

// ========================
// STORE
// ========================
const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      isDarkMode: false,

      setMode: (mode: ThemeMode) => {
        let isDark = false;
        
        if (mode === 'dark') {
          isDark = true;
        } else if (mode === 'light') {
          isDark = false;
        } else {
          // system mode
          isDark = getSystemPreference();
        }
        
        applyTheme(isDark);
        set({ mode, isDarkMode: isDark });
      },

      toggleDarkMode: () => {
        const { isDarkMode } = get();
        const newIsDark = !isDarkMode;
        const newMode = newIsDark ? 'dark' : 'light';
        
        applyTheme(newIsDark);
        set({ isDarkMode: newIsDark, mode: newMode });
      },

      initializeTheme: () => {
        const { mode } = get();
        let isDark = false;
        
        if (mode === 'dark') {
          isDark = true;
        } else if (mode === 'light') {
          isDark = false;
        } else {
          isDark = getSystemPreference();
        }
        
        applyTheme(isDark);
        set({ isDarkMode: isDark });
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ mode: state.mode, isDarkMode: state.isDarkMode }),
    }
  )
);

export default useThemeStore;

// ============================================================================
// THEME PROVIDER - Initializes and manages theme across the application
// ============================================================================

import { useEffect } from 'react';
import useThemeStore from '@store/theme.store';

// ========================
// TYPES
// ========================
interface ThemeProviderProps {
  children: React.ReactNode;
}

// ========================
// COMPONENT
// ========================
const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { initializeTheme, mode } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Listen for system preference changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      initializeTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, initializeTheme]);

  return <>{children}</>;
};

export default ThemeProvider;

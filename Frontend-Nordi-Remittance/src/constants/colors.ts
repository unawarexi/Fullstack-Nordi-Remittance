// ============================================================================
// COLOR SYSTEM - Single source of truth for all colors and theming
// ============================================================================

/**
 * Core color palette used throughout the application
 * These map directly to Tailwind CSS custom colors and CSS variables
 */
export const colors = {
  // ========================
  // PRIMARY BRAND COLORS (Blue)
  // ========================
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main primary
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
    DEFAULT: '#1E3A8A',
  },

  // ========================
  // SECONDARY (AMBER/GOLD)
  // ========================
  secondary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main secondary
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
    DEFAULT: '#F59E0B',
  },

  // ========================
  // ACCENT (INDIGO/PURPLE)
  // ========================
  accent: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main accent
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
    DEFAULT: '#6366F1',
  },

  // ========================
  // SUCCESS (GREEN)
  // ========================
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main success
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
    DEFAULT: '#10B981',
  },

  // ========================
  // ERROR (RED)
  // ========================
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
    DEFAULT: '#EF4444',
  },

  // ========================
  // WARNING (AMBER)
  // ========================
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
    DEFAULT: '#F59E0B',
  },

  // ========================
  // INFO (BLUE)
  // ========================
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main info
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
    DEFAULT: '#3B82F6',
  },

  // ========================
  // NEUTRAL (SLATE)
  // ========================
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B', // Main neutral
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
    DEFAULT: '#64748B',
  },

  // ========================
  // BANKING-SPECIFIC COLORS
  // ========================
  banking: {
    income: '#10B981',
    expense: '#EF4444',
    pending: '#F59E0B',
    savings: '#6366F1',
    investment: '#8B5CF6',
    loan: '#EC4899',
    transfer: '#06B6D4',
  },

  // ========================
  // CARD BRAND COLORS
  // ========================
  cardBrands: {
    visa: '#1A1F71',
    mastercard: '#EB001B',
    amex: '#006FCF',
    discover: '#FF6000',
  },

  // ========================
  // SOCIAL COLORS
  // ========================
  social: {
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    google: '#EA4335',
    apple: '#000000',
    linkedin: '#0A66C2',
  },

  // ========================
  // BASE COLORS
  // ========================
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ============================================================================
// THEME DEFINITIONS - Light and Dark mode color mappings
// ============================================================================

export const lightTheme = {
  // Background colors
  background: {
    primary: colors.white,
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
    elevated: colors.white,
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  // Surface colors (cards, modals, etc.)
  surface: {
    primary: colors.white,
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
    hover: colors.neutral[100],
    active: colors.neutral[200],
  },
  // Text colors
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    muted: colors.neutral[400],
    disabled: colors.neutral[300],
    inverse: colors.white,
    link: colors.primary[600],
  },
  // Border colors
  border: {
    primary: colors.neutral[200],
    secondary: colors.neutral[300],
    focus: colors.primary[500],
    error: colors.error[500],
  },
  // Input colors
  input: {
    background: colors.white,
    border: colors.neutral[300],
    placeholder: colors.neutral[400],
    focus: colors.primary[500],
  },
};

export const darkTheme = {
  // Background colors
  background: {
    primary: colors.neutral[950],
    secondary: colors.neutral[900],
    tertiary: colors.neutral[800],
    elevated: colors.neutral[800],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  // Surface colors (cards, modals, etc.)
  surface: {
    primary: colors.neutral[900],
    secondary: colors.neutral[800],
    tertiary: colors.neutral[700],
    hover: colors.neutral[700],
    active: colors.neutral[600],
  },
  // Text colors
  text: {
    primary: colors.neutral[50],
    secondary: colors.neutral[300],
    tertiary: colors.neutral[400],
    muted: colors.neutral[500],
    disabled: colors.neutral[600],
    inverse: colors.neutral[900],
    link: colors.primary[400],
  },
  // Border colors
  border: {
    primary: colors.neutral[700],
    secondary: colors.neutral[600],
    focus: colors.primary[400],
    error: colors.error[400],
  },
  // Input colors
  input: {
    background: colors.neutral[800],
    border: colors.neutral[600],
    placeholder: colors.neutral[500],
    focus: colors.primary[400],
  },
};

// ============================================================================
// GRADIENT PRESETS
// ============================================================================

export const gradients = {
  primary: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
  secondary: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  accent: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
  error: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
  dark: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
  banking: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
  gold: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  hero: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
  heroLight: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  sidebar: 'linear-gradient(180deg, #1E3A8A 0%, #1D4ED8 50%, #3B82F6 100%)',
  sidebarDark: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
} as const;

// ============================================================================
// CSS VARIABLE GENERATOR - For use in ThemeProvider
// ============================================================================

export const generateCSSVariables = (isDark: boolean) => {
  const theme = isDark ? darkTheme : lightTheme;
  
  return {
    // Background
    '--bg-primary': theme.background.primary,
    '--bg-secondary': theme.background.secondary,
    '--bg-tertiary': theme.background.tertiary,
    '--bg-elevated': theme.background.elevated,
    '--bg-overlay': theme.background.overlay,
    
    // Surface
    '--surface-primary': theme.surface.primary,
    '--surface-secondary': theme.surface.secondary,
    '--surface-tertiary': theme.surface.tertiary,
    '--surface-hover': theme.surface.hover,
    '--surface-active': theme.surface.active,
    
    // Text
    '--text-primary': theme.text.primary,
    '--text-secondary': theme.text.secondary,
    '--text-tertiary': theme.text.tertiary,
    '--text-muted': theme.text.muted,
    '--text-disabled': theme.text.disabled,
    '--text-inverse': theme.text.inverse,
    '--text-link': theme.text.link,
    
    // Border
    '--border-primary': theme.border.primary,
    '--border-secondary': theme.border.secondary,
    '--border-focus': theme.border.focus,
    '--border-error': theme.border.error,
    
    // Input
    '--input-bg': theme.input.background,
    '--input-border': theme.input.border,
    '--input-placeholder': theme.input.placeholder,
    '--input-focus': theme.input.focus,
    
    // Brand colors (don't change with theme)
    '--color-primary': colors.primary[600],
    '--color-primary-light': colors.primary[400],
    '--color-primary-dark': colors.primary[800],
    '--color-secondary': colors.secondary[500],
    '--color-accent': colors.accent[500],
    '--color-success': colors.success[500],
    '--color-error': colors.error[500],
    '--color-warning': colors.warning[500],
    '--color-info': colors.info[500],
  };
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ColorScale = typeof colors.primary;
export type ColorKey = keyof typeof colors;
export type Theme = typeof lightTheme | typeof darkTheme;

export default colors;

// ============================================================================
// COLOR SYSTEM - Centralized color palette for consistent theming
// ============================================================================

/**
 * Core brand colors used throughout the application
 * These map directly to Tailwind CSS custom colors
 */
export const colors = {
  // ========================
  // PRIMARY BRAND COLORS
  // ========================
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main primary
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
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
  },

  // ========================
  // ACCENT (PURPLE/BRAND)
  // ========================
  accent: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Main accent
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
    950: '#3B0764',
  },

  // ========================
  // SEMANTIC COLORS
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
  },

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
  },

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
  },

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
  },

  // ========================
  // BACKGROUND COLORS
  // ========================
  background: {
    light: '#FFFFFF',
    default: '#F8FAFC',
    subtle: '#F1F5F9',
    muted: '#E2E8F0',
    dark: '#0F172A',
    darkSubtle: '#1E293B',
  },

  // ========================
  // TEXT COLORS
  // ========================
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#64748B',
    disabled: '#94A3B8',
    inverse: '#FFFFFF',
    link: '#4F46E5',
    linkHover: '#4338CA',
  },

  // ========================
  // BORDER COLORS
  // ========================
  border: {
    light: '#F1F5F9',
    default: '#E2E8F0',
    muted: '#CBD5E1',
    strong: '#94A3B8',
    focus: '#6366F1',
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
} as const;

// ========================
// COLOR UTILITY TYPES
// ========================
export type ColorScale = typeof colors.primary;
export type ColorKey = keyof typeof colors;
export type PrimaryColor = keyof typeof colors.primary;

// ========================
// CSS VARIABLE MAPPINGS
// ========================
export const cssVars = {
  '--color-primary': colors.primary[500],
  '--color-primary-light': colors.primary[400],
  '--color-primary-dark': colors.primary[600],
  '--color-secondary': colors.secondary[500],
  '--color-accent': colors.accent[500],
  '--color-success': colors.success[500],
  '--color-error': colors.error[500],
  '--color-warning': colors.warning[500],
  '--color-info': colors.info[500],
} as const;

// ========================
// GRADIENT PRESETS
// ========================
export const gradients = {
  primary: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
  secondary: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
  accent: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
  dark: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
  banking: 'linear-gradient(135deg, #4F46E5 0%, #7E22CE 100%)',
  gold: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  hero: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
} as const;

export default colors;

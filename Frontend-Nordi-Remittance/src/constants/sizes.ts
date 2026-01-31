// ============================================================================
// SIZE SYSTEM - Responsive sizing tokens for consistent scaling
// ============================================================================

/**
 * Spacing scale following 4px base unit
 * Used for margins, paddings, gaps
 */
export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

/**
 * Icon sizes - responsive icon scaling
 */
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
} as const;

/**
 * Responsive icon sizes by breakpoint
 */
export const responsiveIconSizes = {
  xs: { base: 10, sm: 12, md: 12, lg: 14 },
  sm: { base: 12, sm: 14, md: 16, lg: 16 },
  md: { base: 16, sm: 18, md: 20, lg: 20 },
  lg: { base: 20, sm: 22, md: 24, lg: 24 },
  xl: { base: 24, sm: 28, md: 32, lg: 32 },
} as const;

/**
 * Avatar sizes
 */
export const avatarSizes = {
  xs: { size: 24, font: 10 },
  sm: { size: 32, font: 12 },
  md: { size: 40, font: 14 },
  lg: { size: 48, font: 16 },
  xl: { size: 64, font: 20 },
  '2xl': { size: 96, font: 28 },
  '3xl': { size: 128, font: 36 },
} as const;

/**
 * Button sizes
 */
export const buttonSizes = {
  xs: {
    height: 28,
    paddingX: 10,
    paddingY: 4,
    fontSize: 12,
    iconSize: 14,
  },
  sm: {
    height: 32,
    paddingX: 12,
    paddingY: 6,
    fontSize: 13,
    iconSize: 16,
  },
  md: {
    height: 40,
    paddingX: 16,
    paddingY: 8,
    fontSize: 14,
    iconSize: 18,
  },
  lg: {
    height: 48,
    paddingX: 20,
    paddingY: 10,
    fontSize: 16,
    iconSize: 20,
  },
  xl: {
    height: 56,
    paddingX: 24,
    paddingY: 12,
    fontSize: 18,
    iconSize: 24,
  },
} as const;

/**
 * Input sizes
 */
export const inputSizes = {
  sm: {
    height: 32,
    paddingX: 10,
    fontSize: 13,
    iconSize: 16,
  },
  md: {
    height: 40,
    paddingX: 14,
    fontSize: 14,
    iconSize: 18,
  },
  lg: {
    height: 48,
    paddingX: 16,
    fontSize: 16,
    iconSize: 20,
  },
} as const;

/**
 * Card sizes
 */
export const cardSizes = {
  sm: {
    padding: 12,
    borderRadius: 8,
  },
  md: {
    padding: 16,
    borderRadius: 12,
  },
  lg: {
    padding: 24,
    borderRadius: 16,
  },
  xl: {
    padding: 32,
    borderRadius: 20,
  },
} as const;

/**
 * Border radius scale
 */
export const borderRadius = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

/**
 * Container max-widths
 */
export const containerWidths = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const;

/**
 * Z-index scale
 */
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

/**
 * Shadow scale
 */
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Component-specific shadows
  card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  cardHover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  button: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  buttonHover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  modal: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  focus: '0 0 0 3px rgb(99 102 241 / 0.3)',
} as const;

/**
 * Responsive sizing helpers - Tailwind class generators
 */
export const responsiveClasses = {
  // Text sizes that scale down on mobile
  heading1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  heading2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  heading3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
  heading4: 'text-base sm:text-lg md:text-xl lg:text-2xl',
  heading5: 'text-sm sm:text-base md:text-lg lg:text-xl',
  heading6: 'text-xs sm:text-sm md:text-base lg:text-lg',
  
  // Body text
  bodyLarge: 'text-base sm:text-lg md:text-lg',
  bodyMedium: 'text-sm sm:text-base md:text-base',
  bodySmall: 'text-xs sm:text-sm md:text-sm',
  
  // Container padding
  containerPadding: 'px-4 sm:px-6 md:px-8 lg:px-10',
  sectionPadding: 'py-8 sm:py-12 md:py-16 lg:py-20',
  
  // Gap sizes
  gapSmall: 'gap-2 sm:gap-3 md:gap-4',
  gapMedium: 'gap-3 sm:gap-4 md:gap-6',
  gapLarge: 'gap-4 sm:gap-6 md:gap-8',
} as const;

export type SpacingKey = keyof typeof spacing;
export type IconSizeKey = keyof typeof iconSizes;
export type ButtonSizeKey = keyof typeof buttonSizes;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;

export default {
  spacing,
  iconSizes,
  avatarSizes,
  buttonSizes,
  inputSizes,
  cardSizes,
  borderRadius,
  containerWidths,
  zIndex,
  shadows,
  responsiveClasses,
  responsiveIconSizes,
};

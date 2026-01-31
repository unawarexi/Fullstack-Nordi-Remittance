// ============================================================================
// TYPOGRAPHY SYSTEM - Consistent text styling across the application
// ============================================================================

/**
 * Font families
 */
export const fontFamilies = {
  sans: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ].join(', '),
  serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'].join(', '),
  mono: [
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ].join(', '),
  display: ['Inter', 'system-ui', 'sans-serif'].join(', '),
} as const;

/**
 * Font sizes with responsive variants
 */
export const fontSizes = {
  xs: { base: '0.625rem', sm: '0.75rem' },      // 10px -> 12px
  sm: { base: '0.75rem', sm: '0.875rem' },      // 12px -> 14px
  base: { base: '0.875rem', sm: '1rem' },       // 14px -> 16px
  lg: { base: '1rem', sm: '1.125rem' },         // 16px -> 18px
  xl: { base: '1.125rem', sm: '1.25rem' },      // 18px -> 20px
  '2xl': { base: '1.25rem', sm: '1.5rem' },     // 20px -> 24px
  '3xl': { base: '1.5rem', sm: '1.875rem' },    // 24px -> 30px
  '4xl': { base: '1.875rem', sm: '2.25rem' },   // 30px -> 36px
  '5xl': { base: '2.25rem', sm: '3rem' },       // 36px -> 48px
  '6xl': { base: '2.75rem', sm: '3.75rem' },    // 44px -> 60px
  '7xl': { base: '3.25rem', sm: '4.5rem' },     // 52px -> 72px
  '8xl': { base: '4rem', sm: '6rem' },          // 64px -> 96px
  '9xl': { base: '5rem', sm: '8rem' },          // 80px -> 128px
} as const;

/**
 * Font weights
 */
export const fontWeights = {
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

/**
 * Line heights
 */
export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
  // Specific line heights for headings
  heading: 1.2,
  body: 1.6,
} as const;

/**
 * Letter spacing
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

/**
 * Pre-defined text styles combining size, weight, and line-height
 */
export const textStyles = {
  // Headings
  h1: {
    className: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight',
    style: {
      fontSize: fontSizes['5xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.heading,
      letterSpacing: letterSpacing.tight,
    },
  },
  h2: {
    className: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight',
    style: {
      fontSize: fontSizes['4xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.heading,
      letterSpacing: letterSpacing.tight,
    },
  },
  h3: {
    className: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
    style: {
      fontSize: fontSizes['3xl'],
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
    },
  },
  h4: {
    className: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold leading-snug',
    style: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.semibold,
      lineHeight: lineHeights.snug,
    },
  },
  h5: {
    className: 'text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-normal',
    style: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
    },
  },
  h6: {
    className: 'text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-normal',
    style: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
    },
  },
  
  // Body text
  bodyLarge: {
    className: 'text-base sm:text-lg leading-relaxed',
    style: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
    },
  },
  body: {
    className: 'text-sm sm:text-base leading-relaxed',
    style: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
    },
  },
  bodySmall: {
    className: 'text-xs sm:text-sm leading-normal',
    style: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
    },
  },
  
  // Utility text
  caption: {
    className: 'text-xs leading-normal text-neutral-500',
    style: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
    },
  },
  label: {
    className: 'text-xs sm:text-sm font-medium leading-none',
    style: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.none,
    },
  },
  overline: {
    className: 'text-xs font-semibold uppercase tracking-widest',
    style: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.widest,
      textTransform: 'uppercase' as const,
    },
  },
  
  // Banking-specific
  balance: {
    className: 'text-2xl sm:text-3xl md:text-4xl font-bold tabular-nums',
    style: {
      fontSize: fontSizes['4xl'],
      fontWeight: fontWeights.bold,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  amount: {
    className: 'text-lg sm:text-xl font-semibold tabular-nums',
    style: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semibold,
      fontVariantNumeric: 'tabular-nums',
    },
  },
  currency: {
    className: 'text-sm font-medium text-neutral-500',
    style: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
  },
} as const;

/**
 * Tailwind responsive text class generators
 */
export const responsiveText = {
  // Returns responsive text classes based on size key
  size: (base: string, sm?: string, md?: string, lg?: string): string => {
    const classes = [`text-${base}`];
    if (sm) classes.push(`sm:text-${sm}`);
    if (md) classes.push(`md:text-${md}`);
    if (lg) classes.push(`lg:text-${lg}`);
    return classes.join(' ');
  },
} as const;

export type FontSizeKey = keyof typeof fontSizes;
export type FontWeightKey = keyof typeof fontWeights;
export type TextStyleKey = keyof typeof textStyles;

export default {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  textStyles,
  responsiveText,
};

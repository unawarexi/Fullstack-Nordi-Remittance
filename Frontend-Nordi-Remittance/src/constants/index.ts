// ============================================================================
// CONSTANTS BARREL EXPORT - Central export for all design tokens and constants
// ============================================================================

// Colors
export { default as colors, gradients, cssVars } from './colors';
export type { ColorKey, ColorScale, PrimaryColor } from './colors';

// Sizes
export { 
  default as sizes,
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
} from './sizes';
export type { 
  SpacingKey, 
  IconSizeKey, 
  ButtonSizeKey, 
  BorderRadiusKey, 
  ShadowKey 
} from './sizes';

// Typography
export { 
  default as typography,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
  textStyles,
  responsiveText,
} from './typography';
export type { FontSizeKey, FontWeightKey, TextStyleKey } from './typography';

// Breakpoints
export {
  default as breakpointSystem,
  breakpoints,
  mediaQueries,
  gridColumns,
  gridClasses,
  sidebarWidths,
  containerPadding,
  visibilityClasses,
  getBreakpointValue,
  matchesBreakpoint,
  getCurrentBreakpoint,
} from './breakpoints';
export type { BreakpointKey, ResponsiveValue } from './breakpoints';

// Images
export { default as Images, placeholders, imageDimensions } from './images';

// Re-export icons
export * from './icons';

// ============================================================================
// QUICK ACCESS THEME OBJECT
// ============================================================================
import colors from './colors';
import sizes from './sizes';
import typography from './typography';
import breakpointSystem from './breakpoints';

export const theme = {
  colors,
  sizes,
  typography,
  breakpoints: breakpointSystem,
} as const;

export default theme;

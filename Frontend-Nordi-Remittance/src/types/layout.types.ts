// ============================================================================
// LAYOUT TYPES - Types for layout components (Section, Container, Grid, etc.)
// ============================================================================

import { ReactNode, CSSProperties } from 'react';

// ============================================================================
// SECTION TYPES
// ============================================================================

export type SectionSize = 'sm' | 'md' | 'lg' | 'xl';
export type SectionBackground = 'white' | 'light' | 'dark' | 'primary' | 'gradient' | 'transparent';

export interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
  size?: SectionSize;
  background?: SectionBackground;
  noPadding?: boolean;
  noContainer?: boolean;
}

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  action?: ReactNode;
  className?: string;
}

// ============================================================================
// CONTAINER TYPES
// ============================================================================

export type ContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'prose';

export interface ContainerProps {
  children: ReactNode;
  maxWidth?: ContainerMaxWidth;
  centered?: boolean;
  noPadding?: boolean;
  className?: string;
}

// ============================================================================
// GRID TYPES
// ============================================================================

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12;
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps {
  children: ReactNode;
  columns?: GridColumns | { sm?: GridColumns; md?: GridColumns; lg?: GridColumns; xl?: GridColumns };
  gap?: GridGap;
  rowGap?: GridGap;
  columnGap?: GridGap;
  className?: string;
}

export interface GridItemProps {
  children: ReactNode;
  colSpan?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  rowSpan?: number;
  className?: string;
}

// ============================================================================
// FLEX TYPES
// ============================================================================

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface FlexProps {
  children: ReactNode;
  direction?: FlexDirection;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: FlexWrap;
  gap?: FlexGap;
  inline?: boolean;
  className?: string;
}

// ============================================================================
// SPACER & DIVIDER TYPES
// ============================================================================

export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface SpacerProps {
  size?: SpacerSize;
  axis?: 'vertical' | 'horizontal';
}

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

export interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  label?: string;
  className?: string;
}

// ============================================================================
// STACK TYPES
// ============================================================================

export interface StackProps {
  children: ReactNode;
  spacing?: FlexGap;
  direction?: 'horizontal' | 'vertical';
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  divider?: ReactNode;
  className?: string;
}

export interface HStackProps extends Omit<StackProps, 'direction'> {}
export interface VStackProps extends Omit<StackProps, 'direction'> {}

// ============================================================================
// BOX TYPES
// ============================================================================

export interface BoxProps {
  children?: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  padding?: SpacerSize;
  margin?: SpacerSize;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: string;
}

// ============================================================================
// CENTER TYPES
// ============================================================================

export interface CenterProps {
  children: ReactNode;
  inline?: boolean;
  className?: string;
}

// ============================================================================
// ASPECT RATIO TYPES
// ============================================================================

export type AspectRatioValue = '1:1' | '4:3' | '16:9' | '21:9' | '9:16' | number;

export interface AspectRatioProps {
  children: ReactNode;
  ratio?: AspectRatioValue;
  className?: string;
}

// ============================================================================
// WRAP TYPES
// ============================================================================

export interface WrapProps {
  children: ReactNode;
  spacing?: FlexGap;
  justify?: FlexJustify;
  align?: FlexAlign;
  className?: string;
}

export interface WrapItemProps {
  children: ReactNode;
  className?: string;
}

// ============================================================================
// SIMPLE GRID TYPES
// ============================================================================

export interface SimpleGridProps {
  children: ReactNode;
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  spacing?: FlexGap;
  spacingX?: FlexGap;
  spacingY?: FlexGap;
  minChildWidth?: string;
  className?: string;
}

// ============================================================================
// MAIN LAYOUT TYPES
// ============================================================================

export interface MainLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  showSidebar?: boolean;
  sidebarContent?: ReactNode;
  headerContent?: ReactNode;
  className?: string;
}

export interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  isSidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  className?: string;
}

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  backgroundImage?: string;
  className?: string;
}

// ============================================================================
// PAGE LAYOUT TYPES
// ============================================================================

export interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  className?: string;
}

export interface PageContentProps {
  children: ReactNode;
  noPadding?: boolean;
  maxWidth?: ContainerMaxWidth;
  className?: string;
}

// ============================================================================
// CARD LAYOUT TYPES
// ============================================================================

export interface CardLayoutProps {
  children: ReactNode;
  columns?: GridColumns;
  gap?: GridGap;
  className?: string;
}

// ============================================================================
// MASONRY LAYOUT TYPES
// ============================================================================

export interface MasonryLayoutProps {
  children: ReactNode;
  columns?: number | { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: FlexGap;
  className?: string;
}

// ============================================================================
// SPLIT LAYOUT TYPES
// ============================================================================

export interface SplitLayoutProps {
  children: [ReactNode, ReactNode];
  ratio?: '1:1' | '1:2' | '2:1' | '1:3' | '3:1';
  direction?: 'horizontal' | 'vertical';
  gap?: FlexGap;
  reversed?: boolean;
  className?: string;
}

// ============================================================================
// STICKY LAYOUT TYPES
// ============================================================================

export interface StickyProps {
  children: ReactNode;
  top?: string | number;
  bottom?: string | number;
  zIndex?: number;
  className?: string;
}

// ============================================================================
// SCROLL AREA TYPES
// ============================================================================

export interface ScrollAreaProps {
  children: ReactNode;
  maxHeight?: string | number;
  hideScrollbar?: boolean;
  orientation?: 'vertical' | 'horizontal' | 'both';
  className?: string;
}

// ============================================================================
// COLLAPSE TYPES
// ============================================================================

export interface CollapseProps {
  children: ReactNode;
  isOpen: boolean;
  animateOpacity?: boolean;
  startingHeight?: number;
  className?: string;
}

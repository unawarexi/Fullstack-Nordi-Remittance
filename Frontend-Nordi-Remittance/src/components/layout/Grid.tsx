// ============================================================================
// GRID COMPONENT - Responsive grid layout
// ============================================================================

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { cn } from '@utils/cn';

// ========================
// TYPES
// ========================
export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  cols?: GridCols | { xs?: GridCols; sm?: GridCols; md?: GridCols; lg?: GridCols; xl?: GridCols };
  gap?: GridGap;
  rowGap?: GridGap;
  colGap?: GridGap;
  animate?: boolean;
  stagger?: boolean;
}

// ========================
// COLUMN STYLES
// ========================
const colStyles: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const responsiveColStyles = {
  xs: { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5', 6: 'grid-cols-6', 12: 'grid-cols-12' },
  sm: { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6', 12: 'sm:grid-cols-12' },
  md: { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6', 12: 'md:grid-cols-12' },
  lg: { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6', 12: 'lg:grid-cols-12' },
  xl: { 1: 'xl:grid-cols-1', 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4', 5: 'xl:grid-cols-5', 6: 'xl:grid-cols-6', 12: 'xl:grid-cols-12' },
};

// ========================
// GAP STYLES
// ========================
const gapStyles: Record<GridGap, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
  xl: 'gap-8 sm:gap-10',
};

const rowGapStyles: Record<GridGap, string> = {
  none: 'gap-y-0',
  xs: 'gap-y-2',
  sm: 'gap-y-3',
  md: 'gap-y-4 sm:gap-y-6',
  lg: 'gap-y-6 sm:gap-y-8',
  xl: 'gap-y-8 sm:gap-y-10',
};

const colGapStyles: Record<GridGap, string> = {
  none: 'gap-x-0',
  xs: 'gap-x-2',
  sm: 'gap-x-3',
  md: 'gap-x-4 sm:gap-x-6',
  lg: 'gap-x-6 sm:gap-x-8',
  xl: 'gap-x-8 sm:gap-x-10',
};

// ========================
// ANIMATION VARIANTS
// ========================
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
};

// ========================
// HELPER FUNCTION
// ========================
const getColClasses = (cols: GridProps['cols']): string => {
  if (typeof cols === 'number') {
    return colStyles[cols];
  }
  
  if (typeof cols === 'object') {
    const classes: string[] = [];
    if (cols.xs) classes.push(responsiveColStyles.xs[cols.xs]);
    if (cols.sm) classes.push(responsiveColStyles.sm[cols.sm]);
    if (cols.md) classes.push(responsiveColStyles.md[cols.md]);
    if (cols.lg) classes.push(responsiveColStyles.lg[cols.lg]);
    if (cols.xl) classes.push(responsiveColStyles.xl[cols.xl]);
    return classes.join(' ');
  }
  
  return colStyles[1];
};

// ========================
// COMPONENT
// ========================
export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      cols = { xs: 1, sm: 2, lg: 3 },
      gap = 'md',
      rowGap,
      colGap,
      animate = true,
      stagger = true,
      className,
      ...props
    },
    ref
  ) => {
    const motionProps = animate
      ? {
          initial: 'hidden',
          whileInView: 'visible',
          viewport: { once: true, margin: '-50px' },
          variants: stagger ? containerVariants : undefined,
        }
      : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          'grid',
          getColClasses(cols),
          !rowGap && !colGap && gapStyles[gap],
          rowGap && rowGapStyles[rowGap],
          colGap && colGapStyles[colGap],
          className
        )}
        {...motionProps}
        {...props}
      >
        {animate && stagger
          ? React.Children.map(children, (child, index) => (
              <motion.div key={index} variants={itemVariants}>
                {child}
              </motion.div>
            ))
          : children}
      </motion.div>
    );
  }
);

Grid.displayName = 'Grid';

// ========================
// GRID ITEM
// ========================
export interface GridItemProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  span?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  start?: number;
  end?: number;
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ children, span, start, end, className, ...props }, ref) => {
    const getSpanClass = () => {
      if (typeof span === 'number') {
        return `col-span-${span}`;
      }
      if (typeof span === 'object') {
        const classes: string[] = [];
        if (span.xs) classes.push(`col-span-${span.xs}`);
        if (span.sm) classes.push(`sm:col-span-${span.sm}`);
        if (span.md) classes.push(`md:col-span-${span.md}`);
        if (span.lg) classes.push(`lg:col-span-${span.lg}`);
        if (span.xl) classes.push(`xl:col-span-${span.xl}`);
        return classes.join(' ');
      }
      return '';
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          getSpanClass(),
          start && `col-start-${start}`,
          end && `col-end-${end}`,
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GridItem.displayName = 'GridItem';

export default Grid;

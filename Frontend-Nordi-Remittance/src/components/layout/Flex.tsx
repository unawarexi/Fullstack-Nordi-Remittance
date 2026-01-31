// ============================================================================
// FLEX COMPONENT - Flexible box layout utility
// ============================================================================

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@utils/cn';

// ========================
// TYPES
// ========================
export type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse';
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type FlexWrap = 'wrap' | 'nowrap' | 'wrap-reverse';
export type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface FlexProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  direction?: FlexDirection | { xs?: FlexDirection; sm?: FlexDirection; md?: FlexDirection };
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: FlexWrap;
  gap?: FlexGap;
  inline?: boolean;
}

// ========================
// DIRECTION STYLES
// ========================
const directionStyles: Record<FlexDirection, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  col: 'flex-col',
  'col-reverse': 'flex-col-reverse',
};

const responsiveDirectionStyles = {
  xs: { row: 'flex-row', 'row-reverse': 'flex-row-reverse', col: 'flex-col', 'col-reverse': 'flex-col-reverse' },
  sm: { row: 'sm:flex-row', 'row-reverse': 'sm:flex-row-reverse', col: 'sm:flex-col', 'col-reverse': 'sm:flex-col-reverse' },
  md: { row: 'md:flex-row', 'row-reverse': 'md:flex-row-reverse', col: 'md:flex-col', 'col-reverse': 'md:flex-col-reverse' },
};

// ========================
// ALIGN STYLES
// ========================
const alignStyles: Record<FlexAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

// ========================
// JUSTIFY STYLES
// ========================
const justifyStyles: Record<FlexJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

// ========================
// WRAP STYLES
// ========================
const wrapStyles: Record<FlexWrap, string> = {
  wrap: 'flex-wrap',
  nowrap: 'flex-nowrap',
  'wrap-reverse': 'flex-wrap-reverse',
};

// ========================
// GAP STYLES
// ========================
const gapStyles: Record<FlexGap, string> = {
  none: 'gap-0',
  xs: 'gap-1 sm:gap-2',
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4',
  lg: 'gap-4 sm:gap-6',
  xl: 'gap-6 sm:gap-8',
};

// ========================
// HELPER FUNCTION
// ========================
const getDirectionClasses = (direction: FlexProps['direction']): string => {
  if (typeof direction === 'string') {
    return directionStyles[direction];
  }
  
  if (typeof direction === 'object') {
    const classes: string[] = [];
    if (direction.xs) classes.push(responsiveDirectionStyles.xs[direction.xs]);
    if (direction.sm) classes.push(responsiveDirectionStyles.sm[direction.sm]);
    if (direction.md) classes.push(responsiveDirectionStyles.md[direction.md]);
    return classes.join(' ');
  }
  
  return directionStyles.row;
};

// ========================
// COMPONENT
// ========================
export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      children,
      direction = 'row',
      align = 'stretch',
      justify = 'start',
      wrap = 'nowrap',
      gap = 'none',
      inline = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          inline ? 'inline-flex' : 'flex',
          getDirectionClasses(direction),
          alignStyles[align],
          justifyStyles[justify],
          wrapStyles[wrap],
          gapStyles[gap],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Flex.displayName = 'Flex';

// ========================
// SPACER COMPONENT
// ========================
export interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  axis?: 'horizontal' | 'vertical';
}

const spacerSizes = {
  xs: { horizontal: 'w-2', vertical: 'h-2' },
  sm: { horizontal: 'w-4', vertical: 'h-4' },
  md: { horizontal: 'w-6', vertical: 'h-6' },
  lg: { horizontal: 'w-8', vertical: 'h-8' },
  xl: { horizontal: 'w-12', vertical: 'h-12' },
  '2xl': { horizontal: 'w-16', vertical: 'h-16' },
  '3xl': { horizontal: 'w-24', vertical: 'h-24' },
};

export const Spacer: React.FC<SpacerProps> = ({ size = 'md', axis = 'vertical' }) => {
  return <div className={spacerSizes[size][axis]} aria-hidden="true" />;
};

// ========================
// DIVIDER COMPONENT
// ========================
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 'md',
  className,
}) => {
  const orientationStyles = {
    horizontal: 'w-full h-px',
    vertical: 'h-full w-px',
  };

  const variantStyles = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  const spacingStyles = {
    none: '',
    sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
  };

  return (
    <div
      role="separator"
      className={cn(
        'bg-neutral-200',
        orientationStyles[orientation],
        variantStyles[variant],
        spacingStyles[spacing],
        className
      )}
    />
  );
};

export default Flex;

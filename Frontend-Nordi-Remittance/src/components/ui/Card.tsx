// ============================================================================
// CARD COMPONENT - Reusable animated card with multiple variants
// ============================================================================

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@utils/cn';

// ========================
// TYPES
// ========================
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant;
  size?: CardSize;
  hoverable?: boolean;
  clickable?: boolean;
  noPadding?: boolean;
  children: React.ReactNode;
}

// ========================
// VARIANT STYLES
// ========================
const variantStyles: Record<CardVariant, string> = {
  default: cn(
    'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
    'shadow-card dark:shadow-none',
  ),
  elevated: cn(
    'bg-white dark:bg-neutral-800',
    'shadow-lg dark:shadow-neutral-900/20',
  ),
  outlined: cn(
    'bg-transparent border-2 border-neutral-200 dark:border-neutral-700',
  ),
  filled: cn(
    'bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700',
  ),
  glass: cn(
    'bg-white/70 dark:bg-neutral-900/70 backdrop-blur-lg border border-white/20 dark:border-neutral-700/50',
    'shadow-lg dark:shadow-neutral-900/20',
  ),
};

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<CardSize, string> = {
  sm: 'p-3 rounded-lg',
  md: 'p-4 rounded-xl',
  lg: 'p-6 rounded-2xl',
  xl: 'p-8 rounded-3xl',
};

// ========================
// ANIMATION VARIANTS
// ========================
const cardAnimations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  hover: { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
  tap: { scale: 0.98 },
};

// ========================
// MAIN CARD COMPONENT
// ========================
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      size = 'md',
      hoverable = false,
      clickable = false,
      noPadding = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={cardAnimations.initial}
        animate={cardAnimations.animate}
        exit={cardAnimations.exit}
        whileHover={hoverable || clickable ? cardAnimations.hover : undefined}
        whileTap={clickable ? cardAnimations.tap : undefined}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          // Base styles
          'relative overflow-hidden',
          'transition-all duration-300',
          // Variant & Size
          variantStyles[variant],
          !noPadding && sizeStyles[size],
          noPadding && (
            size === 'sm' ? 'rounded-lg' :
            size === 'md' ? 'rounded-xl' :
            size === 'lg' ? 'rounded-2xl' : 'rounded-3xl'
          ),
          // Interactive states
          clickable && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// ========================
// CARD HEADER
// ========================
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, icon, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4',
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0 p-2 rounded-lg bg-primary-50 text-primary-600">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">{action}</div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ========================
// CARD CONTENT
// ========================
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mt-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// ========================
// CARD FOOTER
// ========================
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'right', children, className, ...props }, ref) => {
    const alignStyles = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 mt-4 pt-4 border-t border-neutral-100',
          alignStyles[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// ========================
// STATS CARD
// ========================
export interface StatsCardProps extends Omit<CardProps, 'children'> {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  iconColor?: string;
}

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ label, value, change, icon, iconColor = 'bg-primary-100 text-primary-600', className, ...props }, ref) => {
    const changeColors = {
      increase: 'text-success-600 bg-success-50',
      decrease: 'text-error-600 bg-error-50',
      neutral: 'text-neutral-600 bg-neutral-50',
    };

    return (
      <Card ref={ref} variant="default" hoverable className={className} {...props}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">{label}</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 mt-1 tabular-nums">
              {value}
            </p>
            {change && (
              <div className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-2',
                changeColors[change.type]
              )}>
                {change.type === 'increase' && '↑'}
                {change.type === 'decrease' && '↓'}
                {Math.abs(change.value)}%
              </div>
            )}
          </div>
          {icon && (
            <div className={cn('p-2 sm:p-3 rounded-xl', iconColor)}>
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export default Card;

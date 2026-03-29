// ============================================================================
// SECTION COMPONENT - Consistent page section wrapper with animations
// ============================================================================

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { cn } from '@utils/cn';

// ========================
// TYPES
// ========================
export type SectionSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type SectionBackground = 'white' | 'light' | 'dark' | 'primary' | 'gradient' | 'transparent';

export interface SectionProps extends Omit<HTMLMotionProps<'section'>, 'children'> {
  children: React.ReactNode;
  size?: SectionSize;
  background?: SectionBackground;
  noPadding?: boolean;
  centered?: boolean;
  fullHeight?: boolean;
  animate?: boolean;
}

// ========================
// SIZE STYLES (max-width)
// ========================
const sizeStyles: Record<SectionSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-[1440px]',
  xl: 'max-w-[1640px]',
  full: 'max-w-full',
};

// ========================
// BACKGROUND STYLES
// ========================
const backgroundStyles: Record<SectionBackground, string> = {
  white: 'bg-white dark:bg-neutral-900',
  light: 'bg-neutral-50 dark:bg-neutral-800',
  dark: 'bg-neutral-900 text-white',
  primary: 'bg-primary-500 text-white',
  gradient: 'bg-gradient-to-br from-primary-500 to-accent-500 text-white',
  transparent: 'bg-transparent',
};

// ========================
// ANIMATION VARIANTS
// ========================
const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

// ========================
// COMPONENT
// ========================
export const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      children,
      size = 'lg',
      background = 'transparent',
      noPadding = false,
      centered = true,
      fullHeight = false,
      animate = true,
      className,
      ...props
    },
    ref
  ) => {
    const Component = animate ? motion.section : 'section';

    const motionProps = animate
      ? {
          initial: 'hidden',
          whileInView: 'visible',
          viewport: { once: true, margin: '-100px' },
          variants: sectionVariants,
        }
      : {};

    return (
      <Component
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          // Base styles
          'relative w-full',
          // Background
          backgroundStyles[background],
          // Padding
          !noPadding && 'py-8 sm:py-12 md:py-16 lg:py-20',
          // Full height
          fullHeight && 'min-h-screen',
          className
        )}
        {...motionProps}
        {...props}
      >
        <div
          className={cn(
            // Container
            'w-full px-4 sm:px-6 md:px-8 lg:px-12',
            sizeStyles[size],
            centered && 'mx-auto',
          )}
        >
          {children}
        </div>
      </Component>
    );
  }
);

Section.displayName = 'Section';

// ========================
// SECTION HEADER
// ========================
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  centered?: boolean;
  badge?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  description,
  centered = true,
  badge,
  action,
  className,
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={cn(
        'mb-8 sm:mb-12',
        centered && 'text-center',
        className
      )}
    >
      {badge && (
        <span className="inline-block px-3 py-1 mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary-600 bg-primary-100 rounded-full">
          {badge}
        </span>
      )}
      {subtitle && (
        <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-primary-500 mb-2">
          {subtitle}
        </p>
      )}
      <div className={cn(
        'flex gap-4',
        centered ? 'flex-col items-center' : 'items-start justify-between',
      )}>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white">
          {title}
        </h2>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {description && (
        <p className={cn(
          'mt-4 text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300',
          centered && 'max-w-2xl mx-auto',
        )}>
          {description}
        </p>
      )}
    </motion.div>
  );
};

export default Section;

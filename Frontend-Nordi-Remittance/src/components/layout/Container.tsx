// ============================================================================
// CONTAINER COMPONENT - Max-width wrapper with responsive padding
// ============================================================================

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@utils/cn';

// ========================
// TYPES
// ========================
export type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ContainerProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  size?: ContainerSize;
  centered?: boolean;
  noPadding?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<ContainerSize, string> = {
  xs: 'max-w-xs',      // 320px
  sm: 'max-w-xl',      // 576px
  md: 'max-w-3xl',     // 768px
  lg: 'max-w-5xl',     // 1024px
  xl: 'max-w-7xl',     // 1280px
  '2xl': 'max-w-[1536px]',
  full: 'max-w-full',
};

// ========================
// COMPONENT
// ========================
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      size = 'xl',
      centered = true,
      noPadding = false,
      as = 'div',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'w-full',
          sizeStyles[size],
          centered && 'mx-auto',
          !noPadding && 'px-4 sm:px-6 md:px-8',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Container.displayName = 'Container';

export default Container;

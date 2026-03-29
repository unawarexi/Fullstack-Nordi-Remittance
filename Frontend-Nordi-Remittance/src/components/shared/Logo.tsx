// ============================================================================
// LOGO - Consistent brand logo component
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';

// ========================
// TYPES
// ========================
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LogoVariant = 'full' | 'icon' | 'text';

export interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  color?: 'default' | 'white' | 'dark';
  href?: string;
  onClick?: () => void;
  animated?: boolean;
  className?: string;
}

// ========================
// SIZE CONFIGURATION
// ========================
const sizeConfig: Record<LogoSize, { icon: string; text: string; height: string }> = {
  xs: { icon: 'w-6 h-6', text: 'text-sm', height: 'h-6' },
  sm: { icon: 'w-8 h-8', text: 'text-base', height: 'h-8' },
  md: { icon: 'w-10 h-10', text: 'text-lg', height: 'h-10' },
  lg: { icon: 'w-12 h-12', text: 'text-xl', height: 'h-12' },
  xl: { icon: 'w-16 h-16', text: 'text-2xl', height: 'h-16' },
};

// ========================
// COLOR CONFIGURATION
// ========================
const colorConfig: Record<string, { primary: string; secondary: string; text: string }> = {
  default: {
    primary: 'text-primary-600',
    secondary: 'text-primary-400',
    text: 'text-neutral-900 dark:text-white',
  },
  white: {
    primary: 'text-white',
    secondary: 'text-white/70',
    text: 'text-white',
  },
  dark: {
    primary: 'text-neutral-800 dark:text-neutral-100',
    secondary: 'text-neutral-600 dark:text-neutral-300',
    text: 'text-neutral-900 dark:text-white',
  },
};

// ========================
// LOGO ICON (SVG)
// ========================
const LogoIcon: React.FC<{ className?: string; primaryColor?: string; secondaryColor?: string }> = ({
  className,
  primaryColor = 'currentColor',
  secondaryColor = 'currentColor',
}) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main circle */}
    <circle
      cx="20"
      cy="20"
      r="18"
      stroke={primaryColor}
      strokeWidth="2.5"
      fill="none"
    />
    
    {/* Inner design - stylized "R" for Remit */}
    <path
      d="M14 12h8c2.5 0 4.5 2 4.5 4.5S24.5 21 22 21h-4l6 7"
      stroke={primaryColor}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    
    {/* Arrow indicating transfer/remittance */}
    <path
      d="M26 15l3-3m0 0l-3-3m3 3H19"
      stroke={secondaryColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.7"
    />
  </svg>
);

// ========================
// COMPONENT
// ========================
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  color = 'default',
  href,
  onClick,
  animated = true,
  className,
}) => {
  const sizes = sizeConfig[size];
  const colors = colorConfig[color];

  const content = (
    <>
      {/* Icon */}
      {(variant === 'full' || variant === 'icon') && (
        <motion.div
          whileHover={animated ? { rotate: 10, scale: 1.05 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={cn(sizes.icon, colors.primary)}
        >
          <LogoIcon className="w-full h-full" />
        </motion.div>
      )}

      {/* Text */}
      {(variant === 'full' || variant === 'text') && (
        <span className={cn('font-bold tracking-tight', sizes.text, colors.text)}>
          Remit
          <span className={colors.primary}>.</span>
        </span>
      )}
    </>
  );

  const wrapperClass = cn(
    'inline-flex items-center gap-2',
    (href || onClick) && 'cursor-pointer',
    className
  );

  if (href) {
    return (
      <motion.a
        href={href}
        whileTap={animated ? { scale: 0.98 } : undefined}
        className={wrapperClass}
      >
        {content}
      </motion.a>
    );
  }

  if (onClick) {
    return (
      <motion.button
        onClick={onClick}
        whileTap={animated ? { scale: 0.98 } : undefined}
        className={wrapperClass}
      >
        {content}
      </motion.button>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
};

// ========================
// LOGO WITH TAGLINE
// ========================
export interface LogoWithTaglineProps extends LogoProps {
  tagline?: string;
}

export const LogoWithTagline: React.FC<LogoWithTaglineProps> = ({
  tagline = 'Send money globally',
  ...props
}) => {
  return (
    <div className="flex flex-col">
      <Logo {...props} />
      {tagline && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 ml-10">
          {tagline}
        </span>
      )}
    </div>
  );
};

export default Logo;

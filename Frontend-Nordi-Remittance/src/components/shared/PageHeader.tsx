// ============================================================================
// PAGE HEADER - Consistent page header with title, breadcrumbs, and actions
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@components/ui/Button';

// ========================
// TYPES
// ========================
export interface Breadcrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  sticky?: boolean;
  className?: string;
}

// ========================
// SIZE STYLES
// ========================
const sizeStyles = {
  sm: {
    title: 'text-lg sm:text-xl font-semibold',
    subtitle: 'text-sm',
    description: 'text-xs',
    padding: 'py-3 sm:py-4',
  },
  md: {
    title: 'text-xl sm:text-2xl font-bold',
    subtitle: 'text-sm sm:text-base',
    description: 'text-sm',
    padding: 'py-4 sm:py-6',
  },
  lg: {
    title: 'text-2xl sm:text-3xl md:text-4xl font-bold',
    subtitle: 'text-base sm:text-lg',
    description: 'text-sm sm:text-base',
    padding: 'py-6 sm:py-8',
  },
};

// ========================
// COMPONENT
// ========================
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  breadcrumbs,
  showBackButton = false,
  onBack,
  actions,
  badge,
  icon,
  size = 'md',
  sticky = false,
  className,
}) => {
  const styles = sizeStyles[size];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        styles.padding,
        sticky && 'sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border-b border-neutral-200 dark:border-gray-800',
        className
      )}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-sm mb-2 flex-wrap">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight size={14} className="text-neutral-400 dark:text-gray-500 dark:text-neutral-400" />
              )}
              {crumb.href || crumb.onClick ? (
                <a
                  href={crumb.href}
                  onClick={(e) => {
                    if (crumb.onClick) {
                      e.preventDefault();
                      crumb.onClick();
                    }
                  }}
                  className="text-neutral-500 dark:text-gray-400 dark:text-neutral-500 hover:text-primary-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-neutral-700 dark:text-gray-200 font-medium">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left side */}
        <div className="flex items-start gap-3 min-w-0">
          {/* Back button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex-shrink-0 -ml-2"
            >
              <ArrowLeft size={20} />
            </Button>
          )}

          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-100 dark:bg-indigo-950/50 text-primary-600 dark:text-indigo-400 flex items-center justify-center">
              {icon}
            </div>
          )}

          {/* Title area */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {subtitle && (
                <span className={cn('text-neutral-500 dark:text-gray-400 dark:text-neutral-500', styles.subtitle)}>
                  {subtitle}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={cn('text-neutral-900 dark:text-white truncate', styles.title)}>
                {title}
              </h1>
              {badge}
            </div>

            {description && (
              <p className={cn('text-neutral-500 dark:text-gray-400 dark:text-neutral-500 mt-1', styles.description)}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </motion.header>
  );
};

// ========================
// SECTION HEADER (smaller variant)
// ========================
export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  action,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-neutral-500 dark:text-gray-400 dark:text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
};

export default PageHeader;

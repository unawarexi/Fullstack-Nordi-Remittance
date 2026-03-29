// ============================================================================
// EMPTY STATE - Placeholder for empty content areas
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { FileQuestion, Search, Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@components/ui/Button';

// ========================
// TYPES
// ========================
export type EmptyStateVariant = 'default' | 'search' | 'inbox' | 'error' | 'custom';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ========================
// VARIANT CONFIG
// ========================
const variantConfig: Record<EmptyStateVariant, {
  icon: React.ReactNode;
  title: string;
  description: string;
}> = {
  default: {
    icon: <Inbox size={48} />,
    title: 'No data available',
    description: 'There\'s nothing to display here yet.',
  },
  search: {
    icon: <Search size={48} />,
    title: 'No results found',
    description: 'We couldn\'t find anything matching your search.',
  },
  inbox: {
    icon: <Inbox size={48} />,
    title: 'Your inbox is empty',
    description: 'No messages or notifications to display.',
  },
  error: {
    icon: <AlertCircle size={48} />,
    title: 'Something went wrong',
    description: 'We encountered an error loading this content.',
  },
  custom: {
    icon: <FileQuestion size={48} />,
    title: '',
    description: '',
  },
};

// ========================
// SIZE STYLES
// ========================
const sizeStyles = {
  sm: {
    padding: 'py-8 px-4',
    iconSize: 'w-10 h-10',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    padding: 'py-12 px-6',
    iconSize: 'w-12 h-12',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    padding: 'py-16 px-8',
    iconSize: 'w-16 h-16',
    title: 'text-xl',
    description: 'text-base',
  },
};

// ========================
// COMPONENT
// ========================
export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  icon,
  action,
  secondaryAction,
  size = 'md',
  className,
}) => {
  const config = variantConfig[variant];
  const styles = sizeStyles[size];

  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        styles.padding,
        className
      )}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="text-neutral-300 dark:text-gray-600 dark:text-neutral-300 mb-4"
      >
        {displayIcon}
      </motion.div>

      {/* Title */}
      {displayTitle && (
        <h3 className={cn('font-semibold text-neutral-700 dark:text-gray-200 mb-2', styles.title)}>
          {displayTitle}
        </h3>
      )}

      {/* Description */}
      {displayDescription && (
        <p className={cn('text-neutral-500 dark:text-gray-400 dark:text-neutral-500 max-w-sm mb-6', styles.description)}>
          {displayDescription}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ========================
// LOADING STATE
// ========================
export interface LoadingStateProps {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading...',
  description,
  size = 'md',
  className,
}) => {
  const styles = sizeStyles[size];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      styles.padding,
      className
    )}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="text-primary-500 mb-4"
      >
        <RefreshCw className={styles.iconSize} />
      </motion.div>

      <h3 className={cn('font-medium text-neutral-700 dark:text-gray-200 mb-1', styles.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn('text-neutral-500 dark:text-gray-400 dark:text-neutral-500', styles.description)}>
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;

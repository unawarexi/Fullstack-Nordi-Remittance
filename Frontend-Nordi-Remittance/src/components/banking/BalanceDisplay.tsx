// ============================================================================
// BALANCE DISPLAY - Currency formatted balance with animations
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@utils/cn';
import { Eye, EyeOff } from 'lucide-react';

// ========================
// TYPES
// ========================
export type BalanceSize = 'sm' | 'md' | 'lg' | 'xl';
export type BalanceVariant = 'default' | 'positive' | 'negative' | 'muted';

export interface BalanceDisplayProps {
  amount: number;
  currency?: string;
  currencySymbol?: string;
  size?: BalanceSize;
  variant?: BalanceVariant;
  showSymbol?: boolean;
  showCurrency?: boolean;
  hideable?: boolean;
  hidden?: boolean;
  onToggleVisibility?: () => void;
  animate?: boolean;
  label?: string;
  className?: string;
}

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<BalanceSize, { amount: string; currency: string; label: string }> = {
  sm: {
    amount: 'text-lg sm:text-xl font-semibold',
    currency: 'text-xs sm:text-sm',
    label: 'text-xs',
  },
  md: {
    amount: 'text-xl sm:text-2xl md:text-3xl font-bold',
    currency: 'text-sm sm:text-base',
    label: 'text-xs sm:text-sm',
  },
  lg: {
    amount: 'text-2xl sm:text-3xl md:text-4xl font-bold',
    currency: 'text-base sm:text-lg',
    label: 'text-sm',
  },
  xl: {
    amount: 'text-3xl sm:text-4xl md:text-5xl font-bold',
    currency: 'text-lg sm:text-xl',
    label: 'text-sm sm:text-base',
  },
};

// ========================
// VARIANT STYLES
// ========================
const variantStyles: Record<BalanceVariant, string> = {
  default: 'text-neutral-900 dark:text-white',
  positive: 'text-success-600',
  negative: 'text-error-600',
  muted: 'text-neutral-500 dark:text-neutral-400',
};

// ========================
// HELPER FUNCTIONS
// ========================
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    JPY: '¥',
    CNY: '¥',
    INR: '₹',
    BTC: '₿',
    ETH: 'Ξ',
  };
  return symbols[currency] || currency;
};

// ========================
// COMPONENT
// ========================
export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  amount,
  currency = 'USD',
  currencySymbol,
  size = 'md',
  variant = 'default',
  showSymbol = true,
  showCurrency = true,
  hideable = false,
  hidden: controlledHidden,
  onToggleVisibility,
  animate = true,
  label,
  className,
}) => {
  const [internalHidden, setInternalHidden] = useState(false);
  const isHidden = controlledHidden !== undefined ? controlledHidden : internalHidden;
  
  const sizeConfig = sizeStyles[size];
  const symbol = currencySymbol || getCurrencySymbol(currency);
  const formattedAmount = formatCurrency(amount, currency);
  const displayVariant = amount < 0 ? 'negative' : variant;

  const handleToggle = () => {
    if (onToggleVisibility) {
      onToggleVisibility();
    } else {
      setInternalHidden(!internalHidden);
    }
  };

  const BalanceContent = () => (
    <AnimatePresence mode="wait">
      {isHidden ? (
        <motion.span
          key="hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(sizeConfig.amount, 'tracking-wider')}
        >
          ••••••
        </motion.span>
      ) : (
        <motion.span
          key="visible"
          initial={animate ? { opacity: 0, y: 10 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(sizeConfig.amount, 'tabular-nums')}
        >
          {showSymbol && <span className="mr-0.5">{symbol}</span>}
          {formattedAmount}
        </motion.span>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <span className={cn(sizeConfig.label, 'text-neutral-500 dark:text-neutral-400 mb-1')}>
          {label}
        </span>
      )}
      
      <div className={cn('flex items-center gap-2', variantStyles[displayVariant])}>
        <BalanceContent />
        
        {showCurrency && !isHidden && (
          <span className={cn(sizeConfig.currency, 'text-neutral-500 dark:text-neutral-400 font-medium')}>
            {currency}
          </span>
        )}
        
        {hideable && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:bg-neutral-700 transition-colors text-neutral-400 hover:text-neutral-600 dark:text-neutral-300"
            aria-label={isHidden ? 'Show balance' : 'Hide balance'}
          >
            {isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
          </motion.button>
        )}
      </div>
    </div>
  );
};

// ========================
// COMPACT BALANCE
// ========================
export interface CompactBalanceProps {
  amount: number;
  currency?: string;
  label?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export const CompactBalance: React.FC<CompactBalanceProps> = ({
  amount,
  currency = 'USD',
  label,
  trend,
  trendValue,
  className,
}) => {
  const symbol = getCurrencySymbol(currency);
  const formattedAmount = formatCurrency(amount, currency);

  const trendColors = {
    up: 'text-success-600 bg-success-50',
    down: 'text-error-600 bg-error-50',
    neutral: 'text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700',
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        {label && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">{label}</p>
        )}
        <p className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white tabular-nums">
          {symbol}{formattedAmount}
        </p>
      </div>
      
      {trend && trendValue && (
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          trendColors[trend]
        )}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trendValue}
        </span>
      )}
    </div>
  );
};

export default BalanceDisplay;

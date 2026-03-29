// ============================================================================
// ACCOUNT CARD - Bank account display card with balance and actions
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { 
  Wallet, 
  CreditCard, 
  Building, 
  PiggyBank, 
  TrendingUp,
  MoreVertical,
  Copy,
  ExternalLink 
} from 'lucide-react';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { BalanceDisplay } from './BalanceDisplay';

// ========================
// TYPES
// ========================
export type AccountType = 'savings' | 'checking' | 'business' | 'investment' | 'credit';
export type AccountStatus = 'active' | 'frozen' | 'pending' | 'closed';

export interface AccountCardProps {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  currency?: string;
  type: AccountType;
  status?: AccountStatus;
  isPrimary?: boolean;
  lastTransaction?: {
    date: string;
    amount: number;
    type: 'credit' | 'debit';
  };
  onClick?: () => void;
  onCopyAccountNumber?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

// ========================
// ACCOUNT TYPE CONFIG
// ========================
const accountTypeConfig: Record<AccountType, { icon: React.ReactNode; label: string; gradient: string }> = {
  savings: {
    icon: <PiggyBank size={20} />,
    label: 'Savings',
    gradient: 'from-emerald-500 to-teal-600',
  },
  checking: {
    icon: <Wallet size={20} />,
    label: 'Checking',
    gradient: 'from-blue-500 to-indigo-600',
  },
  business: {
    icon: <Building size={20} />,
    label: 'Business',
    gradient: 'from-purple-500 to-violet-600',
  },
  investment: {
    icon: <TrendingUp size={20} />,
    label: 'Investment',
    gradient: 'from-amber-500 to-orange-600',
  },
  credit: {
    icon: <CreditCard size={20} />,
    label: 'Credit',
    gradient: 'from-rose-500 to-pink-600',
  },
};

// ========================
// STATUS CONFIG
// ========================
const statusConfig: Record<AccountStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }> = {
  active: { label: 'Active', variant: 'success' },
  frozen: { label: 'Frozen', variant: 'error' },
  pending: { label: 'Pending', variant: 'warning' },
  closed: { label: 'Closed', variant: 'default' },
};

// ========================
// COMPONENT
// ========================
export const AccountCard: React.FC<AccountCardProps> = ({
  id,
  name,
  accountNumber,
  balance,
  currency = 'USD',
  type,
  status = 'active',
  isPrimary = false,
  lastTransaction,
  onClick,
  onCopyAccountNumber,
  onViewDetails,
  className,
}) => {
  const typeConfig = accountTypeConfig[type];
  const statusInfo = statusConfig[status];

  const maskAccountNumber = (num: string): string => {
    if (num.length <= 4) return num;
    return `****${num.slice(-4)}`;
  };

  return (
    <Card
      variant="elevated"
      hoverable
      clickable={!!onClick}
      onClick={onClick}
      className={cn('overflow-hidden', className)}
    >
      {/* Gradient header */}
      <div className={cn(
        'h-2 -mx-4 -mt-4 mb-4 bg-gradient-to-r',
        typeConfig.gradient
      )} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-xl bg-gradient-to-br text-white',
            typeConfig.gradient
          )}>
            {typeConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base">
                {name}
              </h3>
              {isPrimary && (
                <Badge variant="primary" size="xs">Primary</Badge>
              )}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{typeConfig.label} Account</p>
          </div>
        </div>

        <Badge variant={statusInfo.variant} size="sm" dot>
          {statusInfo.label}
        </Badge>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <BalanceDisplay
          amount={balance}
          currency={currency}
          size="md"
          hideable
          label="Available Balance"
        />
      </div>

      {/* Account Number */}
      <div className="flex items-center justify-between py-3 border-t border-neutral-100 dark:border-neutral-700">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Account Number</p>
          <p className="text-sm font-mono text-neutral-700 dark:text-neutral-200">
            {maskAccountNumber(accountNumber)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {onCopyAccountNumber && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onCopyAccountNumber();
              }}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-200 transition-colors"
              aria-label="Copy account number"
            >
              <Copy size={16} />
            </motion.button>
          )}
          {onViewDetails && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-200 transition-colors"
              aria-label="View details"
            >
              <ExternalLink size={16} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Last Transaction */}
      {lastTransaction && (
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Last Transaction</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-600 dark:text-neutral-300">{lastTransaction.date}</span>
            <span className={cn(
              'text-sm font-semibold',
              lastTransaction.type === 'credit' ? 'text-success-600' : 'text-error-600'
            )}>
              {lastTransaction.type === 'credit' ? '+' : '-'}
              ${Math.abs(lastTransaction.amount).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

// ========================
// COMPACT ACCOUNT CARD
// ========================
export interface CompactAccountCardProps {
  name: string;
  accountNumber: string;
  balance: number;
  currency?: string;
  type: AccountType;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CompactAccountCard: React.FC<CompactAccountCardProps> = ({
  name,
  accountNumber,
  balance,
  currency = 'USD',
  type,
  selected = false,
  onClick,
  className,
}) => {
  const typeConfig = accountTypeConfig[type];

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all',
        'border-2',
        selected
          ? 'border-primary-500 bg-primary-50'
          : 'border-transparent bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:bg-neutral-700',
        className
      )}
    >
      <div className={cn(
        'p-2 rounded-lg bg-gradient-to-br text-white',
        typeConfig.gradient
      )}>
        {typeConfig.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">{name}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">****{accountNumber.slice(-4)}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-neutral-900 dark:text-white text-sm tabular-nums">
          ${balance.toFixed(2)}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{currency}</p>
      </div>
    </motion.div>
  );
};

export default AccountCard;

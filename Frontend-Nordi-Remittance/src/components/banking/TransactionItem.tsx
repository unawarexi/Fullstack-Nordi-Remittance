// ============================================================================
// TRANSACTION ITEM - Individual transaction display with animations
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Repeat, 
  CreditCard,
  ShoppingBag,
  Home,
  Utensils,
  Car,
  Plane,
  Heart,
  Gift,
  Smartphone,
  MoreHorizontal
} from 'lucide-react';
import { Badge, StatusBadge } from '@components/ui/Badge';
import { Avatar } from '@components/ui/Avatar';

// ========================
// TYPES
// ========================
export type TransactionType = 'credit' | 'debit' | 'transfer' | 'refund';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'processing';
export type TransactionCategory = 
  | 'shopping' 
  | 'food' 
  | 'transport' 
  | 'travel' 
  | 'housing' 
  | 'health' 
  | 'entertainment'
  | 'gift'
  | 'transfer'
  | 'salary'
  | 'utilities'
  | 'other';

export interface TransactionItemProps {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  type: TransactionType;
  status?: TransactionStatus;
  category?: TransactionCategory;
  date: string;
  time?: string;
  recipientName?: string;
  recipientAvatar?: string;
  reference?: string;
  onClick?: () => void;
  className?: string;
}

// ========================
// CATEGORY CONFIG
// ========================
const categoryConfig: Record<TransactionCategory, { icon: React.ReactNode; color: string }> = {
  shopping: { icon: <ShoppingBag size={18} />, color: 'bg-pink-100 text-pink-600' },
  food: { icon: <Utensils size={18} />, color: 'bg-orange-100 text-orange-600' },
  transport: { icon: <Car size={18} />, color: 'bg-blue-100 text-blue-600' },
  travel: { icon: <Plane size={18} />, color: 'bg-cyan-100 text-cyan-600' },
  housing: { icon: <Home size={18} />, color: 'bg-purple-100 text-purple-600' },
  health: { icon: <Heart size={18} />, color: 'bg-red-100 text-red-600' },
  entertainment: { icon: <Smartphone size={18} />, color: 'bg-indigo-100 text-indigo-600' },
  gift: { icon: <Gift size={18} />, color: 'bg-yellow-100 text-yellow-600' },
  transfer: { icon: <Repeat size={18} />, color: 'bg-emerald-100 text-emerald-600' },
  salary: { icon: <ArrowDownLeft size={18} />, color: 'bg-green-100 text-green-600' },
  utilities: { icon: <Home size={18} />, color: 'bg-slate-100 text-slate-600' },
  other: { icon: <MoreHorizontal size={18} />, color: 'bg-neutral-100 text-neutral-600' },
};

// ========================
// TYPE CONFIG
// ========================
const typeConfig: Record<TransactionType, { icon: React.ReactNode; color: string }> = {
  credit: { icon: <ArrowDownLeft size={18} />, color: 'bg-success-100 text-success-600' },
  debit: { icon: <ArrowUpRight size={18} />, color: 'bg-error-100 text-error-600' },
  transfer: { icon: <Repeat size={18} />, color: 'bg-primary-100 text-primary-600' },
  refund: { icon: <ArrowDownLeft size={18} />, color: 'bg-amber-100 text-amber-600' },
};

// ========================
// HELPER FUNCTIONS
// ========================
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(amount));
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ========================
// COMPONENT
// ========================
export const TransactionItem: React.FC<TransactionItemProps> = ({
  id,
  title,
  description,
  amount,
  currency = 'USD',
  type,
  status = 'completed',
  category,
  date,
  time,
  recipientName,
  recipientAvatar,
  reference,
  onClick,
  className,
}) => {
  const isIncome = type === 'credit' || type === 'refund';
  const catConfig = category ? categoryConfig[category] : typeConfig[type];
  
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Icon/Avatar */}
      {recipientAvatar ? (
        <Avatar 
          src={recipientAvatar} 
          name={recipientName || title} 
          size="md"
        />
      ) : (
        <div className={cn(
          'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0',
          catConfig.color
        )}>
          {catConfig.icon}
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-neutral-900 text-sm sm:text-base truncate">
              {title}
            </p>
            {description && (
              <p className="text-xs sm:text-sm text-neutral-500 truncate">
                {description}
              </p>
            )}
          </div>
          
          {/* Amount */}
          <div className="text-right flex-shrink-0">
            <p className={cn(
              'font-semibold text-sm sm:text-base tabular-nums',
              isIncome ? 'text-success-600' : 'text-neutral-900'
            )}>
              {isIncome ? '+' : '-'}{formatCurrency(amount, currency)}
            </p>
            {status !== 'completed' && (
              <StatusBadge status={status as any} size="xs" showDot={false} />
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-neutral-400">{formatDate(date)}</span>
          {time && (
            <>
              <span className="text-xs text-neutral-300">•</span>
              <span className="text-xs text-neutral-400">{time}</span>
            </>
          )}
          {reference && (
            <>
              <span className="text-xs text-neutral-300">•</span>
              <span className="text-xs text-neutral-400 font-mono">#{reference}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ========================
// TRANSACTION LIST
// ========================
export interface TransactionListProps {
  transactions: TransactionItemProps[];
  groupByDate?: boolean;
  emptyMessage?: string;
  onTransactionClick?: (id: string) => void;
  className?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  groupByDate = false,
  emptyMessage = 'No transactions found',
  onTransactionClick,
  className,
}) => {
  if (transactions.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  if (!groupByDate) {
    return (
      <div className={cn('divide-y divide-neutral-100', className)}>
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TransactionItem
              {...transaction}
              onClick={() => onTransactionClick?.(transaction.id)}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // Group by date
  const grouped = transactions.reduce((acc, transaction) => {
    const dateKey = formatDate(transaction.date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(transaction);
    return acc;
  }, {} as Record<string, TransactionItemProps[]>);

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <h4 className="text-sm font-medium text-neutral-500 mb-2 px-4">
            {date}
          </h4>
          <div className="bg-white rounded-xl divide-y divide-neutral-100">
            {items.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                {...transaction}
                onClick={() => onTransactionClick?.(transaction.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionItem;

// ============================================================================
// CREDIT CARD DISPLAY - Visual bank card component
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { Wifi, Eye, EyeOff, Copy, Snowflake, Lock } from 'lucide-react';

// ========================
// TYPES
// ========================
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover';
export type CardType = 'debit' | 'credit' | 'virtual';
export type CardStatus = 'active' | 'frozen' | 'expired' | 'blocked';

export interface CreditCardDisplayProps {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv?: string;
  brand?: CardBrand;
  type?: CardType;
  status?: CardStatus;
  variant?: 'default' | 'dark' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onCopy?: (value: string) => void;
  onClick?: () => void;
  className?: string;
}

// ========================
// BRAND LOGOS (SVG)
// ========================
const BrandLogos: Record<CardBrand, React.ReactNode> = {
  visa: (
    <svg viewBox="0 0 48 48" fill="currentColor" className="w-full h-full">
      <path d="M32 10L20 38h-5L8 10h5l5 20 5-20h9zm4 0h-4l-4 28h4l4-28zm8 0l-4 28h4l4-28h-4z"/>
    </svg>
  ),
  mastercard: (
    <div className="flex">
      <div className="w-6 h-6 rounded-full bg-red-500 -mr-2" />
      <div className="w-6 h-6 rounded-full bg-yellow-500 opacity-80" />
    </div>
  ),
  amex: (
    <div className="text-xs font-bold">AMEX</div>
  ),
  discover: (
    <div className="text-xs font-bold">DISCOVER</div>
  ),
};

// ========================
// VARIANT STYLES
// ========================
const variantStyles: Record<string, string> = {
  default: 'bg-gradient-to-br from-primary-600 to-primary-800 text-white',
  dark: 'bg-gradient-to-br from-neutral-800 to-neutral-950 text-white',
  gradient: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white',
  glass: 'bg-white/20 backdrop-blur-xl border border-white/30 text-white',
};

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<string, { card: string; text: string; number: string }> = {
  sm: { card: 'w-64 h-40 p-4', text: 'text-xs', number: 'text-sm' },
  md: { card: 'w-80 h-48 p-5', text: 'text-sm', number: 'text-base' },
  lg: { card: 'w-96 h-56 p-6', text: 'text-base', number: 'text-lg' },
};

// ========================
// COMPONENT
// ========================
export const CreditCardDisplay: React.FC<CreditCardDisplayProps> = ({
  cardNumber,
  cardholderName,
  expiryDate,
  cvv,
  brand = 'visa',
  type = 'debit',
  status = 'active',
  variant = 'default',
  size = 'md',
  showDetails: controlledShowDetails,
  onCopy,
  onClick,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(controlledShowDetails ?? false);
  const sizeConfig = sizeStyles[size];

  // Format card number
  const formatCardNumber = (num: string, show: boolean): string => {
    const clean = num.replace(/\s/g, '');
    const chunks = clean.match(/.{1,4}/g) || [];
    
    if (show) {
      return chunks.join(' ');
    }
    
    return chunks.map((chunk, index) => 
      index === chunks.length - 1 ? chunk : '••••'
    ).join(' ');
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    onCopy?.(value);
  };

  const isDisabled = status === 'frozen' || status === 'blocked' || status === 'expired';

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, rotateY: 5 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl overflow-hidden shadow-xl',
        'transform perspective-1000',
        sizeConfig.card,
        variantStyles[variant],
        isDisabled && 'opacity-75',
        onClick && 'cursor-pointer',
        className
      )}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Status overlay */}
      {status === 'frozen' && (
        <div className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-white">
            <Snowflake className="w-6 h-6" />
            <span className="font-semibold">Card Frozen</span>
          </div>
        </div>
      )}

      {status === 'blocked' && (
        <div className="absolute inset-0 bg-red-900/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-white">
            <Lock className="w-6 h-6" />
            <span className="font-semibold">Card Blocked</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-0 h-full flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Wifi className={cn('transform rotate-90', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
            <span className={cn('font-medium uppercase', sizeConfig.text)}>
              {type}
            </span>
          </div>
          
          <div className={cn('w-10 h-8', size === 'sm' && 'w-8 h-6')}>
            {BrandLogos[brand]}
          </div>
        </div>

        {/* Chip */}
        <div className={cn(
          'rounded bg-gradient-to-br from-yellow-300 to-yellow-500',
          size === 'sm' ? 'w-8 h-6' : 'w-10 h-8'
        )}>
          <div className="w-full h-full grid grid-cols-2 gap-px p-1">
            <div className="bg-yellow-400/50 rounded-sm" />
            <div className="bg-yellow-400/50 rounded-sm" />
            <div className="bg-yellow-400/50 rounded-sm" />
            <div className="bg-yellow-400/50 rounded-sm" />
          </div>
        </div>

        {/* Card Number */}
        <div className="flex items-center gap-2">
          <span className={cn('font-mono tracking-wider', sizeConfig.number)}>
            {formatCardNumber(cardNumber, showDetails)}
          </span>
          {onCopy && showDetails && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(cardNumber.replace(/\s/g, ''));
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Copy className="w-3 h-3" />
            </motion.button>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <p className={cn('opacity-70 uppercase mb-0.5', size === 'sm' ? 'text-[8px]' : 'text-[10px]')}>
              Card Holder
            </p>
            <p className={cn('font-medium uppercase tracking-wide', sizeConfig.text)}>
              {cardholderName}
            </p>
          </div>
          
          <div className="text-right">
            <p className={cn('opacity-70 uppercase mb-0.5', size === 'sm' ? 'text-[8px]' : 'text-[10px]')}>
              Expires
            </p>
            <p className={cn('font-mono', sizeConfig.text)}>
              {showDetails ? expiryDate : '••/••'}
            </p>
          </div>

          {/* Toggle visibility */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            {showDetails ? (
              <EyeOff className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
            ) : (
              <Eye className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ========================
// MINI CARD (for lists)
// ========================
export interface MiniCardProps {
  last4: string;
  brand: CardBrand;
  type?: CardType;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MiniCard: React.FC<MiniCardProps> = ({
  last4,
  brand,
  type = 'debit',
  selected = false,
  onClick,
  className,
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer',
        'border-2',
        selected
          ? 'border-primary-500 bg-primary-50'
          : 'border-transparent bg-neutral-50 hover:bg-neutral-100',
        className
      )}
    >
      <div className="w-12 h-8 rounded bg-gradient-to-br from-neutral-700 to-neutral-900 flex items-center justify-center text-white">
        <div className="w-6 h-4">{BrandLogos[brand]}</div>
      </div>
      <div className="flex-1">
        <p className="font-medium text-neutral-900 text-sm">
          •••• {last4}
        </p>
        <p className="text-xs text-neutral-500 capitalize">{type} Card</p>
      </div>
    </motion.div>
  );
};

export default CreditCardDisplay;

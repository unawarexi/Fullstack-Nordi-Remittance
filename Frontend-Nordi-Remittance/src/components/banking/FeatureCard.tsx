// ============================================================================
// FEATURE CARD - Landing page feature/service display
// ============================================================================

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@utils/cn';
import { ArrowRight } from 'lucide-react';

// ========================
// TYPES
// ========================
export type FeatureCardVariant = 'default' | 'outlined' | 'filled' | 'glass' | 'gradient';
export type FeatureCardSize = 'sm' | 'md' | 'lg';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  variant?: FeatureCardVariant;
  size?: FeatureCardSize;
  href?: string;
  onClick?: () => void;
  badge?: string;
  className?: string;
}

// ========================
// VARIANT STYLES
// ========================
const variantStyles: Record<FeatureCardVariant, string> = {
  default: 'bg-white border border-neutral-200 hover:border-primary-200 hover:shadow-lg',
  outlined: 'bg-transparent border-2 border-neutral-200 hover:border-primary-500',
  filled: 'bg-neutral-50 hover:bg-neutral-100',
  glass: 'bg-white/60 backdrop-blur-lg border border-white/20 shadow-lg',
  gradient: 'bg-gradient-to-br from-primary-500 to-accent-500 text-white',
};

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<FeatureCardSize, { padding: string; icon: string; title: string; desc: string }> = {
  sm: {
    padding: 'p-4',
    icon: 'w-10 h-10 p-2',
    title: 'text-base font-semibold',
    desc: 'text-xs',
  },
  md: {
    padding: 'p-6',
    icon: 'w-12 h-12 p-2.5',
    title: 'text-lg font-semibold',
    desc: 'text-sm',
  },
  lg: {
    padding: 'p-8',
    icon: 'w-14 h-14 p-3',
    title: 'text-xl font-bold',
    desc: 'text-base',
  },
};

// ========================
// ANIMATION
// ========================
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
};

// ========================
// COMPONENT
// ========================
export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  image,
  variant = 'default',
  size = 'md',
  href,
  onClick,
  badge,
  className,
}) => {
  const sizeConfig = sizeStyles[size];
  const isGradient = variant === 'gradient';
  const isClickable = !!href || !!onClick;

  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper {...wrapperProps}>
      <motion.div
        variants={cardVariants}
        whileHover={isClickable ? { y: -4, scale: 1.01 } : undefined}
        whileTap={isClickable ? { scale: 0.98 } : undefined}
        onClick={onClick}
        className={cn(
          'relative rounded-2xl overflow-hidden transition-all duration-300',
          sizeConfig.padding,
          variantStyles[variant],
          isClickable && 'cursor-pointer',
          className
        )}
      >
        {/* Badge */}
        {badge && (
          <span className={cn(
            'absolute top-4 right-4 px-2 py-0.5 text-xs font-semibold rounded-full',
            isGradient ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'
          )}>
            {badge}
          </span>
        )}

        {/* Image */}
        {image && (
          <div className="mb-4 -mx-6 -mt-6 h-40 overflow-hidden">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Icon */}
        {icon && !image && (
          <div className={cn(
            'rounded-xl mb-4',
            sizeConfig.icon,
            isGradient 
              ? 'bg-white/20' 
              : 'bg-primary-100 text-primary-600'
          )}>
            {icon}
          </div>
        )}

        {/* Content */}
        <h3 className={cn(
          sizeConfig.title,
          isGradient ? 'text-white' : 'text-neutral-900'
        )}>
          {title}
        </h3>
        <p className={cn(
          'mt-2 leading-relaxed',
          sizeConfig.desc,
          isGradient ? 'text-white/80' : 'text-neutral-600'
        )}>
          {description}
        </p>

        {/* Link arrow */}
        {isClickable && (
          <div className={cn(
            'mt-4 flex items-center gap-1 text-sm font-medium',
            isGradient ? 'text-white' : 'text-primary-600'
          )}>
            Learn more
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </motion.div>
    </Wrapper>
  );
};

// ========================
// SERVICE CARD (with image background)
// ========================
export interface ServiceCardProps {
  title: string;
  description?: string;
  image: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  image,
  icon,
  href,
  onClick,
  className,
}) => {
  const isClickable = !!href || !!onClick;
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper {...wrapperProps}>
      <motion.div
        variants={cardVariants}
        whileHover={isClickable ? { scale: 1.02 } : undefined}
        whileTap={isClickable ? { scale: 0.98 } : undefined}
        onClick={onClick}
        className={cn(
          'relative h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden group',
          isClickable && 'cursor-pointer',
          className
        )}
      >
        {/* Background image */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          {/* Glassmorphism card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  {icon}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-white text-sm sm:text-base">
                  {title}
                </h3>
                {description && (
                  <p className="text-white/70 text-xs sm:text-sm mt-0.5 line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Wrapper>
  );
};

// ========================
// ICON FEATURE CARD (minimal)
// ========================
export interface IconFeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export const IconFeature: React.FC<IconFeatureProps> = ({
  title,
  description,
  icon,
  iconColor = 'bg-primary-100 text-primary-600',
  className,
}) => {
  return (
    <motion.div
      variants={cardVariants}
      className={cn('flex items-start gap-4', className)}
    >
      <div className={cn('flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center', iconColor)}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-neutral-900 mb-1">{title}</h3>
        <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;

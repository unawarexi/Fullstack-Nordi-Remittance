// ============================================================================
// INPUT COMPONENT - Form input with validation and animations
// ============================================================================

import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@utils/cn';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

// ========================
// TYPES
// ========================
export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled' | 'flushed';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  size?: InputSize;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isRequired?: boolean;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<InputSize, { input: string; label: string; helper: string; icon: string }> = {
  sm: {
    input: 'h-8 px-3 text-xs',
    label: 'text-xs mb-1',
    helper: 'text-[10px] mt-1',
    icon: 'w-4 h-4',
  },
  md: {
    input: 'h-10 px-4 text-sm',
    label: 'text-sm mb-1.5',
    helper: 'text-xs mt-1.5',
    icon: 'w-5 h-5',
  },
  lg: {
    input: 'h-12 px-5 text-base',
    label: 'text-base mb-2',
    helper: 'text-sm mt-2',
    icon: 'w-5 h-5',
  },
};

// ========================
// VARIANT STYLES
// ========================
const variantStyles: Record<InputVariant, { base: string; focus: string }> = {
  default: {
    base: 'border border-neutral-300 rounded-lg bg-white',
    focus: 'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
  },
  filled: {
    base: 'border-0 rounded-lg bg-neutral-100',
    focus: 'focus:bg-neutral-50 focus:ring-2 focus:ring-primary-500/20',
  },
  flushed: {
    base: 'border-0 border-b-2 border-neutral-300 rounded-none bg-transparent px-0',
    focus: 'focus:border-primary-500',
  },
};

// ========================
// ANIMATION VARIANTS
// ========================
const errorAnimation = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

// ========================
// COMPONENT
// ========================
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      success,
      size = 'md',
      variant = 'default',
      leftIcon,
      rightIcon,
      isRequired = false,
      showPasswordToggle = false,
      fullWidth = true,
      type = 'text',
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const sizeConfig = sizeStyles[size];
    const variantConfig = variantStyles[variant];
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block font-medium text-neutral-700',
              sizeConfig.label,
              disabled && 'opacity-50',
            )}
          >
            {label}
            {isRequired && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400',
              sizeConfig.icon,
            )}>
              {leftIcon}
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full outline-none transition-all duration-200',
              'placeholder:text-neutral-400',
              // Size & Variant
              sizeConfig.input,
              variantConfig.base,
              variantConfig.focus,
              // States
              hasError && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
              hasSuccess && 'border-success-500 focus:border-success-500 focus:ring-success-500/20',
              disabled && 'opacity-50 cursor-not-allowed bg-neutral-100',
              // Icons padding
              leftIcon && 'pl-10',
              (rightIcon || isPassword || hasError || hasSuccess) && 'pr-10',
              className
            )}
            {...props}
          />
          
          {/* Right icons container */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Status icons */}
            {hasError && !isPassword && (
              <AlertCircle className={cn('text-error-500', sizeConfig.icon)} />
            )}
            {hasSuccess && !isPassword && (
              <CheckCircle className={cn('text-success-500', sizeConfig.icon)} />
            )}
            
            {/* Password toggle */}
            {isPassword && showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className={sizeConfig.icon} />
                ) : (
                  <Eye className={sizeConfig.icon} />
                )}
              </button>
            )}
            
            {/* Custom right icon */}
            {rightIcon && !isPassword && !hasError && !hasSuccess && (
              <span className={cn('text-neutral-400', sizeConfig.icon)}>
                {rightIcon}
              </span>
            )}
          </div>
        </div>
        
        {/* Helper text / Error / Success message */}
        <AnimatePresence mode="wait">
          {(error || success || helperText) && (
            <motion.p
              key={error ? 'error' : success ? 'success' : 'helper'}
              {...errorAnimation}
              className={cn(
                sizeConfig.helper,
                error && 'text-error-500',
                success && !error && 'text-success-500',
                !error && !success && 'text-neutral-500',
              )}
            >
              {error || success || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

// ========================
// TEXTAREA COMPONENT
// ========================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  isRequired?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      isRequired = false,
      resize = 'vertical',
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const sizeConfig = sizeStyles[size];
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block font-medium text-neutral-700',
              sizeConfig.label,
              disabled && 'opacity-50',
            )}
          >
            {label}
            {isRequired && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'w-full min-h-[100px] px-4 py-3',
            'border border-neutral-300 rounded-lg bg-white',
            'text-sm placeholder:text-neutral-400',
            'outline-none transition-all duration-200',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            hasError && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
            disabled && 'opacity-50 cursor-not-allowed bg-neutral-100',
            resizeStyles[resize],
            className
          )}
          {...props}
        />
        
        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.p
              {...errorAnimation}
              className={cn(
                sizeConfig.helper,
                error ? 'text-error-500' : 'text-neutral-500',
              )}
            >
              {error || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;

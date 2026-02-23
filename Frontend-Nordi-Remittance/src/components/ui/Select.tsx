// ========================
// SELECT COMPONENT - Dropdown selection
// ============================================================================

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@utils/cn';
import { ChevronDown, Check, Search } from 'lucide-react';

// ========================
// TYPES
// ========================
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;
  size?: SelectSize;
  disabled?: boolean;
  isRequired?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  fullWidth?: boolean;
  className?: string;
}

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<SelectSize, { trigger: string; option: string; icon: number }> = {
  sm: { trigger: 'h-8 px-3 text-xs', option: 'px-3 py-1.5 text-xs', icon: 14 },
  md: { trigger: 'h-10 px-4 text-sm', option: 'px-4 py-2 text-sm', icon: 18 },
  lg: { trigger: 'h-12 px-5 text-base', option: 'px-5 py-2.5 text-base', icon: 20 },
};

// ========================
// DROPDOWN ANIMATION
// ========================
const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -8,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  exit: { 
    opacity: 0, 
    y: -8,
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

// ========================
// COMPONENT
// ========================
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = 'Select an option',
      label,
      helperText,
      error,
      size = 'md',
      disabled = false,
      isRequired = false,
      searchable = false,
      clearable = false,
      fullWidth = true,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    const sizeConfig = sizeStyles[size];
    const hasError = !!error;

    // Update internal state when controlled value changes
    useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Get selected option
    const selectedOption = options.find((opt) => opt.value === selectedValue);

    // Filter options based on search
    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Handle selection
    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return;
      
      setSelectedValue(option.value);
      onChange?.(option.value);
      setIsOpen(false);
      setSearchQuery('');
    };

    // Handle clear
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValue('');
      onChange?.('');
    };

    return (
      <div
        ref={containerRef}
        className={cn('relative', fullWidth && 'w-full', className)}
      >
        {/* Label */}
        {label && (
          <label className={cn(
            'block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base',
            disabled && 'opacity-50',
          )}>
            {label}
            {isRequired && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        {/* Trigger */}
        <div
          ref={ref}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'relative flex items-center justify-between gap-2 cursor-pointer',
            'border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800',
            'transition-all duration-200',
            sizeConfig.trigger,
            isOpen && 'border-primary-500 ring-2 ring-primary-500/20',
            hasError && 'border-error-500',
            disabled && 'opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900',
          )}
        >
          {/* Selected value or placeholder */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption?.icon && (
              <span className="flex-shrink-0">{selectedOption.icon}</span>
            )}
            <span className={cn(
              'truncate text-neutral-900 dark:text-white',
              !selectedOption && 'text-neutral-400 dark:text-neutral-500'
            )}>
              {selectedOption?.label || placeholder}
            </span>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1">
            {/* Clear button */}
            {clearable && selectedValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Chevron */}
            <ChevronDown
              size={sizeConfig.icon}
              className={cn(
                'text-neutral-400 dark:text-neutral-500 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                'absolute z-50 w-full mt-1',
                'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-dropdown',
                'max-h-60 overflow-hidden',
              )}
            >
              {/* Search input */}
              {searchable && (
                <div className="p-2 border-b border-neutral-100 dark:border-neutral-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full h-8 pl-9 pr-3 text-sm border border-neutral-200 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* Options list */}
              <div className="overflow-y-auto max-h-48">
                {filteredOptions.length === 0 ? (
                  <div className={cn('text-center text-neutral-500 dark:text-neutral-400', sizeConfig.option)}>
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        'flex items-center gap-2 cursor-pointer transition-colors text-neutral-900 dark:text-white',
                        sizeConfig.option,
                        option.value === selectedValue
                          ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-700',
                        option.disabled && 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                      {option.value === selectedValue && (
                        <Check size={16} className="flex-shrink-0 text-primary-500" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper text / Error */}
        {(error || helperText) && (
          <p className={cn(
            'mt-1.5',
            size === 'sm' && 'text-[10px]',
            size === 'md' && 'text-xs',
            size === 'lg' && 'text-sm',
            error ? 'text-error-500' : 'text-neutral-500',
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;

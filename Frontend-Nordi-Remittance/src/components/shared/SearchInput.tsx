// ============================================================================
// SEARCH INPUT - Search input with animations and optional filters
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@utils/cn';
import { Search, X, SlidersHorizontal, Loader2 } from 'lucide-react';

// ========================
// TYPES
// ========================
export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  isLoading?: boolean;
  showClearButton?: boolean;
  showFilterButton?: boolean;
  onFilterClick?: () => void;
  autoFocus?: boolean;
  debounceMs?: number;
  className?: string;
}

// ========================
// SIZE STYLES
// ========================
const sizeStyles = {
  sm: {
    input: 'h-8 text-sm pl-8 pr-8',
    icon: 'w-4 h-4 left-2.5',
    clearIcon: 'w-3.5 h-3.5 right-2',
  },
  md: {
    input: 'h-10 text-sm pl-10 pr-10',
    icon: 'w-5 h-5 left-3',
    clearIcon: 'w-4 h-4 right-3',
  },
  lg: {
    input: 'h-12 text-base pl-12 pr-12',
    icon: 'w-6 h-6 left-3.5',
    clearIcon: 'w-5 h-5 right-3.5',
  },
};

// ========================
// VARIANT STYLES
// ========================
const variantStyles = {
  default: 'bg-white border border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
  filled: 'bg-neutral-100 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
  outlined: 'bg-transparent border-2 border-neutral-200 focus:border-primary-500',
};

// ========================
// COMPONENT
// ========================
export const SearchInput: React.FC<SearchInputProps> = ({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Search...',
  size = 'md',
  variant = 'default',
  isLoading = false,
  showClearButton = true,
  showFilterButton = false,
  onFilterClick,
  autoFocus = false,
  debounceMs = 300,
  className,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const styles = sizeStyles[size];

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);

    // Debounced search
    if (onSearch && debounceMs > 0) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onSearch(newValue);
      }, debounceMs);
    }
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalValue('');
    }
    onChange?.('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      clearTimeout(debounceTimer.current);
      onSearch(value);
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Search icon */}
      <motion.div
        animate={{ scale: isFocused ? 1.1 : 1 }}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none',
          styles.icon
        )}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Search />
        )}
      </motion.div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg outline-none transition-all',
          styles.input,
          variantStyles[variant],
          showFilterButton && 'pr-20'
        )}
      />

      {/* Clear button */}
      <AnimatePresence>
        {showClearButton && value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors',
              styles.clearIcon,
              showFilterButton && 'right-12'
            )}
          >
            <X />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Filter button */}
      {showFilterButton && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onFilterClick}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 right-3 p-1.5 rounded-md',
            'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
};

// ========================
// SEARCH BAR WITH SUGGESTIONS
// ========================
export interface SearchSuggestion {
  id: string;
  label: string;
  icon?: React.ReactNode;
  category?: string;
}

export interface SearchBarProps extends Omit<SearchInputProps, 'value' | 'onChange'> {
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  showRecent?: boolean;
  recentSearches?: string[];
  onClearRecent?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  suggestions = [],
  onSuggestionSelect,
  showRecent = false,
  recentSearches = [],
  onClearRecent,
  onSearch,
  ...props
}) => {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setShowSuggestions(true);
  };

  const handleSelect = (suggestion: SearchSuggestion) => {
    setValue(suggestion.label);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
    onSearch?.(suggestion.label);
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.label.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative">
      <SearchInput
        {...props}
        value={value}
        onChange={handleChange}
        onSearch={onSearch}
      />

      <AnimatePresence>
        {showSuggestions && (value || (showRecent && recentSearches.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden z-50"
          >
            {/* Recent searches */}
            {showRecent && !value && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-xs text-neutral-500 font-medium">Recent</span>
                  {onClearRecent && (
                    <button
                      onClick={onClearRecent}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setValue(search);
                      onSearch?.(search);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {value && filteredSuggestions.length > 0 && (
              <div className="max-h-64 overflow-y-auto p-2">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelect(suggestion)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50 rounded-md transition-colors"
                  >
                    {suggestion.icon && (
                      <span className="text-neutral-400">{suggestion.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900 truncate">{suggestion.label}</p>
                      {suggestion.category && (
                        <p className="text-xs text-neutral-500">{suggestion.category}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {value && filteredSuggestions.length === 0 && (
              <div className="p-4 text-center text-sm text-neutral-500">
                No results found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInput;

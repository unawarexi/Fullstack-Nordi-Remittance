// ============================================================================
// THEME TOGGLE - Button to switch between light and dark modes
// ============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@utils/cn';
import useThemeStore, { type ThemeMode } from '@store/theme.store';

// ========================
// TYPES
// ========================
interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

// ========================
// SIZE STYLES
// ========================
const sizeStyles = {
  sm: { icon: 16, button: 'p-1.5' },
  md: { icon: 20, button: 'p-2' },
  lg: { icon: 24, button: 'p-2.5' },
};

// ========================
// ICON ANIMATION
// ========================
const iconVariants = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: { scale: 1, rotate: 0, opacity: 1 },
  exit: { scale: 0, rotate: 180, opacity: 0 },
};

// ========================
// SIMPLE ICON TOGGLE
// ========================
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  size = 'md',
  className,
  showLabel = false,
}) => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { icon: iconSize, button: buttonSize } = sizeStyles[size];

  if (variant === 'icon') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDarkMode}
        className={cn(
          buttonSize,
          'rounded-lg transition-colors',
          'bg-surface-secondary hover:bg-surface-hover',
          'border border-border-primary',
          'text-foreground-secondary hover:text-foreground-primary',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          className
        )}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDarkMode ? (
            <motion.div
              key="sun"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Sun size={iconSize} className="text-yellow-400" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Moon size={iconSize} className="text-primary-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  if (variant === 'button') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={toggleDarkMode}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          'bg-surface-secondary hover:bg-surface-hover',
          'border border-border-primary',
          'text-foreground-secondary hover:text-foreground-primary',
          className
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDarkMode ? (
            <motion.div
              key="sun"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Sun size={iconSize} className="text-yellow-400" />
              {showLabel && <span className="text-sm font-medium">Light</span>}
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Moon size={iconSize} className="text-primary-600" />
              {showLabel && <span className="text-sm font-medium">Dark</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  return null;
};

// ========================
// THEME SELECTOR DROPDOWN
// ========================
interface ThemeSelectorProps {
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ className }) => {
  const { mode, setMode } = useThemeStore();
  const [isOpen, setIsOpen] = React.useState(false);

  const options: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
    { value: 'system', label: 'System', icon: <Monitor size={16} /> },
  ];

  const currentOption = options.find((opt) => opt.value === mode);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          'bg-surface-secondary hover:bg-surface-hover',
          'border border-border-primary',
          'text-foreground-secondary hover:text-foreground-primary'
        )}
      >
        {currentOption?.icon}
        <span className="text-sm font-medium">{currentOption?.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute right-0 mt-2 z-50 min-w-[140px]',
                'bg-surface-primary border border-border-primary rounded-lg shadow-lg',
                'py-1 overflow-hidden'
              )}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setMode(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm',
                    'hover:bg-surface-hover transition-colors',
                    mode === option.value
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-foreground-secondary'
                  )}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeToggle;

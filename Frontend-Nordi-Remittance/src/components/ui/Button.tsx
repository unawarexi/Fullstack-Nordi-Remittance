// ============================================================================
// BUTTON COMPONENT - Reusable animated button with multiple variants
// ============================================================================

import { cn } from "@utils/cn";
import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// ========================
// VARIANT STYLES
// ========================
const variantStyles: Record<ButtonVariant, string> = {
  primary: cn(
    "bg-primary-500 text-white dark:bg-primary-600",
    "hover:bg-primary-600 active:bg-primary-700 dark:hover:bg-primary-500 dark:active:bg-primary-700",
    "focus-visible:ring-primary-500/50",
    "shadow-button hover:shadow-buttonHover",
  ),
  secondary: cn(
    "bg-secondary-500 text-white dark:bg-secondary-600",
    "hover:bg-secondary-600 active:bg-secondary-700 dark:hover:bg-secondary-500 dark:active:bg-secondary-700",
    "focus-visible:ring-secondary-500/50",
    "shadow-button hover:shadow-buttonHover",
  ),
  outline: cn(
    "bg-transparent border-2 border-primary-500 text-primary-500",
    "hover:bg-primary-50 active:bg-primary-100 dark:hover:bg-primary-500/10 dark:active:bg-primary-500/20",
    "focus-visible:ring-primary-500/50",
  ),
  ghost: cn(
    "bg-transparent text-neutral-700 dark:text-neutral-300",
    "hover:bg-neutral-100 active:bg-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700",
    "focus-visible:ring-neutral-500/50",
  ),
  danger: cn(
    "bg-error-500 text-white dark:bg-error-600",
    "hover:bg-error-600 active:bg-error-700 dark:hover:bg-error-500 dark:active:bg-error-700",
    "focus-visible:ring-error-500/50",
    "shadow-button hover:shadow-buttonHover",
  ),
  success: cn(
    "bg-success-500 text-white dark:bg-success-600",
    "hover:bg-success-600 active:bg-success-700 dark:hover:bg-success-500 dark:active:bg-success-700",
    "focus-visible:ring-success-500/50",
    "shadow-button hover:shadow-buttonHover",
  ),
  link: cn(
    "bg-transparent text-primary-500 underline-offset-4 dark:text-primary-400",
    "hover:underline hover:text-primary-600 dark:hover:text-primary-300",
    "focus-visible:ring-primary-500/50",
    "p-0 h-auto",
  ),
};

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs gap-1.5 rounded-md",
  sm: "h-8 px-3 text-sm gap-2 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-5 text-base gap-2.5 rounded-lg",
  xl: "h-14 px-6 text-lg gap-3 rounded-xl",
};

// ========================
// ANIMATION VARIANTS
// ========================
const buttonAnimations = {
  tap: { scale: 0.98 },
  hover: { scale: 1.02 },
};

// ========================
// COMPONENT
// ========================
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const disabled = isDisabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileTap={disabled ? undefined : buttonAnimations.tap}
        whileHover={disabled ? undefined : buttonAnimations.hover}
        transition={{ duration: 0.15 }}
        disabled={disabled}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center font-medium",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          // Variant & Size
          variantStyles[variant],
          variant !== "link" && sizeStyles[size],
          // Full width
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <Loader2
            className={cn(
              "animate-spin",
              size === "xs" && "h-3 w-3",
              size === "sm" && "h-4 w-4",
              size === "md" && "h-4 w-4",
              size === "lg" && "h-5 w-5",
              size === "xl" && "h-6 w-6",
            )}
          />
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}

        {/* Children */}
        <span className={isLoading ? "opacity-0" : undefined}>{children}</span>

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

// ========================
// ICON BUTTON VARIANT
// ========================

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "md", className, ...props }, ref) => {
    const iconSizeStyles: Record<ButtonSize, string> = {
      xs: "w-7 h-7 p-0",
      sm: "w-8 h-8 p-0",
      md: "w-10 h-10 p-0",
      lg: "w-12 h-12 p-0",
      xl: "w-14 h-14 p-0",
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={cn(iconSizeStyles[size], className)}
        {...props}
      >
        {icon}
      </Button>
    );
  },
);

IconButton.displayName = "IconButton";

export default Button;

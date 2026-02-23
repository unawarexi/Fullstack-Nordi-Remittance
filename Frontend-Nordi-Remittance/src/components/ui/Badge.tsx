// ============================================================================
// BADGE COMPONENT - Status indicators and labels
// ============================================================================

import React, { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@utils/cn";

// ========================
// VARIANT STYLES
// ========================
const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-neutral-100 text-neutral-700 border-neutral-200",
  primary: "bg-primary-100 text-primary-700 border-primary-200",
  secondary: "bg-secondary-100 text-secondary-700 border-secondary-200",
  success: "bg-success-100 text-success-700 border-success-200",
  warning: "bg-warning-100 text-warning-700 border-warning-200",
  error: "bg-error-100 text-error-700 border-error-200",
  info: "bg-info-100 text-info-700 border-info-200",
  outline: "bg-transparent text-neutral-700 border-neutral-300",
};

// ========================
// DOT COLORS
// ========================
const dotColors: Record<BadgeVariant, string> = {
  default: "bg-neutral-500",
  primary: "bg-primary-500",
  secondary: "bg-secondary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
  info: "bg-info-500",
  outline: "bg-neutral-500",
};

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<BadgeSize, string> = {
  xs: "text-[10px] px-1.5 py-0.5 gap-1",
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1 gap-2",
};

const dotSizeStyles: Record<BadgeSize, string> = {
  xs: "w-1 h-1",
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-2.5 h-2.5",
};

// ========================
// COMPONENT
// ========================
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "sm",
      dot = false,
      pulse = false,
      removable = false,
      onRemove,
      icon,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center rounded-full border font-medium",
          "transition-colors duration-200",
          // Variant & Size
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span className="relative flex">
            <span
              className={cn(
                "rounded-full",
                dotSizeStyles[size],
                dotColors[variant],
              )}
            />
            {pulse && (
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  dotColors[variant],
                )}
              />
            )}
          </span>
        )}

        {/* Icon */}
        {icon && !dot && <span className="flex-shrink-0">{icon}</span>}

        {/* Content */}
        <span>{children}</span>

        {/* Remove button */}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className={cn(
              "-mr-1 ml-0.5 rounded-full p-0.5",
              "transition-colors hover:bg-black/10",
              "focus:outline-none focus:ring-1 focus:ring-offset-1",
            )}
            aria-label="Remove"
          >
            <svg
              className={cn(
                size === "xs" && "h-2.5 w-2.5",
                size === "sm" && "h-3 w-3",
                size === "md" && "h-3.5 w-3.5",
                size === "lg" && "h-4 w-4",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  },
);

Badge.displayName = "Badge";

// ========================
// STATUS BADGE - Pre-configured for common statuses
// ========================

const statusConfig: Record<
  StatusType,
  { variant: BadgeVariant; label: string }
> = {
  active: { variant: "success", label: "Active" },
  inactive: { variant: "default", label: "Inactive" },
  pending: { variant: "warning", label: "Pending" },
  completed: { variant: "success", label: "Completed" },
  failed: { variant: "error", label: "Failed" },
  processing: { variant: "info", label: "Processing" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "error", label: "Rejected" },
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, showDot = true, customLabel, ...props }, ref) => {
    const config = statusConfig[status];

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        dot={showDot}
        pulse={status === "processing"}
        {...props}
      >
        {customLabel || config.label}
      </Badge>
    );
  },
);

StatusBadge.displayName = "StatusBadge";

// ========================
// NOTIFICATION BADGE
// ========================

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  max = 99,
  showZero = false,
  children,
}) => {
  const displayCount = count > max ? `${max}+` : count;
  const shouldShow = count > 0 || showZero;

  return (
    <div className="relative inline-flex">
      {children}
      {shouldShow && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute -right-1 -top-1",
            "flex items-center justify-center",
            "h-[18px] min-w-[18px] px-1",
            "text-[10px] font-bold text-white",
            "rounded-full bg-error-500",
            "border-2 border-white",
          )}
        >
          {displayCount}
        </motion.span>
      )}
    </div>
  );
};

export default Badge;

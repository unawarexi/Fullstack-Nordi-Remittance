// ============================================================================
// AVATAR COMPONENT - User profile images with fallback
// ============================================================================

import React, { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@utils/cn";
import { User } from "lucide-react";

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<
  AvatarSize,
  { container: string; text: string; icon: number; status: string }
> = {
  xs: {
    container: "w-6 h-6",
    text: "text-[8px]",
    icon: 12,
    status: "w-1.5 h-1.5 border",
  },
  sm: {
    container: "w-8 h-8",
    text: "text-xs",
    icon: 14,
    status: "w-2 h-2 border",
  },
  md: {
    container: "w-10 h-10",
    text: "text-sm",
    icon: 18,
    status: "w-2.5 h-2.5 border-2",
  },
  lg: {
    container: "w-12 h-12",
    text: "text-base",
    icon: 20,
    status: "w-3 h-3 border-2",
  },
  xl: {
    container: "w-16 h-16",
    text: "text-lg",
    icon: 24,
    status: "w-3.5 h-3.5 border-2",
  },
  "2xl": {
    container: "w-24 h-24",
    text: "text-2xl",
    icon: 32,
    status: "w-4 h-4 border-2",
  },
  "3xl": {
    container: "w-32 h-32",
    text: "text-3xl",
    icon: 48,
    status: "w-5 h-5 border-2",
  },
};

// ========================
// STATUS COLORS
// ========================
const statusColors = {
  online: "bg-success-500",
  offline: "bg-neutral-400",
  away: "bg-warning-500",
  busy: "bg-error-500",
};

// ========================
// HELPER FUNCTIONS
// ========================
const getInitials = (name?: string): string => {
  if (!name) return "";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorFromName = (name?: string): string => {
  if (!name) return "bg-primary-500";

  const colors = [
    "bg-primary-500",
    "bg-secondary-500",
    "bg-accent-500",
    "bg-success-500",
    "bg-info-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-orange-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// ========================
// COMPONENT
// ========================
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = "md",
      status,
      shape = "circle",
      bordered = false,
      fallbackIcon,
      className,
      ...props
    },
    ref,
  ) => {
    const [imageError, setImageError] = useState(false);
    const sizeConfig = sizeStyles[size];

    const showImage = src && !imageError;
    const showInitials = !showImage && name;
    const showIcon = !showImage && !showInitials;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex flex-shrink-0",
          sizeConfig.container,
          className,
        )}
        {...props}
      >
        {/* Avatar container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "flex h-full w-full items-center justify-center overflow-hidden",
            "transition-all duration-200",
            shape === "circle" ? "rounded-full" : "rounded-lg",
            bordered && "ring-2 ring-white ring-offset-2",
            !showImage && getColorFromName(name),
          )}
        >
          {/* Image */}
          {showImage && (
            <img
              src={src}
              alt={alt || name || "Avatar"}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
            />
          )}

          {/* Initials */}
          {showInitials && (
            <span
              className={cn(
                "select-none font-semibold text-white",
                sizeConfig.text,
              )}
            >
              {getInitials(name)}
            </span>
          )}

          {/* Fallback icon */}
          {showIcon &&
            (fallbackIcon || (
              <User size={sizeConfig.icon} className="text-white opacity-80" />
            ))}
        </motion.div>

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              "absolute bottom-0 right-0",
              "rounded-full border-white",
              sizeConfig.status,
              statusColors[status],
            )}
          />
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

// ========================
// AVATAR GROUP
// ========================

const spacingStyles = {
  tight: "-space-x-3",
  normal: "-space-x-2",
  loose: "-space-x-1",
};

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    { max, size = "md", spacing = "normal", children, className, ...props },
    ref,
  ) => {
    const childArray = React.Children.toArray(children);
    const visibleChildren = max ? childArray.slice(0, max) : childArray;
    const remainingCount = max ? childArray.length - max : 0;
    const sizeConfig = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={cn("flex items-center", spacingStyles[spacing], className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className="rounded-full ring-2 ring-white"
            style={{ zIndex: visibleChildren.length - index }}
          >
            {React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<AvatarProps>, {
                  size,
                })
              : child}
          </div>
        ))}

        {/* Overflow count */}
        {remainingCount > 0 && (
          <div
            className={cn(
              "flex items-center justify-center",
              "bg-neutral-200 font-semibold text-neutral-600",
              "rounded-full ring-2 ring-white",
              sizeConfig.container,
              sizeConfig.text,
            )}
            style={{ zIndex: 0 }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";

export default Avatar;

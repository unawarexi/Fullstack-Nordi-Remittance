// ============================================================================
// SPINNER / LOADER COMPONENTS - Loading state indicators
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@utils/cn";
import { Loader2 } from "lucide-react";

// ========================
// SIZE STYLES
// ========================
const sizeStyles: Record<SpinnerSize, { spinner: number; text: string }> = {
  xs: { spinner: 14, text: "text-xs" },
  sm: { spinner: 18, text: "text-sm" },
  md: { spinner: 24, text: "text-sm" },
  lg: { spinner: 32, text: "text-base" },
  xl: { spinner: 48, text: "text-lg" },
};

// ========================
// VARIANT STYLES
// ========================
const variantStyles: Record<SpinnerVariant, string> = {
  default: "text-neutral-500",
  primary: "text-primary-500",
  white: "text-white",
};

// ========================
// SPINNER COMPONENT
// ========================
export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  variant = "primary",
  label,
  className,
}) => {
  const sizeConfig = sizeStyles[size];

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <Loader2
        size={sizeConfig.spinner}
        className={cn("animate-spin", variantStyles[variant])}
      />
      {label && (
        <span className={cn(sizeConfig.text, variantStyles[variant])}>
          {label}
        </span>
      )}
    </div>
  );
};

// ========================
// DOTS LOADER
// ========================

export const DotsLoader: React.FC<DotsLoaderProps> = ({
  size = "md",
  variant = "primary",
  className,
}) => {
  const dotSizes: Record<SpinnerSize, string> = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  const gaps: Record<SpinnerSize, string> = {
    xs: "gap-1",
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
    xl: "gap-2.5",
  };

  const dotVariants = {
    animate: (i: number) => ({
      y: [0, -8, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay: i * 0.1,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <div className={cn("flex items-center", gaps[size], className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          custom={i}
          variants={dotVariants}
          animate="animate"
          className={cn(
            "rounded-full",
            dotSizes[size],
            variant === "default" && "bg-neutral-500",
            variant === "primary" && "bg-primary-500",
            variant === "white" && "bg-white",
          )}
        />
      ))}
    </div>
  );
};

// ========================
// PULSE LOADER
// ========================

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  size = "md",
  variant = "primary",
  className,
}) => {
  const sizes: Record<SpinnerSize, string> = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={cn("relative", sizes[size], className)}>
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full",
          variant === "default" && "bg-neutral-400",
          variant === "primary" && "bg-primary-400",
          variant === "white" && "bg-white/70",
        )}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div
        className={cn(
          "absolute inset-[25%] rounded-full",
          variant === "default" && "bg-neutral-500",
          variant === "primary" && "bg-primary-500",
          variant === "white" && "bg-white",
        )}
      />
    </div>
  );
};

// ========================
// SKELETON LOADER
// ========================

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "text",
  width,
  height,
  animation = "pulse",
}) => {
  const variantStyles = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const animationStyles = {
    pulse: "animate-pulse",
    wave: "skeleton-wave",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-neutral-200",
        variantStyles[variant],
        animationStyles[animation],
        className,
      )}
      style={{
        width: width || (variant === "circular" ? height : "100%"),
        height: height || (variant === "text" ? undefined : 100),
      }}
    />
  );
};

// ========================
// FULL PAGE LOADER
// ========================

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Loading...",
  showLogo = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="text-center">
        {showLogo && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
          </motion.div>
        )}
        <Spinner size="lg" variant="primary" />
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-neutral-600"
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

// ========================
// OVERLAY LOADER
// ========================

export const OverlayLoader: React.FC<OverlayLoaderProps> = ({
  isVisible,
  message,
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="rounded-2xl bg-white p-8 text-center shadow-2xl">
        <Spinner size="lg" variant="primary" />
        {message && (
          <p className="mt-4 font-medium text-neutral-600">{message}</p>
        )}
      </div>
    </motion.div>
  );
};

export default Spinner;

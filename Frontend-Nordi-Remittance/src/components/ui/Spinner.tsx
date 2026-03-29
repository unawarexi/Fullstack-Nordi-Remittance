// ============================================================================
// SPINNER / LOADER COMPONENTS - Unified loading state indicators
// ============================================================================

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@utils/cn";
import { Loader2 } from "lucide-react";
import FooterImg from "@assets/images/footer/confirmed.png";

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
// BRANDED LOGO SPINNER — logo with orbital ring
// ========================
const logoSizes = {
  sm: { ring: 48, img: 24, stroke: 2.5 },
  md: { ring: 64, img: 32, stroke: 3 },
  lg: { ring: 96, img: 48, stroke: 3.5 },
  xl: { ring: 128, img: 64, stroke: 4 },
} as const;

type LogoSpinnerSize = keyof typeof logoSizes;

const LogoSpinner: React.FC<{ size?: LogoSpinnerSize; className?: string }> = ({
  size = "lg",
  className,
}) => {
  const { ring, img, stroke } = logoSizes[size];
  const radius = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: ring, height: ring }}
    >
      {/* Outer pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-primary-300/40"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Rotating orbital arc */}
      <motion.svg
        className="absolute inset-0"
        width={ring}
        height={ring}
        viewBox={`0 0 ${ring} ${ring}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke="url(#orbital-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.3} ${circumference * 0.7}`}
        />
        <defs>
          <linearGradient id="orbital-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Counter-rotating secondary arc (thinner, opposite) */}
      <motion.svg
        className="absolute inset-0"
        width={ring}
        height={ring}
        viewBox={`0 0 ${ring} ${ring}`}
        animate={{ rotate: -360 }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius - stroke * 1.5}
          fill="none"
          stroke="#818CF8"
          strokeOpacity={0.3}
          strokeWidth={stroke * 0.6}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.15} ${circumference * 0.85}`}
        />
      </motion.svg>

      {/* Center logo with gentle breathe */}
      <motion.img
        src={FooterImg}
        alt="Nordi"
        className="relative z-10 rounded-full object-contain"
        style={{ width: img, height: img }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
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
  const skeletonVariantStyles = {
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
        skeletonVariantStyles[variant],
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
// FULL PAGE LOADER (branded)
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
      <div className="flex flex-col items-center text-center">
        {showLogo && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <LogoSpinner size="xl" />
          </motion.div>
        )}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-neutral-600"
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

// ========================
// OVERLAY LOADER (branded)
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
        <LogoSpinner size="lg" />
        {message && (
          <p className="mt-4 font-medium text-neutral-600">{message}</p>
        )}
      </div>
    </motion.div>
  );
};

// ========================
// CONFIRM SPINNER (full-screen branded overlay)
// ========================
export const ConfirmSpinner: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 backdrop-blur-lg"
      >
        <div className="flex flex-col items-center">
          <LogoSpinner size="xl" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg font-medium text-white lg:text-2xl"
          >
            Verifying ID...
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ========================
// SUBMIT SPINNER (full-screen branded overlay)
// ========================
export const SubmitSpinner: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/75 backdrop-blur-lg"
      >
        <div className="flex flex-col items-center">
          <LogoSpinner size="xl" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg font-medium text-white lg:text-2xl"
          >
            Submitting Remittance! Loading...
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Spinner;

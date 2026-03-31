// ============================================================================
// AUTH LAYOUT - Reusable layout component for authentication pages
// ============================================================================

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Globe, Lock, CreditCard } from "lucide-react";
import { cn } from "@utils/cn";
import Images from "@constants/images";
import GetLocation from "@utils/GetLocation";
import { Logo } from "@components/shared";

// ========================
// TYPES
// ========================
export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  contentClassName?: string;
  alternateAction?: {
    text: string;
    linkText: string;
    href: string;
  };
  variant?: "login" | "signup" | "verify";
}

// ========================
// ANIMATION VARIANTS
// ========================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ========================
// FEATURE ITEM COMPONENT
// ========================
const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <motion.div variants={itemVariants} className="flex items-start gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
    <div className="rounded-lg bg-white/20 p-2 text-white">{icon}</div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  </motion.div>
);

// ========================
// AUTH LAYOUT COMPONENT
// ========================
const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  contentClassName,
  alternateAction,
  variant = "login",
}) => {
  // Background gradient based on variant
  const gradientClass =
    variant === "login"
      ? "from-blue-600 via-blue-700 to-indigo-800"
      : variant === "signup"
        ? "from-indigo-600 via-purple-700 to-blue-800"
        : "from-emerald-600 via-teal-700 to-cyan-800";

  return (
    <section className="relative flex min-h-screen w-full overflow-hidden">
      {/* LEFT SECTION - Auth Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full flex-col justify-center bg-slate-50 p-6 transition-colors duration-300 dark:bg-neutral-900 md:w-1/2 md:p-10 lg:w-[55%] lg:p-16"
      >
        {/* Header */}
        <div className="mb-6 flex w-full items-center justify-between pt-6 md:pt-0">
          <Link to="/" className="group flex items-center gap-3">
            <Logo size="sm" className="md:hidden" />
            <Logo size="md" className="hidden md:flex" />
          </Link>
          <GetLocation />
        </div>

        {/* Back Button */}
        {showBackButton && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link
              to="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </motion.div>
        )}

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl lg:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 md:text-lg">{subtitle}</p>}
          {alternateAction && (
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              {alternateAction.text}{" "}
              <Link
                to={alternateAction.href}
                className="font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                {alternateAction.linkText}
              </Link>
            </p>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={cn("w-full max-w-md", contentClassName)}
        >
          {children}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-auto pt-8 text-center text-xs text-neutral-500 dark:text-neutral-400"
        >
          <p>© 2024 Nordea Bank PLC. (Licensed by the International Monetary Fund)</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link to="/privacy" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/contact" className="transition-colors hover:text-primary-600 dark:hover:text-primary-400">
              Contact
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* RIGHT SECTION - Visual/Branding */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={cn(
          "hidden md:flex md:w-1/2 lg:w-[45%]",
          "flex-col items-center justify-center",
          "bg-gradient-to-br",
          gradientClass,
          "relative overflow-hidden p-8 lg:p-12",
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-neutral-800" />
          <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-white dark:bg-neutral-800" />
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-neutral-800" />
        </div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 w-full max-w-md"
        >
          {/* Card Image */}
          <motion.div variants={itemVariants} className="mb-8">
            <img
              src={variant === "login" ? Images.authCard1 : Images.authCard2}
              alt="Banking Card"
              className="mx-auto w-full max-w-sm drop-shadow-2xl"
            />
          </motion.div>

          {/* Title */}
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-white lg:text-3xl">
              {variant === "login"
                ? "Welcome Back!"
                : variant === "signup"
                  ? "Join Nordea Banking"
                  : "Verify Your Identity"}
            </h2>
            <p className="text-white/80">
              {variant === "login"
                ? "Access your accounts securely from anywhere in the world"
                : variant === "signup"
                  ? "Start your journey to better banking today"
                  : "Complete the verification to secure your account"}
            </p>
          </motion.div>

          {/* Features */}
          <div className="space-y-4">
            <FeatureItem
              icon={<Shield className="h-5 w-5" />}
              title="Bank-Grade Security"
              description="256-bit encryption & multi-factor authentication"
            />
            <FeatureItem
              icon={<Globe className="h-5 w-5" />}
              title="Global Access"
              description="Manage your finances from anywhere, anytime"
            />
            <FeatureItem
              icon={variant === "login" ? <Lock className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
              title={variant === "login" ? "Secure Login" : "Smart Banking"}
              description={
                variant === "login"
                  ? "Your data is protected with industry-leading security"
                  : "Modern tools for all your financial needs"
              }
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AuthLayout;

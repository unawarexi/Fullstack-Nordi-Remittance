// ============================================================================
// DASHBOARD UI PRIMITIVES — Shared components for all dashboard pages
// Eliminates repetition, ensures consistent dark mode & responsive design
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@utils/cn";
import {
  dashboardContainerVariants,
  dashboardItemVariants,
} from "@core/animation/Animation";

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE CONTAINER — Wraps every dashboard page
   ═══════════════════════════════════════════════════════════════════════════ */
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
}) => (
  <motion.div
    className={cn(
      "p-3 sm:p-4 lg:p-6 min-h-full",
      "bg-gray-50 dark:bg-gray-950",
      "transition-colors duration-200",
      className
    )}
    variants={dashboardContainerVariants}
    initial="hidden"
    animate="visible"
  >
    <div className="max-w-7xl mx-auto">{children}</div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   DASH CARD — Card with light grey border, NO shadow, full dark mode
   ═══════════════════════════════════════════════════════════════════════════ */
interface DashCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap: Record<string, string> = {
  none: "",
  sm: "p-2.5 sm:p-3",
  md: "p-3 sm:p-4",
  lg: "p-4 sm:p-5 lg:p-6",
};

export const DashCard: React.FC<DashCardProps> = ({
  children,
  className,
  hover = false,
  onClick,
  padding = "md",
}) => (
  <motion.div
    className={cn(
      "bg-white dark:bg-gray-900",
      "border border-gray-200 dark:border-gray-800",
      "rounded-xl",
      paddingMap[padding],
      hover &&
        "cursor-pointer hover:border-gray-300 dark:hover:border-gray-700",
      onClick && "cursor-pointer",
      "transition-colors duration-200",
      className
    )}
    variants={dashboardItemVariants}
    whileHover={hover || onClick ? { y: -2 } : undefined}
    whileTap={onClick ? { scale: 0.99 } : undefined}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD — Stats display with icon, value, label, optional change badge
   ═══════════════════════════════════════════════════════════════════════════ */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  change?: string;
  positive?: boolean;
  onClick?: () => void;
  index?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconColor,
  change,
  positive = true,
  onClick,
  index = 0,
}) => (
  <motion.div
    className={cn(
      "bg-white dark:bg-gray-900",
      "border border-gray-200 dark:border-gray-800",
      "rounded-xl p-3 sm:p-4 lg:p-5",
      onClick &&
        "cursor-pointer hover:border-gray-300 dark:hover:border-gray-700",
      "transition-colors duration-200"
    )}
    initial={{ opacity: 0, y: 20 }}
    animate={{
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.06, duration: 0.35, ease: "easeOut" },
    }}
    whileHover={onClick ? { y: -2 } : undefined}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-2 sm:mb-3">
      <div
        className={cn(
          "p-2 sm:p-2.5 rounded-xl bg-gradient-to-br text-white",
          iconColor
        )}
      >
        {icon}
      </div>
      {change && (
        <span
          className={cn(
            "text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full",
            positive
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
          )}
        >
          {change}
        </span>
      )}
    </div>
    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
      {value}
    </p>
    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
      {label}
    </p>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   STATS GRID — Responsive grid wrapper for StatCards
   ═══════════════════════════════════════════════════════════════════════════ */
interface StatsGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

const gridCols: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  cols = 4,
  className,
}) => (
  <motion.div
    className={cn(
      "grid gap-3 sm:gap-4 mb-4 sm:mb-6",
      gridCols[cols],
      className
    )}
    variants={dashboardItemVariants}
  >
    {children}
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION HEADER — Title + optional subtitle + optional action inside cards
   ═══════════════════════════════════════════════════════════════════════════ */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onActionClick?: () => void;
  actionLabel?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
  onActionClick,
  actionLabel,
  className,
}) => (
  <div className={cn("flex items-center justify-between mb-3 sm:mb-4", className)}>
    <div className="flex items-center gap-2">
      {icon && (
        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
      )}
      <div>
        <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action ||
      (onActionClick && (
        <motion.button
          className="text-[10px] sm:text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-0.5"
          whileHover={{ x: 2 }}
          onClick={onActionClick}
        >
          {actionLabel || "View All"} <ChevronRight size={14} />
        </motion.button>
      ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK LINK CARD — Bottom-of-page navigation link cards
   ═══════════════════════════════════════════════════════════════════════════ */
interface QuickLinkCardProps {
  label: string;
  icon: React.ReactNode;
  route: string;
  iconColor: string;
}

export const QuickLinkCard: React.FC<QuickLinkCardProps> = ({
  label,
  icon,
  route,
  iconColor,
}) => {
  const navigate = useNavigate();
  return (
    <motion.button
      onClick={() => navigate(route)}
      className={cn(
        "flex items-center gap-2 sm:gap-3 p-3 sm:p-4 w-full",
        "bg-white dark:bg-gray-900",
        "border border-gray-200 dark:border-gray-800",
        "rounded-xl text-left",
        "hover:border-gray-300 dark:hover:border-gray-700",
        "transition-colors duration-200"
      )}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn("p-1.5 sm:p-2 rounded-lg", iconColor)}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
          {label}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
          View <ChevronRight size={10} />
        </p>
      </div>
    </motion.button>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK LINKS GRID — Wraps QuickLinkCards in a responsive grid
   ═══════════════════════════════════════════════════════════════════════════ */
interface QuickLinksGridProps {
  children: React.ReactNode;
  className?: string;
}

export const QuickLinksGrid: React.FC<QuickLinksGridProps> = ({
  children,
  className,
}) => (
  <motion.div
    className={cn(
      "mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4",
      className
    )}
    variants={dashboardItemVariants}
  >
    {children}
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FILTER BAR — Search + filter children wrapper
   ═══════════════════════════════════════════════════════════════════════════ */
interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
  className,
}) => (
  <DashCard
    className={cn(
      "!flex flex-wrap gap-2 sm:gap-3 items-center mb-4 sm:mb-6",
      className
    )}
  >
    <div className="relative flex-1 min-w-[160px] sm:min-w-[200px]">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
      />
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className={cn(
          "w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2",
          "rounded-lg border border-gray-200 dark:border-gray-700",
          "bg-gray-50 dark:bg-gray-800",
          "text-xs sm:text-sm text-gray-900 dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-indigo-400/40 focus:border-indigo-500 dark:focus:border-indigo-400",
          "transition-colors duration-200"
        )}
      />
    </div>
    {children}
  </DashCard>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FILTER SELECT — Dark-mode-ready select dropdown
   ═══════════════════════════════════════════════════════════════════════════ */
interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  className,
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      "px-2 sm:px-3 py-1.5 sm:py-2",
      "rounded-lg border border-gray-200 dark:border-gray-700",
      "bg-gray-50 dark:bg-gray-800",
      "text-xs sm:text-sm text-gray-900 dark:text-white",
      "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-indigo-400/40",
      "transition-colors duration-200",
      className
    )}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

/* ═══════════════════════════════════════════════════════════════════════════
   FILTER PILL — Tab-style filter button
   ═══════════════════════════════════════════════════════════════════════════ */
interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const FilterPill: React.FC<FilterPillProps> = ({
  label,
  active,
  onClick,
}) => (
  <motion.button
    onClick={onClick}
    className={cn(
      "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap",
      "transition-all duration-200",
      active
        ? "bg-indigo-600 dark:bg-indigo-500 text-white"
        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
    )}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {label}
  </motion.button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ACTION BUTTON — Primary / secondary action buttons
   ═══════════════════════════════════════════════════════════════════════════ */
interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  variant = "primary",
  className,
}) => (
  <motion.button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium",
      "transition-colors duration-200",
      variant === "primary"
        ? "bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
        : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
      className
    )}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {icon}
    {label}
  </motion.button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   STATUS BADGE — Colored status pill
   ═══════════════════════════════════════════════════════════════════════════ */
interface StatusBadgeProps {
  status: string;
  icon?: React.ReactNode;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active:
    "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
  completed:
    "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
  success:
    "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400",
  approved:
    "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
  pending:
    "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400",
  processing:
    "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
  failed:
    "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
  rejected:
    "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400",
  cancelled:
    "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
  closed:
    "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
  disbursed:
    "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  icon,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium capitalize",
      statusStyles[status.toLowerCase()] || statusStyles.pending,
      className
    )}
  >
    {icon}
    {status}
  </span>
);

/* ═══════════════════════════════════════════════════════════════════════════
   PROGRESS BAR — Animated progress bar with dark mode
   ═══════════════════════════════════════════════════════════════════════════ */
interface ProgressBarProps {
  value: number;
  color?: string;
  height?: "sm" | "md";
  animated?: boolean;
  delay?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = "bg-gradient-to-r from-indigo-500 to-purple-500",
  height = "sm",
  animated = true,
  delay = 0,
  className,
}) => (
  <div
    className={cn(
      "w-full bg-gray-100 dark:bg-gray-800 rounded-full",
      height === "sm" ? "h-1.5" : "h-2.5",
      className
    )}
  >
    <motion.div
      className={cn(
        "rounded-full",
        color,
        height === "sm" ? "h-1.5" : "h-2.5"
      )}
      initial={animated ? { width: 0 } : undefined}
      animate={{ width: `${Math.min(value, 100)}%` }}
      transition={
        animated ? { duration: 0.8, ease: "easeOut", delay } : undefined
      }
    />
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ICON BOX — Colored icon container (gradient or flat)
   ═══════════════════════════════════════════════════════════════════════════ */
interface IconBoxProps {
  icon: React.ReactNode;
  color: string;
  size?: "sm" | "md" | "lg";
  gradient?: boolean;
}

const iconSizeMap: Record<string, string> = {
  sm: "p-1.5 rounded-lg",
  md: "p-2 sm:p-2.5 rounded-xl",
  lg: "p-3 rounded-xl",
};

export const IconBox: React.FC<IconBoxProps> = ({
  icon,
  color,
  size = "md",
  gradient = true,
}) => (
  <div
    className={cn(
      iconSizeMap[size],
      gradient ? `bg-gradient-to-br ${color} text-white` : color
    )}
  >
    {icon}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   LIST ACTION ROW — Clickable row for action lists (e.g. card actions)
   ═══════════════════════════════════════════════════════════════════════════ */
interface ListActionRowProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  iconColor: string;
  onClick: () => void;
}

export const ListActionRow: React.FC<ListActionRowProps> = ({
  label,
  description,
  icon,
  iconColor,
  onClick,
}) => (
  <motion.button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4",
      "bg-white dark:bg-gray-900",
      "border border-gray-200 dark:border-gray-800",
      "rounded-xl text-left",
      "hover:border-gray-300 dark:hover:border-gray-700",
      "transition-colors duration-200"
    )}
    whileHover={{ x: 4 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className={cn("p-2 sm:p-2.5 rounded-xl", iconColor)}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </p>
      {description && (
        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
    <ChevronRight
      size={16}
      className="text-gray-400 dark:text-gray-500 flex-shrink-0"
    />
  </motion.button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MINI ACTION BUTTON — Small action buttons inside cards (Send, Edit, etc.)
   ═══════════════════════════════════════════════════════════════════════════ */
interface MiniActionButtonProps {
  label?: string;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  color?: string;
  className?: string;
}

export const MiniActionButton: React.FC<MiniActionButtonProps> = ({
  label,
  icon,
  onClick,
  color = "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/80",
  className,
}) => (
  <motion.button
    className={cn(
      "flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium",
      "transition-colors duration-200",
      label ? "flex-1 px-2 sm:px-3" : "px-2 sm:px-3",
      color,
      className
    )}
    whileTap={{ scale: 0.95 }}
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
  >
    {icon}
    {label}
  </motion.button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   DIVIDER — Themed horizontal divider
   ═══════════════════════════════════════════════════════════════════════════ */
export const Divider: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "border-t border-gray-100 dark:border-gray-800",
      className
    )}
  />
);

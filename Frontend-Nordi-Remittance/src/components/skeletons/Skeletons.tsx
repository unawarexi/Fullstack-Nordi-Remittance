// ============================================================================
// REUSABLE SKELETON COMPONENTS — Banking loading placeholders
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@utils/cn";

// ========================
// BASE SKELETON BLOCK
// ========================
const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export const SkeletonBlock: React.FC<{
  className?: string;
  rounded?: string;
}> = ({ className, rounded = "rounded-lg" }) => (
  <div className={cn("bg-neutral-200", shimmer, rounded, className)} />
);

// ========================
// PAGE HEADER SKELETON
// ========================
export const PageHeaderSkeleton: React.FC = () => (
  <div className="mb-6">
    <SkeletonBlock className="h-8 w-64 mb-2" />
    <SkeletonBlock className="h-4 w-96" />
  </div>
);

// ========================
// STATS CARD SKELETON
// ========================
export const StatsCardSkeleton: React.FC = () => (
  <motion.div
    className="bg-white rounded-xl shadow-sm p-5"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between mb-3">
      <SkeletonBlock className="h-10 w-10" rounded="rounded-lg" />
      <SkeletonBlock className="h-5 w-16" />
    </div>
    <SkeletonBlock className="h-7 w-32 mb-1" />
    <SkeletonBlock className="h-4 w-24" />
  </motion.div>
);

export const StatsGridSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {Array.from({ length: count }).map((_, i) => (
      <StatsCardSkeleton key={i} />
    ))}
  </div>
);

// ========================
// ACCOUNT CARD SKELETON
// ========================
export const AccountCardSkeleton: React.FC = () => (
  <motion.div
    className="bg-white rounded-xl shadow-sm p-5 border border-neutral-100"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <SkeletonBlock className="h-12 w-12" rounded="rounded-xl" />
      <div className="flex-1">
        <SkeletonBlock className="h-5 w-40 mb-1" />
        <SkeletonBlock className="h-4 w-24" />
      </div>
      <SkeletonBlock className="h-6 w-16" rounded="rounded-full" />
    </div>
    <SkeletonBlock className="h-8 w-36 mb-2" />
    <SkeletonBlock className="h-4 w-48" />
    <div className="flex gap-2 mt-4">
      <SkeletonBlock className="h-9 w-24" rounded="rounded-lg" />
      <SkeletonBlock className="h-9 w-24" rounded="rounded-lg" />
    </div>
  </motion.div>
);

export const AccountListSkeleton: React.FC<{ count?: number }> = ({
  count = 3,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <AccountCardSkeleton key={i} />
    ))}
  </div>
);

// ========================
// TRANSACTION ROW SKELETON
// ========================
export const TransactionRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 py-3 border-b border-neutral-100">
    <SkeletonBlock className="h-10 w-10 flex-shrink-0" rounded="rounded-full" />
    <div className="flex-1 min-w-0">
      <SkeletonBlock className="h-4 w-40 mb-1" />
      <SkeletonBlock className="h-3 w-28" />
    </div>
    <div className="text-right">
      <SkeletonBlock className="h-5 w-20 mb-1 ml-auto" />
      <SkeletonBlock className="h-3 w-16 ml-auto" />
    </div>
  </div>
);

export const TransactionListSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => (
  <div className="bg-white rounded-xl shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <SkeletonBlock className="h-6 w-44" />
      <SkeletonBlock className="h-8 w-28" rounded="rounded-lg" />
    </div>
    {Array.from({ length: count }).map((_, i) => (
      <TransactionRowSkeleton key={i} />
    ))}
  </div>
);

// ========================
// CREDIT CARD SKELETON
// ========================
export const CreditCardSkeleton: React.FC = () => (
  <motion.div
    className="bg-gradient-to-br from-neutral-300 to-neutral-200 rounded-2xl p-6 h-48 w-full max-w-sm"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="flex justify-between mb-8">
      <SkeletonBlock className="h-8 w-12 bg-neutral-300" rounded="rounded-md" />
      <SkeletonBlock className="h-6 w-16 bg-neutral-300" />
    </div>
    <SkeletonBlock className="h-6 w-56 bg-neutral-300 mb-4" />
    <div className="flex justify-between">
      <SkeletonBlock className="h-4 w-24 bg-neutral-300" />
      <SkeletonBlock className="h-4 w-16 bg-neutral-300" />
    </div>
  </motion.div>
);

// ========================
// TABLE SKELETON
// ========================
export const TableSkeleton: React.FC<{
  rows?: number;
  cols?: number;
}> = ({ rows = 5, cols = 5 }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    {/* Header */}
    <div className="flex gap-4 p-4 border-b border-neutral-200 bg-neutral-50">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex gap-4 p-4 border-b border-neutral-100 last:border-0"
      >
        {Array.from({ length: cols }).map((_, j) => (
          <SkeletonBlock
            key={j}
            className={cn("h-4 flex-1", j === 0 && "w-8 flex-none")}
          />
        ))}
      </div>
    ))}
  </div>
);

// ========================
// FORM SKELETON
// ========================
export const FormFieldSkeleton: React.FC = () => (
  <div className="mb-4">
    <SkeletonBlock className="h-4 w-28 mb-2" />
    <SkeletonBlock className="h-10 w-full" rounded="rounded-lg" />
  </div>
);

export const FormSkeleton: React.FC<{ fields?: number }> = ({
  fields = 4,
}) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <SkeletonBlock className="h-6 w-48 mb-6" />
    {Array.from({ length: fields }).map((_, i) => (
      <FormFieldSkeleton key={i} />
    ))}
    <SkeletonBlock className="h-11 w-full mt-6" rounded="rounded-lg" />
  </div>
);

// ========================
// CHART SKELETON
// ========================
export const ChartSkeleton: React.FC<{ height?: string }> = ({
  height = "h-64",
}) => (
  <div className="bg-white rounded-xl shadow-sm p-5">
    <div className="flex items-center justify-between mb-4">
      <SkeletonBlock className="h-6 w-40" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-8 w-16" rounded="rounded-lg" />
        <SkeletonBlock className="h-8 w-16" rounded="rounded-lg" />
      </div>
    </div>
    <SkeletonBlock className={cn("w-full", height)} rounded="rounded-lg" />
  </div>
);

// ========================
// DETAIL PAGE SKELETON
// ========================
export const DetailPageSkeleton: React.FC = () => (
  <div className="space-y-6">
    <PageHeaderSkeleton />
    <StatsGridSkeleton count={3} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TransactionListSkeleton />
      </div>
      <div>
        <ChartSkeleton height="h-48" />
      </div>
    </div>
  </div>
);

// ========================
// FULL PAGE SKELETON
// ========================
export const FullPageSkeleton: React.FC = () => (
  <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full">
    <PageHeaderSkeleton />
    <StatsGridSkeleton />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TransactionListSkeleton count={4} />
      <ChartSkeleton />
    </div>
  </div>
);

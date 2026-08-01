import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  CreditCard,
  Calculator,
  ShieldCheck,
  CalendarClock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  BadgeDollarSign,
  Percent,
  ChevronRight,
  Star,
  Info,
  Lightbulb,
  BarChart3,
  FileText,
  DollarSign,
  Wallet,
  Banknote,
} from "@constants/icons";

import { PageContainer, DashCard, StatCard, StatsGrid, StatusBadge } from "@components/shared/DashboardPrimitives";
import PageHeader from "@components/shared/PageHeader";
import EmptyState from "@components/shared/EmptyState";
import { StatsGridSkeleton, TableSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientLoans, useClientLoanProducts } from "../../client-usecase/useloans-client-usecase";
import { useUIStore } from "@store/ui.store";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const fmtCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const loanStatusMap: Record<string, { label: string; variant: string }> = {
  active: { label: "Active", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "info" },
  rejected: { label: "Rejected", variant: "error" },
  closed: { label: "Closed", variant: "default" },
  overdue: { label: "Overdue", variant: "error" },
};

const ApplyForLoan: React.FC = () => {
  const { products, isLoading } = useClientLoanProducts();
  const sidebarCollapsed = useUIStore((s) => s.sidebar.isCollapsed);

  return (
    <PageContainer>
      <PageHeader
        title="Apply for a Loan"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Loans", href: "/loans" },
          { label: "Apply" },
        ]}
      />

      {isLoading ? (
        <FormSkeleton />
      ) : (
        <motion.div variants={dashboardItemVariants} initial="hidden" animate="visible" className="space-y-6">
          {!products.length ? (
            <EmptyState
              icon={<Landmark size={48} />}
              title="No loan products available"
              description="There are no loan products available at the moment. Please check back later."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product: any, idx: number) => (
                <DashCard key={product.id ?? idx}>
                  <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="mb-4 flex items-start gap-3">
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 dark:border-blue-800/40 dark:bg-blue-900/20">
                        <Landmark className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                          {product.name ?? product.loanType ?? "Loan Product"}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                          {product.description ?? "Flexible loan for your needs"}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mb-4 flex-1 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                        <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Interest Rate</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                          {product.interestRate ?? product.rate ?? "—"}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                        <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Max Amount</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                          {product.maxAmount ? fmt(product.maxAmount) : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                        <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Tenure</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                          {product.minTenure ?? 6}–{product.maxTenure ?? 360} months
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Processing Fee</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                          {product.processingFee ?? "1"}%
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Features
                        </p>
                        <ul className="space-y-1.5">
                          {product.features.slice(0, 4).map((feature: string, fIdx: number) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500 dark:text-green-400" />
                              <span className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Apply Button */}
                    <button className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 sm:text-sm">
                      Apply Now
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </DashCard>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </PageContainer>
  );
};

export default ApplyForLoan;

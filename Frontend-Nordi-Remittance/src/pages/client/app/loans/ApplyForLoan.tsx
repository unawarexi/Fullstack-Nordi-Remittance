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

import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import PageHeader from "@components/shared/PageHeader";
import EmptyState from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  TableSkeleton,
  FormSkeleton,
} from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useLoans, useLoanProducts } from "@hooks/queries/useLoans";
import { useUIStore } from "@store/ui.store";

const safeArray = (d: unknown): any[] => Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];

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
  const { data: productsData, isLoading } = useLoanProducts();
  const sidebarCollapsed = useUIStore((s) => s.sidebar.isCollapsed);

  const products = safeArray(productsData);

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
        <motion.div
          variants={dashboardItemVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {!products.length ? (
            <EmptyState
              icon={<Landmark size={48} />}
              title="No loan products available"
              description="There are no loan products available at the moment. Please check back later."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product: any, idx: number) => (
                <DashCard key={product.id ?? idx}>
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
                        <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                          {product.name ?? product.loanType ?? "Loan Product"}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {product.description ?? "Flexible loan for your needs"}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4 flex-1">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Interest Rate
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {product.interestRate ?? product.rate ?? "—"}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Max Amount
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {product.maxAmount ? fmt(product.maxAmount) : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Tenure
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {product.minTenure ?? 6}–{product.maxTenure ?? 360} months
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Processing Fee
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {product.processingFee ?? "1"}%
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Features
                        </p>
                        <ul className="space-y-1.5">
                          {product.features.slice(0, 4).map((feature: string, fIdx: number) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Apply Button */}
                    <button className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-medium transition-colors">
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
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

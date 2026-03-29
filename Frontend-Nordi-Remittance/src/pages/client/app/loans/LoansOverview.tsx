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


const LoansOverview: React.FC = () => {
  const { data: loansData, isLoading } = useLoans();
  const sidebarCollapsed = useUIStore((s) => s.sidebar.isCollapsed);

  const loans = safeArray(loansData);

  const stats = useMemo(() => {
    if (!loans.length)
      return { totalBorrowed: 0, activeLoans: 0, nextPayment: 0, nextPaymentDate: "" };

    const totalBorrowed = loans.reduce(
      (sum: number, l: any) => sum + (l.principalAmount ?? l.amount ?? 0),
      0
    );
    const activeLoans = loans.filter(
      (l: any) => l.status === "active" || l.status === "approved"
    ).length;

    const activeLoansList = loans.filter((l: any) => l.status === "active");
    const upcoming = activeLoansList
      .filter((l: any) => l.nextPaymentDate)
      .sort(
        (a: any, b: any) =>
          new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()
      );
    const nextPayment = upcoming[0]?.nextPaymentAmount ?? upcoming[0]?.emiAmount ?? 0;
    const nextPaymentDate = upcoming[0]?.nextPaymentDate ?? "";

    return { totalBorrowed, activeLoans, nextPayment, nextPaymentDate };
  }, [loans]);

  return (
    <PageContainer>
      <PageHeader
        title="Loans Overview"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Loans", href: "/loans" },
          { label: "Overview" },
        ]}
      />

      {isLoading ? (
        <>
          <StatsGridSkeleton count={3} />
          <TableSkeleton rows={5} />
        </>
      ) : (
        <motion.div
          variants={dashboardItemVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Stats */}
          <StatsGrid cols={3}>
            <StatCard
              label="Total Borrowed"
              value={fmt(stats.totalBorrowed)}
              icon={<Landmark size={20} />}
              iconColor="from-blue-500 to-indigo-500"
            />
            <StatCard
              label="Active Loans"
              value={String(stats.activeLoans)}
              icon={<FileText size={20} />}
              iconColor="from-emerald-500 to-teal-500"
            />
            <StatCard
              label="Next Payment"
              value={stats.nextPayment ? fmt(stats.nextPayment) : "—"}
              icon={<CalendarClock size={20} />}
              iconColor="from-amber-500 to-orange-500"
            />
          </StatsGrid>

          {/* Loans Table */}
          <DashCard padding="none">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Your Loans
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                All loan accounts and their current status
              </p>
            </div>

            {loans.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<Landmark size={48} />}
                  title="No loans yet"
                  description="You haven't taken any loans. Apply for one to get started."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        EMI
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tenure
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {loans.map((loan: any, idx: number) => {
                      const status = loanStatusMap[loan.status] ?? {
                        label: loan.status,
                        variant: "default",
                      };
                      return (
                        <tr
                          key={loan.id ?? idx}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {loan.loanId ?? loan.id ?? `LN-${idx + 1}`}
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {loan.loanType ?? loan.type ?? "Personal"}
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            {fmt(loan.principalAmount ?? loan.amount ?? 0)}
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            {loan.emiAmount ? fmt(loan.emiAmount) : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {loan.tenure ? `${loan.tenure} mo` : "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={status.label} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DashCard>
        </motion.div>
      )}
    </PageContainer>
  );
};

export default LoansOverview;

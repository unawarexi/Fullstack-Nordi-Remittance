// ============================================================================
// LOANS OVERVIEW — table of all user loans with real field names from backend
// ============================================================================

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  CalendarClock,
  FileText,
} from "@constants/icons";

import { PageContainer, DashCard, StatCard, StatsGrid, StatusBadge } from "@components/shared/DashboardPrimitives";
import PageHeader from "@components/shared/PageHeader";
import EmptyState from "@components/shared/EmptyState";
import { StatsGridSkeleton, TableSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import {
  useClientLoans,
  useClientApplications,
} from "../../client-usecase/useloans-client-usecase";

/* eslint-disable @typescript-eslint/no-explicit-any */

const fmt = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(value);

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const loanStatusVariant: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  paid: "Paid",
  defaulted: "Defaulted",
  written_off: "Written Off",
  paused: "Paused",
};

const LoansOverview: React.FC = () => {
  const navigate = useNavigate();
  const { loans, isLoading } = useClientLoans();
  const { applications, isLoading: appsLoading } = useClientApplications();

  const stats = useMemo(() => {
    if (!loans.length) return { totalBorrowed: 0, activeLoans: 0, nextPayment: 0, nextPaymentDate: "" };

    const totalBorrowed = loans.reduce((sum: number, l: any) => sum + (l.principalAmount ?? l.amount ?? 0), 0);
    const activeLoans = loans.filter((l: any) => l.status === "active").length;

    const upcoming = loans
      .filter((l: any) => l.status === "active" && l.nextPaymentDate)
      .sort((a: any, b: any) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime());

    return {
      totalBorrowed,
      activeLoans,
      nextPayment: upcoming[0]?.nextPaymentAmount ?? upcoming[0]?.monthlyPayment ?? 0,
      nextPaymentDate: upcoming[0]?.nextPaymentDate ?? "",
    };
  }, [loans]);

  return (
    <PageContainer>
      <PageHeader
        title="Loans Overview"
        breadcrumbs={[
          { label: "Dashboard", href: "/customer/dashboard" },
          { label: "Loans", href: "/customer/loans" },
          { label: "Overview" },
        ]}
      />

      {isLoading ? (
        <>
          <StatsGridSkeleton count={3} />
          <TableSkeleton rows={5} />
        </>
      ) : (
        <motion.div variants={dashboardItemVariants} initial="hidden" animate="visible" className="space-y-6">
          <StatsGrid cols={3}>
            <StatCard label="Total Borrowed" value={fmt(stats.totalBorrowed)} icon={<Landmark size={20} />} iconColor="from-blue-500 to-indigo-500" index={0} />
            <StatCard label="Active Loans" value={String(stats.activeLoans)} icon={<FileText size={20} />} iconColor="from-emerald-500 to-teal-500" index={1} />
            <StatCard label="Next Payment" value={stats.nextPayment ? fmt(stats.nextPayment) : "—"} icon={<CalendarClock size={20} />} iconColor="from-amber-500 to-orange-500" index={2} />
          </StatsGrid>

          {/* Active Loans Table */}
          <DashCard padding="none">
            <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800 sm:px-6 sm:py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Active Loans</h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">All your loan accounts</p>
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
                      {["Loan ID", "Type", "Amount", "Outstanding", "Monthly", "Term", "Next Payment", "Status"].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {loans.map((loan: any, idx: number) => (
                      <tr
                        key={loan._id ?? loan.loanId ?? idx}
                        onClick={() => navigate(`/customer/loans/${loan._id || loan.loanId}`)}
                        className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                          {loan.loanId ?? loan._id ?? `LN-${idx + 1}`}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs capitalize text-gray-500 dark:text-gray-400 sm:text-sm">
                          {loan.loanType ?? loan.type ?? "Personal"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-900 dark:text-white sm:text-sm">
                          {fmt(loan.principalAmount ?? loan.amount ?? 0, loan.currency)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-900 dark:text-white sm:text-sm">
                          {fmt(loan.outstandingBalance ?? 0, loan.currency)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700 dark:text-gray-300 sm:text-sm">
                          {fmt(loan.monthlyPayment ?? 0, loan.currency)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                          {loan.term ? `${loan.term} mo` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                          {fmtDate(loan.nextPaymentDate)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={loanStatusVariant[loan.status] ?? loan.status ?? "Unknown"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashCard>

          {/* Applications Table */}
          {!appsLoading && applications.length > 0 && (
            <DashCard padding="none">
              <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800 sm:px-6 sm:py-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Loan Applications</h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Submitted and pending review</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      {["Application ID", "Type", "Amount", "Term", "Status", "Submitted"].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {applications.map((app: any, idx: number) => (
                      <tr key={app._id ?? app.applicationId ?? idx} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">
                          {app.applicationId ?? app._id ?? `APP-${idx + 1}`}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs capitalize text-gray-500 dark:text-gray-400">
                          {app.loanType ?? "Personal"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-900 dark:text-white">
                          {fmt(app.requestedAmount ?? 0)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {app.term ? `${app.term} mo` : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <StatusBadge status={app.status ?? "unknown"} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {fmtDate(app.submittedAt ?? app.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashCard>
          )}
        </motion.div>
      )}
    </PageContainer>
  );
};

export default LoansOverview;


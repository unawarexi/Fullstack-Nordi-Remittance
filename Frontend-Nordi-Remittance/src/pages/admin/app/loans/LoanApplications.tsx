// ============================================================================
// ADMIN — LOAN APPLICATIONS
// Lists all loan applications from GET /loans/admin/applications.
// Supports approve/reject (with modal) and disburse actions.
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Percent,
  Users,
  Send,
  X,
  Loader2,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  FilterBar,
  FilterSelect,
  FilterPill,
  ActionButton,
  StatusBadge,
  SectionHeader,
  ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";
import { useLoansManagement } from "../../admin-usecase/useloans-admin-usecase";
import { TableSkeleton } from "@components/skeletons";

/* eslint-disable @typescript-eslint/no-explicit-any */

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);

const statusFilters = ["all", "submitted", "under_review", "approved", "rejected", "cancelled"];

const typeLabels: Record<string, string> = {
  personal: "Personal Loan",
  business: "Business Loan",
  mortgage: "Mortgage",
  auto: "Auto Loan",
  student: "Student Loan",
  payday: "Payday Loan",
};

// ─── Review Modal ─────────────────────────────────────────────────────────────
interface ReviewModalProps {
  loan: any;
  mode: "approve" | "reject";
  onConfirm: (notes: string, approvedAmount?: number) => void;
  onClose: () => void;
  isLoading: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ loan, mode, onConfirm, onClose, isLoading }) => {
  const [notes, setNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<number>(loan.amount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`text-base font-semibold ${mode === "approve" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
            {mode === "approve" ? "Approve Application" : "Reject Application"}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{loan.applicant}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{loan.email}</p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
            {typeLabels[loan.type] ?? loan.type} · {fmt(loan.amount)} · {loan.term}mo
          </p>
        </div>

        <div className="space-y-3">
          {mode === "approve" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Approved Amount
              </label>
              <input
                type="number"
                min={100}
                max={loan.amount}
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === "approve" ? "Notes (optional)" : "Reason for rejection"}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={mode === "approve" ? "Internal notes…" : "Explain why the application is being rejected…"}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <ActionButton label="Cancel" variant="secondary" onClick={onClose} />
          <button
            onClick={() => onConfirm(notes, mode === "approve" ? approvedAmount : undefined)}
            disabled={isLoading || (mode === "reject" && !notes.trim())}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60
              ${mode === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {mode === "approve" ? "Approve" : "Reject"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function LoanApplications({ defaultStatus }: { defaultStatus?: string }) {
  const toast = useToast();
  const [reviewTarget, setReviewTarget] = useState<{ loan: any; mode: "approve" | "reject" } | null>(null);

  const {
    loans: filtered,
    stats,
    search,
    setSearch,
    statusFilter: activeStatus,
    setStatusFilter: setActiveStatus,
    typeFilter,
    setTypeFilter,
    approveLoan,
    rejectLoan,
    disburseLoan,
    refetch,
    isLoading,
    isMutating,
  } = useLoansManagement();

  // Apply defaultStatus prop as initial filter once ready
  React.useEffect(() => {
    if (defaultStatus && defaultStatus !== "all") {
      setActiveStatus(defaultStatus as any);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultStatus]);

  const handleReview = (notes: string, approvedAmount?: number) => {
    if (!reviewTarget) return;
    if (reviewTarget.mode === "approve") {
      approveLoan(reviewTarget.loan.applicationId, approvedAmount, notes, {
        onSuccess: () => setReviewTarget(null),
        onError: (err) => toast.error(err?.message || "Failed to approve"),
      });
    } else {
      rejectLoan(reviewTarget.loan.applicationId, notes, {
        onSuccess: () => setReviewTarget(null),
        onError: (err) => toast.error(err?.message || "Failed to reject"),
      });
    }
  };

  return (
    <>
      <AnimatePresence>
        {reviewTarget && (
          <ReviewModal
            loan={reviewTarget.loan}
            mode={reviewTarget.mode}
            onConfirm={handleReview}
            onClose={() => setReviewTarget(null)}
            isLoading={isMutating}
          />
        )}
      </AnimatePresence>

      <PageContainer>
        <PageHeader
          title="Loan Management"
          subtitle="Review applications, manage active loans, and monitor repayments"
          breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Loans" }]}
          actions={
            <div className="flex gap-2">
              <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
              <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} />
            </div>
          }
        />

        <StatsGrid>
          <StatCard label="Total Portfolio" value={fmt(stats.totalDisbursed)} icon={<DollarSign size={18} />} iconColor="from-blue-500 to-blue-600" positive index={0} />
          <StatCard label="Active Loans" value={stats.activeLoans} icon={<Banknote size={18} />} iconColor="from-emerald-500 to-emerald-600" index={1} />
          <StatCard label="Pending Applications" value={stats.pendingApplications} icon={<Clock size={18} />} iconColor="from-amber-500 to-amber-600" index={2} />
          <StatCard label="Total Applications" value={stats.totalLoans} icon={<Users size={18} />} iconColor="from-rose-500 to-rose-600" positive={false} index={3} />
        </StatsGrid>

        {/* Status tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map((s) => (
            <FilterPill
              key={s}
              label={s === "all" ? "All" : s.replace("_", " ")}
              active={activeStatus === s}
              onClick={() => setActiveStatus(s as any)}
            />
          ))}
        </div>

        <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by name, email or application ID…">
          <FilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: "all", label: "All Types" },
              { value: "personal", label: "Personal" },
              { value: "business", label: "Business" },
              { value: "mortgage", label: "Mortgage" },
              { value: "auto", label: "Auto" },
              { value: "student", label: "Student" },
            ]}
          />
        </FilterBar>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((loan: any, i: number) => (
                <motion.div
                  key={loan.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <DashCard>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                      {/* Applicant Info */}
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                          <Banknote size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{loan.applicant}</p>
                          <p className="truncate text-[10px] text-gray-400 sm:text-xs">
                            {loan.email} · App: {loan.applicationId?.slice(-8) || loan.id?.slice(-8)}
                          </p>
                        </div>
                      </div>

                      {/* Loan Metrics */}
                      <div className="flex flex-shrink-0 flex-wrap items-center gap-4">
                        <div>
                          <p className="text-[10px] text-gray-400">Amount</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{fmt(loan.amount)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">Type</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{typeLabels[loan.type] ?? loan.type}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">Term</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{loan.term}mo</p>
                        </div>
                        <div className="hidden sm:block">
                          <p className="text-[10px] text-gray-400">Purpose</p>
                          <p className="max-w-[120px] truncate text-xs text-gray-500 dark:text-gray-400">{loan.purpose || "—"}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={loan.status} />
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        {/* Approve / Reject for submitted/under_review */}
                        {(loan.status === "submitted" || loan.status === "under_review") && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setReviewTarget({ loan, mode: "approve" })}
                              title="Approve"
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                            >
                              <CheckCircle size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setReviewTarget({ loan, mode: "reject" })}
                              title="Reject"
                              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                            >
                              <XCircle size={16} />
                            </motion.button>
                          </>
                        )}

                        {/* Disburse for approved (but not yet disbursed) */}
                        {loan.status === "approved" && !loan.disbursed && loan.loanId && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              disburseLoan(loan.loanId, {
                                onError: (err) => toast.error(err?.message || "Disbursement failed"),
                              })
                            }
                            title="Disburse Loan"
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
                          >
                            <Send size={16} />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {loan.status === "rejected" && loan.rejectionReason && (
                      <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2 dark:border-rose-900 dark:bg-rose-950/30">
                        <p className="text-[10px] text-rose-600 dark:text-rose-400">
                          Reason: {loan.rejectionReason}
                        </p>
                      </div>
                    )}
                  </DashCard>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <DashCard className="py-12 text-center">
                <Banknote size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No loan applications found matching your criteria</p>
              </DashCard>
            )}
          </div>
        )}
      </PageContainer>
    </>
  );
}

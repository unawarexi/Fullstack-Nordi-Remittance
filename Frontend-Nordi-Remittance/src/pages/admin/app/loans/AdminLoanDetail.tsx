// ============================================================================
// ADMIN — LOAN APPLICATION DETAIL
// Shows full application info + approve / reject / disburse actions.
// Route: /admin/loans/:applicationId
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import {
  Banknote,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  X,
  Loader2,
  User,
  DollarSign,
  CalendarClock,
  FileText,
  Percent,
  RefreshCw,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  StatusBadge,
  ActionButton,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { StatsGridSkeleton } from "@components/skeletons";
import EmptyState from "@components/shared/EmptyState";
import { useAdminLoanApplications, useReviewLoanApplication, useDisburseAdminLoan } from "@hooks/api-queries/useLoans";
import { useToast } from "@store/toast.store";
import { dashboardItemVariants } from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

const fmt = (v: number, cur = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur, minimumFractionDigits: 2 }).format(v);
const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export default function AdminLoanDetail() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const toast = useToast();

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [notes, setNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState(0);

  // Fetch all applications and find the one we need (admin has no single-fetch endpoint)
  const { data: raw, isLoading, refetch } = useAdminLoanApplications();
  const reviewMutation = useReviewLoanApplication();
  const disburseMutation = useDisburseAdminLoan();

  const applications: any[] = Array.isArray((raw as any)?.data?.data)
    ? (raw as any).data.data
    : Array.isArray((raw as any)?.data)
      ? (raw as any).data
      : (raw as any)?.applications || [];

  const app = applications.find(
    (a: any) => a._id === applicationId || a.applicationId === applicationId,
  );

  // Set default approved amount once loaded
  React.useEffect(() => {
    if (app && !approvedAmount) setApprovedAmount(app.requestedAmount ?? 0);
  }, [app, approvedAmount]);

  const handleApprove = () => {
    if (!app) return;
    reviewMutation.mutate(
      { applicationId: (app._id || app.applicationId) as any, data: { decision: "approve", approvedAmount, notes } },
      {
        onSuccess: () => {
          setShowApprove(false);
          setNotes("");
          refetch();
          toast.success("Application approved");
        },
        onError: (err: any) => toast.error(err?.message || "Failed to approve"),
      },
    );
  };

  const handleReject = () => {
    if (!app) return;
    reviewMutation.mutate(
      { applicationId: (app._id || app.applicationId) as any, data: { decision: "reject", reason: notes } },
      {
        onSuccess: () => {
          setShowReject(false);
          setNotes("");
          refetch();
          toast.success("Application rejected");
        },
        onError: (err: any) => toast.error(err?.message || "Failed to reject"),
      },
    );
  };

  const handleDisburse = () => {
    if (!app?.loan?._id && !app?.loan) return;
    const loanId = typeof app.loan === "string" ? app.loan : app.loan?._id;
    disburseMutation.mutate(loanId as any, {
      onSuccess: () => {
        refetch();
        toast.success("Loan disbursed");
      },
      onError: (err: any) => toast.error(err?.message || "Disbursement failed"),
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Application Detail" breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Loans", href: "/admin/loans" }, { label: "Detail" }]} />
        <StatsGridSkeleton count={4} />
      </PageContainer>
    );
  }

  if (!app) {
    return (
      <PageContainer>
        <PageHeader title="Application Detail" breadcrumbs={[{ label: "Loans", href: "/admin/loans" }, { label: "Detail" }]} />
        <DashCard>
          <EmptyState icon={<Banknote size={40} />} title="Application not found" description="This loan application could not be found." />
        </DashCard>
      </PageContainer>
    );
  }

  const user = app.user || {};
  const canReview = app.status === "submitted" || app.status === "under_review";
  const canDisburse = app.status === "approved" && app.loan;

  return (
    <>
      {/* Approve modal */}
      <AnimatePresence>
        {showApprove && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-emerald-700 dark:text-emerald-400">Approve Application</h3>
                <button onClick={() => setShowApprove(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Approved Amount</label>
                  <input type="number" min={100} max={app.requestedAmount} value={approvedAmount}
                    onChange={(e) => setApprovedAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (optional)</label>
                  <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes…"
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <ActionButton label="Cancel" variant="secondary" onClick={() => setShowApprove(false)} />
                <button onClick={handleApprove} disabled={reviewMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60">
                  {reviewMutation.isPending && <Loader2 size={16} className="animate-spin" />} Approve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject modal */}
      <AnimatePresence>
        {showReject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-red-700 dark:text-red-400">Reject Application</h3>
                <button onClick={() => setShowReject(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} /></button>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for rejection *</label>
                <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Explain the reason for rejection…"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div className="mt-4 flex gap-2">
                <ActionButton label="Cancel" variant="secondary" onClick={() => setShowReject(false)} />
                <button onClick={handleReject} disabled={reviewMutation.isPending || !notes.trim()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
                  {reviewMutation.isPending && <Loader2 size={16} className="animate-spin" />} Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PageContainer>
        <PageHeader
          title={`Application ${app.applicationId?.slice(-10) || app._id?.slice(-10)}`}
          subtitle={`${user.firstName ?? ""} ${user.lastName ?? ""} · ${app.loanType ?? "Personal"} loan`}
          breadcrumbs={[
            { label: "Admin", href: "/admin/dashboard" },
            { label: "Loans", href: "/admin/loans" },
            { label: "Detail" },
          ]}
          actions={
            <div className="flex gap-2">
              <ActionButton label="Refresh" icon={<RefreshCw size={14} />} variant="secondary" onClick={() => refetch()} />
              {canReview && (
                <>
                  <ActionButton label="Approve" icon={<CheckCircle size={14} />} onClick={() => setShowApprove(true)} />
                  <button
                    onClick={() => setShowReject(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </>
              )}
              {canDisburse && (
                <button
                  onClick={handleDisburse}
                  disabled={disburseMutation.isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {disburseMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Disburse Loan
                </button>
              )}
            </div>
          }
        />

        <motion.div variants={dashboardItemVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Stats */}
          <StatsGrid cols={4}>
            <StatCard label="Requested Amount" value={fmt(app.requestedAmount ?? 0)} icon={<DollarSign size={18} />} iconColor="from-blue-500 to-blue-600" index={0} />
            <StatCard label="Approved Amount" value={app.approvedAmount ? fmt(app.approvedAmount) : "—"} icon={<CheckCircle size={18} />} iconColor="from-emerald-500 to-emerald-600" index={1} />
            <StatCard label="Term" value={`${app.term ?? 0} months`} icon={<CalendarClock size={18} />} iconColor="from-amber-500 to-amber-600" index={2} />
            <StatCard label="Interest Rate" value={app.interestRate ? `${app.interestRate}%` : "TBD"} icon={<Percent size={18} />} iconColor="from-purple-500 to-purple-600" index={3} />
          </StatsGrid>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Application Details */}
            <DashCard>
              <div className="mb-4 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Application Details</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Status", value: <StatusBadge status={app.status} /> },
                  { label: "Application ID", value: app.applicationId || app._id },
                  { label: "Loan Type", value: app.loanType ?? "—" },
                  { label: "Purpose", value: app.purpose ?? "—" },
                  { label: "Submitted At", value: fmtDate(app.submittedAt || app.createdAt) },
                  { label: "Reviewed At", value: fmtDate(app.reviewedAt) },
                  { label: "Notes", value: app.reviewNotes || "—" },
                  { label: "Rejection Reason", value: app.rejectionReason || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="ml-4 text-right text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </DashCard>

            {/* Applicant Info */}
            <DashCard>
              <div className="mb-4 flex items-center gap-2">
                <User size={16} className="text-indigo-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Applicant</h3>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Name", value: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—" },
                  { label: "Email", value: user.email ?? "—" },
                  { label: "Employment Status", value: app.employmentInfo?.employmentStatus ?? "—" },
                  { label: "Occupation", value: app.employmentInfo?.occupation ?? "—" },
                  { label: "Monthly Income", value: app.employmentInfo?.monthlyIncome ? fmt(app.employmentInfo.monthlyIncome) : "—" },
                  { label: "Monthly Expenses", value: app.financialInfo?.monthlyExpenses ? fmt(app.financialInfo.monthlyExpenses) : "—" },
                  { label: "Existing Debts", value: app.financialInfo?.existingDebts ? fmt(app.financialInfo.existingDebts) : "—" },
                  { label: "Assets", value: app.financialInfo?.assets ? fmt(app.financialInfo.assets) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="ml-4 text-right text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </DashCard>
          </div>

          {/* Disbursed Loan Info */}
          {app.loan && (
            <DashCard>
              <div className="mb-4 flex items-center gap-2">
                <Banknote size={16} className="text-emerald-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Disbursed Loan</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Loan ID", value: (typeof app.loan === "object" ? app.loan.loanId : app.loan) || "—" },
                  { label: "Principal", value: typeof app.loan === "object" ? fmt(app.loan.principalAmount ?? 0) : "—" },
                  { label: "Status", value: typeof app.loan === "object" ? <StatusBadge status={app.loan.status} /> : "—" },
                  { label: "Disbursed At", value: typeof app.loan === "object" ? fmtDate(app.loan.disbursementDate) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </DashCard>
          )}
        </motion.div>
      </PageContainer>
    </>
  );
}

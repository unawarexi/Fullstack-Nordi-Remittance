// ============================================================================
// AccountApplications — Admin review of account opening applications
// Endpoints: GET /admin/operations/accounts/applications/pending
//            POST /admin/operations/accounts/applications/:id/approve
//            POST /admin/operations/accounts/applications/:id/reject
// ============================================================================
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ChevronDown,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  CheckCheck,
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
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useApplicationsManagement } from "../../admin-usecase/useadmin-account-usecase";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const;

const typeLabels: Record<string, string> = {
  savings: "Savings Account",
  current: "Current Account",
  fixed_deposit: "Fixed Deposit",
};

const typeColors: Record<string, string> = {
  savings: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  current: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  fixed_deposit: "bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={12} className="text-amber-500" />,
  approved: <CheckCircle2 size={12} className="text-emerald-500" />,
  rejected: <XCircle size={12} className="text-rose-500" />,
};

// ─── Reject Dialog ────────────────────────────────────────────────────────────
function RejectDialog({
  isOpen,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  isLoading,
}: {
  isOpen: boolean;
  reason: string;
  onReasonChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/30">
              <XCircle size={18} className="text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reject Application</h3>
              <p className="text-xs text-gray-400">Provide a reason for the applicant</p>
            </div>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={16} />
          </button>
        </div>

        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="e.g. Insufficient documentation, KYC verification failed..."
          rows={4}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-rose-500 dark:focus:ring-rose-950/30"
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim() || isLoading}
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Rejecting…" : "Reject Application"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Application Row ──────────────────────────────────────────────────────────
function ApplicationRow({
  app,
  onApprove,
  onReject,
  isApproving,
}: {
  app: any;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const ownerName =
    app.user?.firstName && app.user?.lastName
      ? `${app.user.firstName} ${app.user.lastName}`
      : app.user?.email || "Unknown";

  return (
    <>
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="border-b border-gray-50 transition-colors hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
      >
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <User size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">{ownerName}</p>
              <p className="text-[10px] text-gray-400">{app.user?.email || "—"}</p>
            </div>
          </div>
        </td>
        <td className="px-3 py-3">
          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-medium ${typeColors[app.type] || "bg-gray-100 text-gray-600"}`}>
            {typeLabels[app.type] || app.type}
          </span>
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-1">
            {statusIcons[app.status] || null}
            <span className="text-xs capitalize text-gray-600 dark:text-gray-300">{app.status}</span>
          </div>
        </td>
        <td className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
          {app.currency || "EUR"}
        </td>
        <td className="px-3 py-3 text-[10px] text-gray-400">
          {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Details"
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={13} />
              </motion.div>
            </button>
            {app.status === "pending" && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isApproving}
                  onClick={onApprove}
                  className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[10px] font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCheck size={10} />
                  Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onReject}
                  className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[10px] font-medium text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  <XCircle size={10} />
                  Reject
                </motion.button>
              </>
            )}
          </div>
        </td>
      </motion.tr>

      {/* Expanded Detail Row */}
      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <td colSpan={6} className="bg-gray-50/80 px-4 py-3 dark:bg-gray-800/40">
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                {app.initialDeposit != null && (
                  <div>
                    <p className="font-medium text-gray-500">Initial Deposit</p>
                    <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">€{app.initialDeposit.toLocaleString()}</p>
                  </div>
                )}
                {app.principal != null && (
                  <div>
                    <p className="font-medium text-gray-500">Principal</p>
                    <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">€{app.principal.toLocaleString()}</p>
                  </div>
                )}
                {app.termMonths != null && (
                  <div>
                    <p className="font-medium text-gray-500">Term</p>
                    <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{app.termMonths} months</p>
                  </div>
                )}
                {app.interestRate != null && (
                  <div>
                    <p className="font-medium text-gray-500">Interest Rate</p>
                    <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">{app.interestRate}%</p>
                  </div>
                )}
                {app.purpose && (
                  <div>
                    <p className="font-medium text-gray-500">Purpose</p>
                    <p className="mt-0.5 capitalize text-gray-900 dark:text-white">{app.purpose}</p>
                  </div>
                )}
                {app.businessName && (
                  <div>
                    <p className="font-medium text-gray-500">Business</p>
                    <p className="mt-0.5 text-gray-900 dark:text-white">{app.businessName}</p>
                  </div>
                )}
                {app.goal && (
                  <div>
                    <p className="font-medium text-gray-500">Savings Goal</p>
                    <p className="mt-0.5 text-gray-900 dark:text-white">{app.goal}</p>
                  </div>
                )}
                {app.rejectionReason && (
                  <div className="col-span-2">
                    <p className="font-medium text-rose-500">Rejection Reason</p>
                    <p className="mt-0.5 text-gray-900 dark:text-white">{app.rejectionReason}</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-500">Application ID</p>
                  <p className="mt-0.5 font-mono text-[10px] text-gray-400">{app._id || app.id}</p>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AccountApplications() {
  const {
    applications,
    stats,
    search,
    statusFilter,
    typeFilter,
    isLoading,
    isApproving,
    isRejecting,
    rejectDialogId,
    rejectReason,
    pagination,
    setSearch,
    setStatusFilter,
    setTypeFilter,
    setPage,
    setRejectDialogId,
    setRejectReason,
    approveApplication,
    rejectApplication,
    refetch,
  } = useApplicationsManagement();

  return (
    <PageContainer>
      <PageHeader
        title="Account Applications"
        subtitle="Review, approve or reject customer account opening applications"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Accounts", href: "/admin/accounts" },
          { label: "Applications" },
        ]}
        actions={
          <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} />
        }
      />

      <StatsGrid>
        <StatCard label="Total Applications" value={stats.total} icon={<FileText size={18} />} iconColor="from-indigo-500 to-indigo-600" index={0} />
        <StatCard label="Pending Review" value={stats.pending} icon={<Clock size={18} />} iconColor="from-amber-500 to-amber-600" index={1} />
        <StatCard label="Approved" value={stats.approved} icon={<CheckCircle2 size={18} />} iconColor="from-emerald-500 to-emerald-600" positive index={2} />
        <StatCard label="Rejected" value={stats.rejected} icon={<XCircle size={18} />} iconColor="from-rose-500 to-rose-600" index={3} />
      </StatsGrid>

      {stats.pending > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
          <AlertCircle size={16} className="shrink-0 text-amber-500" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <span className="font-semibold">{stats.pending} application{stats.pending !== 1 ? "s" : ""}</span> awaiting your review
          </p>
        </motion.div>
      )}

      {/* Filters */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((s) => (
          <FilterPill key={s} label={s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by applicant name or email...">
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All Types" },
            { value: "savings", label: "Savings" },
            { value: "current", label: "Current" },
            { value: "fixed_deposit", label: "Fixed Deposit" },
          ]}
        />
      </FilterBar>

      <DashCard>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["Applicant", "Account Type", "Status", "Currency", "Submitted", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-3 py-3"><div className="h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" /></td>
                        ))}
                      </tr>
                    ))
                  : applications.map((app) => (
                      <ApplicationRow
                        key={app._id || app.id}
                        app={app}
                        onApprove={() => approveApplication(app._id || app.id)}
                        onReject={() => setRejectDialogId(app._id || app.id)}
                        isApproving={isApproving}
                      />
                    ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!isLoading && applications.length === 0 && (
          <div className="py-14 text-center">
            <FileText size={36} className="mx-auto mb-3 text-gray-200 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No applications found</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Try adjusting your filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <p className="text-xs text-gray-400">
              Showing {(pagination.page - 1) * 20 + 1}–{Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${p === pagination.page ? "bg-indigo-500 text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </DashCard>

      {/* Reject Dialog */}
      <AnimatePresence>
        {rejectDialogId && (
          <RejectDialog
            isOpen={!!rejectDialogId}
            reason={rejectReason}
            onReasonChange={setRejectReason}
            onConfirm={() => rejectApplication(rejectDialogId, rejectReason)}
            onCancel={() => { setRejectDialogId(null); setRejectReason(""); }}
            isLoading={isRejecting}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

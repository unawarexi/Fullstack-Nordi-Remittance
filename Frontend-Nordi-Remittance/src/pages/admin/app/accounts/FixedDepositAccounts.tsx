// ============================================================================
// FixedDepositAccounts — Fixed deposit applications and account view
// ============================================================================
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Clock, CheckCircle2, XCircle, RefreshCw, Search, FileText, AlertCircle } from "lucide-react";
import {
  PageContainer, DashCard, StatCard, StatsGrid, FilterBar, FilterSelect, FilterPill, ActionButton, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useApplicationsManagement } from "../../admin-usecase/useadmin-account-usecase";

export default function FixedDepositAccounts() {
  const {
    rawApplications, isLoading, search, statusFilter, isApproving, isRejecting,
    rejectDialogId, rejectReason,
    setSearch, setStatusFilter, setRejectDialogId, setRejectReason,
    approveApplication, rejectApplication, refetch, stats,
  } = useApplicationsManagement();

  const fixedApps = rawApplications.filter((a: any) => a.type === "fixed_deposit");
  const pendingCount = fixedApps.filter((a: any) => a.status === "pending").length;
  const approvedCount = fixedApps.filter((a: any) => a.status === "approved").length;

  const filtered = fixedApps.filter((a: any) => {
    const q = search.toLowerCase();
    return !search ||
      a.user?.firstName?.toLowerCase().includes(q) ||
      a.user?.email?.toLowerCase().includes(q);
  }).filter((a: any) => statusFilter === "all" || a.status === statusFilter);

  return (
    <PageContainer>
      <PageHeader
        title="Fixed Deposit Applications"
        subtitle="Review and manage customer fixed deposit account applications"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Accounts", href: "/admin/accounts" }, { label: "Fixed Deposits" }]}
        actions={<ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} />}
      />
      <StatsGrid>
        <StatCard label="Total Applications" value={fixedApps.length} icon={<FileText size={18} />} iconColor="from-violet-500 to-purple-600" index={0} />
        <StatCard label="Pending" value={pendingCount} icon={<Clock size={18} />} iconColor="from-amber-500 to-amber-600" index={1} />
        <StatCard label="Approved" value={approvedCount} icon={<CheckCircle2 size={18} />} iconColor="from-emerald-500 to-emerald-600" positive index={2} />
        <StatCard label="Rejected" value={fixedApps.filter((a: any) => a.status === "rejected").length} icon={<XCircle size={18} />} iconColor="from-rose-500 to-rose-600" index={3} />
      </StatsGrid>

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <FilterPill key={s} label={s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
        ))}
      </div>
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search applicants..." />

      <DashCard>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["Applicant", "Principal", "Term", "Rate", "Currency", "Status", "Submitted", "Actions"].map((h) => (
                  <th key={h} className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 8 }).map((__, j) => <td key={j} className="px-2 py-3"><div className="h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" /></td>)}</tr>
                    ))
                  : filtered.map((app: any, i: number) => (
                      <motion.tr key={app._id || app.id} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.02 } }} exit={{ opacity: 0 }} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-800/30">
                        <td className="px-2 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{app.user?.firstName} {app.user?.lastName}</p>
                          <p className="text-[10px] text-gray-400">{app.user?.email}</p>
                        </td>
                        <td className="px-2 py-3 font-semibold text-gray-900 dark:text-white">€{(app.principal || 0).toLocaleString()}</td>
                        <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{app.termMonths}mo</td>
                        <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{app.interestRate}%</td>
                        <td className="px-2 py-3 text-gray-500">{app.currency}</td>
                        <td className="px-2 py-3"><StatusBadge status={app.status} /></td>
                        <td className="px-2 py-3 text-gray-400">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString("en-GB") : "—"}</td>
                        <td className="px-2 py-3">
                          {app.status === "pending" && (
                            <div className="flex gap-1">
                              <motion.button whileHover={{ scale: 1.05 }} disabled={isApproving} onClick={() => approveApplication(app._id || app.id)} className="rounded-lg bg-emerald-500 px-2 py-1 text-[10px] font-medium text-white hover:bg-emerald-600 disabled:opacity-50">Approve</motion.button>
                              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setRejectDialogId(app._id || app.id)} className="rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-medium text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400">Reject</motion.button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length === 0 && <div className="py-12 text-center"><Lock size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" /><p className="text-sm text-gray-400">No fixed deposit applications</p></div>}
      </DashCard>

      {/* Reject dialog */}
      <AnimatePresence>
        {rejectDialogId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setRejectDialogId(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Reject Fixed Deposit Application</h3>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." rows={3} className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
              <div className="mt-4 flex gap-3">
                <button onClick={() => setRejectDialogId(null)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">Cancel</button>
                <button disabled={!rejectReason.trim() || isRejecting} onClick={() => rejectApplication(rejectDialogId, rejectReason)} className="flex-1 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50">{isRejecting ? "Rejecting…" : "Reject"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

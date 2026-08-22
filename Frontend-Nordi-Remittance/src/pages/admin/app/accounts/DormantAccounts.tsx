// ============================================================================
// DormantAccounts — Suspended, frozen and inactive wallets
// ============================================================================
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Unlock, Eye, RefreshCw, Search, Ban, AlertTriangle } from "lucide-react";
import {
  PageContainer, DashCard, StatCard, StatsGrid, FilterBar, ActionButton, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";
import { useAccountsManagement } from "../../admin-usecase/useadmin-account-usecase";

export default function DormantAccounts() {
  const toast = useToast();
  const { rawAccounts, isLoading, search, setSearch, unfreezeAccount, closeAccount, refetch } = useAccountsManagement();

  const dormantAccounts = rawAccounts.filter((a: any) =>
    a.status === "suspended" || a.status === "dormant" || a.status === "frozen"
  );
  const closedAccounts = rawAccounts.filter((a: any) => a.status === "closed");
  const totalDormantBalance = dormantAccounts.reduce((s: number, a: any) => s + a.balance, 0);

  const allInactive = [...dormantAccounts, ...closedAccounts];
  const filtered = allInactive.filter((a: any) => {
    const q = search.toLowerCase();
    return !search || a.owner.toLowerCase().includes(q) || a.accountNumber.includes(q) || a.email.toLowerCase().includes(q);
  });

  return (
    <PageContainer>
      <PageHeader
        title="Dormant & Closed Accounts"
        subtitle="Monitor and manage suspended, frozen and closed wallets"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Accounts", href: "/admin/accounts" }, { label: "Dormant" }]}
        actions={<ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} />}
      />
      <StatsGrid>
        <StatCard label="Dormant / Frozen" value={dormantAccounts.length} icon={<Clock size={18} />} iconColor="from-amber-500 to-amber-600" index={0} />
        <StatCard label="Locked Funds" value={`€${(totalDormantBalance / 1000).toFixed(1)}K`} icon={<AlertTriangle size={18} />} iconColor="from-orange-500 to-orange-600" index={1} />
        <StatCard label="Closed" value={closedAccounts.length} icon={<Ban size={18} />} iconColor="from-rose-500 to-rose-600" index={2} />
        <StatCard label="Total Inactive" value={allInactive.length} icon={<Clock size={18} />} iconColor="from-gray-500 to-gray-600" index={3} />
      </StatsGrid>

      {dormantAccounts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/20">
          <AlertTriangle size={15} className="shrink-0 text-amber-500" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>{dormantAccounts.length}</strong> wallet{dormantAccounts.length !== 1 ? "s" : ""} currently frozen or dormant — review and reactivate if appropriate.
          </p>
        </motion.div>
      )}

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search inactive wallets..." />

      <DashCard>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["Wallet No.", "Owner", "Type", "Balance", "Status", "Last Activity", "Actions"].map((h) => (
                  <th key={h} className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                        {Array.from({ length: 7 }).map((__, j) => <td key={j} className="px-2 py-3"><div className="h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" /></td>)}
                      </tr>
                    ))
                  : filtered.map((acc: any, i: number) => (
                      <motion.tr key={acc.id} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.02 } }} exit={{ opacity: 0 }} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-800/30">
                        <td className="px-2 py-3 font-mono font-medium text-gray-900 dark:text-white">{acc.accountNumber || "—"}</td>
                        <td className="px-2 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{acc.owner}</p>
                          <p className="text-[10px] text-gray-400">{acc.email}</p>
                        </td>
                        <td className="px-2 py-3 capitalize text-gray-600 dark:text-gray-300">{acc.type}</td>
                        <td className="px-2 py-3 font-semibold text-gray-900 dark:text-white">€{acc.balance.toLocaleString()}</td>
                        <td className="px-2 py-3"><StatusBadge status={acc.status} /></td>
                        <td className="px-2 py-3 text-gray-400">{acc.lastActivity ? new Date(acc.lastActivity).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1">
                            <motion.button whileHover={{ scale: 1.1 }} title="View" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><Eye size={13} /></motion.button>
                            {(acc.status === "suspended" || acc.status === "frozen" || acc.status === "dormant") && (
                              <motion.button whileHover={{ scale: 1.1 }} title="Reactivate" onClick={() => { unfreezeAccount(acc.id); toast.success("Wallet reactivated"); }} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <Unlock size={10} /> Reactivate
                              </motion.button>
                            )}
                            {acc.status !== "closed" && (
                              <motion.button whileHover={{ scale: 1.1 }} title="Close permanently" onClick={() => { if (confirm("Permanently close this wallet?")) { closeAccount(acc.id); toast.error("Wallet closed"); } }} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20">
                                <Ban size={13} />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length === 0 && <div className="py-12 text-center"><Clock size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" /><p className="text-sm text-gray-400">No dormant or closed accounts</p></div>}
      </DashCard>
    </PageContainer>
  );
}

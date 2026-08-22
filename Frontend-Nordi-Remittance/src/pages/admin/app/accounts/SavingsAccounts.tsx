// ============================================================================
// SavingsAccounts — Personal/savings wallets filtered view
// ============================================================================
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiggyBank, Lock, Unlock, Eye, RefreshCw, Download, Search, Ban } from "lucide-react";
import {
  PageContainer, DashCard, StatCard, StatsGrid, FilterBar, ActionButton, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { Modal } from "@components/ui/Modal";
import { Button } from "@components/ui/Button";
import { useToast } from "@store/toast.store";
import { useAccountsManagement } from "../../admin-usecase/useadmin-account-usecase";

export default function SavingsAccounts() {
  const [accountToClose, setAccountToClose] = React.useState<string | null>(null);
  const toast = useToast();
  const { rawAccounts, isLoading, search, setSearch, freezeAccount, unfreezeAccount, closeAccount, refetch } = useAccountsManagement();

  const accounts = rawAccounts.filter((a: any) => a.type === "personal" || a.type === "savings");
  const totalBalance = accounts.reduce((s: number, a: any) => s + a.balance, 0);
  const active = accounts.filter((a: any) => a.status === "active").length;

  return (
    <PageContainer>
      <PageHeader
        title="Savings Wallets"
        subtitle="Personal savings wallet management and monitoring"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Accounts", href: "/admin/accounts" }, { label: "Savings" }]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} />
          </div>
        }
      />
      <StatsGrid>
        <StatCard label="Total Savings" value={`€${(totalBalance / 1000).toFixed(1)}K`} icon={<PiggyBank size={18} />} iconColor="from-emerald-500 to-teal-600" index={0} />
        <StatCard label="Active Wallets" value={active} icon={<PiggyBank size={18} />} iconColor="from-emerald-400 to-emerald-600" positive index={1} />
        <StatCard label="Total Wallets" value={accounts.length} icon={<PiggyBank size={18} />} iconColor="from-teal-500 to-teal-600" index={2} />
      </StatsGrid>
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search savings wallets..." />
      <DashCard>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["Wallet No.", "Owner", "Balance", "Status", "Opened", "Actions"].map((h) => (
                  <th key={h} className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                        {Array.from({ length: 6 }).map((__, j) => <td key={j} className="px-2 py-3"><div className="h-3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" /></td>)}
                      </tr>
                    ))
                  : accounts.filter((a: any) => !search || a.owner.toLowerCase().includes(search.toLowerCase()) || a.accountNumber.includes(search)).map((acc: any, i: number) => (
                      <motion.tr key={acc.id} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.02 } }} exit={{ opacity: 0 }} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-800/30">
                        <td className="px-2 py-3 font-mono font-medium text-gray-900 dark:text-white">{acc.accountNumber || "—"}</td>
                        <td className="px-2 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{acc.owner}</p>
                          <p className="text-[10px] text-gray-400">{acc.email}</p>
                        </td>
                        <td className="px-2 py-3 font-semibold text-gray-900 dark:text-white">€{acc.balance.toLocaleString()}</td>
                        <td className="px-2 py-3"><StatusBadge status={acc.status} /></td>
                        <td className="px-2 py-3 text-gray-400">{acc.opened ? new Date(acc.opened).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1">
                            <motion.button whileHover={{ scale: 1.1 }} title="View" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><Eye size={13} /></motion.button>
                            {acc.status === "active" && <motion.button whileHover={{ scale: 1.1 }} title="Freeze" onClick={() => { freezeAccount(acc.id); toast.warning("Wallet frozen"); }} className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"><Lock size={13} /></motion.button>}
                            {acc.status === "suspended" && <motion.button whileHover={{ scale: 1.1 }} title="Unfreeze" onClick={() => { unfreezeAccount(acc.id); toast.success("Wallet unfrozen"); }} className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"><Unlock size={13} /></motion.button>}
                            {acc.status !== "closed" && <motion.button whileHover={{ scale: 1.1 }} title="Close" onClick={() => setAccountToClose(acc.id)} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"><Ban size={13} /></motion.button>}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {!isLoading && accounts.length === 0 && <div className="py-12 text-center"><Search size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" /><p className="text-sm text-gray-400">No savings wallets found</p></div>}
      </DashCard>

      <Modal 
        isOpen={!!accountToClose} 
        onClose={() => setAccountToClose(null)}
        title="Close Wallet"
        description="Are you sure you want to close this wallet? This action cannot be undone."
        footer={
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setAccountToClose(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1 !bg-rose-600 hover:!bg-rose-700" onClick={() => {
              if (accountToClose) {
                closeAccount(accountToClose);
                toast.error("Wallet closed");
                setAccountToClose(null);
              }
            }}>Close Wallet</Button>
          </div>
        }
      >
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-900/10 dark:text-rose-400">
          This will permanently close the selected savings wallet.
        </div>
      </Modal>
    </PageContainer>
  );
}

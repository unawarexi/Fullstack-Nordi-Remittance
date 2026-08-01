import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  CreditCard,
  Building2,
  PiggyBank,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  ChevronDown,
  Search,
  Eye,
  Lock,
  Unlock,
  Ban,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  SectionHeader,
  FilterBar,
  FilterSelect,
  FilterPill,
  ActionButton,
  StatusBadge,
  ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";
import { useAccountsManagement } from "../../admin-usecase/useAccountsManagement";

const accountTypeIcons: Record<string, React.ReactNode> = {
  savings: <PiggyBank size={16} />,
  current: <Building2 size={16} />,
  "fixed-deposit": <Lock size={16} />,
  wallet: <Wallet size={16} />,
};

const accountTypeColors: Record<string, string> = {
  savings: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
  current: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
  "fixed-deposit": "bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
  wallet: "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
};

const statusFilters = ["All", "Active", "Dormant", "Frozen", "Closed"];

export default function AccountsManagement() {
  const toast = useToast();
  const {
    accounts: filtered,
    stats,
    search,
    setSearch,
    statusFilter: activeStatus,
    setStatusFilter: setActiveStatus,
    typeFilter,
    setTypeFilter,
    freezeAccount,
    unfreezeAccount,
    refetch,
    isLoading,
  } = useAccountsManagement();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <PageContainer>
      <PageHeader
        title="Bank Accounts"
        subtitle="Manage customer savings, current, fixed deposit accounts and wallets"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Accounts" }]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} />
          </div>
        }
      />

      <StatsGrid>
        <StatCard
          label="Total Balance (AUM)"
          value={`€${(stats.totalBalance / 1000).toFixed(0)}K`}
          icon={<Wallet size={18} />}
          iconColor="from-indigo-500 to-indigo-600"
          index={0}
        />
        <StatCard
          label="Active Accounts"
          value={stats.activeAccounts}
          icon={<CreditCard size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          positive
          index={1}
        />
        <StatCard
          label="Dormant Accounts"
          value={stats.dormantAccounts}
          icon={<Clock size={18} />}
          iconColor="from-amber-500 to-amber-600"
          index={2}
        />
        <StatCard
          label="Total Accounts"
          value={stats.totalAccounts}
          icon={<Building2 size={18} />}
          iconColor="from-blue-500 to-blue-600"
          index={3}
        />
      </StatsGrid>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <FilterPill key={s} label={s} active={activeStatus === s} onClick={() => setActiveStatus(s as any)} />
        ))}
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or account number..."
      >
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All Types" },
            { value: "savings", label: "Savings" },
            { value: "current", label: "Current" },
            { value: "fixed-deposit", label: "Fixed Deposit" },
            { value: "wallet", label: "Wallet" },
          ]}
        />
      </FilterBar>

      {/* Accounts Table */}
      <DashCard>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["Account", "Owner", "Type", "Balance", "Interest", "Status", "Last Activity", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((acc, i) => (
                  <motion.tr
                    key={acc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: i * 0.03 } }}
                    exit={{ opacity: 0 }}
                    className="border-b border-gray-50 transition-colors hover:bg-gray-50/50 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-2 py-3">
                      <p className="font-mono text-gray-900 dark:text-white">{acc.accountNumber}</p>
                      <p className="text-[10px] text-gray-400">{acc.id}</p>
                    </td>
                    <td className="px-2 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{acc.owner}</p>
                      <p className="text-[10px] text-gray-400">{acc.email}</p>
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-medium capitalize ${accountTypeColors[acc.type]}`}
                      >
                        {accountTypeIcons[acc.type]}
                        {acc.type.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-2 py-3 font-semibold text-gray-900 dark:text-white">
                      €{acc.balance.toLocaleString()}
                    </td>
                    <td className="px-2 py-3 text-gray-600 dark:text-gray-300">
                      {acc.interestRate > 0 ? `${acc.interestRate}%` : "—"}
                    </td>
                    <td className="px-2 py-3">
                      <StatusBadge status={acc.status} />
                    </td>
                    <td className="px-2 py-3 text-gray-400">
                      {new Date(acc.lastActivity).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </motion.button>
                        {acc.status === "active" && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              freezeAccount(acc.id);
                              toast.warning(`Account ${acc.accountNumber} frozen`);
                            }}
                            className="rounded-lg p-1.5 text-amber-500 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/20"
                            title="Freeze"
                          >
                            <Lock size={14} />
                          </motion.button>
                        )}
                        {acc.status === "frozen" && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              unfreezeAccount(acc.id);
                              toast.success(`Account ${acc.accountNumber} unfrozen`);
                            }}
                            className="rounded-lg p-1.5 text-emerald-500 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                            title="Unfreeze"
                          >
                            <Unlock size={14} />
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
      </DashCard>

      {filtered.length === 0 && (
        <DashCard className="py-12 text-center">
          <Search size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No accounts match your filters</p>
        </DashCard>
      )}
    </PageContainer>
  );
}

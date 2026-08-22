import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Activity,
  Globe,
  RotateCcw,
  ArrowRightLeft,
  CreditCard,
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
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useTransactionManagement } from "../../admin-usecase/useadmin-transaction-usecase";
import { formatCurrency } from "@core/algo/financial";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "processing", label: "Processing" },
  { value: "cancelled", label: "Cancelled" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "transfer", label: "Transfer" },
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "remittance", label: "International" },
];

const timeFilters = ["Today", "This Week", "This Month", "This Quarter", "All Time"];

const typeIcons: Record<string, React.ReactNode> = {
  transfer: <ArrowRightLeft size={14} />,
  deposit: <ArrowDownLeft size={14} />,
  withdrawal: <ArrowUpRight size={14} />,
  remittance: <Globe size={14} />,
};

const currencySymbol = (c: string) =>
  c === "EUR" ? "€" : c === "USD" ? "$" : c === "GBP" ? "£" : c === "SEK" ? "kr" : c;

export default function AdminTransactions() {
  const {
    transactions,
    stats,
    isLoading,
    isRefetching,
    isMutating,
    filters,
    updateFilter,
    resetFilters,
    page,
    setPage,
    pagination,
    pageNumbers,
    selectedTxId,
    setSelectedTxId,
    setActionModal,
    approveTransaction,
    rejectTransaction,
    refetch,
  } = useTransactionManagement();

  const hasActiveFilters = filters.status !== "all" || filters.type !== "all" || filters.timeRange !== "all";

  return (
    <PageContainer>
      <PageHeader
        title="Transaction Management"
        subtitle="Monitor, review, and manage all platform transactions"
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Transactions" }]}
        actions={
          <div className="flex gap-2">
            <ActionButton
              label="Refresh"
              icon={<RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />}
              onClick={refetch}
              variant="primary"
            />
          </div>
        }
      />

      <StatsGrid>
        <StatCard
          label="Total Transactions"
          value={stats.total.toLocaleString()}
          icon={<Activity size={18} />}
          iconColor="from-blue-500 to-blue-600"
          change={`${stats.processing} processing`}
          positive
          index={0}
        />
        <StatCard
          label="Total Volume"
          value={formatCurrency(stats.volume, "EUR")}
          icon={<DollarSign size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          change={`${stats.completed} completed`}
          positive
          index={1}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle size={18} />}
          iconColor="from-green-500 to-green-600"
          change=""
          positive
          index={2}
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={<Clock size={18} />}
          iconColor="from-amber-500 to-amber-600"
          change={`${stats.failed} failed`}
          positive={false}
          index={3}
        />
      </StatsGrid>

      {/* Time Filters */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {timeFilters.map((t) => (
          <FilterPill
            key={t}
            label={t}
            active={filters.timeRange === (t === "All Time" ? "all" : t)}
            onClick={() => updateFilter("timeRange", t === "All Time" ? "all" : t)}
          />
        ))}
      </div>

      {/* Search & Filters */}
      <FilterBar
        searchValue={filters.search}
        onSearchChange={(v) => updateFilter("search", v)}
        searchPlaceholder="Search by user, email, or reference..."
      >
        <FilterSelect value={filters.status} onChange={(v) => updateFilter("status", v)} options={statusOptions} />
        <FilterSelect value={filters.type} onChange={(v) => updateFilter("type", v)} options={typeOptions} />
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400"
          >
            <RotateCcw size={12} /> Reset
          </motion.button>
        )}
      </FilterBar>

      {/* Loading State */}
      {isLoading ? (
        <DashCard>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={24} className="mb-2 animate-spin text-blue-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading transactions...</p>
          </div>
        </DashCard>
      ) : (
        /* Transactions Table */
        <DashCard padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {["Transaction", "User", "Type", "Amount", "Status", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {transactions.map((tx: any, i: number) => {
                    const userName = tx.sourceWallet?.user?.fullName ?? tx.user ?? "—";
                    const userEmail = tx.sourceWallet?.user?.email ?? tx.email ?? "";
                    const txType = tx.type ?? "transfer";
                    const currency = tx.currency ?? "EUR";

                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.02 } }}
                        exit={{ opacity: 0, x: -20 }}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                            {tx.reference ?? tx.id}
                          </p>
                          <p className="font-mono text-[10px] text-gray-400">{tx.id?.substring(0, 12)}...</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-900 dark:text-white sm:text-sm">{userName}</p>
                          <p className="text-[10px] text-gray-400">{userEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs capitalize text-gray-600 dark:text-gray-300">
                            {typeIcons[txType] ?? <CreditCard size={14} />} {txType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold sm:text-sm ${txType === "deposit" ? "text-emerald-600 dark:text-emerald-400" : txType === "withdrawal" ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-white"}`}
                          >
                            {txType === "deposit" ? "+" : txType === "withdrawal" ? "-" : ""}
                            {currencySymbol(currency)}
                            {(tx.amount ?? 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(tx.createdAt ?? tx.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          <br />
                          <span className="text-[10px]">
                            {new Date(tx.createdAt ?? tx.date).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedTxId(tx.id)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                              <Eye size={14} />
                            </motion.button>
                            {tx.status === "pending" && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => approveTransaction(tx.id)}
                                  className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                                >
                                  <CheckCircle size={14} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => rejectTransaction(tx.id, "Rejected by admin")}
                                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                >
                                  <XCircle size={14} />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <AlertTriangle size={32} className="mb-2" />
              <p className="text-sm">No transactions found</p>
              <p className="mt-1 text-xs">Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
              Showing {pagination.items.length} of {pagination.total} transactions
            </p>
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Previous
              </motion.button>
              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`e-${idx}`} className="px-1 text-xs text-gray-400">
                    ...
                  </span>
                ) : (
                  <motion.button
                    key={p}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(p as number)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs ${page === p ? "border-blue-500 bg-blue-50 font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                  >
                    {p}
                  </motion.button>
                ),
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Next
              </motion.button>
            </div>
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
}

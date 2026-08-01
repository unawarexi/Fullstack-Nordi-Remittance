import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  Activity,
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  FilterBar,
  FilterSelect,
  ActionButton,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useInternationalTransactionManagement } from "../../admin-usecase/useTransactionManagement";
import { formatCurrency } from "@core/algo/financial";
import { UserEligibilityModal } from "@components/shared/UserEligibilityModal";
import { useEligibilityError } from "@hooks/useEligibilityError";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "processing", label: "Processing" },
];

const currencySymbol = (c: string) =>
  c === "EUR" ? "€" : c === "USD" ? "$" : c === "GBP" ? "£" : c === "SEK" ? "kr" : c;

export default function InternationalTransactions() {
  const {
    transactions,
    stats,
    total,
    isLoading,
    isMutating,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pagination,
    pageNumbers,
    approve,
    reject,
    refetch,
  } = useInternationalTransactionManagement();

  const eligibility = useEligibilityError();

  return (
    <PageContainer>
      <PageHeader
        title="International Transactions"
        subtitle="Cross-border remittances and international transfers"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Transactions", href: "/admin/transactions" },
          { label: "International" },
        ]}
        actions={<ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={refetch} variant="secondary" />}
      />

      <StatsGrid>
        <StatCard
          label="International Txns"
          value={stats.total}
          icon={<Globe size={18} />}
          iconColor="from-indigo-500 to-indigo-600"
          change=""
          positive
          index={0}
        />
        <StatCard
          label="Total Volume"
          value={formatCurrency(stats.volume, "EUR")}
          icon={<DollarSign size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          change=""
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
          label="Pending"
          value={stats.pending}
          icon={<Clock size={18} />}
          iconColor="from-amber-500 to-amber-600"
          change=""
          positive={false}
          index={3}
        />
      </StatsGrid>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search international transactions..."
      >
        <FilterSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        {statusFilter !== "all" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setStatusFilter("all")}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400"
          >
            <RotateCcw size={12} /> Reset
          </motion.button>
        )}
      </FilterBar>

      {isLoading ? (
        <DashCard>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={24} className="mb-2 animate-spin text-blue-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading international transactions...</p>
          </div>
        </DashCard>
      ) : (
        <DashCard padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {["Transaction", "Amount", "Currency", "Exchange Rate", "Status", "Date", "Actions"].map((h) => (
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
                  {transactions.map((tx: any, i: number) => (
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
                        <span className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                          {currencySymbol(tx.currency ?? "EUR")}
                          {(tx.amount ?? 0).toLocaleString()}
                        </span>
                        {tx.fee > 0 && (
                          <p className="text-[10px] text-gray-400">
                            Fee: {currencySymbol(tx.currency ?? "EUR")}
                            {tx.fee}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{tx.currency ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                        {tx.exchangeRate ? tx.exchangeRate.toFixed(4) : "—"}
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
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {tx.status === "pending" && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  approve(tx.id, undefined, { onError: (err: any) => eligibility.handleError(err) })
                                }
                                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                                title="Approve"
                              >
                                <CheckCircle size={14} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  reject(tx.id, "Rejected by admin", {
                                    onError: (err: any) => eligibility.handleError(err),
                                  })
                                }
                                className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                title="Reject"
                              >
                                <XCircle size={14} />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <Globe size={32} className="mb-2" />
              <p className="text-sm">No international transactions</p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
              Showing {pagination.items.length} of {pagination.total} international transactions
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

      <UserEligibilityModal error={eligibility.error} isOpen={eligibility.isOpen} onClose={eligibility.close} />
    </PageContainer>
  );
}

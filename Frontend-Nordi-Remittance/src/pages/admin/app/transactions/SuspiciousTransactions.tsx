import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
  Eye,
  Loader2,
  Globe,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  FilterBar,
  ActionButton,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useSuspiciousTransactionManagement } from "../../admin-usecase/useTransactionManagement";
import { formatCurrency } from "@core/algo/financial";

const typeIcons: Record<string, React.ReactNode> = {
  transfer: <ArrowRightLeft size={14} />,
  deposit: <ArrowDownLeft size={14} />,
  withdrawal: <ArrowUpRight size={14} />,
  remittance: <Globe size={14} />,
};

const currencySymbol = (c: string) =>
  c === "EUR" ? "€" : c === "USD" ? "$" : c === "GBP" ? "£" : c === "SEK" ? "kr" : c;

export default function SuspiciousTransactions() {
  const {
    transactions,
    fraudSignals,
    total,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    pagination,
    pageNumbers,
    refetch,
  } = useSuspiciousTransactionManagement();

  // Map fraud signal by transactionId for quick lookup
  const signalMap = new Map<string, any>();
  for (const sig of fraudSignals) {
    if (sig.transactionId) signalMap.set(sig.transactionId, sig);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Suspicious Transactions"
        subtitle="Flagged transactions requiring fraud review"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Transactions", href: "/admin/transactions" },
          { label: "Suspicious" },
        ]}
        actions={<ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={refetch} variant="secondary" />}
      />

      <StatsGrid>
        <StatCard
          label="Suspicious Transactions"
          value={total}
          icon={<ShieldAlert size={18} />}
          iconColor="from-rose-500 to-rose-600"
          change={`${fraudSignals.length} fraud signals`}
          positive={false}
          index={0}
        />
      </StatsGrid>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search suspicious transactions..."
      />

      {isLoading ? (
        <DashCard>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={24} className="mb-2 animate-spin text-blue-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading suspicious transactions...</p>
          </div>
        </DashCard>
      ) : (
        <DashCard padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {["Transaction", "Type", "Amount", "Status", "Fraud Signal", "Date"].map((h) => (
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
                    const signal = signalMap.get(tx.id);
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
                          <span className="inline-flex items-center gap-1 text-xs capitalize text-gray-600 dark:text-gray-300">
                            {typeIcons[tx.type] ?? <CreditCard size={14} />} {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                            {currencySymbol(tx.currency ?? "EUR")}
                            {(tx.amount ?? 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="px-4 py-3">
                          {signal ? (
                            <div>
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                                <AlertTriangle size={10} />
                                {signal.type ?? signal.severity ?? "Flagged"}
                              </span>
                              {signal.description && (
                                <p className="mt-0.5 max-w-[200px] truncate text-[10px] text-gray-400">
                                  {signal.description}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                              Suspicious status
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(tx.createdAt ?? tx.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
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
              <ShieldAlert size={32} className="mb-2" />
              <p className="text-sm">No suspicious transactions found</p>
              <p className="mt-1 text-xs">All clear!</p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
              Showing {pagination.items.length} of {pagination.total} suspicious transactions
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

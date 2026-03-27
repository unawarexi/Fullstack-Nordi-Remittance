import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Globe,
  CreditCard,
  X,
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
import { usePendingTransactionManagement } from "../../domain/useTransactionManagement";
import { UserEligibilityModal } from "@components/shared/UserEligibilityModal";
import { useEligibilityError } from "@hooks/useEligibilityError";

const typeIcons: Record<string, React.ReactNode> = {
  transfer: <ArrowRightLeft size={14} />,
  deposit: <ArrowDownLeft size={14} />,
  withdrawal: <ArrowUpRight size={14} />,
  remittance: <Globe size={14} />,
};

const currencySymbol = (c: string) =>
  c === "EUR" ? "€" : c === "USD" ? "$" : c === "GBP" ? "£" : c === "SEK" ? "kr" : c;

export default function PendingTransactions() {
  const {
    transactions,
    total,
    isLoading,
    isMutating,
    search,
    setSearch,
    page,
    setPage,
    pagination,
    pageNumbers,
    approve,
    reject,
    refetch,
  } = usePendingTransactionManagement();

  const eligibility = useEligibilityError();
  const [actionModal, setActionModal] = useState<{ type: "approve" | "reject"; txId: string } | null>(null);
  const [note, setNote] = useState("");

  const handleAction = () => {
    if (!actionModal) return;
    const errorCallbacks = { onError: (err: any) => eligibility.handleError(err) };
    if (actionModal.type === "approve") {
      approve(actionModal.txId, note || undefined, errorCallbacks);
    } else {
      if (!note.trim()) return;
      reject(actionModal.txId, note, errorCallbacks);
    }
    setActionModal(null);
    setNote("");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Pending Transactions"
        subtitle="Transactions awaiting admin review and approval"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Transactions", href: "/admin/transactions" },
          { label: "Pending" },
        ]}
        actions={
          <ActionButton
            label="Refresh"
            icon={<RefreshCw size={14} />}
            onClick={refetch}
            variant="secondary"
          />
        }
      />

      <StatsGrid>
        <StatCard label="Pending Review" value={total} icon={<Clock size={18} />} iconColor="from-amber-500 to-amber-600" change="Requires action" positive={false} index={0} />
      </StatsGrid>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search pending transactions..." />

      {isLoading ? (
        <DashCard>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-blue-500 mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading pending transactions...</p>
          </div>
        </DashCard>
      ) : (
        <DashCard padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {["Transaction", "Type", "Amount", "Status", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
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
                      className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{tx.reference ?? tx.id}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{tx.id?.substring(0, 12)}...</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs capitalize text-gray-600 dark:text-gray-300">
                          {typeIcons[tx.type] ?? <CreditCard size={14} />} {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                          {currencySymbol(tx.currency ?? "EUR")}{(tx.amount ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(tx.createdAt ?? tx.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setActionModal({ type: "approve", txId: tx.id })}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setActionModal({ type: "reject", txId: tx.id })}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </motion.button>
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
              <CheckCircle size={32} className="mb-2 text-emerald-400" />
              <p className="text-sm">No pending transactions</p>
              <p className="text-xs mt-1">All caught up!</p>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              Showing {pagination.items.length} of {pagination.total} pending transactions
            </p>
            <div className="flex items-center gap-1">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPage(page - 1)} disabled={!pagination.hasPrev} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                Previous
              </motion.button>
              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`e-${idx}`} className="px-1 text-xs text-gray-400">...</span>
                ) : (
                  <motion.button key={p} whileTap={{ scale: 0.95 }} onClick={() => setPage(p as number)} className={`px-2.5 py-1.5 text-xs rounded-lg border ${page === p ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                    {p}
                  </motion.button>
                ),
              )}
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPage(page + 1)} disabled={!pagination.hasNext} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                Next
              </motion.button>
            </div>
          </div>
        </DashCard>
      )}

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setActionModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {actionModal.type === "approve" ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-500" />}
                  {actionModal.type === "approve" ? "Approve Transaction" : "Reject Transaction"}
                </h3>
                <button onClick={() => setActionModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Transaction: <span className="font-mono text-gray-700 dark:text-gray-300">{actionModal.txId}</span>
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={actionModal.type === "approve" ? "Note (optional)..." : "Rejection reason (required)..."}
                rows={3}
                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => setActionModal(null)} className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button
                  onClick={handleAction}
                  disabled={isMutating || (actionModal.type === "reject" && !note.trim())}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg text-white font-medium flex items-center justify-center gap-1 disabled:opacity-50 ${actionModal.type === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
                >
                  {isMutating && <Loader2 size={12} className="animate-spin" />}
                  {actionModal.type === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <UserEligibilityModal
        error={eligibility.error}
        isOpen={eligibility.isOpen}
        onClose={eligibility.close}
      />
    </PageContainer>
  );
}

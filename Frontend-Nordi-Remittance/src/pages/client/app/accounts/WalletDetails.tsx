// ============================================================================
// WALLET DETAILS — new page
// ============================================================================
// Wires up two backend capabilities that had no UI at all:
//  - WalletService.getWalletById (wallet + its AccountLimit doc + last 10 entries)
//  - AccountAnalyticsService.getBalanceHistory (full, paginated, filterable ledger)
// Also exposes updateWallet (rename / set primary) and closeWallet, both of
// which had mutations wired but nowhere in the UI to trigger them.
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Star, Lock, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { PageContainer, DashCard, StatusBadge } from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton, AccountListSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import {
  useClientWalletDetail,
  useClientBalanceHistory,
  useUpdateWallet,
  useCloseWallet,
} from "../../client-usecase/useaccounts-client-usecase";

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

const WalletDetails: React.FC = () => {
  const { walletId } = useParams<{ walletId: string }>();
  const navigate = useNavigate();

  const { wallet, limit, recentEntries, isLoading } = useClientWalletDetail(walletId as UUID);
  const [page, setPage] = useState(1);
  const [entryType, setEntryType] = useState<"" | "debit" | "credit">("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const {
    entries,
    pagination,
    isLoading: historyLoading,
  } = useClientBalanceHistory(walletId as UUID, {
    page,
    limit: 20,
    type: entryType || undefined,
    startDate: dateRange.from || undefined,
    endDate: dateRange.to || undefined,
  });

  const updateWallet = useUpdateWallet();
  const closeWallet = useCloseWallet();
  const [renaming, setRenaming] = useState(false);
  const [notes, setNotes] = useState("");

  const inputCls =
    "px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400";

  if (isLoading) {
    return (
      <PageContainer>
        <StatsGridSkeleton count={3} />
        <div className="mt-6">
          <AccountListSkeleton count={4} />
        </div>
      </PageContainer>
    );
  }

  if (!wallet) {
    return (
      <PageContainer>
        <DashCard className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Wallet not found.</p>
          <button onClick={() => navigate("/customer/accounts")} className="mt-3 text-sm font-medium text-indigo-500">
            Back to My Accounts
          </button>
        </DashCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants} className="mb-4">
        <button
          onClick={() => navigate("/customer/accounts")}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:text-sm"
        >
          <ArrowLeft size={14} /> Back to My Accounts
        </button>
      </motion.div>

      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title={`${wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet`}
          subtitle={`•••• ${wallet.walletNumber.slice(-4)}`}
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Wallet" },
          ]}
        />
      </motion.div>

      {/* Overview */}
      <DashCard className="mb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <StatusBadge status={wallet.status} />
              {wallet.isPrimary && (
                <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Star size={10} /> Primary
                </span>
              )}
            </div>
            {wallet.balancesByCurrency.length === 0 ? (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(0)}</p>
            ) : (
              <div className="space-y-0.5">
                {wallet.balancesByCurrency.map((b) => (
                  <p key={b.currency} className="text-2xl font-bold text-gray-900 dark:text-white">
                    {fmt(b.amount, b.currency)}
                  </p>
                ))}
              </div>
            )}
            {wallet.notes && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">"{wallet.notes}"</p>}
          </div>

          <div className="flex gap-2">
            {!wallet.isPrimary && wallet.status === "active" && (
              <button
                onClick={() => updateWallet.mutate({ walletId: wallet.id as UUID, data: { isDefault: true } })}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Set as Primary
              </button>
            )}
            <button
              onClick={() => setRenaming((r) => !r)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Pencil size={12} /> Rename
            </button>
            {!wallet.isPrimary && wallet.status === "active" && (
              <button
                onClick={() => {
                  if (confirm("Close this wallet? This can't be undone.")) closeWallet.mutate(wallet.id as UUID);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30"
              >
                <Lock size={12} /> Close
              </button>
            )}
          </div>
        </div>

        {renaming && (
          <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
            <input
              className={inputCls + " flex-1"}
              placeholder="Wallet nickname"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={() => {
                updateWallet.mutate(
                  { walletId: wallet.id as UUID, data: { name: notes } as any },
                  { onSuccess: () => setRenaming(false) },
                );
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white"
            >
              Save
            </button>
          </div>
        )}

        {closeWallet.isError && (
          <p className="mt-3 text-xs text-rose-500">
            {(closeWallet.error as any)?.response?.data?.message || "Couldn't close wallet."}
          </p>
        )}
      </DashCard>

      {/* Per-wallet limit */}
      {limit && (
        <DashCard className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Wallet Limit</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            {limit.limitType} · {limit.category} — {fmt(limit.usedAmount, limit.currency)} of{" "}
            {fmt(limit.amount, limit.currency)} used
          </p>
        </DashCard>
      )}

      {/* Ledger / balance history */}
      <DashCard padding="none">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Transaction Ledger</h3>
          <div className="flex flex-wrap gap-2">
            <select
              value={entryType}
              onChange={(e) => {
                setPage(1);
                setEntryType(e.target.value as "" | "debit" | "credit");
              }}
              className={inputCls}
            >
              <option value="">All entries</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
            </select>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => {
                setPage(1);
                setDateRange((p) => ({ ...p, from: e.target.value }));
              }}
              className={inputCls}
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => {
                setPage(1);
                setDateRange((p) => ({ ...p, to: e.target.value }));
              }}
              className={inputCls}
            />
          </div>
        </div>

        {historyLoading ? (
          <div className="p-4">
            <AccountListSkeleton count={4} />
          </div>
        ) : entries.length === 0 ? (
          <p className="p-6 text-center text-xs text-gray-400 dark:text-gray-500 sm:text-sm">
            No ledger entries match these filters.
          </p>
        ) : (
          <>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        entry.entryType === "credit"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-rose-50 text-rose-500 dark:bg-rose-950/50 dark:text-rose-400"
                      }`}
                    >
                      {entry.entryType === "credit" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                        {entry.description}
                        {entry.isReversed && (
                          <span className="ml-2 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500 dark:bg-gray-800">
                            Reversed
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold sm:text-base ${
                        entry.entryType === "credit"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {entry.entryType === "credit" ? "+" : "-"}
                      {fmt(entry.amount, entry.currency)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                      Bal. {fmt(entry.balance, entry.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 p-4 dark:border-gray-800">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 sm:text-xs">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} entries
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40 dark:border-gray-700"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-200 p-1.5 disabled:opacity-40 dark:border-gray-700"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </DashCard>
    </PageContainer>
  );
};

export default WalletDetails;

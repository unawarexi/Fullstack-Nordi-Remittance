// ============================================================================
// TRANSACTIONS SUB-PAGES — Recent Activity, Scheduled, History, Download
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownLeft, Clock, Download, Search, Filter,
  ChevronDown, Calendar, FileText, TrendingUp, TrendingDown,
  CheckCircle2, XCircle, Timer, AlertTriangle,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, StatusBadge, SectionHeader,
} from "@components/shared/DashboardPrimitives";
import { TransactionListSkeleton, StatsGridSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useTransactions, useRecentTransactions } from "@hooks/queries/useTransactions";
import { useUIStore } from "@store/ui.store";

const safeArray = (d: unknown): any[] => Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const txnIcon = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("debit") || t.includes("send") || t.includes("out"))
    return <ArrowUpRight size={16} />;
  return <ArrowDownLeft size={16} />;
};

const txnColor = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("debit") || t.includes("send") || t.includes("out"))
    return "text-red-500 bg-red-50 dark:bg-red-950/50 dark:text-red-400";
  return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400";
};

const statusIcon = (s: string) => {
  switch ((s || "").toLowerCase()) {
    case "completed": case "success": return <CheckCircle2 size={14} className="text-emerald-500" />;
    case "failed": return <XCircle size={14} className="text-red-500" />;
    case "pending": return <Timer size={14} className="text-amber-500" />;
    default: return <AlertTriangle size={14} className="text-gray-400" />;
  }
};

interface TransactionRowProps {
  tx: any;
  show: boolean;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ tx, show }) => (
  <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl ${txnColor(tx.type)}`}>{txnIcon(tx.type)}</div>
      <div>
        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
          {tx.description || tx.name || "Transaction"}
        </h4>
        <div className="flex items-center gap-2">
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            {tx.date ? new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
          </p>
          {tx.status && <span className="flex items-center gap-1">{statusIcon(tx.status)}</span>}
        </div>
      </div>
    </div>
    <p className={`text-xs sm:text-sm font-bold ${
      (tx.type || "").toLowerCase().includes("credit") || (tx.type || "").toLowerCase().includes("in")
        ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
    }`}>
      {show ? ((tx.type || "").toLowerCase().includes("credit") ? "+" : "-") + fmt(Math.abs(tx.amount || 0)) : "••••••"}
    </p>
  </div>
);

/* ═══════ RECENT ACTIVITY ═══════ */
export const RecentActivity: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: txData, isLoading } = useRecentTransactions();
  const txns = safeArray(txData);

  const totalIn = txns.filter((t: any) => (t.type || "").toLowerCase().includes("credit")).reduce((a: number, t: any) => a + (t.amount || 0), 0);
  const totalOut = txns.filter((t: any) => !(t.type || "").toLowerCase().includes("credit")).reduce((a: number, t: any) => a + (t.amount || 0), 0);

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Recent Activity"
          subtitle="Your latest transactions at a glance"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Transactions", href: "/customer/transactions" },
            { label: "Recent Activity" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <>
          <StatsGridSkeleton count={3} />
          <TransactionListSkeleton count={6} />
        </>
      ) : (
        <>
          <StatsGrid cols={3}>
            <StatCard label="Total In" value={show ? fmt(totalIn) : "••••••"} icon={<TrendingUp size={20} />} iconColor="from-emerald-500 to-teal-500" />
            <StatCard label="Total Out" value={show ? fmt(totalOut) : "••••••"} icon={<TrendingDown size={20} />} iconColor="from-red-500 to-pink-500" />
            <StatCard label="Transactions" value={String(txns.length)} icon={<Clock size={20} />} iconColor="from-indigo-500 to-purple-500" />
          </StatsGrid>

          {txns.length === 0 ? (
            <EmptyState title="No Recent Transactions" description="Your recent transactions will appear here." />
          ) : (
            <DashCard padding="none" className="mt-6">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Recent Transactions</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">{txns.length} total</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {txns.slice(0, 20).map((tx: any, i: number) => (
                  <TransactionRow key={tx._id || tx.id || i} tx={tx} show={show} />
                ))}
              </div>
            </DashCard>
          )}
        </>
      )}
    </PageContainer>
  );
};

/* ═══════ SCHEDULED TRANSFERS ═══════ */
export const ScheduledTransfers: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: txData, isLoading } = useTransactions();
  const allTxns = safeArray(txData);
  const scheduled = allTxns.filter((t: any) => (t.status || "").toLowerCase() === "pending" || (t.status || "").toLowerCase() === "scheduled");

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Scheduled Transfers"
          subtitle="Upcoming and recurring transfers"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Transactions", href: "/customer/transactions" },
            { label: "Scheduled" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <TransactionListSkeleton count={5} />
      ) : scheduled.length === 0 ? (
        <EmptyState
          title="No Scheduled Transfers"
          description="You don't have any upcoming or recurring transfers. Schedule one to get started."
        />
      ) : (
        <DashCard padding="none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Upcoming Transfers</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {scheduled.map((tx: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{tx.description || "Scheduled Transfer"}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {tx.date ? new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Pending"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    {show ? fmt(tx.amount || 0) : "••••••"}
                  </p>
                  <StatusBadge status="pending" />
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

/* ═══════ TRANSACTION HISTORY ═══════ */
export const TransactionHistory: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const { data: txData, isLoading } = useTransactions();
  const allTxns = safeArray(txData);

  const filtered = allTxns.filter((t: any) => {
    const matchSearch = !search || (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || (t.type || "").toLowerCase().includes(typeFilter);
    return matchSearch && matchType;
  });

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Transaction History"
          subtitle="Search and filter your complete transaction history"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Transactions", href: "/customer/transactions" },
            { label: "History" },
          ]}
        />
      </motion.div>

      <DashCard className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className={`${inputCls} pl-10`}
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`${inputCls} sm:w-44`}>
            <option value="all">All Types</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
          </select>
        </div>
      </DashCard>

      {isLoading ? (
        <TransactionListSkeleton count={8} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No Transactions Found" description="Try adjusting your search or filter criteria." />
      ) : (
        <DashCard padding="none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">All Transactions</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{filtered.length} results</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((tx: any, i: number) => (
              <TransactionRow key={tx._id || tx.id || i} tx={tx} show={show} />
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

/* ═══════ DOWNLOAD STATEMENT ═══════ */
export const DownloadStatement: React.FC = () => {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [format, setFormat] = useState("pdf");

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";
  const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Download Statement"
          subtitle="Export your transaction data in multiple formats"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Transactions", href: "/customer/transactions" },
            { label: "Download" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl">
        <DashCard>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Generate Transaction Statement
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>From Date</label>
                <input type="date" value={dateRange.from} onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>To Date</label>
                <input type="date" value={dateRange.to} onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Format</label>
              <div className="flex gap-3">
                {["pdf", "csv", "excel"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      format === f
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <motion.button
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium mt-4"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Download size={16} /> Download Statement
            </motion.button>
          </div>
        </DashCard>

        <DashCard className="mt-6">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-4">
            Previous Downloads
          </h3>
          <div className="space-y-2">
            {["March 2025 Statement", "February 2025 Statement", "January 2025 Statement"].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{item}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">PDF • 245 KB</p>
                  </div>
                </div>
                <Download size={16} className="text-indigo-500 dark:text-indigo-400" />
              </div>
            ))}
          </div>
        </DashCard>
      </div>
    </PageContainer>
  );
};

// ============================================================================
// TRANSACTIONS SUB-PAGES — Recent, Scheduled, History, Download
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Clock, Calendar, BarChart3, Download, Search, Filter,
  ArrowUpRight, ArrowDownLeft, Repeat, CheckCircle2,
  XCircle, RefreshCw, ChevronRight, FileText, Send,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { TransactionListSkeleton, StatsGridSkeleton, FormSkeleton } from "@components/skeletons";
import { useTransactions, useRecentTransactions } from "@hooks/queries/useTransactions";
import { useUIStore } from "@store/ui.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const fmt = (n: number, c = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

const statusIcons: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  completed: { icon: <CheckCircle2 size={14} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  success: { icon: <CheckCircle2 size={14} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  pending: { icon: <Clock size={14} />, color: "text-amber-600", bg: "bg-amber-50" },
  processing: { icon: <RefreshCw size={14} />, color: "text-blue-600", bg: "bg-blue-50" },
  failed: { icon: <XCircle size={14} />, color: "text-rose-600", bg: "bg-rose-50" },
  cancelled: { icon: <XCircle size={14} />, color: "text-gray-600", bg: "bg-gray-50" },
  scheduled: { icon: <Calendar size={14} />, color: "text-indigo-600", bg: "bg-indigo-50" },
};

const TransactionRow: React.FC<{ tx: any; showBalances: boolean; onClick?: () => void }> = ({ tx, showBalances, onClick }) => {
  const type = tx.type?.toLowerCase() || "transfer";
  const status = tx.status?.toLowerCase() || "completed";
  const sConfig = statusIcons[status] || statusIcons.completed;
  const isCredit = ["credit", "deposit", "refund"].includes(type);

  return (
    <motion.div className="flex items-center gap-4 px-4 py-3.5 hover:bg-indigo-50/50 cursor-pointer transition-colors" whileHover={{ x: 3 }} onClick={onClick}>
      <div className={`p-2 rounded-full ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"}`}>
        {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{tx.description || tx.recipientName || tx.narration || "Transaction"}</p>
        <p className="text-xs text-gray-500 mt-0.5">{tx.createdAt && fmtDate(tx.createdAt)}</p>
      </div>
      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sConfig.color} ${sConfig.bg}`}>
        {sConfig.icon}<span className="capitalize">{status}</span>
      </div>
      <p className={`text-sm font-semibold ${isCredit ? "text-emerald-600" : "text-gray-900"}`}>
        {showBalances ? `${isCredit ? "+" : "-"}${fmt(tx.amount || 0, tx.currency)}` : "••••••"}
      </p>
    </motion.div>
  );
};

// ========================
// RECENT ACTIVITY
// ========================
export const RecentActivity: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data, isLoading } = useRecentTransactions(20);
  const transactions = (data as any)?.data ? (data as any).data : data || [];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Recent Activity" subtitle="Your latest financial transactions"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Transactions", href: "/customer/transactions" }, { label: "Recent" }]}
          actions={
            <motion.button onClick={() => navigate("/customer/send/domestic")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Send size={16} /> New Transfer
            </motion.button>
          } />
      </motion.div>

      {isLoading ? <TransactionListSkeleton count={10} /> : transactions.length === 0 ? (
        <EmptyState title="No Recent Activity" description="Your recent transactions will appear here."
          action={{ label: "Make a Transfer", onClick: () => navigate("/customer/send/domestic") }} />
      ) : (
        <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-indigo-900">Recent Transactions</h3></div>
          <div className="divide-y divide-gray-50">
            {transactions.map((tx: any, i: number) => <TransactionRow key={tx._id || i} tx={tx} showBalances={show} />)}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// SCHEDULED TRANSFERS
// ========================
export const ScheduledTransfers: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data, isLoading } = useTransactions({ status: "pending" as any });
  const transactions = data?.data || [];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Scheduled Transfers" subtitle="Manage your upcoming and recurring transfers"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Transactions", href: "/customer/transactions" }, { label: "Scheduled" }]}
          actions={
            <motion.button onClick={() => navigate("/customer/send/domestic")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Calendar size={16} /> Schedule Transfer
            </motion.button>
          } />
      </motion.div>

      {isLoading ? <TransactionListSkeleton count={5} /> : transactions.length === 0 ? (
        <EmptyState title="No Scheduled Transfers" description="Schedule transfers to automate your payments and never miss a due date."
          action={{ label: "Schedule Transfer", onClick: () => navigate("/customer/send/domestic") }} />
      ) : (
        <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-indigo-900">Upcoming Transfers</h3></div>
          <div className="divide-y divide-gray-50">
            {transactions.map((tx: any, i: number) => <TransactionRow key={tx._id || i} tx={{ ...tx, status: "scheduled" }} showBalances={show} />)}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// TRANSACTION HISTORY
// ========================
export const TransactionHistory: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, refetch } = useTransactions({ page: 1, limit: 100 });
  const transactions = data?.data || [];

  const filtered = useMemo(() => {
    return transactions.filter((t: any) => {
      const matchSearch = !search || t.description?.toLowerCase().includes(search.toLowerCase()) || t.reference?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [transactions, search, statusFilter]);

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Transaction History" subtitle="Complete history of all your transactions"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Transactions", href: "/customer/transactions" }, { label: "History" }]} />
      </motion.div>

      <motion.div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center" variants={itemVariants}>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <motion.button onClick={() => refetch()} className="p-2 rounded-lg bg-indigo-50 text-indigo-600" whileTap={{ scale: 0.95 }}>
          <RefreshCw size={16} />
        </motion.button>
      </motion.div>

      {isLoading ? <TransactionListSkeleton count={10} /> : filtered.length === 0 ? (
        <EmptyState title="No Transactions Found" description={search ? "Try adjusting your search criteria." : "Your transaction history will appear here."} variant={search ? "search" : "default"} />
      ) : (
        <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-indigo-900">All Transactions ({filtered.length})</h3></div>
          <div className="divide-y divide-gray-50">
            {filtered.map((tx: any, i: number) => <TransactionRow key={tx._id || i} tx={tx} showBalances={show} />)}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// DOWNLOAD STATEMENT
// ========================
export const DownloadStatement: React.FC = () => {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [format, setFormat] = useState("pdf");

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Download Statement" subtitle="Export your transaction data"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Transactions", href: "/customer/transactions" }, { label: "Download" }]} />
      </motion.div>

      <motion.div className="max-w-2xl" variants={itemVariants}>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-6">Export Transactions</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input type="date" value={dateRange.from} onChange={(e) => setDateRange(p => ({ ...p, from: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input type="date" value={dateRange.to} onChange={(e) => setDateRange(p => ({ ...p, to: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
              <div className="flex gap-3">
                {["pdf", "csv", "excel"].map((f) => (
                  <button key={f} onClick={() => setFormat(f)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${format === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <motion.button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium mt-4" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Download size={16} /> Download Statement
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

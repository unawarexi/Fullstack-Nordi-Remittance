// ============================================================================
// TRANSACTIONS — Main transactions dashboard
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Repeat,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  BarChart3,
  RefreshCw,
  Send,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  TransactionListSkeleton,
} from "@components/skeletons";
import {
  useTransactions,
  useRecentTransactions,
} from "@hooks/queries/useTransactions";
import { useUIStore } from "@store/ui.store";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Status & type configs
const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  completed: { icon: <CheckCircle2 size={14} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  success: { icon: <CheckCircle2 size={14} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  pending: { icon: <Clock size={14} />, color: "text-amber-600", bg: "bg-amber-50" },
  processing: { icon: <RefreshCw size={14} />, color: "text-blue-600", bg: "bg-blue-50" },
  failed: { icon: <XCircle size={14} />, color: "text-rose-600", bg: "bg-rose-50" },
  cancelled: { icon: <XCircle size={14} />, color: "text-gray-600", bg: "bg-gray-50" },
};

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  credit: { icon: <ArrowDownLeft size={16} />, color: "text-emerald-600" },
  debit: { icon: <ArrowUpRight size={16} />, color: "text-rose-600" },
  transfer: { icon: <Repeat size={16} />, color: "text-indigo-600" },
  deposit: { icon: <ArrowDownLeft size={16} />, color: "text-emerald-600" },
  withdrawal: { icon: <ArrowUpRight size={16} />, color: "text-rose-600" },
  refund: { icon: <ArrowDownLeft size={16} />, color: "text-blue-600" },
};

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const {
    data: transactionsData,
    isLoading,
    refetch,
  } = useTransactions({ page: 1, limit: 50 });
  const { data: recentData, isLoading: recentLoading } = useRecentTransactions(5);

  const transactions = transactionsData?.data || [];
  const recentTransactions = (recentData as any)?.data ? (recentData as any).data : recentData || [];

  // Computed stats
  const stats = useMemo(() => {
    const total = transactions.length;
    const completed = transactions.filter(
      (t: any) => t.status === "completed" || t.status === "success"
    ).length;
    const pending = transactions.filter(
      (t: any) => t.status === "pending" || t.status === "processing"
    ).length;
    const totalAmount = transactions.reduce(
      (acc: number, t: any) => acc + (t.amount || 0),
      0
    );
    return { total, completed, pending, totalAmount };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: any) => {
      const matchSearch =
        !searchQuery ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.recipientName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchType = typeFilter === "all" || t.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [transactions, searchQuery, statusFilter, typeFilter]);

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Transactions"
          subtitle="View and manage all your financial transactions"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Transactions" },
          ]}
          actions={
            <div className="flex gap-3">
              <motion.button
                onClick={() => navigate("/customer/transactions/download")}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={16} />
                Export
              </motion.button>
              <motion.button
                onClick={() => navigate("/customer/send/domestic")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={16} />
                New Transfer
              </motion.button>
            </div>
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          variants={itemVariants}
        >
          {[
            { label: "Total Transactions", value: stats.total, icon: <Repeat size={20} />, color: "from-indigo-500 to-purple-500" },
            { label: "Total Volume", value: showBalances ? formatCurrency(stats.totalAmount) : "••••••", icon: <BarChart3 size={20} />, color: "from-emerald-500 to-teal-500" },
            { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={20} />, color: "from-green-500 to-emerald-500" },
            { label: "Pending", value: stats.pending, icon: <Clock size={20} />, color: "from-amber-500 to-orange-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-indigo-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Filters Bar */}
      <motion.div
        className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center"
        variants={itemVariants}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
          <option value="transfer">Transfer</option>
        </select>
        <motion.button
          onClick={() => refetch()}
          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={16} />
        </motion.button>
      </motion.div>

      {/* Transaction List */}
      {isLoading ? (
        <TransactionListSkeleton count={8} />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description={
            searchQuery
              ? "No transactions match your search criteria."
              : "Your transaction history will appear here once you start making transfers."
          }
          variant={searchQuery ? "search" : "default"}
          action={{
            label: "Make a Transfer",
            onClick: () => navigate("/customer/send/domestic"),
          }}
        />
      ) : (
        <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-indigo-900">
              All Transactions ({filteredTransactions.length})
            </h3>
            <motion.button
              onClick={() => navigate("/customer/transactions/history")}
              className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700"
              whileHover={{ x: 2 }}
            >
              View All <ChevronRight size={14} />
            </motion.button>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredTransactions.slice(0, 20).map((tx: any, index: number) => {
              const type = tx.type?.toLowerCase() || "transfer";
              const status = tx.status?.toLowerCase() || "completed";
              const tConfig = typeConfig[type] || typeConfig.transfer;
              const sConfig = statusConfig[status] || statusConfig.completed;
              const isCredit = type === "credit" || type === "deposit" || type === "refund";

              return (
                <motion.div
                  key={tx._id || tx.id || index}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() =>
                    navigate(
                      `/customer/transactions/history`
                    )
                  }
                >
                  {/* Type Icon */}
                  <div className={`p-2 rounded-full bg-gray-100 ${tConfig.color}`}>
                    {tConfig.icon}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tx.description || tx.recipientName || tx.narration || "Transaction"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tx.reference && <span className="mr-2">{tx.reference}</span>}
                      {tx.createdAt && formatDate(tx.createdAt)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sConfig.color} ${sConfig.bg}`}>
                    {sConfig.icon}
                    <span className="capitalize">{status}</span>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isCredit ? "text-emerald-600" : "text-gray-900"}`}>
                      {showBalances
                        ? `${isCredit ? "+" : "-"}${formatCurrency(tx.amount || 0, tx.currency)}`
                        : "••••••"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4" variants={itemVariants}>
        {[
          { label: "Recent Activity", icon: <Clock size={20} />, route: "/customer/transactions/recent", color: "text-blue-600 bg-blue-50" },
          { label: "Scheduled", icon: <Calendar size={20} />, route: "/customer/transactions/scheduled", color: "text-amber-600 bg-amber-50" },
          { label: "Full History", icon: <BarChart3 size={20} />, route: "/customer/transactions/history", color: "text-indigo-600 bg-indigo-50" },
          { label: "Download", icon: <Download size={20} />, route: "/customer/transactions/download", color: "text-purple-600 bg-purple-50" },
        ].map((link) => (
          <motion.button
            key={link.label}
            onClick={() => navigate(link.route)}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`p-2 rounded-lg ${link.color}`}>{link.icon}</div>
            <div>
              <p className="text-sm font-medium text-indigo-900">{link.label}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                View <ChevronRight size={12} />
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Transactions;

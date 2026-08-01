// ============================================================================
// TRANSACTIONS — Main transactions dashboard (Dark mode + Shared Primitives)
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Repeat,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Calendar,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { StatsGridSkeleton, TransactionListSkeleton } from "@components/skeletons";
import { useClientTransactions } from "../../client-usecase/usetransaction-client-usecase";
import { useUIStore } from "@store/ui.store";
import {
  PageContainer,
  StatCard,
  StatsGrid,
  DashCard,
  SectionHeader,
  FilterBar,
  FilterSelect,
  StatusBadge,
  ActionButton,
  QuickLinkCard,
  QuickLinksGrid,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants, listItemRevealVariants } from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  credit: { icon: <ArrowDownLeft size={16} />, color: "text-emerald-600 dark:text-emerald-400" },
  debit: { icon: <ArrowUpRight size={16} />, color: "text-rose-600 dark:text-rose-400" },
  transfer: { icon: <Repeat size={16} />, color: "text-indigo-600 dark:text-indigo-400" },
  deposit: { icon: <ArrowDownLeft size={16} />, color: "text-emerald-600 dark:text-emerald-400" },
  withdrawal: { icon: <ArrowUpRight size={16} />, color: "text-rose-600 dark:text-rose-400" },
  refund: { icon: <ArrowDownLeft size={16} />, color: "text-blue-600 dark:text-blue-400" },
};

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 size={14} />,
  success: <CheckCircle2 size={14} />,
  pending: <Clock size={14} />,
  processing: <RefreshCw size={14} />,
  failed: <XCircle size={14} />,
  cancelled: <XCircle size={14} />,
};

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { transactions, isLoading, refetch } = useClientTransactions({ page: 1, limit: 50 });

  const stats = useMemo(() => {
    const total = transactions.length;
    const completed = transactions.filter((t: any) => t.status === "completed" || t.status === "success").length;
    const pending = transactions.filter((t: any) => t.status === "pending" || t.status === "processing").length;
    const totalAmount = transactions.reduce((acc: number, t: any) => acc + (t.amount || 0), 0);
    return { total, completed, pending, totalAmount };
  }, [transactions]);

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
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <PageContainer>
      {/* Header */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Transactions"
          subtitle="View and manage all your financial transactions"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Transactions" }]}
          actions={
            <div className="flex gap-2 sm:gap-3">
              <ActionButton
                label="Export"
                icon={<Download size={16} />}
                variant="secondary"
                onClick={() => navigate("/customer/transactions/download")}
              />
              <ActionButton
                label="New Transfer"
                icon={<Send size={16} />}
                onClick={() => navigate("/customer/send/domestic")}
              />
            </div>
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <StatsGrid cols={4}>
          <StatCard
            label="Total Transactions"
            value={stats.total}
            icon={<Repeat size={20} />}
            iconColor="from-indigo-500 to-purple-500"
            index={0}
          />
          <StatCard
            label="Total Volume"
            value={showBalances ? formatCurrency(stats.totalAmount) : "••••••"}
            icon={<BarChart3 size={20} />}
            iconColor="from-emerald-500 to-teal-500"
            index={1}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 size={20} />}
            iconColor="from-green-500 to-emerald-500"
            index={2}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<Clock size={20} />}
            iconColor="from-amber-500 to-orange-500"
            index={3}
          />
        </StatsGrid>
      )}

      {/* Filters */}
      <FilterBar searchValue={searchQuery} onSearchChange={setSearchQuery} searchPlaceholder="Search transactions...">
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All Status" },
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "failed", label: "Failed" },
          ]}
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All Types" },
            { value: "credit", label: "Credit" },
            { value: "debit", label: "Debit" },
            { value: "transfer", label: "Transfer" },
          ]}
        />
        <motion.button
          onClick={() => refetch()}
          className="rounded-lg bg-gray-100 p-1.5 text-indigo-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700 sm:p-2"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={16} />
        </motion.button>
      </FilterBar>

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
          action={{ label: "Make a Transfer", onClick: () => navigate("/customer/send/domestic") }}
        />
      ) : (
        <DashCard padding="none">
          <div className="flex items-center justify-between border-b border-gray-100 p-3 dark:border-gray-800 sm:p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
              All Transactions ({filteredTransactions.length})
            </h3>
            <motion.button
              onClick={() => navigate("/customer/transactions/history")}
              className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 sm:text-xs"
              whileHover={{ x: 2 }}
            >
              View All <ChevronRight size={14} />
            </motion.button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {filteredTransactions.slice(0, 20).map((tx: any, index: number) => {
              const type = tx.type?.toLowerCase() || "transfer";
              const status = tx.status?.toLowerCase() || "completed";
              const tConfig = typeConfig[type] || typeConfig.transfer;
              const isCredit = type === "credit" || type === "deposit" || type === "refund";

              return (
                <motion.div
                  key={tx._id || tx.id || index}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:gap-4 sm:px-4 sm:py-3.5"
                  custom={index}
                  variants={listItemRevealVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => navigate("/customer/transactions/history")}
                >
                  <div className={`rounded-full bg-gray-100 p-1.5 dark:bg-gray-800 sm:p-2 ${tConfig.color}`}>
                    {tConfig.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                      {tx.description || tx.recipientName || tx.narration || "Transaction"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                      {tx.reference && <span className="mr-2">{tx.reference}</span>}
                      {tx.createdAt && formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={status} icon={statusIcons[status]} />
                  <div className="text-right">
                    <p
                      className={`text-xs font-semibold sm:text-sm ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}
                    >
                      {showBalances
                        ? `${isCredit ? "+" : "-"}${formatCurrency(tx.amount || 0, tx.currency)}`
                        : "••••••"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </DashCard>
      )}

      {/* Quick Links */}
      <QuickLinksGrid>
        <QuickLinkCard
          label="Recent Activity"
          icon={<Clock size={20} />}
          route="/customer/transactions/recent"
          iconColor="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
        />
        <QuickLinkCard
          label="Scheduled"
          icon={<Calendar size={20} />}
          route="/customer/transactions/scheduled"
          iconColor="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50"
        />
        <QuickLinkCard
          label="Full History"
          icon={<BarChart3 size={20} />}
          route="/customer/transactions/history"
          iconColor="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
        />
        <QuickLinkCard
          label="Download"
          icon={<Download size={20} />}
          route="/customer/transactions/download"
          iconColor="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50"
        />
      </QuickLinksGrid>
    </PageContainer>
  );
};

export default Transactions;

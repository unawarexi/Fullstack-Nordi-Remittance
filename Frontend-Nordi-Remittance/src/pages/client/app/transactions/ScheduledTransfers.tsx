// ============================================================================
// TRANSACTIONS SUB-PAGES — Recent Activity, Scheduled, History, Download
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Download,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Timer,
  AlertTriangle,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  StatusBadge,
  SectionHeader,
} from "@components/shared/DashboardPrimitives";
import { TransactionListSkeleton, StatsGridSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientTransactions } from "../../client-usecase/usetransaction-client-usecase";
import { useUIStore } from "@store/ui.store";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const txnIcon = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("debit") || t.includes("send") || t.includes("out")) return <ArrowUpRight size={16} />;
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
    case "completed":
    case "success":
      return <CheckCircle2 size={14} className="text-emerald-500" />;
    case "failed":
      return <XCircle size={14} className="text-red-500" />;
    case "pending":
      return <Timer size={14} className="text-amber-500" />;
    default:
      return <AlertTriangle size={14} className="text-gray-400" />;
  }
};

interface TransactionRowProps {
  tx: any;
  show: boolean;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ tx, show }) => (
  <div className="flex items-center justify-between p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 sm:p-4">
    <div className="flex items-center gap-3">
      <div className={`rounded-xl p-2 ${txnColor(tx.type)}`}>{txnIcon(tx.type)}</div>
      <div>
        <h4 className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
          {tx.description || tx.name || "Transaction"}
        </h4>
        <div className="flex items-center gap-2">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
            {tx.date
              ? new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "—"}
          </p>
          {tx.status && <span className="flex items-center gap-1">{statusIcon(tx.status)}</span>}
        </div>
      </div>
    </div>
    <p
      className={`text-xs font-bold sm:text-sm ${
        (tx.type || "").toLowerCase().includes("credit") || (tx.type || "").toLowerCase().includes("in")
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {show ? ((tx.type || "").toLowerCase().includes("credit") ? "+" : "-") + fmt(Math.abs(tx.amount || 0)) : "••••••"}
    </p>
  </div>
);

const ScheduledTransfers: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { transactions: allTxns, isLoading } = useClientTransactions();
  const scheduled = allTxns.filter(
    (t: any) => (t.status || "").toLowerCase() === "pending" || (t.status || "").toLowerCase() === "scheduled",
  );

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
          <div className="border-b border-gray-200 p-4 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Upcoming Transfers</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {scheduled.map((tx: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                      {tx.description || "Scheduled Transfer"}
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                      {tx.date
                        ? new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "Pending"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">
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

export default ScheduledTransfers;

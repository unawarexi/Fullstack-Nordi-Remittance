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


const RecentActivity: React.FC = () => {
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

export default RecentActivity;

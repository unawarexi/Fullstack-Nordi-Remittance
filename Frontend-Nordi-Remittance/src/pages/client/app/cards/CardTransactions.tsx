// ============================================================================
// CARDS SUB-PAGES — Overview, Transactions, Apply, Security, Virtual
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard, Eye, EyeOff, Lock, Plus, Shield, Smartphone,
  ArrowUpRight, ArrowDownLeft, Settings, CheckCircle2, AlertTriangle,
  Globe, Wifi, ShoppingBag, TrendingUp,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, StatusBadge,
} from "@components/shared/DashboardPrimitives";
import {
  CreditCardSkeleton, TransactionListSkeleton, FormSkeleton, StatsGridSkeleton,
} from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useCards, useCardTransactions } from "@hooks/queries/useCards";
import { useUIStore } from "@store/ui.store";

const safeArray = (d: unknown): any[] => Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

/* ─── Shared card visual ─── */
const CardVisual: React.FC<{ card: any; show: boolean; gradient?: string }> = ({
  card, show, gradient = "from-indigo-600 via-purple-600 to-fuchsia-600",
}) => (
  <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-5 sm:p-6 text-white overflow-hidden`}>
    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10" />
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-6 -mb-6" />
    <div className="flex justify-between items-start mb-8">
      <div>
        <p className="text-xs text-white/70">{card.type || "Premium"}</p>
        <p className="text-sm font-medium">{card.name || "Nordi Card"}</p>
      </div>
      <Wifi size={24} className="text-white/60" />
    </div>
    <p className="text-lg sm:text-xl font-mono tracking-widest mb-4">
      {show ? (card.number || "•••• •••• •••• ••••") : "•••• •••• •••• ••••"}
    </p>
    <div className="flex justify-between items-end">
      <div>
        <p className="text-[10px] text-white/60">BALANCE</p>
        <p className="text-base sm:text-lg font-bold">{show ? fmt(card.balance || card.limit || 0) : "••••••"}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] text-white/60">EXPIRES</p>
        <p className="text-sm font-medium">{card.expiry || "12/28"}</p>
      </div>
    </div>
  </div>
);


const CardTransactions: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: cardsData } = useCards();
  const cards = safeArray(cardsData);
  const selectedCardId = cards?.[0]?.id ?? cards?.[0]?._id ?? "";
  const { data: txData, isLoading } = useCardTransactions(selectedCardId);
  const txns = safeArray(txData);

  const txnIcon = (t: string) =>
    (t || "").toLowerCase().includes("online") ? <Globe size={16} /> : <ShoppingBag size={16} />;

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Card Transactions"
          subtitle="Review all transactions made with your cards"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards", href: "/customer/cards" },
            { label: "Transactions" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <TransactionListSkeleton count={8} />
      ) : txns.length === 0 ? (
        <EmptyState title="No Card Transactions" description="Transactions made with your cards will appear here." />
      ) : (
        <DashCard padding="none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">All Card Transactions</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">{txns.length} total</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {txns.map((tx: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    {txnIcon(tx.channel || "")}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{tx.description || tx.merchant || "Card Transaction"}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                      {tx.date ? new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      {tx.cardLast4 && ` • •••• ${tx.cardLast4}`}
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">
                  {show ? `-${fmt(Math.abs(tx.amount || 0))}` : "••••••"}
                </p>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

export default CardTransactions;

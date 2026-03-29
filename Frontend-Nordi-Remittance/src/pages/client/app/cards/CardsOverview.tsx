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


const CardsOverview: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: cardsData, isLoading } = useCards();
  const cards = safeArray(cardsData);

  const gradients = [
    "from-indigo-600 via-purple-600 to-fuchsia-600",
    "from-emerald-600 via-teal-600 to-cyan-600",
    "from-amber-600 via-orange-500 to-red-500",
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Cards Overview"
          subtitle="Manage and monitor all your cards"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards", href: "/customer/cards" },
            { label: "Overview" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <>
          <StatsGridSkeleton count={3} />
          <CreditCardSkeleton />
        </>
      ) : (
        <>
          <StatsGrid cols={3}>
            <StatCard label="Active Cards" value={String(cards.filter((c: any) => (c.status || "active").toLowerCase() === "active").length)} icon={<CreditCard size={20} />} iconColor="from-indigo-500 to-purple-500" />
            <StatCard label="Total Limit" value={show ? fmt(cards.reduce((a: number, c: any) => a + (c.limit || 0), 0)) : "••••••"} icon={<TrendingUp size={20} />} iconColor="from-emerald-500 to-teal-500" />
            <StatCard label="Cards" value={String(cards.length)} icon={<CreditCard size={20} />} iconColor="from-amber-500 to-orange-500" />
          </StatsGrid>

          {cards.length === 0 ? (
            <EmptyState
              title="No Cards Found"
              description="Apply for a card to start making transactions."
              action={{ label: "Apply for Card", onClick: () => {} }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mt-6">
              {cards.map((card: any, i: number) => (
                <motion.div key={card._id || card.id || i} variants={dashboardItemVariants}>
                  <CardVisual card={card} show={show} gradient={gradients[i % gradients.length]} />
                  <DashCard className="mt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                        <StatusBadge status={(card.status || "active").toLowerCase() as any} />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Spending Limit</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {show ? fmt(card.limit || 0) : "••••••"}
                        </p>
                      </div>
                    </div>
                  </DashCard>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default CardsOverview;

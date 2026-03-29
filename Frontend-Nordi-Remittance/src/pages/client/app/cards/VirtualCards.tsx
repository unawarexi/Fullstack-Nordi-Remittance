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


const VirtualCards: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: cardsData, isLoading } = useCards();
  const allCards = safeArray(cardsData);
  const virtual = allCards.filter((c: any) => (c.type || "").toLowerCase().includes("virtual"));

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Virtual Cards"
          subtitle="Manage your digital cards for online transactions"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards", href: "/customer/cards" },
            { label: "Virtual" },
          ]}
          actions={
            <motion.button
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs sm:text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} /> Create Virtual Card
            </motion.button>
          }
        />
      </motion.div>

      {isLoading ? (
        <StatsGridSkeleton count={2} />
      ) : virtual.length === 0 ? (
        <DashCard className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mb-4">
            <Smartphone size={28} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
            Create Your First Virtual Card
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Virtual cards are perfect for online shopping. Create one instantly and start using it right away.
          </p>
          <motion.button
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Virtual Card
          </motion.button>
        </DashCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {virtual.map((card: any, i: number) => (
            <motion.div key={card._id || card.id || i} variants={dashboardItemVariants}>
              <CardVisual card={card} show={show} gradient="from-emerald-600 via-teal-600 to-cyan-600" />
              <DashCard className="mt-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={(card.status || "active").toLowerCase() as any} />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default VirtualCards;

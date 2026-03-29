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


const ApplyForCard: React.FC = () => {
  const cardTypes = [
    { name: "Classic Debit", desc: "No annual fee, everyday banking", icon: CreditCard, gradient: "from-blue-500 to-cyan-500", features: ["Free ATM withdrawals", "Online shopping", "Contactless payments"] },
    { name: "Premium Credit", desc: "Rewards, lounge access, higher limits", icon: Shield, gradient: "from-indigo-600 to-purple-600", features: ["Cashback rewards", "Airport lounge", "Travel insurance"] },
    { name: "Virtual Card", desc: "Instant digital card for online use", icon: Smartphone, gradient: "from-emerald-500 to-teal-500", features: ["Instant issuance", "Single-use option", "Enhanced security"] },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Apply for Card"
          subtitle="Choose the perfect card for your lifestyle"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards", href: "/customer/cards" },
            { label: "Apply" },
          ]}
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {cardTypes.map((card) => (
          <motion.div key={card.name} variants={dashboardItemVariants}>
            <DashCard className="h-full flex flex-col">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white mb-4`}>
                <card.icon size={22} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{card.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">{card.desc}</p>
              <div className="flex-1 space-y-2 mb-6">
                {card.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
              <motion.button
                className={`w-full py-2.5 bg-gradient-to-r ${card.gradient} text-white rounded-xl text-xs sm:text-sm font-medium`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply Now
              </motion.button>
            </DashCard>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

export default ApplyForCard;

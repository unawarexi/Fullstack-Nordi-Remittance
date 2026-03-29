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


const CardSecurity: React.FC = () => {
  const { data: cardsData, isLoading } = useCards();
  const cards = safeArray(cardsData);

  const securityOpts = [
    { label: "Online Transactions", key: "online", desc: "Allow online/e-commerce purchases" },
    { label: "International Transactions", key: "intl", desc: "Allow transactions abroad" },
    { label: "Contactless Payments", key: "contactless", desc: "Enable tap-to-pay" },
    { label: "ATM Withdrawals", key: "atm", desc: "Enable cash withdrawals at ATMs" },
  ];

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    online: true, intl: false, contactless: true, atm: true,
  });

  const toggle = (key: string) => setToggles((p) => ({ ...p, [key]: !p[key] }));

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Card Security"
          subtitle="Manage card locks, limits, and security settings"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards", href: "/customer/cards" },
            { label: "Security" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <FormSkeleton fields={4} />
      ) : (
        <div className="max-w-2xl space-y-6">
          <DashCard>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Card Controls
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
              Toggle transaction types for your cards
            </p>
            <div className="space-y-4">
              {securityOpts.map((opt) => (
                <div key={opt.key} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{opt.label}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle(opt.key)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      toggles[opt.key] ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        toggles[opt.key] ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </DashCard>

          <DashCard>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Freeze Card", icon: Lock, color: "text-red-500 bg-red-50 dark:bg-red-950/50" },
                { label: "Change PIN", icon: Settings, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/50" },
                { label: "Report Lost", icon: AlertTriangle, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/50" },
                { label: "Set Limits", icon: Shield, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  <div className={`p-2 rounded-xl ${action.color}`}>
                    <action.icon size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                </button>
              ))}
            </div>
          </DashCard>
        </div>
      )}
    </PageContainer>
  );
};

export default CardSecurity;

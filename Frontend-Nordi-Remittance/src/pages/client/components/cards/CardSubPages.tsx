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
} from "lucide-react";
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

/* ═══════ CARDS OVERVIEW ═══════ */
export const CardsOverview: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: cardsData, isLoading } = useCards();
  const cards = (cardsData as any)?.data ?? cardsData ?? [];

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

/* ═══════ CARD TRANSACTIONS ═══════ */
export const CardTransactions: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: cardsData } = useCards();
  const cards = (cardsData as any)?.data ?? cardsData ?? [];
  const selectedCardId = cards?.[0]?.id ?? cards?.[0]?._id ?? "";
  const { data: txData, isLoading } = useCardTransactions(selectedCardId);
  const txns = (txData as any)?.data ?? txData ?? [];

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

/* ═══════ APPLY FOR CARD ═══════ */
export const ApplyForCard: React.FC = () => {
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

/* ═══════ CARD SECURITY ═══════ */
export const CardSecurity: React.FC = () => {
  const { data: cardsData, isLoading } = useCards();
  const cards = (cardsData as any)?.data ?? cardsData ?? [];

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

/* ═══════ VIRTUAL CARDS ═══════ */
export const VirtualCards: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: cardsData, isLoading } = useCards();
  const allCards = (cardsData as any)?.data ?? cardsData ?? [];
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

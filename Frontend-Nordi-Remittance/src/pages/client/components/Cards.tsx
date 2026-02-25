// ============================================================================
// CARDS — Main cards management dashboard (Dark mode + Shared Primitives)
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Plus,
  Eye,
  EyeOff,
  Shield,
  Snowflake,
  Settings,
  ChevronRight,
  Wifi,
  Smartphone,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  CreditCardSkeleton,
} from "@components/skeletons";
import { useCards } from "@hooks/queries/useCards";
import { useUIStore } from "@store/ui.store";
import {
  PageContainer,
  StatCard,
  StatsGrid,
  DashCard,
  ActionButton,
  ListActionRow,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

const cardThemes: Record<string, { bg: string; accent: string }> = {
  visa: { bg: "from-indigo-600 via-indigo-700 to-purple-800", accent: "text-indigo-200" },
  mastercard: { bg: "from-gray-800 via-gray-900 to-black", accent: "text-gray-300" },
  virtual: { bg: "from-purple-600 via-violet-700 to-indigo-800", accent: "text-purple-200" },
  platinum: { bg: "from-slate-600 via-slate-700 to-slate-900", accent: "text-slate-200" },
  gold: { bg: "from-amber-500 via-yellow-600 to-orange-700", accent: "text-amber-100" },
  default: { bg: "from-indigo-500 via-purple-600 to-violet-700", accent: "text-indigo-200" },
};

const Cards: React.FC = () => {
  const navigate = useNavigate();
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const toggleShowBalances = useUIStore((s) => s.toggleShowBalances);
  const [selectedCard, setSelectedCard] = useState<number>(0);

  const { data: cardsData, isLoading } = useCards();
  const cards = cardsData?.data || [];

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);

  const maskCardNumber = (num: string) => {
    if (!num) return "•••• •••• •••• ••••";
    const last4 = num.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <PageContainer>
      {/* Header */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="My Cards"
          subtitle="Manage your debit, credit, and virtual cards"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards" },
          ]}
          actions={
            <div className="flex gap-2 sm:gap-3">
              <ActionButton
                label=""
                icon={showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
                variant="secondary"
                onClick={() => toggleShowBalances()}
              />
              <ActionButton
                label="New Card"
                icon={<Plus size={16} />}
                onClick={() => navigate("/customer/cards/apply")}
              />
            </div>
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <StatsGrid cols={3}>
          <StatCard label="Active Cards" value={cards.filter((c: any) => c.status === "active").length || cards.length} icon={<CreditCard size={20} />} iconColor="from-indigo-500 to-purple-500" index={0} />
          <StatCard label="Total Limit" value={showBalances ? formatCurrency(cards.reduce((a: number, c: any) => a + (c.limit || c.creditLimit || 0), 0)) : "••••••"} icon={<Shield size={20} />} iconColor="from-emerald-500 to-teal-500" index={1} />
          <StatCard label="Virtual Cards" value={cards.filter((c: any) => c.isVirtual || c.type === "virtual").length} icon={<Smartphone size={20} />} iconColor="from-violet-500 to-purple-500" index={2} />
        </StatsGrid>
      )}

      {/* Cards Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 sm:mb-8">
          {[1, 2].map((i) => <CreditCardSkeleton key={i} />)}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          title="No Cards Yet"
          description="Apply for your first card to start making payments and managing your finances."
          action={{ label: "Apply for Card", onClick: () => navigate("/customer/cards/apply") }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Card Visual */}
          <motion.div variants={dashboardItemVariants}>
            <AnimatePresence mode="wait">
              {cards.map((card: any, index: number) => {
                if (index !== selectedCard) return null;
                const theme = cardThemes[card.network?.toLowerCase()] || cardThemes[card.type?.toLowerCase()] || cardThemes.default;

                return (
                  <motion.div
                    key={card._id || card.id || index}
                    className={`bg-gradient-to-br ${theme.bg} rounded-2xl p-5 sm:p-6 text-white shadow-xl aspect-[1.6/1] max-w-md mx-auto flex flex-col justify-between`}
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-[10px] sm:text-xs ${theme.accent} mb-1`}>
                          {card.type?.toUpperCase() || "DEBIT"} CARD
                        </p>
                        <p className="text-xs sm:text-sm font-medium">
                          {card.name || "Primary Card"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi size={18} className="rotate-90 opacity-70" />
                        <span className="text-sm sm:text-lg font-bold opacity-80">
                          {card.network?.toUpperCase() || "VISA"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-base sm:text-lg font-mono tracking-wider mb-3 sm:mb-4">
                        {showBalances ? maskCardNumber(card.cardNumber || card.number || "") : "•••• •••• •••• ••••"}
                      </p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className={`text-[10px] sm:text-xs ${theme.accent}`}>CARD HOLDER</p>
                          <p className="text-xs sm:text-sm font-medium">
                            {card.holderName || card.cardholderName || "ACCOUNT HOLDER"}
                          </p>
                        </div>
                        <div>
                          <p className={`text-[10px] sm:text-xs ${theme.accent}`}>EXPIRES</p>
                          <p className="text-xs sm:text-sm font-medium">
                            {card.expiryDate || card.expiry || "••/••"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Card Selector Dots */}
            {cards.length > 1 && (
              <div className="flex justify-center gap-2 mt-3 sm:mt-4">
                {cards.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCard(i)}
                    className={`h-2 sm:h-2.5 rounded-full transition-all ${
                      i === selectedCard
                        ? "bg-indigo-600 dark:bg-indigo-400 w-5 sm:w-6"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 w-2 sm:w-2.5"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Card Actions */}
          <motion.div variants={dashboardItemVariants} className="space-y-2 sm:space-y-3">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Quick Actions
            </h3>
            {[
              { label: "Card Transactions", desc: "View spending history", icon: <CreditCard size={18} />, route: "/customer/cards/transactions", color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400" },
              { label: "Freeze Card", desc: "Temporarily disable card", icon: <Snowflake size={18} />, route: "/customer/cards/security", color: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" },
              { label: "Card Settings", desc: "Limits, PIN, notifications", icon: <Settings size={18} />, route: "/customer/cards/security", color: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400" },
              { label: "Card Security", desc: "Manage security options", icon: <Shield size={18} />, route: "/customer/cards/security", color: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" },
              { label: "Virtual Cards", desc: "Create & manage virtual cards", icon: <Smartphone size={18} />, route: "/customer/cards/virtual", color: "bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400" },
            ].map((action) => (
              <DashCard
                key={action.label}
                className="hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all"
                padding="sm"
                hover
              >
                <motion.div
                  className="flex items-center gap-3 sm:gap-4"
                  onClick={() => navigate(action.route)}
                  whileHover={{ x: 4 }}
                >
                  <div className={`p-2 sm:p-2.5 rounded-xl ${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {action.label}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{action.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                </motion.div>
              </DashCard>
            ))}
          </motion.div>
        </div>
      )}
    </PageContainer>
  );
};

export default Cards;

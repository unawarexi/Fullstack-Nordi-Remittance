// ============================================================================
// CARDS — Main cards management dashboard
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
  Lock,
  MoreVertical,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  CreditCardSkeleton,
} from "@components/skeletons";
import { useCards } from "@hooks/queries/useCards";
import { useUIStore } from "@store/ui.store";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Card gradient themes
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
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);

  const maskCardNumber = (num: string) => {
    if (!num) return "•••• •••• •••• ••••";
    const last4 = num.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="My Cards"
          subtitle="Manage your debit, credit, and virtual cards"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards" },
          ]}
          actions={
            <div className="flex gap-3">
              <motion.button
                onClick={() => toggleShowBalances()}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
              </motion.button>
              <motion.button
                onClick={() => navigate("/customer/cards/apply")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} />
                New Card
              </motion.button>
            </div>
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          variants={itemVariants}
        >
          {[
            { label: "Active Cards", value: cards.filter((c: any) => c.status === "active").length || cards.length, icon: <CreditCard size={20} />, color: "from-indigo-500 to-purple-500" },
            { label: "Total Limit", value: showBalances ? formatCurrency(cards.reduce((a: number, c: any) => a + (c.limit || c.creditLimit || 0), 0)) : "••••••", icon: <Shield size={20} />, color: "from-emerald-500 to-teal-500" },
            { label: "Virtual Cards", value: cards.filter((c: any) => c.isVirtual || c.type === "virtual").length, icon: <Smartphone size={20} />, color: "from-violet-500 to-purple-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-indigo-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Cards Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <CreditCardSkeleton key={i} />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState
          title="No Cards Yet"
          description="Apply for your first card to start making payments and managing your finances."
          action={{
            label: "Apply for Card",
            onClick: () => navigate("/customer/cards/apply"),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Card Visual */}
          <motion.div variants={itemVariants}>
            <AnimatePresence mode="wait">
              {cards.map((card: any, index: number) => {
                if (index !== selectedCard) return null;
                const theme =
                  cardThemes[card.network?.toLowerCase()] ||
                  cardThemes[card.type?.toLowerCase()] ||
                  cardThemes.default;

                return (
                  <motion.div
                    key={card._id || card.id || index}
                    className={`bg-gradient-to-br ${theme.bg} rounded-2xl p-6 text-white shadow-xl aspect-[1.6/1] max-w-md mx-auto flex flex-col justify-between`}
                    initial={{ opacity: 0, rotateY: -90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: 90 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-xs ${theme.accent} mb-1`}>
                          {card.type?.toUpperCase() || "DEBIT"} CARD
                        </p>
                        <p className="text-sm font-medium">
                          {card.name || "Primary Card"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wifi size={20} className="rotate-90 opacity-70" />
                        <span className="text-lg font-bold opacity-80">
                          {card.network?.toUpperCase() || "VISA"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-lg font-mono tracking-wider mb-4">
                        {showBalances
                          ? maskCardNumber(card.cardNumber || card.number || "")
                          : "•••• •••• •••• ••••"}
                      </p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className={`text-xs ${theme.accent}`}>CARD HOLDER</p>
                          <p className="text-sm font-medium">
                            {card.holderName || card.cardholderName || "ACCOUNT HOLDER"}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${theme.accent}`}>EXPIRES</p>
                          <p className="text-sm font-medium">
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
              <div className="flex justify-center gap-2 mt-4">
                {cards.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCard(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === selectedCard
                        ? "bg-indigo-600 w-6"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Card Actions */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4">
              Quick Actions
            </h3>
            {[
              { label: "Card Transactions", desc: "View spending history", icon: <CreditCard size={18} />, route: "/customer/cards/transactions", color: "bg-indigo-50 text-indigo-600" },
              { label: "Freeze Card", desc: "Temporarily disable card", icon: <Snowflake size={18} />, route: "/customer/cards/security", color: "bg-blue-50 text-blue-600" },
              { label: "Card Settings", desc: "Limits, PIN, notifications", icon: <Settings size={18} />, route: "/customer/cards/security", color: "bg-purple-50 text-purple-600" },
              { label: "Card Security", desc: "Manage security options", icon: <Shield size={18} />, route: "/customer/cards/security", color: "bg-emerald-50 text-emerald-600" },
              { label: "Virtual Cards", desc: "Create & manage virtual cards", icon: <Smartphone size={18} />, route: "/customer/cards/virtual", color: "bg-violet-50 text-violet-600" },
            ].map((action) => (
              <motion.button
                key={action.label}
                onClick={() => navigate(action.route)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`p-2.5 rounded-xl ${action.color}`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </motion.button>
            ))}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Cards;

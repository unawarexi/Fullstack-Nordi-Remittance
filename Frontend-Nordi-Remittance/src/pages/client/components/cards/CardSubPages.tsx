// ============================================================================
// CARDS SUB-PAGES — Overview, Transactions, Apply, Security, Virtual
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CreditCard, Shield, Snowflake, Settings, Smartphone, Plus,
  Eye, EyeOff, Lock, Bell, ChevronRight, CheckCircle2,
  ArrowUpRight, ArrowDownLeft, Clock, AlertTriangle,
  Wifi, Globe, Fingerprint,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { CreditCardSkeleton, TransactionListSkeleton, FormSkeleton, StatsGridSkeleton } from "@components/skeletons";
import { useCards, useCardTransactions } from "@hooks/queries/useCards";
import { useUIStore } from "@store/ui.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const fmt = (n: number, c = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

// ========================
// CARDS OVERVIEW
// ========================
export const CardsOverview: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: cardsData, isLoading } = useCards();
  const cards = cardsData?.data || [];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="My Cards" subtitle="View and manage all your cards"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Cards", href: "/customer/cards" }, { label: "Overview" }]}
          actions={
            <motion.button onClick={() => navigate("/customer/cards/apply")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Plus size={16} /> New Card
            </motion.button>
          } />
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1, 2].map(i => <CreditCardSkeleton key={i} />)}</div>
      ) : cards.length === 0 ? (
        <EmptyState title="No Cards" description="Apply for your first card." action={{ label: "Apply", onClick: () => navigate("/customer/cards/apply") }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card: any, i: number) => (
            <motion.div key={card._id || i} className="bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800 rounded-2xl p-6 text-white shadow-xl" variants={itemVariants} whileHover={{ y: -4 }}>
              <div className="flex justify-between items-start mb-6">
                <div><p className="text-xs text-indigo-200">{(card.type || "DEBIT").toUpperCase()}</p><p className="text-sm font-medium">{card.name || "Primary Card"}</p></div>
                <Wifi size={20} className="rotate-90 opacity-70" />
              </div>
              <p className="text-lg font-mono tracking-wider mb-6">{show ? `•••• •••• •••• ${(card.cardNumber || card.number || "0000").slice(-4)}` : "•••• •••• •••• ••••"}</p>
              <div className="flex justify-between">
                <div><p className="text-xs text-indigo-200">HOLDER</p><p className="text-sm">{card.holderName || "ACCOUNT HOLDER"}</p></div>
                <div><p className="text-xs text-indigo-200">EXPIRES</p><p className="text-sm">{card.expiryDate || "••/••"}</p></div>
                <div><p className="text-xs text-indigo-200">BALANCE</p><p className="text-sm font-semibold">{show ? fmt(card.balance || 0) : "••••••"}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ========================
// CARD TRANSACTIONS
// ========================
export const CardTransactions: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: cardsData } = useCards();
  const cards = cardsData?.data || [];
  const firstCardId = (cards[0] as any)?._id || cards[0]?.id || "";
  const { data: txData, isLoading } = useCardTransactions(firstCardId);
  const transactions = txData?.data || [];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Card Transactions" subtitle="View all transactions from your cards"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Cards", href: "/customer/cards" }, { label: "Transactions" }]} />
      </motion.div>

      {isLoading ? <TransactionListSkeleton count={8} /> : transactions.length === 0 ? (
        <EmptyState title="No Card Transactions" description="Card transactions will appear here once you start using your cards." />
      ) : (
        <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
          <div className="p-4 border-b border-gray-100"><h3 className="font-semibold text-indigo-900">Card Transactions</h3></div>
          <div className="divide-y divide-gray-50">
            {transactions.map((tx: any, i: number) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3.5 hover:bg-indigo-50/30 transition-colors">
                <div className={`p-2 rounded-full ${tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"}`}>
                  {tx.type === "credit" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.description || tx.merchant || "Transaction"}</p>
                  <p className="text-xs text-gray-500">{tx.createdAt && new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-semibold ${tx.type === "credit" ? "text-emerald-600" : "text-gray-900"}`}>
                  {show ? fmt(tx.amount || 0) : "••••••"}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// APPLY FOR CARD
// ========================
export const ApplyForCard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("");

  const cardTypes = [
    { type: "debit", name: "Debit Card", desc: "Linked to your account balance", icon: <CreditCard size={24} />, color: "from-indigo-500 to-purple-600", features: ["No annual fee", "ATM withdrawals", "Online payments"] },
    { type: "credit", name: "Credit Card", desc: "Build credit with flexible payments", icon: <CreditCard size={24} />, color: "from-gray-800 to-black", features: ["Cashback rewards", "Travel insurance", "0% intro APR"] },
    { type: "virtual", name: "Virtual Card", desc: "Instant digital card for online use", icon: <Smartphone size={24} />, color: "from-purple-600 to-violet-700", features: ["Instant activation", "Disposable numbers", "Enhanced security"] },
    { type: "platinum", name: "Platinum Card", desc: "Premium banking experience", icon: <CreditCard size={24} />, color: "from-slate-600 to-slate-900", features: ["Airport lounge access", "Concierge service", "Higher limits"] },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Apply for New Card" subtitle="Choose the card that fits your lifestyle"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Cards", href: "/customer/cards" }, { label: "Apply" }]} />
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl" variants={containerVariants}>
        {cardTypes.map((card) => (
          <motion.div key={card.type} variants={itemVariants}
            className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all border-2 ${selectedType === card.type ? "border-indigo-500 shadow-md" : "border-transparent hover:shadow-md"}`}
            whileHover={{ y: -4 }} onClick={() => setSelectedType(card.type)}>
            <div className={`bg-gradient-to-r ${card.color} p-6 text-white`}>
              <div className="flex items-center gap-3 mb-2">{card.icon}<h3 className="text-lg font-semibold">{card.name}</h3></div>
              <p className="text-sm opacity-80">{card.desc}</p>
            </div>
            <div className="p-5">
              <ul className="space-y-2">
                {card.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 size={14} className="text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <motion.button
                className={`w-full mt-4 py-2.5 rounded-lg text-sm font-medium transition-all ${selectedType === card.type ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                whileTap={{ scale: 0.98 }}>
                {selectedType === card.type ? "Selected ✓" : "Select"}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {selectedType && (
        <motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Continue Application →
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// CARD SECURITY
// ========================
export const CardSecurity: React.FC = () => {
  const { data: cardsData, isLoading } = useCards();
  const cards = cardsData?.data || [];

  const securityOptions = [
    { label: "Freeze Card", desc: "Temporarily disable your card", icon: <Snowflake size={18} />, color: "bg-blue-50 text-blue-600", toggle: true },
    { label: "Online Transactions", desc: "Enable/disable online payments", icon: <Globe size={18} />, color: "bg-indigo-50 text-indigo-600", toggle: true },
    { label: "International Transactions", desc: "Allow usage abroad", icon: <Globe size={18} />, color: "bg-purple-50 text-purple-600", toggle: true },
    { label: "Contactless Payments", desc: "Tap to pay functionality", icon: <Wifi size={18} />, color: "bg-emerald-50 text-emerald-600", toggle: true },
    { label: "Transaction Alerts", desc: "Get notified for every transaction", icon: <Bell size={18} />, color: "bg-amber-50 text-amber-600", toggle: true },
    { label: "Change PIN", desc: "Update your card PIN", icon: <Lock size={18} />, color: "bg-rose-50 text-rose-600", toggle: false },
    { label: "Biometric Auth", desc: "Use fingerprint for transactions", icon: <Fingerprint size={18} />, color: "bg-violet-50 text-violet-600", toggle: true },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Card Security" subtitle="Manage security settings for your cards"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Cards", href: "/customer/cards" }, { label: "Security" }]} />
      </motion.div>

      <motion.div className="max-w-2xl space-y-3" variants={containerVariants}>
        {securityOptions.map((opt) => (
          <motion.div key={opt.label} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4" variants={itemVariants} whileHover={{ x: 3 }}>
            <div className={`p-2.5 rounded-xl ${opt.color}`}>{opt.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </div>
            {opt.toggle ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            ) : (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// ========================
// VIRTUAL CARDS
// ========================
export const VirtualCards: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data: cardsData, isLoading } = useCards();
  const virtualCards = (cardsData?.data || []).filter((c: any) => c.isVirtual || c.type === "virtual");

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Virtual Cards" subtitle="Create and manage virtual cards for online payments"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Cards", href: "/customer/cards" }, { label: "Virtual" }]}
          actions={
            <motion.button onClick={() => navigate("/customer/cards/apply")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Plus size={16} /> Create Virtual Card
            </motion.button>
          } />
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1, 2].map(i => <CreditCardSkeleton key={i} />)}</div>
      ) : virtualCards.length === 0 ? (
        <EmptyState title="No Virtual Cards" description="Create an instant virtual card for secure online payments."
          action={{ label: "Create Virtual Card", onClick: () => navigate("/customer/cards/apply") }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {virtualCards.map((card: any, i: number) => (
            <motion.div key={i} className="bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl" variants={itemVariants} whileHover={{ y: -4 }}>
              <div className="flex justify-between items-start mb-6">
                <div><p className="text-xs text-purple-200">VIRTUAL CARD</p><p className="text-sm font-medium">{card.name || "Virtual Card"}</p></div>
                <Smartphone size={20} className="opacity-70" />
              </div>
              <p className="text-lg font-mono tracking-wider mb-4">{show ? `•••• •••• •••• ${(card.cardNumber || "0000").slice(-4)}` : "•••• •••• •••• ••••"}</p>
              <div className="flex justify-between">
                <div><p className="text-xs text-purple-200">EXPIRES</p><p className="text-sm">{card.expiryDate || "••/••"}</p></div>
                <div><p className="text-xs text-purple-200">LIMIT</p><p className="text-sm font-semibold">{show ? fmt(card.limit || 0) : "••••••"}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DashCard, SectionHeader } from "@components/shared/DashboardPrimitives";
import { SkeletonBlock } from "@components/skeletons/Skeletons";
import { FiWifi } from "react-icons/fi";
import { ChevronLeft, ChevronRight, Plus, Snowflake } from "lucide-react";
import { formatCurrency } from "@core/algo";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// CARD GRADIENTS
// ============================================================================
const CARD_GRADIENTS = [
  "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950",
  "bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800",
  "bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-800",
  "bg-gradient-to-br from-rose-700 via-pink-600 to-fuchsia-800",
  "bg-gradient-to-br from-amber-700 via-orange-600 to-red-800",
];

// ============================================================================
// CHIP SVG
// ============================================================================
const CardChip: React.FC = () => (
  <svg width="36" height="28" viewBox="0 0 36 28" fill="none" className="drop-shadow-sm">
    <rect x="0.5" y="0.5" width="35" height="27" rx="4" fill="#d4af37" stroke="#c4a030" strokeWidth="0.5" />
    <rect x="4" y="4" width="12" height="8" rx="1" fill="#c4a030" opacity="0.5" />
    <rect x="20" y="4" width="12" height="8" rx="1" fill="#c4a030" opacity="0.5" />
    <rect x="4" y="16" width="12" height="8" rx="1" fill="#c4a030" opacity="0.5" />
    <rect x="20" y="16" width="12" height="8" rx="1" fill="#c4a030" opacity="0.5" />
    <line x1="18" y1="0" x2="18" y2="28" stroke="#c4a030" strokeWidth="0.5" opacity="0.4" />
    <line x1="0" y1="14" x2="36" y2="14" stroke="#c4a030" strokeWidth="0.5" opacity="0.4" />
  </svg>
);

// ============================================================================
// BRAND LOGO
// ============================================================================
const CardBrand: React.FC<{ isVirtual?: boolean }> = ({ isVirtual }) => {
  if (isVirtual) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-5 h-5 rounded-full bg-blue-400/60" />
        <div className="w-5 h-5 rounded-full bg-cyan-300/60 -ml-2.5" />
        <span className="text-[8px] text-white/60 ml-1 font-medium tracking-wider">VIRTUAL</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0">
      <div className="w-6 h-6 rounded-full bg-red-500/80" />
      <div className="w-6 h-6 rounded-full bg-amber-400/80 -ml-2" />
    </div>
  );
};

// ============================================================================
// SINGLE CARD
// ============================================================================
const CreditCard: React.FC<{ card: CardItem; index: number }> = ({ card, index }) => {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const isFrozen = card.status === "frozen";

  return (
    <motion.div
      className={`relative w-full aspect-[1.6/1] rounded-2xl p-4 sm:p-5 overflow-hidden select-none ${gradient} shadow-xl`}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.35 }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full" />
      <div className="absolute -bottom-16 -left-8 w-48 h-48 bg-white/5 rounded-full" />

      {/* Frozen overlay */}
      {isFrozen && (
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-blue-950/60 px-3 py-1.5 rounded-full">
            <Snowflake size={14} className="text-blue-300" />
            <span className="text-xs font-medium text-blue-200">Frozen</span>
          </div>
        </div>
      )}

      {/* Top row: chip + contactless + brand */}
      <div className="flex justify-between items-start relative z-20">
        <div className="flex items-center gap-2.5">
          <CardChip />
          <FiWifi size={16} className="text-white/50 rotate-90" />
        </div>
        <CardBrand isVirtual={card.isVirtual} />
      </div>

      {/* Card number */}
      <div className="mt-4 sm:mt-5 relative z-20">
        <p className="text-sm sm:text-base font-mono tracking-[0.22em] text-white/90">
          •••• •••• •••• {card.lastFour}
        </p>
      </div>

      {/* Bottom row: name + expiry */}
      <div className="flex justify-between items-end mt-3 sm:mt-4 relative z-20">
        <div>
          <p className="text-[8px] sm:text-[9px] text-white/40 uppercase tracking-widest mb-0.5">
            Card Holder
          </p>
          <p className="text-xs sm:text-sm font-medium text-white/90 tracking-wide uppercase">
            {card.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[8px] sm:text-[9px] text-white/40 uppercase tracking-widest mb-0.5">
            Expires
          </p>
          <p className="text-xs sm:text-sm font-medium text-white/90 font-mono">
            {card.expiryDate}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// SPEND BAR
// ============================================================================
const SpendBar: React.FC<{ card: CardItem }> = ({ card }) => {
  const pct = card.spendLimit > 0 ? Math.min((card.usedAmount / card.spendLimit) * 100, 100) : 0;
  const isHigh = pct >= 80;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] sm:text-xs mb-1">
        <span className="text-gray-500 dark:text-gray-400">Monthly Spend</span>
        <span className={`font-medium ${isHigh ? "text-rose-600 dark:text-rose-400" : "text-gray-700 dark:text-gray-300"}`}>
          {formatCurrency(card.usedAmount)} / {formatCurrency(card.spendLimit)}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isHigh ? "bg-rose-500" : "bg-indigo-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
interface ClientCardsPanelProps {
  cards: CardItem[];
  cardsData: ClientCardsDetailData;
  isLoading: boolean;
}

const ClientCardsPanel: React.FC<ClientCardsPanelProps> = ({ cards, cardsData, isLoading }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return (
      <DashCard className="flex-1">
        <SkeletonBlock className="h-5 w-36 mb-4" />
        <SkeletonBlock className="h-40 w-full rounded-2xl mb-3" />
        <SkeletonBlock className="h-3 w-full" />
      </DashCard>
    );
  }

  const hasCards = cards.length > 0;
  const currentCard = hasCards ? cards[activeIndex] : null;

  const prev = () => setActiveIndex((i) => (i === 0 ? cards.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === cards.length - 1 ? 0 : i + 1));

  return (
    <DashCard className="flex-1">
      <SectionHeader
        title="My Cards"
        subtitle={`${cardsData.totalCards} card${cardsData.totalCards !== 1 ? "s" : ""} · ${cardsData.activeCards} active`}
        onActionClick={() => navigate("/customer/cards")}
        actionLabel="Manage"
      />

      {hasCards ? (
        <>
          {/* Card Carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <CreditCard key={currentCard!.id} card={currentCard!} index={activeIndex} />
            </AnimatePresence>

            {/* Navigation arrows */}
            {cards.length > 1 && (
              <>
                <motion.button
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-30"
                  whileTap={{ scale: 0.85 }}
                  onClick={prev}
                >
                  <ChevronLeft size={14} className="text-white" />
                </motion.button>
                <motion.button
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-30"
                  whileTap={{ scale: 0.85 }}
                  onClick={next}
                >
                  <ChevronRight size={14} className="text-white" />
                </motion.button>
              </>
            )}
          </div>

          {/* Dots */}
          {cards.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {cards.map((_, i) => (
                <button
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-5 bg-indigo-500"
                      : "w-1.5 bg-gray-300 dark:bg-gray-600"
                  }`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}

          {/* Spend Bar */}
          {currentCard && <SpendBar card={currentCard} />}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{cardsData.activeCards}</p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400">Active</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-sky-50 dark:bg-sky-950/30">
              <p className="text-sm font-bold text-sky-700 dark:text-sky-400">{cardsData.frozenCards}</p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400">Frozen</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30">
              <p className="text-sm font-bold text-purple-700 dark:text-purple-400">{formatCurrency(cardsData.totalSpending)}</p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400">Total Spent</p>
            </div>
          </div>
        </>
      ) : (
        <motion.div
          className="flex flex-col items-center justify-center py-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <Plus size={24} className="text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No cards yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Add your first card to get started</p>
          <motion.button
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg"
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/customer/cards")}
          >
            Add Card
          </motion.button>
        </motion.div>
      )}
    </DashCard>
  );
};

export default ClientCardsPanel;

// ============================================================================
// CARDS — Main Hub / Manager
// The landing page for /customer/cards: card carousel, quick actions
// (fund / withdraw / freeze), and a tabbed at-a-glance summary.
// Deep management (limits, controls, full transaction history) lives in the
// dedicated sub-pages this links out to — this page stays a fast overview.
// Strictly consumes domain hooks without raw logic in the UI component.
// ============================================================================

import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Unlock,
  ShieldCheck,
  Receipt,
  X,
  Loader2,
  Globe,
  Wifi,
  DollarSign,
  ArrowRight,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { CreditCardSkeleton, StatsGridSkeleton, TransactionListSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useMainCardManagerDomain, useClientCardTransactions } from "../../client-usecase/useCards-client-usecase";
import {
  CardFace,
  CardStatusPill,
  fmt,
  fmtDate,
  isCreditTxn,
  isFreezeable,
  isFundable,
  txnTypeLabel,
} from "@pages/client/components/card-ui-utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Recent Activity" },
  { id: "security", label: "Security" },
] as const;

const Cards: React.FC = () => {
  const {
    cards,
    isLoading,
    showBalances,
    selectedCard,
    setSelectedCard,
    activeTab,
    setActiveTab,
    activeCard,
    activeCardId,
    isFrozen,
    modalType,
    modalAmount,
    setModalAmount,
    modalNotes,
    setModalNotes,
    isModalPending,
    isFreezePending,
    handleOpenModal,
    handleCloseModal,
    handleToggleFreeze,
    handleModalSubmit,
  } = useMainCardManagerDomain();

  const { transactions, isLoading: txnsLoading } = useClientCardTransactions(activeCardId);

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="My Cards"
          subtitle="A quick view of every card on your account, plus fast actions for the one you're using."
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Cards" }]}
          actions={
            <Link
              to="/customer/cards/apply"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-md transition hover:bg-indigo-700 sm:px-4 sm:text-sm"
            >
              <Plus size={16} /> Apply for New Card
            </Link>
          }
        />
      </motion.div>

      {isLoading ? (
        <>
          <CreditCardSkeleton />
          <StatsGridSkeleton count={3} />
        </>
      ) : cards.length === 0 ? (
        <EmptyState
          title="No Cards Yet"
          description="Apply for a virtual or physical card to start spending directly from your wallet."
          action={{ label: "Apply for a Card", onClick: () => (window.location.href = "/customer/cards/apply") }}
        />
      ) : (
        <div className="my-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ─── Left: card carousel + quick actions ─── */}
          <motion.div variants={dashboardItemVariants} className="space-y-4 lg:col-span-5">
            <div className="relative">
              <CardFace card={activeCard} show={showBalances} />
              {cards.length > 1 && (
                <>
                  <button
                    aria-label="Previous card"
                    onClick={() => setSelectedCard((selectedCard - 1 + cards.length) % cards.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white transition hover:bg-black/50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    aria-label="Next card"
                    onClick={() => setSelectedCard((selectedCard + 1) % cards.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white transition hover:bg-black/50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center justify-between px-1">
              <CardStatusPill status={activeCard.status} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {activeCard.isPhysical ? "Physical" : "Virtual"} • {(activeCard.cardBrand || "").toUpperCase()}
              </span>
            </div>

            {cards.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {cards.map((c: any, i: number) => (
                  <button
                    key={c.id || i}
                    onClick={() => setSelectedCard(i)}
                    className={`shrink-0 rounded-xl border-2 px-3 py-2 text-[11px] font-semibold transition-all ${
                      i === selectedCard
                        ? "border-indigo-600 bg-indigo-50/60 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                        : "border-gray-100 text-gray-500 hover:border-gray-200 dark:border-gray-800 dark:text-gray-400 dark:hover:border-gray-700"
                    }`}
                  >
                    •••• {c.last4}
                  </button>
                ))}
              </div>
            )}

            {activeCard.status === "pending_activation" && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                <ShieldCheck className="mt-0.5 shrink-0 text-amber-500" size={18} />
                <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                  This card is on its way and needs activation once it arrives. You'll need the last 4 digits and CVV
                  printed on the card.
                </p>
              </div>
            )}

            {/* Quick actions */}
            <DashCard className="border border-gray-100 shadow-sm dark:border-gray-800">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOpenModal("fund")}
                  disabled={!isFundable(activeCard.status)}
                  className="flex items-center gap-2.5 rounded-xl border-2 border-gray-100 p-3.5 text-left transition-all hover:border-emerald-200 disabled:opacity-40 disabled:hover:border-gray-100 dark:border-gray-800 dark:hover:border-emerald-900"
                >
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <ArrowDownLeft size={16} />
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Add Money</span>
                </button>

                <button
                  onClick={() => handleOpenModal("withdraw")}
                  disabled={!isFundable(activeCard.status) || (activeCard.balance || 0) <= 0}
                  className="flex items-center gap-2.5 rounded-xl border-2 border-gray-100 p-3.5 text-left transition-all hover:border-indigo-200 disabled:opacity-40 disabled:hover:border-gray-100 dark:border-gray-800 dark:hover:border-indigo-900"
                >
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <ArrowUpRight size={16} />
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Withdraw</span>
                </button>

                <button
                  onClick={handleToggleFreeze}
                  disabled={!isFreezeable(activeCard.status) || isFreezePending}
                  className="flex items-center gap-2.5 rounded-xl border-2 border-gray-100 p-3.5 text-left transition-all hover:border-amber-200 disabled:opacity-40 disabled:hover:border-gray-100 dark:border-gray-800 dark:hover:border-amber-900"
                >
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    {isFreezePending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isFrozen ? (
                      <Unlock size={16} />
                    ) : (
                      <Lock size={16} />
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {isFrozen ? "Unfreeze" : "Freeze"}
                  </span>
                </button>

                <Link
                  to="/customer/cards/security"
                  className="flex items-center gap-2.5 rounded-xl border-2 border-gray-100 p-3.5 text-left transition-all hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                >
                  <div className="rounded-lg bg-gray-50 p-2 text-gray-500 dark:bg-gray-800">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">Security</span>
                </Link>
              </div>
            </DashCard>
          </motion.div>

          {/* ─── Right: tabbed summary ─── */}
          <motion.div variants={dashboardItemVariants} className="lg:col-span-7">
            <DashCard padding="none" className="border border-gray-100 shadow-sm dark:border-gray-800/80">
              <div className="flex items-center border-b border-gray-100 px-2 dark:border-gray-800">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-3.5 text-xs font-bold transition-colors sm:text-sm ${
                      activeTab === tab.id
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.span
                        layoutId="cards-hub-tab"
                        className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/40">
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            {activeCard.cardType === "credit" ? "Credit Limit" : "Available Balance"}
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {showBalances
                              ? fmt(
                                  activeCard.cardType === "credit" ? activeCard.creditLimit : activeCard.balance,
                                  activeCard.currency,
                                )
                              : "••••••"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/40">
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Cardholder
                          </p>
                          <p className="truncate text-lg font-bold text-gray-900 dark:text-white">
                            {activeCard.cardholderName || "—"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Enabled Channels
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { on: activeCard.isOnlineEnabled, label: "Online", icon: Globe },
                            { on: activeCard.isInternationalEnabled, label: "International", icon: Globe },
                            { on: activeCard.isContactlessEnabled, label: "Contactless", icon: Wifi },
                            { on: activeCard.isAtmEnabled, label: "ATM", icon: DollarSign },
                          ].map((c) => (
                            <span
                              key={c.label}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${
                                c.on
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                              }`}
                            >
                              <c.icon size={12} /> {c.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {activeCard.isPhysical && activeCard.billingAddress?.city && (
                        <div>
                          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Shipping Address
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {activeCard.billingAddress.street}, {activeCard.billingAddress.city},{" "}
                            {activeCard.billingAddress.country}
                          </p>
                        </div>
                      )}

                      <Link
                        to="/customer/cards/overview"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 transition-all hover:gap-2.5 dark:text-indigo-400"
                      >
                        View all cards <ArrowRight size={14} />
                      </Link>
                    </motion.div>
                  )}

                  {activeTab === "transactions" && (
                    <motion.div
                      key="transactions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {txnsLoading ? (
                        <TransactionListSkeleton count={4} />
                      ) : transactions.length === 0 ? (
                        <div className="py-10 text-center">
                          <Receipt className="mx-auto mb-3 text-gray-300 dark:text-gray-700" size={32} />
                          <p className="text-sm text-gray-500 dark:text-gray-400">No activity on this card yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {transactions.slice(0, 5).map((tx: any, i: number) => (
                            <div key={tx._id || i} className="flex items-center justify-between py-3">
                              <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">
                                  {tx.merchantName ||
                                    txnTypeLabel[tx.transactionType as keyof typeof txnTypeLabel] ||
                                    "Card Transaction"}
                                </p>
                                <p className="mt-0.5 text-[11px] text-gray-400">{fmtDate(tx.createdAt)}</p>
                              </div>
                              <p
                                className={`text-xs font-extrabold sm:text-sm ${isCreditTxn(tx.transactionType) ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                              >
                                {isCreditTxn(tx.transactionType) ? "+" : "-"}
                                {showBalances ? fmt(Math.abs(tx.amount || 0), tx.currency) : "••••••"}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      <Link
                        to="/customer/cards/transactions"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 transition-all hover:gap-2.5 dark:text-indigo-400"
                      >
                        View full history <ArrowRight size={14} />
                      </Link>
                    </motion.div>
                  )}

                  {activeTab === "security" && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        A read-only snapshot for this card. Head to Security to change any of these controls.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Online Transactions", on: activeCard.isOnlineEnabled },
                          { label: "International", on: activeCard.isInternationalEnabled },
                          { label: "Contactless", on: activeCard.isContactlessEnabled },
                          { label: "ATM Withdrawals", on: activeCard.isAtmEnabled },
                        ].map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/40"
                          >
                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                              {row.label}
                            </span>
                            <span
                              className={`h-2 w-2 rounded-full ${row.on ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}
                            />
                          </div>
                        ))}
                      </div>
                      <Link
                        to="/customer/cards/security"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 transition-all hover:gap-2.5 dark:text-indigo-400"
                      >
                        Manage security settings <ArrowRight size={14} />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </DashCard>
          </motion.div>
        </div>
      )}

      {/* Fund / Withdraw Modal */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                  {modalType === "fund" ? (
                    <ArrowDownLeft size={20} className="text-emerald-500" />
                  ) : (
                    <ArrowUpRight size={20} className="text-indigo-500" />
                  )}
                  {modalType === "fund" ? "Add Money to Card" : "Withdraw to Wallet"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4 p-6">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      {activeCard.currency === "USD" || !activeCard.currency ? "$" : activeCard.currency}
                    </span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={modalAmount}
                      onChange={(e) => setModalAmount(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  {modalType === "withdraw" && (
                    <p className="mt-1.5 text-[11px] text-gray-400">
                      Available on card: {fmt(activeCard.balance, activeCard.currency)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Note (optional)
                  </label>
                  <input
                    type="text"
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                    placeholder="What's this for?"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isModalPending}
                  className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isModalPending ? "Processing..." : modalType === "fund" ? "Add Money" : "Withdraw to Wallet"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default Cards;

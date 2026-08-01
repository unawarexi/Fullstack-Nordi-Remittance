// ============================================================================
// CARDS SUB-PAGE — Card Transactions
// Strictly consumes domain hook without raw logic in UI component
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, CreditCard, ArrowDownLeft, Landmark, Receipt } from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { TransactionListSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useCardTransactionsPageDomain } from "../../client-usecase/useCards-client-usecase";
import { fmt, fmtDate, isCreditTxn, txnTypeLabel } from "@pages/client/components/card-ui-utils";
import type { CardTransactionType, CardTransactionStatus } from "@domain/types/Card.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TXN_ICON: Record<CardTransactionType, any> = {
  purchase: ShoppingBag,
  refund: ArrowDownLeft,
  withdrawal: Landmark,
  cash_advance: ArrowDownLeft,
  fee: Receipt,
  interest: Receipt,
};

const STATUS_STYLE: Record<CardTransactionStatus, string> = {
  completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  declined: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  reversed: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

const CardTransactions: React.FC = () => {
  const {
    cards,
    activeCardId,
    setSelectedCardId,
    transactions: txns,
    isLoading,
    showBalances,
  } = useCardTransactionsPageDomain();

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Card Transactions"
          subtitle="Review financial activity and point-of-sale expenditures made with your cards"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards", href: "/customer/cards" },
            { label: "Transactions" },
          ]}
        />
      </motion.div>

      {/* Card Selector Bar if multiple cards exist */}
      {cards.length > 1 && (
        <div className="my-4 flex items-center gap-3 overflow-x-auto pb-2">
          {cards.map((c: any) => {
            const isSelected = c.id === activeCardId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCardId(c.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md"
                    : "dark:hover:bg-gray-750 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                <CreditCard size={15} /> {(c.cardType || "CARD").toUpperCase()} (•••• {c.last4})
              </button>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <TransactionListSkeleton count={8} />
      ) : txns.length === 0 ? (
        <EmptyState
          title="No Card Transactions"
          description="Transactions and POS purchases made with your selected card will appear right here."
        />
      ) : (
        <DashCard padding="none" className="shadow-xs mt-4 border border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
              <CreditCard size={18} className="text-indigo-600 dark:text-indigo-400" /> Card Expenditure History
            </h3>
            <span className="dark:bg-gray-750 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 dark:text-gray-300">
              {txns.length} records
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {txns.map((tx: any, i: number) => {
              const type: CardTransactionType = tx.transactionType || "purchase";
              const Icon = TXN_ICON[type] || ShoppingBag;
              const credit = isCreditTxn(type);
              return (
                <div
                  key={tx._id || i}
                  className="flex items-center justify-between p-3.5 transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/60 sm:p-4"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="shadow-2xs shrink-0 rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-xs font-bold text-gray-900 dark:text-white sm:text-sm">
                        {tx.merchantName || txnTypeLabel[type]}
                      </h4>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs">
                        {fmtDate(tx.createdAt)}
                        {tx.status && tx.status !== "completed" && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${STATUS_STYLE[tx.status as CardTransactionStatus] || ""}`}
                          >
                            {tx.status}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 pl-3 text-xs font-extrabold text-gray-900 dark:text-white sm:text-sm">
                    {showBalances ? (
                      <span
                        className={
                          credit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }
                      >
                        {credit ? "+" : "-"}
                        {fmt(Math.abs(tx.amount || 0), tx.currency)}
                      </span>
                    ) : (
                      "••••••"
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

export default CardTransactions;

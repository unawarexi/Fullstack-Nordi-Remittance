// ============================================================================
// CARDS SUB-PAGE — Overview
// Strictly consumes domain hook without raw logic in UI component
// ============================================================================

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, TrendingUp, Globe, Wifi, DollarSign, ArrowRight } from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, DashCard, StatCard, StatsGrid } from "@components/shared/DashboardPrimitives";
import { CreditCardSkeleton, StatsGridSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useCardsOverviewDomain } from "../../client-usecase/useCards-client-usecase";
import { CardFace, CardStatusPill, fmt, isFundable } from "@pages/client/components/card-ui-utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CONTROL_ICONS: { key: string; icon: any; label: string }[] = [
  { key: "isOnlineEnabled", icon: Globe, label: "Online" },
  { key: "isContactlessEnabled", icon: Wifi, label: "Contactless" },
  { key: "isAtmEnabled", icon: DollarSign, label: "ATM" },
];

const CardsOverview: React.FC = () => {
  const { cards, isLoading, showBalances, activeCardsCount, totalLimit, handleApplyForCard } = useCardsOverviewDomain();

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Cards Overview"
          subtitle="Manage and monitor all your deployed accounts and cards"
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
            <StatCard
              label="Active Cards"
              value={String(activeCardsCount)}
              icon={<CreditCard size={20} />}
              iconColor="from-indigo-500 to-purple-500"
            />
            <StatCard
              label="Total Limit / Balance"
              value={showBalances ? fmt(totalLimit) : "••••••"}
              icon={<TrendingUp size={20} />}
              iconColor="from-emerald-500 to-teal-500"
            />
            <StatCard
              label="Total Cards"
              value={String(cards.length)}
              icon={<CreditCard size={20} />}
              iconColor="from-amber-500 to-orange-500"
            />
          </StatsGrid>

          {cards.length === 0 ? (
            <EmptyState
              title="No Cards Found"
              description="Apply for a card to start making transactions and managing funds."
              action={{ label: "Apply for Card", onClick: handleApplyForCard }}
            />
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card: any, i: number) => (
                <motion.div key={card.id || i} variants={dashboardItemVariants}>
                  <CardFace card={card} show={showBalances} />

                  <DashCard className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <CardStatusPill status={card.status} />
                      <div className="text-right">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {card.cardType === "credit" ? "Credit Limit" : "Balance"}
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {showBalances ? fmt(card.creditLimit || card.balance || 0, card.currency) : "••••••"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-gray-100 pt-2 dark:border-gray-800">
                      {CONTROL_ICONS.map(({ key, icon: Icon, label }) => (
                        <span
                          key={key}
                          title={label}
                          className={`rounded-lg p-1.5 ${
                            card[key]
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600"
                          }`}
                        >
                          <Icon size={13} />
                        </span>
                      ))}
                      <span className="flex-1" />
                      <Link
                        to="/customer/cards/transactions"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 transition-all hover:gap-1.5 dark:text-indigo-400"
                      >
                        Activity <ArrowRight size={11} />
                      </Link>
                    </div>

                    {!isFundable(card.status) && (
                      <p className="pt-1 text-[11px] text-gray-400">
                        This card is {card.status.replace("_", " ")} and can't be funded right now.
                      </p>
                    )}
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

export default CardsOverview;

// ============================================================================
// CARDS SUB-PAGE — Virtual Cards
// Strictly consumes domain hook without raw logic in UI component
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Smartphone, X, Info } from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useVirtualCardsDomain } from "../../client-usecase/useCards-client-usecase";
import { CARD_BRANDS } from "@domain/types/Card.types";
import { CardFace, CardStatusPill, fmtDate } from "@pages/client/components/card-ui-utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

const VirtualCards: React.FC = () => {
  const {
    virtualCards,
    isLoading,
    showBalances,
    isCreating,
    selectedBrand,
    setSelectedBrand,
    cardholderName,
    setCardholderName,
    cardLimitReached,
    handleCreateVirtualCard,
  } = useVirtualCardsDomain();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSubmit = () => {
    handleCreateVirtualCard();
    setIsModalOpen(false);
  };

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Virtual Cards"
          subtitle="Manage your instant digital cards for secure online and e-commerce transactions"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards", href: "/customer/cards" },
            { label: "Virtual" },
          ]}
          actions={
            <motion.button
              onClick={() => setIsModalOpen(true)}
              disabled={cardLimitReached}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-xs font-medium text-white shadow-md transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 sm:px-4 sm:text-sm"
              whileHover={{ scale: cardLimitReached ? 1 : 1.02 }}
              whileTap={{ scale: cardLimitReached ? 1 : 0.98 }}
            >
              <Plus size={16} /> Create Virtual Card
            </motion.button>
          }
        />
      </motion.div>

      {cardLimitReached && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
          <Info className="mt-0.5 shrink-0 text-amber-500" size={18} />
          <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
            You've reached the maximum of 5 cards on this account. Cancel an existing card before creating another.
          </p>
        </div>
      )}

      {isLoading ? (
        <StatsGridSkeleton count={2} />
      ) : virtualCards.length === 0 ? (
        <DashCard className="border border-gray-100 py-12 text-center dark:border-gray-800">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
            <Smartphone size={28} />
          </div>
          <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
            Create Your First Virtual Card
          </h3>
          <p className="mx-auto mb-6 max-w-md text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Virtual cards provide enhanced fraud isolation for subscriptions and online shopping. Create one instantly
            to begin.
          </p>
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Virtual Card
          </motion.button>
        </DashCard>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {virtualCards.map((card: any, i: number) => (
            <motion.div key={card.id || i} variants={dashboardItemVariants}>
              <CardFace card={card} show={showBalances} />
              <DashCard className="mt-3 p-4">
                <div className="flex items-center justify-between">
                  <CardStatusPill status={card.status} />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created {fmtDate(card.createdAt)}</p>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                  <Smartphone size={20} className="text-emerald-500" /> New Virtual Card
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Cardholder Name (optional)
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Defaults to your account name"
                  className="mb-5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                />

                <p className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Select Payment Network</p>
                <div className="mb-6 grid grid-cols-3 gap-3">
                  {CARD_BRANDS.filter((b) => b.id !== "discover").map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand.id)}
                      className={`flex flex-col items-center rounded-xl border-2 p-3 transition-all ${
                        selectedBrand === brand.id
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                          : "border-gray-100 hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                      }`}
                    >
                      <img src={brand.icon} alt={brand.name} className="mb-2 h-8 object-contain" />
                      <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">{brand.name}</span>
                    </button>
                  ))}
                </div>

                <div className="mb-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Issuance Fee</span>
                    <span className="font-bold text-gray-900 dark:text-white">Free</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Monthly Limit</span>
                    <span className="font-bold text-gray-900 dark:text-white">$5,000.00</span>
                  </div>
                </div>

                <motion.button
                  onClick={onSubmit}
                  disabled={isCreating}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isCreating ? "Generating Details..." : "Deploy Virtual Card"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default VirtualCards;

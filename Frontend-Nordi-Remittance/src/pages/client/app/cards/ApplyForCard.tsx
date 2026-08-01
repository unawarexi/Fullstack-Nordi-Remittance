// ============================================================================
// CARDS SUB-PAGE — Apply For Card
// Strictly consumes domain hook without raw logic in UI component
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Shield, Smartphone, MapPin, AlertTriangle } from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useApplyForCardDomain } from "../../client-usecase/useCards-client-usecase";
import { CARD_BRANDS } from "@domain/types/Card.types";
import { BRAND_GRADIENT, fmt } from "@pages/client/components/card-ui-utils";

const ApplyForCard: React.FC = () => {
  const {
    handleApply,
    isApplying,
    selectedBrand,
    setSelectedBrand,
    cardholderName,
    setCardholderName,
    shippingAddress,
    setShippingAddress,
    activeWallet,
    hasExistingPhysicalCard,
    cardLimitReached,
    hasSufficientFundsForPhysical,
    issuanceFee,
  } = useApplyForCardDomain();

  const [activeType, setActiveType] = useState<"virtual" | "physical">("virtual");

  const addressComplete = !!shippingAddress.street && !!shippingAddress.city && !!shippingAddress.country;

  const physicalBlockedReason = cardLimitReached
    ? "You've reached the 5-card limit on this account."
    : hasExistingPhysicalCard
      ? "You already have a physical card on this account."
      : !hasSufficientFundsForPhysical
        ? `Your wallet needs at least ${fmt(issuanceFee, activeWallet?.currency)} to cover the issuance fee.`
        : null;

  const canSubmit = !cardLimitReached && (activeType === "virtual" || (!physicalBlockedReason && addressComplete));

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Apply for a New Card"
          subtitle="Configure and request your next digital or physical premium card instantly."
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards", href: "/customer/cards" },
            { label: "Apply" },
          ]}
        />
      </motion.div>

      {cardLimitReached && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={18} />
          <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
            You've reached the maximum of 5 cards on this account. Cancel an existing card from Cards Overview before
            applying for a new one.
          </p>
        </div>
      )}

      <div className="my-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Configuration */}
        <motion.div variants={dashboardItemVariants} className="space-y-6 lg:col-span-7">
          {/* Card Type Selection */}
          <DashCard className="border border-gray-100 p-6 shadow-sm dark:border-gray-800">
            <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">1. Select Card Type</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => setActiveType("virtual")}
                className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                  activeType === "virtual"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "border-gray-100 hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                }`}
              >
                <div
                  className={`shrink-0 rounded-xl p-2 ${activeType === "virtual" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}
                >
                  <Smartphone size={20} />
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-900 dark:text-white">Virtual Card</span>
                  <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                    Instant digital issuance for immediate online spending.
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveType("physical")}
                disabled={cardLimitReached || hasExistingPhysicalCard}
                className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                  activeType === "physical"
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20"
                    : "border-gray-100 hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                }`}
              >
                <div
                  className={`shrink-0 rounded-xl p-2 ${activeType === "physical" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <span className="block text-sm font-bold text-gray-900 dark:text-white">Physical Card</span>
                  <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                    Premium plastic card shipped to your address · {fmt(issuanceFee, activeWallet?.currency)} issuance
                    fee.
                  </span>
                </div>
              </button>
            </div>

            {activeType === "physical" && physicalBlockedReason && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3.5 dark:border-red-900/40 dark:bg-red-950/30">
                <AlertTriangle className="mt-0.5 shrink-0 text-red-500" size={15} />
                <p className="text-xs text-red-600 dark:text-red-400">{physicalBlockedReason}</p>
              </div>
            )}
          </DashCard>

          {/* Card Brand Selection */}
          <DashCard className="border border-gray-100 p-6 shadow-sm dark:border-gray-800">
            <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">2. Select Payment Network</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CARD_BRANDS.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all ${
                    selectedBrand === brand.id
                      ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10"
                      : "border-gray-100 hover:border-gray-200 dark:border-gray-800 dark:hover:border-gray-700"
                  }`}
                >
                  <img src={brand.icon} alt={brand.name} className="mb-3 h-8 object-contain" />
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{brand.name}</span>
                </button>
              ))}
            </div>
          </DashCard>

          {/* Cardholder name — virtual only; physical always uses your account name */}
          {activeType === "virtual" && (
            <DashCard className="border border-gray-100 p-6 shadow-sm dark:border-gray-800">
              <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">3. Cardholder Name (optional)</h3>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Defaults to your account name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
              />
            </DashCard>
          )}

          {/* Shipping Address (Only for Physical) */}
          <AnimatePresence>
            {activeType === "physical" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <DashCard className="border border-gray-100 p-6 shadow-sm dark:border-gray-800">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                    <MapPin size={16} className="text-gray-400" /> 3. Shipping Address
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, street: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                        placeholder="123 Main St, Apt 4B"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        City
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, city: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, state: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, zipCode: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Country
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.country}
                        onChange={(e) => setShippingAddress((p) => ({ ...p, country: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white"
                      />
                    </div>
                  </div>
                </DashCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right Column: Preview & Submit */}
        <motion.div variants={dashboardItemVariants} className="lg:col-span-5">
          <DashCard className="sticky top-6 overflow-hidden border border-gray-100 p-0 shadow-xl dark:border-gray-800">
            {/* Card Preview Graphic */}
            <div
              className={`flex h-48 w-full flex-col justify-between bg-gradient-to-br p-6 text-white transition-colors duration-500 ${BRAND_GRADIENT[selectedBrand]}`}
            >
              <div className="flex items-start justify-between">
                <Shield size={24} className="opacity-80" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">{activeType}</span>
              </div>
              <div>
                <p className="mb-2 font-mono text-xl tracking-widest opacity-90">•••• •••• •••• ••••</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60">Cardholder</p>
                    <p className="text-sm font-bold tracking-wide">{(cardholderName || "YOUR NAME").toUpperCase()}</p>
                  </div>
                  <img
                    src={CARD_BRANDS.find((b) => b.id === selectedBrand)?.icon}
                    alt="Brand"
                    className="h-8 object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Summary</h4>

              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Card Type</span>
                  <span className="font-bold capitalize text-gray-900 dark:text-white">{activeType} Card</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Network</span>
                  <span className="font-bold capitalize text-gray-900 dark:text-white">{selectedBrand}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Issuance Fee</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {activeType === "physical" ? fmt(issuanceFee, activeWallet?.currency) : "Free"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Annual Fee</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Free</span>
                </div>
                {activeWallet && (
                  <div className="flex justify-between border-t border-gray-100 pt-3 text-xs dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Funding Wallet Balance</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {fmt(activeWallet.balance, activeWallet.currency)}
                    </span>
                  </div>
                )}
              </div>

              <motion.button
                onClick={() => handleApply(activeType)}
                disabled={isApplying || !canSubmit}
                className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isApplying ? "Processing Application..." : "Submit Application"}
              </motion.button>

              {activeType === "physical" && !physicalBlockedReason && !addressComplete && (
                <p className="mt-3 text-center text-[11px] font-medium text-red-500">
                  Please fill in your complete shipping address.
                </p>
              )}
            </div>
          </DashCard>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default ApplyForCard;

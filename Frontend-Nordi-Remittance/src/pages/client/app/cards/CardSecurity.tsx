// ============================================================================
// CARDS SUB-PAGE — Card Security & Controls
// Strictly consumes domain hook without raw logic in UI component
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { Lock, Shield, Settings, AlertTriangle, Globe, Wifi, DollarSign, CreditCard } from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useCardSecurityDomain } from "../../client-usecase/useCards-client-usecase";
import { CardStatusPill, isFreezeable } from "@pages/client/components/card-ui-utils";

const CardSecurity: React.FC = () => {
  const {
    cards,
    isLoading,
    activeCard,
    activeCardId,
    setActiveCardId,
    toggles,
    handleToggleOption,
    handleQuickAction,
    isPending,
  } = useCardSecurityDomain();

  const securityOpts = [
    {
      label: "Online Transactions",
      key: "isOnlineEnabled",
      icon: Shield,
      desc: "Allow online and e-commerce transactions across digital merchants",
    },
    {
      label: "International Transactions",
      key: "isInternationalEnabled",
      icon: Globe,
      desc: "Allow card usage in foreign currencies and international terminals",
    },
    {
      label: "Contactless Payments",
      key: "isContactlessEnabled",
      icon: Wifi,
      desc: "Enable NFC tap-to-pay functionality up to designated contactless limit",
    },
    ...(activeCard.isPhysical
      ? [
          {
            label: "ATM Withdrawals",
            key: "isAtmEnabled",
            icon: DollarSign,
            desc: "Enable automated teller machine physical cash withdrawals",
          },
        ]
      : []),
  ];

  const quickActions = [
    {
      label: "Freeze Card",
      icon: Lock,
      color:
        "text-red-500 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/40 border-red-100 dark:border-red-900/30",
    },
    {
      label: "Change PIN",
      icon: Settings,
      color:
        "text-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 border-amber-100 dark:border-amber-900/30",
      requiresPhysical: true,
    },
    {
      label: "Report Lost",
      icon: AlertTriangle,
      color:
        "text-orange-500 bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/40 border-orange-100 dark:border-orange-900/30",
    },
    {
      label: "Set Limits",
      icon: Shield,
      color:
        "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border-indigo-100 dark:border-indigo-900/30",
    },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Card Security & Controls"
          subtitle="Configure real-time security locks, regional permissions, and fraud response controls"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Cards", href: "/customer/cards" },
            { label: "Security" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <FormSkeleton fields={4} />
      ) : cards.length === 0 ? (
        <DashCard className="mt-4 border border-gray-100 py-12 text-center dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Apply for a card to configure security controls.</p>
        </DashCard>
      ) : (
        <>
          {/* Card selector — previously this page silently only ever managed cards[0] */}
          {cards.length > 1 && (
            <div className="my-4 flex items-center gap-3 overflow-x-auto pb-2">
              {cards.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCardId(c.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    c.id === activeCardId
                      ? "bg-indigo-600 text-white shadow-md"
                      : "dark:hover:bg-gray-750 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  <CreditCard size={15} /> {(c.cardType || "card").toUpperCase()} (•••• {c.last4})
                </button>
              ))}
            </div>
          )}

          <div className="my-4 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Managing <span className="font-bold text-gray-700 dark:text-gray-300">•••• {activeCard.last4}</span>
            </p>
            <CardStatusPill status={activeCard.status} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Transaction Permissions */}
            <motion.div variants={dashboardItemVariants}>
              <DashCard className="h-full border border-gray-100 shadow-md dark:border-gray-800/80">
                <h3 className="mb-1 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                  <Shield size={18} className="text-indigo-600 dark:text-indigo-400" /> Transaction Permissions
                </h3>
                <p className="mb-6 text-xs text-gray-500 dark:text-gray-400">
                  Toggle authorization channels for this card. Changes take effect in real time.
                </p>
                <div className="space-y-4">
                  {securityOpts.map((opt) => (
                    <div
                      key={opt.key}
                      className="flex items-center justify-between rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-gray-200 dark:border-gray-700/50 dark:bg-gray-800/40 dark:hover:border-gray-600"
                    >
                      <div className="flex items-start gap-4 pr-4">
                        <div className="rounded-xl bg-gray-50 p-2 text-gray-400 dark:bg-gray-800">
                          <opt.icon size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">{opt.label}</h4>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 sm:text-xs">
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleToggleOption(opt.key)}
                        className={`relative h-7 w-14 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                          toggles[opt.key] ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      >
                        <span
                          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                            toggles[opt.key] ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </DashCard>
            </motion.div>

            {/* Quick Security Actions */}
            <motion.div variants={dashboardItemVariants}>
              <DashCard className="flex h-full flex-col justify-between border border-gray-100 shadow-md dark:border-gray-800/80">
                <div>
                  <h3 className="mb-1 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                    Emergency & Security Controls
                  </h3>
                  <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">
                    Execute immediate protective actions if you suspect compromise or unauthorized expenditures on this
                    card.
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {quickActions.map((action) => {
                      const disabled =
                        isPending ||
                        (action.requiresPhysical && !activeCard.isPhysical) ||
                        (action.label === "Freeze Card" && !isFreezeable(activeCard.status));
                      return (
                        <button
                          key={action.label}
                          disabled={disabled}
                          onClick={() => handleQuickAction(action.label)}
                          className="group flex items-center gap-3.5 rounded-2xl border-2 border-gray-100 bg-white p-4 text-left shadow-sm transition-all hover:border-gray-200 disabled:opacity-50 dark:border-gray-700/50 dark:bg-gray-800/40 dark:hover:border-gray-600"
                        >
                          <div
                            className={`rounded-xl border p-2.5 ${action.color} transition-transform group-hover:scale-105`}
                          >
                            <action.icon size={18} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-900 dark:text-gray-100 sm:text-sm">
                              {action.label === "Freeze Card" && activeCard.status === "blocked"
                                ? "Unfreeze Card"
                                : action.label}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-gray-500">
                              {action.requiresPhysical && !activeCard.isPhysical
                                ? "Physical cards only"
                                : "Execute control command"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
                  <div className="flex gap-3">
                    <AlertTriangle className="mt-0.5 shrink-0 text-blue-500" size={20} />
                    <div>
                      <h4 className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                        Fraud Protection Guarantee
                      </h4>
                      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                        You are completely covered by our Zero Liability guarantee. You won't be held responsible for
                        unauthorized transactions made if you report them promptly.
                      </p>
                    </div>
                  </div>
                </div>
              </DashCard>
            </motion.div>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default CardSecurity;

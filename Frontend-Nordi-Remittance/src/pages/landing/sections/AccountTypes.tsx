// ============================================================================
// ACCOUNT TYPES SECTION - Account comparison cards
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// ACCOUNT DATA
// ========================
interface AccountType {
  id: string;
  name: string;
  tagline: string;
  monthlyFee: string;
  popular?: boolean;
  features: {
    name: string;
    included: boolean;
    value?: string;
  }[];
  color: string;
}

const accounts: AccountType[] = [
  {
    id: "basic",
    name: "Basic Checking",
    tagline: "For everyday banking needs",
    monthlyFee: "$0",
    color: "bg-neutral-500 dark:bg-neutral-400",
    features: [
      { name: "Monthly fee", included: true, value: "Free" },
      { name: "Minimum balance", included: true, value: "None" },
      { name: "Debit card", included: true },
      { name: "Mobile banking", included: true },
      { name: "ATM fee refunds", included: false },
      { name: "Cashback rewards", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    id: "plus",
    name: "Plus Checking",
    tagline: "Enhanced features for active users",
    monthlyFee: "$9.99",
    popular: true,
    color: "bg-indigo-500 dark:bg-indigo-400",
    features: [
      { name: "Monthly fee", included: true, value: "$9.99" },
      { name: "Minimum balance", included: true, value: "None" },
      { name: "Debit card", included: true },
      { name: "Mobile banking", included: true },
      { name: "ATM fee refunds", included: true, value: "Up to $15/mo" },
      { name: "Cashback rewards", included: true, value: "1%" },
      { name: "Priority support", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium Checking",
    tagline: "The ultimate banking experience",
    monthlyFee: "$24.99",
    color: "bg-amber-500 dark:bg-amber-400",
    features: [
      { name: "Monthly fee", included: true, value: "$24.99" },
      { name: "Minimum balance", included: true, value: "None" },
      { name: "Debit card", included: true, value: "Metal card" },
      { name: "Mobile banking", included: true },
      { name: "ATM fee refunds", included: true, value: "Unlimited" },
      { name: "Cashback rewards", included: true, value: "2%" },
      { name: "Priority support", included: true, value: "24/7" },
    ],
  },
];

// ========================
// ACCOUNT CARD COMPONENT
// ========================
interface AccountCardProps {
  account: AccountType;
  index: number;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative flex flex-col rounded-xl overflow-hidden",
      "bg-white dark:bg-neutral-800 border",
      account.popular
        ? "border-indigo-200 dark:border-indigo-700 shadow-lg shadow-indigo-100/50 dark:shadow-indigo-900/50 scale-[1.02]"
        : "border-neutral-100 dark:border-neutral-700"
    )}
  >
    {/* Popular Badge */}
    {account.popular && (
      <div className="absolute top-0 right-0">
        <div className="flex items-center gap-1 px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-bl-lg">
          <Sparkles className="w-3 h-3" />
          Most Popular
        </div>
      </div>
    )}

    {/* Header */}
    <div className="p-4 sm:p-5 pb-3 sm:pb-4">
      <div className={cn("inline-block w-8 sm:w-10 h-1 rounded-full mb-2 sm:mb-3", account.color)} />
      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">{account.name}</h3>
      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">{account.tagline}</p>
      <div className="mt-3 sm:mt-4">
        <span className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">{account.monthlyFee}</span>
        <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">/month</span>
      </div>
    </div>

    {/* Features */}
    <div className="flex-1 px-4 sm:px-5 pb-4 sm:pb-5">
      <div className="border-t border-neutral-100 dark:border-neutral-700 pt-3 sm:pt-4">
        <ul className="space-y-2.5">
          {account.features.map((feature) => (
            <li key={feature.name} className="flex items-center gap-2.5">
              {feature.included ? (
                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-neutral-300 flex-shrink-0" />
              )}
              <span
                className={cn(
                  "text-sm",
                  feature.included ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-400 dark:text-neutral-500"
                )}
              >
                {feature.name}
                {feature.value && feature.included && (
                  <span className="ml-1 font-medium text-neutral-900 dark:text-neutral-100">
                    ({feature.value})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* CTA */}
    <div className="p-4 sm:p-5 pt-0">
      <a
        href={`/accounts/${account.id}`}
        className={cn(
          "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg",
          "text-sm font-medium transition-colors",
          account.popular
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600"
        )}
      >
        Open Account
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const AccountTypes: React.FC = () => {
  return (
    <Section background="light" className="py-8 sm:py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10"
        >
          <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 rounded-full mb-2 sm:mb-3">
            Account Options
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Choose Your Perfect Account
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            From basic banking to premium features, find the account that fits your lifestyle.
          </p>
        </motion.div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-4xl mx-auto">
          {accounts.map((account, index) => (
            <AccountCard key={account.id} account={account} index={index} />
          ))}
        </div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400"
        >
          All accounts include FDIC insurance up to $250,000. No hidden fees.{" "}
          <a href="/accounts" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Compare all features
          </a>
        </motion.p>
      </Container>
    </Section>
  );
};

export default AccountTypes;

// ============================================================================
// SAVINGS ACCOUNTS SECTION - Personal Banking
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiggyBank,
  TrendingUp,
  Calendar,
  Shield,
  Check,
  ArrowRight,
  Star,
  Clock,
  Percent,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// SAVINGS ACCOUNTS DATA
// ========================
interface SavingsAccount {
  id: string;
  name: string;
  tagline: string;
  interestRate: string;
  minBalance: string;
  popular?: boolean;
  features: string[];
  icon: React.ReactNode;
  color: string;
}

const savingsAccounts: SavingsAccount[] = [
  {
    id: "regular",
    name: "Regular Savings",
    tagline: "Start your savings journey",
    interestRate: "2.5%",
    minBalance: "$100",
    icon: <PiggyBank className="w-6 h-6" />,
    color: "bg-emerald-500",
    features: [
      "No monthly maintenance fee",
      "Free ATM withdrawals",
      "Mobile banking access",
      "Automatic savings tools",
      "Instant transfers",
    ],
  },
  {
    id: "high-yield",
    name: "High-Yield Savings",
    tagline: "Maximize your earnings",
    interestRate: "4.5%",
    minBalance: "$1,000",
    popular: true,
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-indigo-50 dark:bg-indigo-900/300",
    features: [
      "Highest interest rates",
      "No monthly fees with min balance",
      "Priority customer support",
      "Personalized savings goals",
      "Monthly interest payouts",
      "No withdrawal limits",
    ],
  },
  {
    id: "fixed-deposit",
    name: "Fixed Deposit",
    tagline: "Lock in guaranteed returns",
    interestRate: "5.5%",
    minBalance: "$5,000",
    icon: <Calendar className="w-6 h-6" />,
    color: "bg-amber-50 dark:bg-amber-900/200",
    features: [
      "Guaranteed returns",
      "Flexible tenure options",
      "Auto-renewal facility",
      "Loan against deposit",
      "Quarterly interest payout option",
    ],
  },
  {
    id: "premium",
    name: "Premium Savings",
    tagline: "Exclusive benefits for high earners",
    interestRate: "4.0%",
    minBalance: "$25,000",
    icon: <Star className="w-6 h-6" />,
    color: "bg-violet-500",
    features: [
      "Dedicated relationship manager",
      "Complimentary insurance coverage",
      "Global ATM fee rebates",
      "Priority processing",
      "Exclusive event invitations",
      "Concierge services",
    ],
  },
];

// ========================
// SAVINGS BENEFITS
// ========================
const benefits = [
  {
    title: "FDIC Insured",
    description: "Your deposits are protected up to $250,000",
    icon: Shield,
  },
  {
    title: "24/7 Access",
    description: "Manage your savings anytime, anywhere",
    icon: Clock,
  },
  {
    title: "Competitive Rates",
    description: "Earn more with industry-leading interest rates",
    icon: Percent,
  },
];

// ========================
// ACCOUNT CARD COMPONENT
// ========================
interface AccountCardProps {
  account: SavingsAccount;
  index: number;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative flex flex-col h-full p-6 rounded-2xl",
      "bg-white dark:bg-neutral-800 border shadow-sm",
      account.popular
        ? "border-indigo-200 shadow-lg shadow-indigo-100/50 ring-2 ring-indigo-500"
        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300",
      "transition-all duration-300"
    )}
  >
    {/* Popular Badge */}
    {account.popular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/300 text-white text-xs font-medium rounded-full">
          <Star className="w-3 h-3" />
          Most Popular
        </span>
      </div>
    )}

    {/* Header */}
    <div className="flex items-start gap-4 mb-4">
      <div className={cn("p-3 rounded-xl text-white", account.color)}>
        {account.icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{account.name}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{account.tagline}</p>
      </div>
    </div>

    {/* Interest Rate */}
    <div className="py-4 border-y border-neutral-100 dark:border-neutral-700 mb-4">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-neutral-900 dark:text-white">{account.interestRate}</span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">APY</span>
      </div>
      <p className="text-xs text-neutral-400 mt-1">
        Min. balance: {account.minBalance}
      </p>
    </div>

    {/* Features */}
    <ul className="space-y-2.5 flex-1 mb-6">
      {account.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-neutral-600 dark:text-neutral-300">{feature}</span>
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button
      variant={account.popular ? "primary" : "outline"}
      className={cn(
        "w-full",
        account.popular && "bg-indigo-600 hover:bg-indigo-700"
      )}
    >
      Open Account
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const SavingsAccounts: React.FC = () => {
  return (
    <Section id="savings-accounts" background="light" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            <PiggyBank className="w-4 h-4" />
            Savings Accounts
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Grow Your Wealth With Our Savings Solutions
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Choose from a range of savings accounts designed to help you reach your 
            financial goals faster with competitive interest rates and flexible options.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-800/30 text-indigo-600">
                <benefit.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">{benefit.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{benefit.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {savingsAccounts.map((account, index) => (
            <AccountCard key={account.id} account={account} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-neutral-600 dark:text-neutral-300 mb-4">
            Not sure which account is right for you?
          </p>
          <Button variant="outline" size="lg">
            Compare All Accounts
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
};

export default SavingsAccounts;

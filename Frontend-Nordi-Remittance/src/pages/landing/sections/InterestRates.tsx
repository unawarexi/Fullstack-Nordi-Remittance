// ============================================================================
// INTEREST RATES SECTION - Current rates display
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Info, ArrowRight } from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// RATES DATA
// ========================
interface Rate {
  category: string;
  name: string;
  rate: string;
  apy?: string;
  change: "up" | "down" | "stable";
  term?: string;
}

const savingsRates: Rate[] = [
  { category: "Savings", name: "High-Yield Savings", rate: "4.50%", apy: "4.51%", change: "stable" },
  { category: "Savings", name: "Money Market", rate: "4.25%", apy: "4.26%", change: "up" },
  { category: "CD", name: "6-Month CD", rate: "4.75%", apy: "4.77%", change: "stable", term: "6 months" },
  { category: "CD", name: "12-Month CD", rate: "5.00%", apy: "5.02%", change: "up", term: "12 months" },
  { category: "CD", name: "24-Month CD", rate: "4.85%", apy: "4.87%", change: "down", term: "24 months" },
];

const loanRates: Rate[] = [
  { category: "Mortgage", name: "30-Year Fixed", rate: "6.875%", change: "down", term: "30 years" },
  { category: "Mortgage", name: "15-Year Fixed", rate: "6.125%", change: "down", term: "15 years" },
  { category: "Mortgage", name: "5/1 ARM", rate: "5.750%", change: "stable", term: "5 years" },
  { category: "Auto", name: "New Auto Loan", rate: "5.99%", change: "stable", term: "36-72 months" },
  { category: "Auto", name: "Used Auto Loan", rate: "6.49%", change: "up", term: "36-60 months" },
  { category: "Personal", name: "Personal Loan", rate: "8.99%", change: "stable", term: "12-60 months" },
];

// ========================
// TREND ICON COMPONENT
// ========================
const TrendIcon: React.FC<{ change: Rate["change"] }> = ({ change }) => {
  switch (change) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    case "down":
      return <TrendingDown className="w-4 h-4 text-rose-500" />;
    default:
      return <Minus className="w-4 h-4 text-neutral-400" />;
  }
};

// ========================
// RATE ROW COMPONENT
// ========================
interface RateRowProps {
  rate: Rate;
  index: number;
}

const RateRow: React.FC<RateRowProps> = ({ rate, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className={cn(
      "flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4",
      "border-b border-neutral-100 dark:border-neutral-700 last:border-0",
      "hover:bg-neutral-50 dark:hover:bg-neutral-700 dark:bg-neutral-700/50 transition-colors"
    )}
  >
    <div className="flex-1 min-w-0">
      <div className="font-medium text-neutral-900 dark:text-white text-sm">{rate.name}</div>
      {rate.term && (
        <div className="text-xs text-neutral-500 dark:text-neutral-400">{rate.term}</div>
      )}
    </div>
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="font-semibold text-neutral-900 dark:text-white">{rate.rate}</div>
        {rate.apy && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{rate.apy} APY</div>
        )}
      </div>
      <TrendIcon change={rate.change} />
    </div>
  </motion.div>
);

// ========================
// RATE TABLE COMPONENT
// ========================
interface RateTableProps {
  title: string;
  rates: Rate[];
  color: string;
}

const RateTable: React.FC<RateTableProps> = ({ title, rates, color }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 overflow-hidden">
    <div className={cn("px-3 sm:px-4 py-2 sm:py-3 border-b border-neutral-100 dark:border-neutral-700", color)}>
      <h3 className="font-semibold text-white text-sm">{title}</h3>
    </div>
    <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
      {rates.map((rate, index) => (
        <RateRow key={rate.name} rate={rate} index={index} />
      ))}
    </div>
  </div>
);

// ========================
// MAIN COMPONENT
// ========================
const InterestRates: React.FC = () => {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Section background="white" className="py-8 sm:py-12 lg:py-16">
      <Container size="xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-2 sm:mb-3">
              Current Rates
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
              Competitive Interest Rates
            </h2>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-300">
              Updated daily to give you the best possible rates.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400"
          >
            <Info className="w-4 h-4" />
            Last updated: {lastUpdated}
          </motion.div>
        </div>

        {/* Rates Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RateTable
            title="Savings & CDs"
            rates={savingsRates}
            color="bg-emerald-600"
          />
          <RateTable
            title="Loans & Mortgages"
            rates={loanRates}
            color="bg-indigo-600"
          />
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn(
            "mt-6 p-3 sm:p-4 rounded-lg",
            "bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30"
          )}
        >
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">Rate Information</p>
              <p className="mt-1 text-amber-700 dark:text-amber-300">
                Annual Percentage Yields (APY) and rates are accurate as of the date shown and are
                subject to change without notice. Fees may reduce earnings. Additional terms and
                conditions may apply.{" "}
                <a href="/rates" className="underline hover:no-underline">
                  View full rate details
                </a>
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <a
            href="/rates/calculator"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium text-indigo-600",
              "hover:text-indigo-700 transition-colors"
            )}
          >
            Calculate Your Earnings
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </Container>
    </Section>
  );
};

export default InterestRates;

// ============================================================================
// COMPARE CARDS SECTION - Credit card comparison
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Plane,
  Gift,
  Percent,
  Shield,
  Star,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// CARDS DATA
// ========================
interface CreditCardData {
  id: string;
  name: string;
  tagline: string;
  annualFee: string;
  apr: string;
  intro: string;
  rewards: string;
  highlight: string;
  benefits: string[];
  color: string;
  popular?: boolean;
}

const creditCards: CreditCardData[] = [
  {
    id: "cashback",
    name: "Nordea Cashback",
    tagline: "Unlimited cashback on everything",
    annualFee: "$0",
    apr: "18.99% - 26.99%",
    intro: "0% APR for 15 months",
    rewards: "1.5% cashback",
    highlight: "No annual fee",
    benefits: [
      "Unlimited 1.5% cashback",
      "No foreign transaction fees",
      "Free credit score",
      "Extended warranty",
    ],
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "travel",
    name: "Nordea Travel Elite",
    tagline: "Premium travel rewards",
    annualFee: "$95",
    apr: "19.99% - 27.99%",
    intro: "60,000 bonus points",
    rewards: "3x points on travel",
    highlight: "Best for travelers",
    popular: true,
    benefits: [
      "3x points on travel & dining",
      "Airport lounge access",
      "Trip cancellation insurance",
      "No foreign transaction fees",
    ],
    color: "from-violet-500 to-purple-600",
  },
  {
    id: "rewards",
    name: "Nordea Rewards+",
    tagline: "Flexible rewards your way",
    annualFee: "$49",
    apr: "17.99% - 25.99%",
    intro: "0% APR for 18 months",
    rewards: "5x on categories",
    highlight: "Most flexible",
    benefits: [
      "5x on chosen categories",
      "2x on everything else",
      "Points never expire",
      "Gift card bonuses",
    ],
    color: "from-amber-500 to-orange-600",
  },
];

// ========================
// CARD COMPONENT
// ========================
interface CardPreviewProps {
  card: CreditCardData;
  index: number;
}

const CardPreview: React.FC<CardPreviewProps> = ({ card, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative flex flex-col rounded-2xl overflow-hidden",
      "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
      card.popular ? "ring-2 ring-indigo-500 shadow-lg" : "hover:shadow-lg dark:hover:shadow-neutral-900/50",
      "transition-shadow"
    )}
  >
    {/* Popular Badge */}
    {card.popular && (
      <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-bl-xl">
        Most Popular
      </div>
    )}

    {/* Card Visual */}
    <div className={cn("relative h-32 sm:h-40 bg-neutral-900 overflow-hidden")}>
      <div
        className={cn(
          "absolute -right-10 -top-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full opacity-30 bg-gradient-to-br",
          card.color
        )}
      />
      <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-5 right-4 sm:right-5">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
          <span className="text-white/60 text-[10px] sm:text-xs">NORDEA</span>
        </div>
        <div className="text-white text-sm sm:text-base font-semibold">{card.name}</div>
        <div className="text-white/60 text-[10px] sm:text-xs mt-0.5">{card.tagline}</div>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 p-4 sm:p-5">
      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
        <div className="p-2 sm:p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700">
          <div className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Annual Fee</div>
          <div className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">{card.annualFee}</div>
        </div>
        <div className="p-2 sm:p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700">
          <div className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">Rewards</div>
          <div className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">{card.rewards}</div>
        </div>
      </div>

      {/* Intro Offer */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 mb-4">
        <Gift className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{card.intro}</span>
      </div>

      {/* Benefits */}
      <ul className="space-y-2 mb-5">
        {card.benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {benefit}
          </li>
        ))}
      </ul>

      {/* APR Info */}
      <p className="text-xs text-neutral-400 dark:text-neutral-500">APR: {card.apr} variable</p>
    </div>

    {/* CTA */}
    <div className="p-4 sm:p-5 pt-0">
      <a
        href={`/cards/${card.id}`}
        className={cn(
          "flex items-center justify-center gap-2 w-full py-3 rounded-xl",
          "font-medium text-sm transition-colors",
          card.popular
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600"
        )}
      >
        Apply Now
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const CompareCards: React.FC = () => {
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
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 rounded-full mb-2 sm:mb-3">
            <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Credit Cards
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Find Your Perfect Card
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Whether you want cashback, travel rewards, or low APR, we have a card for you.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {creditCards.map((card, index) => (
            <CardPreview key={card.id} card={card} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <a
            href="/cards"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400",
              "hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            )}
          >
            Compare All Credit Cards
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
            Credit card offers are subject to credit approval. Terms and conditions apply.
            See card agreements for complete details.
          </p>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CompareCards;

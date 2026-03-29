// ============================================================================
// CREDIT CARDS SECTION - Personal Banking
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Gift,
  Plane,
  ShoppingBag,
  Shield,
  Percent,
  ArrowRight,
  Check,
  Star,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// CREDIT CARDS DATA
// ========================
interface CreditCardType {
  id: string;
  name: string;
  tagline: string;
  annualFee: string;
  apr: string;
  cashback: string;
  signupBonus: string;
  popular?: boolean;
  premium?: boolean;
  cardColor: string;
  features: string[];
  rewards: {
    category: string;
    rate: string;
  }[];
}

const creditCards: CreditCardType[] = [
  {
    id: "everyday",
    name: "Nordea Everyday",
    tagline: "Perfect for daily purchases",
    annualFee: "$0",
    apr: "14.99%",
    cashback: "1.5%",
    signupBonus: "$100",
    cardColor: "from-slate-600 to-slate-800",
    features: [
      "No annual fee",
      "0% intro APR for 15 months",
      "Free credit score monitoring",
      "Cell phone protection",
    ],
    rewards: [
      { category: "All purchases", rate: "1.5%" },
      { category: "Gas stations", rate: "2%" },
    ],
  },
  {
    id: "rewards-plus",
    name: "Nordea Rewards Plus",
    tagline: "Earn more on every swipe",
    annualFee: "$95",
    apr: "16.99%",
    cashback: "3%",
    signupBonus: "$200",
    popular: true,
    cardColor: "from-indigo-500 to-indigo-700",
    features: [
      "5% cashback on rotating categories",
      "Travel accident insurance",
      "Extended warranty protection",
      "Concierge service",
    ],
    rewards: [
      { category: "Dining", rate: "3%" },
      { category: "Travel", rate: "3%" },
      { category: "Streaming", rate: "3%" },
      { category: "Other", rate: "1.5%" },
    ],
  },
  {
    id: "travel-elite",
    name: "Nordea Travel Elite",
    tagline: "For the frequent traveler",
    annualFee: "$195",
    apr: "18.99%",
    cashback: "5%",
    signupBonus: "60,000 pts",
    cardColor: "from-emerald-500 to-teal-600",
    features: [
      "Airport lounge access",
      "Global Entry/TSA PreCheck credit",
      "No foreign transaction fees",
      "Trip cancellation insurance",
    ],
    rewards: [
      { category: "Travel", rate: "5x" },
      { category: "Airlines", rate: "3x" },
      { category: "Hotels", rate: "3x" },
      { category: "Other", rate: "1x" },
    ],
  },
  {
    id: "black-card",
    name: "Nordea Black",
    tagline: "Exclusive privileges await",
    annualFee: "$495",
    apr: "19.99%",
    cashback: "6%",
    signupBonus: "100,000 pts",
    premium: true,
    cardColor: "from-neutral-900 to-neutral-800",
    features: [
      "Dedicated relationship manager",
      "Unlimited lounge access worldwide",
      "Premium concierge 24/7",
      "Exclusive experiences & events",
      "Luxury hotel upgrades",
    ],
    rewards: [
      { category: "Premium travel", rate: "6x" },
      { category: "Dining", rate: "4x" },
      { category: "Luxury retail", rate: "3x" },
      { category: "Other", rate: "2x" },
    ],
  },
];

// ========================
// CARD BENEFITS
// ========================
const cardBenefits = [
  { icon: Gift, title: "Sign-up Bonuses", description: "Earn rewards from day one" },
  { icon: Shield, title: "Fraud Protection", description: "Zero liability guarantee" },
  { icon: Percent, title: "Low APR Options", description: "Competitive interest rates" },
  { icon: Zap, title: "Instant Approval", description: "Know in 60 seconds" },
];

// ========================
// CREDIT CARD VISUAL COMPONENT
// ========================
interface CardVisualProps {
  card: CreditCardType;
}

const CardVisual: React.FC<CardVisualProps> = ({ card }) => (
  <div
    className={cn(
      "relative w-full aspect-[1.586/1] rounded-xl overflow-hidden",
      "bg-gradient-to-br shadow-xl",
      card.cardColor
    )}
  >
    {/* Card chip */}
    <div className="absolute top-6 left-6">
      <div className="w-10 h-8 rounded bg-amber-400/80" />
    </div>
    
    {/* Card number placeholder */}
    <div className="absolute bottom-16 left-6 right-6">
      <div className="flex gap-4 text-white/60 text-sm font-mono">
        <span>****</span>
        <span>****</span>
        <span>****</span>
        <span>****</span>
      </div>
    </div>
    
    {/* Card name */}
    <div className="absolute bottom-6 left-6">
      <p className="text-white/90 text-sm font-semibold">{card.name}</p>
    </div>
    
    {/* Logo placeholder */}
    <div className="absolute bottom-6 right-6">
      <div className="w-12 h-8 bg-white/20 rounded" />
    </div>

    {/* Premium shine effect */}
    {card.premium && (
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
    )}
  </div>
);

// ========================
// CREDIT CARD COMPONENT
// ========================
interface CreditCardCardProps {
  card: CreditCardType;
  index: number;
}

const CreditCardCard: React.FC<CreditCardCardProps> = ({ card, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative flex flex-col p-6 rounded-2xl bg-white dark:bg-neutral-800 border",
      card.popular
        ? "border-indigo-200 shadow-xl ring-2 ring-indigo-500"
        : card.premium
        ? "border-amber-200 shadow-xl ring-2 ring-amber-500"
        : "border-neutral-200 dark:border-neutral-700 hover:shadow-lg dark:hover:shadow-neutral-900/50",
      "transition-all duration-300"
    )}
  >
    {/* Badge */}
    {(card.popular || card.premium) && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className={cn(
          "inline-flex items-center gap-1 px-3 py-1 text-white text-xs font-medium rounded-full",
          card.popular ? "bg-indigo-50 dark:bg-indigo-900/300" : "bg-amber-50 dark:bg-amber-900/200"
        )}>
          {card.popular ? <Star className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
          {card.popular ? "Most Popular" : "Premium"}
        </span>
      </div>
    )}

    {/* Card Visual */}
    <div className="mb-6">
      <CardVisual card={card} />
    </div>

    {/* Card Info */}
    <div className="mb-4">
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">{card.name}</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{card.tagline}</p>
    </div>

    {/* Key Stats */}
    <div className="grid grid-cols-2 gap-3 py-4 border-y border-neutral-100 dark:border-neutral-700 mb-4">
      <div>
        <p className="text-xs text-neutral-400">Annual Fee</p>
        <p className="text-lg font-bold text-neutral-900 dark:text-white">{card.annualFee}</p>
      </div>
      <div>
        <p className="text-xs text-neutral-400">Sign-up Bonus</p>
        <p className="text-lg font-bold text-emerald-600">{card.signupBonus}</p>
      </div>
    </div>

    {/* Rewards */}
    <div className="mb-4">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase mb-2">Rewards</p>
      <div className="space-y-1.5">
        {card.rewards.slice(0, 3).map((reward) => (
          <div key={reward.category} className="flex items-center justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-300">{reward.category}</span>
            <span className="font-semibold text-indigo-600">{reward.rate}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Features */}
    <ul className="space-y-2 flex-1 mb-6">
      {card.features.slice(0, 4).map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          {feature}
        </li>
      ))}
    </ul>

    {/* CTA */}
    <Button
      variant={card.popular || card.premium ? "primary" : "outline"}
      className={cn(
        "w-full",
        card.popular && "bg-indigo-600 hover:bg-indigo-700",
        card.premium && "bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600"
      )}
    >
      Apply Now
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const CreditCards: React.FC = () => {
  return (
    <Section id="credit-cards" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            <CreditCard className="w-4 h-4" />
            Credit Cards
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Find The Perfect Card For Your Lifestyle
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            From everyday essentials to premium rewards, our credit cards offer 
            exceptional benefits and industry-leading cashback rates.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {cardBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50"
            >
              <div className="w-10 h-10 mx-auto rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                <benefit.icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-neutral-900 dark:text-white text-sm">{benefit.title}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditCards.map((card, index) => (
            <CreditCardCard key={card.id} card={card} index={index} />
          ))}
        </div>

        {/* Compare CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-neutral-600 dark:text-neutral-300 mb-4">
            Need help choosing? Compare all cards side by side.
          </p>
          <Button variant="outline" size="lg">
            Compare All Cards
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
};

export default CreditCards;

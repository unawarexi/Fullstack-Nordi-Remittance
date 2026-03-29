// ============================================================================
// CARDS SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Shield,
  Globe,
  Smartphone,
  ArrowRight,
  Check,
  Lock,
  Wifi,
  Zap,
  Gift,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// CARD PRODUCTS
// ========================
interface CardProduct {
  id: string;
  name: string;
  type: "Debit" | "Credit" | "Prepaid";
  features: string[];
  limit: string;
  color: string;
  popular?: boolean;
}

const cardProducts: CardProduct[] = [
  {
    id: "classic-debit",
    name: "Classic Debit Card",
    type: "Debit",
    features: ["ATM withdrawals", "POS payments", "Online shopping", "Free issuance"],
    limit: "₦50,000/day",
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    id: "gold-debit",
    name: "Gold Debit Card",
    type: "Debit",
    features: ["Higher limits", "Priority support", "Travel insurance", "Lounge access"],
    limit: "₦200,000/day",
    color: "bg-gradient-to-br from-amber-500 to-amber-700",
    popular: true,
  },
  {
    id: "platinum-debit",
    name: "Platinum Debit Card",
    type: "Debit",
    features: ["Premium limits", "Concierge", "Global insurance", "VIP benefits"],
    limit: "₦500,000/day",
    color: "bg-gradient-to-br from-neutral-600 to-neutral-800",
  },
  {
    id: "naira-credit",
    name: "Naira Credit Card",
    type: "Credit",
    features: ["Interest-free period", "Rewards points", "Flexible payment", "Credit building"],
    limit: "Up to ₦5M",
    color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
  },
  {
    id: "dollar-credit",
    name: "Dollar Credit Card",
    type: "Credit",
    features: ["USD transactions", "Global acceptance", "FX benefits", "Travel perks"],
    limit: "Up to $10,000",
    color: "bg-gradient-to-br from-violet-500 to-violet-700",
  },
  {
    id: "prepaid",
    name: "Prepaid Card",
    type: "Prepaid",
    features: ["No credit check", "Budget control", "Gift option", "Student friendly"],
    limit: "Load up to ₦500K",
    color: "bg-gradient-to-br from-rose-500 to-rose-700",
  },
];

// ========================
// CARD FEATURES
// ========================
const cardFeatures = [
  { icon: Wifi, title: "Contactless", description: "Tap to pay" },
  { icon: Lock, title: "Chip & PIN", description: "EMV secured" },
  { icon: Smartphone, title: "Digital Cards", description: "Virtual instantly" },
  { icon: Zap, title: "Instant Issue", description: "Same-day cards" },
];

// ========================
// MAIN COMPONENT
// ========================
const Cards: React.FC = () => {
  return (
    <Section id="cards" className="py-16 lg:py-24">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <CreditCard className="w-4 h-4" />
            Cards
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            The Right Card for Every Need
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            From everyday spending to international travel, choose from our 
            range of debit, credit, and prepaid cards with world-class security.
          </p>
        </motion.div>

        {/* Features Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {cardFeatures.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <feature.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white text-sm">{feature.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardProducts.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className={cn(
                "group relative flex flex-col rounded-2xl bg-white dark:bg-neutral-800 border",
                card.popular ? "border-amber-300 shadow-lg" : "border-neutral-200 dark:border-neutral-700",
                "hover:shadow-xl dark:hover:shadow-neutral-900/50 transition-all duration-300"
              )}
            >
              {card.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/200 text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}

              {/* Card Visual */}
              <div className="p-5 pb-0">
                <div className={cn(
                  "relative h-40 rounded-xl p-4 text-white overflow-hidden",
                  card.color
                )}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/4 -translate-y-1/4" />
                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-white/20 text-xs font-medium">{card.type}</span>
                      <CreditCard className="w-6 h-6 opacity-50" />
                    </div>
                    <div>
                      <p className="font-bold">{card.name}</p>
                      <p className="text-xs opacity-80">{card.limit}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col">
                <ul className="space-y-2 flex-1 mb-4">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Manage Cards CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center"
        >
          <h3 className="text-xl font-bold mb-2">Manage Your Cards Digitally</h3>
          <p className="text-blue-100 mb-4 max-w-xl mx-auto">
            Block, unblock, set limits, and track spending all from your mobile app. 
            Get instant virtual cards for immediate online use.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" className="bg-white dark:bg-neutral-800 text-blue-600 hover:bg-blue-50">
              Open Mobile App
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Card Controls
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default Cards;

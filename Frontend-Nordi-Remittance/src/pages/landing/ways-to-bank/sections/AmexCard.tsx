// ============================================================================
// AMEX CARD SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Globe,
  Shield,
  Gift,
  ArrowRight,
  Check,
  Plane,
  Star,
  Percent,
  Clock,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// CARD TYPES
// ========================
interface CardType {
  id: string;
  name: string;
  fee: string;
  color: string;
  benefits: string[];
  rewards: string;
}

const cardTypes: CardType[] = [
  {
    id: "green",
    name: "American Express Green",
    fee: "$150/year",
    color: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    benefits: [
      "3X points on travel",
      "3X points on restaurants",
      "1X points on other purchases",
      "No foreign transaction fees",
    ],
    rewards: "45,000 bonus points",
  },
  {
    id: "gold",
    name: "American Express Gold",
    fee: "$250/year",
    color: "bg-gradient-to-br from-amber-400 to-amber-600",
    benefits: [
      "4X points on restaurants",
      "4X points on groceries",
      "3X points on flights",
      "$120 dining credit annual",
    ],
    rewards: "60,000 bonus points",
  },
  {
    id: "platinum",
    name: "American Express Platinum",
    fee: "$695/year",
    color: "bg-gradient-to-br from-neutral-400 to-neutral-600",
    benefits: [
      "5X points on flights",
      "Airport lounge access",
      "$200 airline fee credit",
      "Hotel elite status",
    ],
    rewards: "100,000 bonus points",
  },
];

// ========================
// GLOBAL BENEFITS
// ========================
const globalBenefits = [
  { icon: Globe, title: "Accepted Worldwide", description: "170+ countries" },
  { icon: Shield, title: "Fraud Protection", description: "$0 liability" },
  { icon: Gift, title: "Member Rewards", description: "Exclusive perks" },
  { icon: Plane, title: "Travel Benefits", description: "Insurance & more" },
];

// ========================
// MAIN COMPONENT
// ========================
const AmexCard: React.FC = () => {
  return (
    <Section id="amex-card" className="py-16 lg:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
            <CreditCard className="w-4 h-4" />
            American Express
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Premium Cards, Premium Benefits
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Experience the prestige and rewards of American Express cards, 
            now available through our partnership with enhanced local benefits.
          </p>
        </motion.div>

        {/* Global Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {globalBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <benefit.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white text-sm">{benefit.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{benefit.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Card Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cardTypes.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "group relative flex flex-col rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
                "hover:shadow-xl dark:hover:shadow-neutral-900/50 hover:border-neutral-300 transition-all duration-300"
              )}
            >
              {/* Card Visual */}
              <div className="p-6 pb-0">
                <div className={cn(
                  "relative h-48 rounded-xl p-4 text-white overflow-hidden",
                  card.color
                )}>
                  {/* Card Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-x-1/4 translate-y-1/4" />
                  </div>
                  
                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <Star className="w-6 h-6" />
                      <span className="text-xs font-semibold">{card.fee}</span>
                    </div>
                    <div>
                      <p className="text-sm opacity-80">American Express</p>
                      <p className="font-bold">{card.name.replace('American Express ', '')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 mb-4 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Welcome Bonus</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{card.rewards}</p>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {card.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <span className="text-sm text-neutral-600 dark:text-neutral-300">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="w-full group-hover:border-blue-500 dark:group-hover:border-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-2xl bg-blue-900 dark:bg-blue-950 text-white text-center"
        >
          <h3 className="text-xl font-bold mb-2">Already Have an AMEX?</h3>
          <p className="text-blue-200 mb-4">
            Link your existing American Express card to your account for enhanced benefits.
          </p>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Link Your Card
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
};

export default AmexCard;

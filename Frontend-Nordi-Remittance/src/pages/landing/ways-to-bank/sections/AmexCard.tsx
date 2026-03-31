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
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-12 sm:mb-20"
        >
          {globalBenefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-4 sm:p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="font-black text-[13px] sm:text-sm text-neutral-900 dark:text-white uppercase tracking-tight leading-tight mb-1">{benefit.title}</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-bold leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Card Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cardTypes.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(
                "group relative flex flex-col rounded-[2.5rem] bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 overflow-hidden",
                "hover:shadow-2xl dark:hover:shadow-neutral-900/50 hover:border-blue-500/30 transition-all duration-500"
              )}
            >
              {/* Card Visual */}
              <div className="p-8 pb-4">
                <div className={cn(
                  "relative h-44 sm:h-52 rounded-3xl p-6 text-white overflow-hidden shadow-2xl group-hover:scale-[1.02] transition-transform duration-500",
                  card.color,
                  "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-black/20 before:to-transparent"
                )}>
                  {/* Card Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full bg-white/30 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  
                  <div className="relative h-full flex flex-col justify-between z-10">
                    <div className="flex items-start justify-between">
                      <Star className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse text-white/50" />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">{card.fee}</span>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest mb-1">American Express</p>
                      <p className="text-lg sm:text-2xl font-black uppercase tracking-tighter italic leading-none">{card.name.replace('American Express ', '')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-8 pt-4 flex-1 flex flex-col">
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/5 border-2 border-blue-500/10 mb-6 text-center group-hover:bg-blue-500/10 transition-colors">
                  <p className="text-[10px] sm:text-xs text-neutral-400 font-black uppercase tracking-[0.2em] mb-1">Welcome Bonus</p>
                  <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums italic tracking-tighter">{card.rewards}</p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {card.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3 group/benefit">
                      <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover/benefit:scale-110 transition-transform">
                        <Check className="w-3 h-3 text-blue-600 font-bold" />
                      </div>
                      <span className="text-[13px] sm:text-sm text-neutral-600 dark:text-neutral-300 font-bold group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="outline" size="lg" className="w-full rounded-2xl border-2 font-black py-4 uppercase tracking-widest text-xs group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                  Secure The Legacy
                  <ArrowRight className="w-5 h-5 ml-3" />
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

// ============================================================================
// BLACK CARD SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Crown,
  Plane,
  Utensils,
  Shield,
  ArrowRight,
  Check,
  Sparkles,
  Globe,
  Gift,
  Percent,
  Star,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// CARD BENEFITS
// ========================
interface CardBenefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const cardBenefits: CardBenefit[] = [
  {
    icon: <Plane className="w-5 h-5" />,
    title: "Unlimited Lounge Access",
    description: "Access to 1,300+ airport lounges worldwide with Priority Pass",
  },
  {
    icon: <Utensils className="w-5 h-5" />,
    title: "Fine Dining Program",
    description: "Complimentary dishes at 250+ premier restaurants globally",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Premium Insurance",
    description: "Comprehensive travel, purchase, and rental car protection",
  },
  {
    icon: <Gift className="w-5 h-5" />,
    title: "Exclusive Experiences",
    description: "VIP access to sold-out events, concerts, and premieres",
  },
  {
    icon: <Percent className="w-5 h-5" />,
    title: "5X Rewards",
    description: "Earn 5 points per dollar on travel and dining purchases",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "No Foreign Fees",
    description: "Zero foreign transaction fees on international purchases",
  },
];

// ========================
// CARD TIERS
// ========================
const cardTiers = [
  { name: "Black Card", fee: "$500/year", spend: "$100K+", color: "bg-neutral-900" },
  { name: "Black Elite", fee: "$1,000/year", spend: "$250K+", color: "bg-gradient-to-r from-neutral-900 to-amber-900" },
  { name: "Black Infinite", fee: "Invitation Only", spend: "$500K+", color: "bg-gradient-to-r from-amber-800 to-amber-600" },
];

// ========================
// MAIN COMPONENT
// ========================
const BlackCard: React.FC = () => {
  return (
    <Section id="black-card" className="py-16 lg:py-24 bg-neutral-900 text-white overflow-hidden">
      <Container>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/200/20 text-amber-400 text-sm font-medium mb-4 border border-amber-500/30">
            <Crown className="w-4 h-4" />
            Black Card
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            The Ultimate Symbol of
            <span className="text-amber-400"> Prestige</span>
          </h2>
          <p className="text-lg text-neutral-400">
            Crafted from premium materials and backed by unparalleled benefits, 
            the Black Card opens doors to a world of privilege.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Card Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Card Stack */}
            <div className="relative mx-auto w-80 lg:w-96 h-56 lg:h-64">
              {/* Background Card */}
              <div className="absolute top-4 left-4 w-full h-full rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-800 opacity-50 blur-sm" />
              
              {/* Main Card */}
              <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-6 border border-amber-500/30 shadow-2xl overflow-hidden">
                {/* Subtle Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMCBMNDAgMjAgTDIwIDQwIEwwIDIwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]" />
                </div>

                {/* Card Content */}
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-amber-400" />
                      <span className="text-amber-400 font-bold tracking-wider">BLACK</span>
                    </div>
                    <CreditCard className="w-8 h-8 text-amber-500/50" />
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-8 rounded bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-2" />
                    <p className="text-xl font-mono tracking-widest text-neutral-400">•••• •••• •••• 8888</p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">Card Holder</p>
                      <p className="font-semibold">PREFERRED MEMBER</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">Valid Thru</p>
                      <p className="font-semibold">12/28</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-20 bg-amber-50 dark:bg-amber-900/200 rounded-full scale-50" />
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {cardBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/200/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{benefit.title}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="primary" className="w-full bg-amber-50 dark:bg-amber-900/200 hover:bg-amber-600 text-neutral-900 dark:text-white">
              <Star className="w-5 h-5 mr-2" />
              Apply for Black Card
            </Button>
          </motion.div>
        </div>

        {/* Card Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 pt-16 border-t border-white/10"
        >
          <h3 className="text-xl font-semibold text-center mb-8">Card Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cardTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={cn(
                  "relative p-6 rounded-xl border border-white/10 text-center",
                  "hover:border-amber-500/50 transition-all"
                )}
              >
                <div className={cn("w-16 h-10 mx-auto rounded-lg mb-4", tier.color)} />
                <h4 className="font-bold text-lg mb-2">{tier.name}</h4>
                <p className="text-amber-400 font-semibold mb-1">{tier.fee}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Min. annual spend: {tier.spend}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default BlackCard;

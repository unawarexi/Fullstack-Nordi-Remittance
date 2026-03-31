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
            className="relative flex justify-center lg:justify-start"
          >
            {/* Card Stack */}
            <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-[1.58/1]">
              {/* Background Card */}
              <div className="absolute top-3 left-3 sm:top-5 sm:left-5 w-full h-full rounded-2xl sm:rounded-3xl bg-neutral-800 opacity-40 blur-md -z-10" />
              
              {/* Main Card */}
              <div className="relative w-full h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-5 sm:p-8 border border-amber-500/30 shadow-2xl overflow-hidden group">
                {/* Subtle Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMCBMNDAgMjAgTDIwIDQwIEwwIDIwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]" />
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                {/* Card Content */}
                <div className="relative h-full flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-1.5 rounded-lg bg-amber-400">
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-900" />
                      </div>
                      <span className="text-amber-400 font-black tracking-[0.2em] text-xs sm:text-sm">BLACK</span>
                    </div>
                    <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500/30" />
                  </div>

                  <div className="text-center py-4 sm:py-6">
                    <div className="w-10 h-7 sm:w-12 sm:h-8 rounded-md bg-gradient-to-r from-amber-400 via-amber-200 to-amber-600 mx-auto mb-3 shadow-inner" />
                    <p className="text-lg sm:text-2xl font-mono tracking-[0.25em] text-neutral-300 tabular-nums">•••• •••• •••• 8888</p>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-0.5">Card Holder</p>
                      <p className="font-bold text-[12px] sm:text-base uppercase truncate">PREFERRED MEMBER</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[8px] sm:text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-0.5">Valid Thru</p>
                      <p className="font-bold text-[12px] sm:text-base tabular-nums">12/28</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 -z-20 blur-[100px] opacity-10 bg-amber-400 rounded-full scale-75 lg:scale-110" />
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
              {cardBenefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-amber-400/5 hover:border-amber-400/20 transition-all group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                    {React.isValidElement(benefit.icon) 
                      ? React.cloneElement(benefit.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })
                      : benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base uppercase tracking-tight mb-0.5">{benefit.title}</h4>
                    <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="primary" size="lg" className="w-full bg-amber-400 hover:bg-amber-500 text-neutral-900 font-bold py-4 px-10 shadow-xl shadow-amber-400/10">
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
          className="mt-16 sm:mt-24 pt-16 sm:pt-20 border-t border-white/10"
        >
          <h3 className="text-xl sm:text-3xl font-black text-center mb-10 sm:mb-16 uppercase tracking-widest italic">Card Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {cardTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "relative p-8 rounded-3xl border border-white/10 text-center bg-white/5 shadow-xl transition-all group",
                  "hover:border-amber-400 hover:bg-white/10 hover:-translate-y-2"
                )}
              >
                <div className={cn("w-20 h-12 mx-auto rounded-xl mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform", tier.color)} />
                <h4 className="font-black text-xl sm:text-2xl mb-3 uppercase tracking-tighter italic">{tier.name}</h4>
                <div className="py-2.5 px-4 rounded-full bg-amber-400/10 border border-amber-400/20 inline-block mb-4">
                  <p className="text-amber-400 font-bold text-sm uppercase tracking-widest">{tier.fee}</p>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 font-bold uppercase tracking-wider">Min. annual spend: <span className="text-white">{tier.spend}</span></p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default BlackCard;

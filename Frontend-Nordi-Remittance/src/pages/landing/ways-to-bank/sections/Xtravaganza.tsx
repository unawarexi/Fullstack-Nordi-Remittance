// ============================================================================
// XTRAVAGANZA REWARDS SECTION
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Star,
  Trophy,
  Sparkles,
  ArrowRight,
  Check,
  Users,
  Zap,
  PartyPopper,
  Crown,
  Ticket,
  Percent,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";
import { Button } from "@components/ui/Button";

// ========================
// REWARDS TIERS
// ========================
interface RewardTier {
  name: string;
  icon: React.ReactNode;
  color: string;
  pointsRequired: string;
  benefits: string[];
}

const rewardTiers: RewardTier[] = [
  {
    name: "Silver",
    icon: <Star className="w-6 h-6" />,
    color: "from-neutral-400 to-neutral-500",
    pointsRequired: "0",
    benefits: ["Birthday bonus points", "Quarterly lucky draw entry", "Basic rewards catalog"],
  },
  {
    name: "Gold",
    icon: <Trophy className="w-6 h-6" />,
    color: "from-amber-400 to-amber-600",
    pointsRequired: "50,000",
    benefits: ["2x points on transactions", "Priority customer service", "Exclusive merchant offers", "Monthly cashback"],
  },
  {
    name: "Platinum",
    icon: <Crown className="w-6 h-6" />,
    color: "from-violet-500 to-purple-600",
    pointsRequired: "200,000",
    benefits: ["3x points on all transactions", "Airport lounge access", "Concierge service", "Premium gift catalog", "Annual bonus points"],
  },
];

// ========================
// HOW TO EARN
// ========================
interface EarnMethod {
  icon: React.ReactNode;
  action: string;
  points: string;
}

const earnMethods: EarnMethod[] = [
  { icon: <Send className="w-5 h-5" />, action: "Fund transfers", points: "1 point per ₦100" },
  { icon: <Receipt className="w-5 h-5" />, action: "Bill payments", points: "2 points per ₦100" },
  { icon: <CreditCard className="w-5 h-5" />, action: "Card transactions", points: "3 points per ₦100" },
  { icon: <Zap className="w-5 h-5" />, action: "Airtime & data", points: "2 points per ₦100" },
];

// Import additional icons at runtime
import { Send, Receipt, CreditCard } from "lucide-react";

// ========================
// REDEMPTION OPTIONS
// ========================
const redemptionOptions = [
  { icon: Ticket, label: "Event Tickets", desc: "Concerts & shows" },
  { icon: Gift, label: "Gift Cards", desc: "Popular brands" },
  { icon: Percent, label: "Cashback", desc: "Direct to account" },
  { icon: Sparkles, label: "Experiences", desc: "Trips & dining" },
];

// ========================
// MAIN COMPONENT
// ========================
const Xtravaganza: React.FC = () => {
  return (
    <Section id="xtravaganza" className="py-16 lg:py-24 bg-gradient-to-br from-purple-900 via-violet-800 to-fuchsia-900 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: [0, 0.3, 0], 
              y: [-20, -200],
              x: Math.sin(i) * 50
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute w-2 h-2 rounded-full bg-white dark:bg-neutral-800"
            style={{ 
              left: `${Math.random() * 100}%`,
              bottom: 0,
            }}
          />
        ))}
      </div>

      <Container className="relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
            <PartyPopper className="w-4 h-4" />
            Xtravaganza Rewards
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Bank More, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">Win More!</span>
          </h2>
          <p className="text-lg text-purple-100">
            Every transaction brings you closer to amazing rewards. 
            Earn points, climb tiers, and unlock exclusive benefits.
          </p>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto mb-12 sm:mb-20"
        >
          {[
            { value: "₦500M+", label: "Rewards" },
            { value: "2M+", label: "Members" },
            { value: "10K+", label: "Winners" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl">
              <p className="text-xl sm:text-3xl font-black text-white tabular-nums tracking-tighter italic">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-purple-200 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-12 sm:mb-20"
        >
          {rewardTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={cn(
                "relative p-8 rounded-[2.5rem] overflow-hidden group transition-all duration-500",
                "bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:bg-white/15",
                index === 2 && "lg:scale-110 lg:-translate-y-2 lg:z-20 border-white/40"
              )}
            >
              {/* Tier Badge */}
              <div className={cn(
                "inline-flex items-center gap-3 px-5 py-2 rounded-2xl text-white text-sm font-black mb-6 shadow-xl uppercase tracking-widest",
                `bg-gradient-to-r ${tier.color}`
              )}>
                {tier.icon && React.isValidElement(tier.icon) 
                  ? React.cloneElement(tier.icon as React.ReactElement, { className: "w-5 h-5 sm:w-6 sm:h-6" })
                  : tier.icon}
                {tier.name}
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-black text-white italic tracking-tighter">
                  {tier.pointsRequired === "0" ? "FREE" : tier.pointsRequired}
                </span>
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Points Threshold</span>
              </div>

              <ul className="space-y-4">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-[13px] sm:text-sm text-white/90 font-medium group-hover:translate-x-1 transition-transform">
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-300 font-black" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* How to Earn & Redeem */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* How to Earn */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-bold text-white">How to Earn Points</h3>
            </div>
            <div className="space-y-3">
              {earnMethods.map((method) => (
                <div key={method.action} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{method.action}</p>
                    <p className="text-sm text-purple-200">{method.points}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Redemption Options */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-pink-400" />
              <h3 className="text-xl font-bold text-white">Redeem Your Points</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {redemptionOptions.map((option) => (
                <div
                  key={option.label}
                  className={cn(
                    "p-4 rounded-xl bg-white/5",
                    "hover:bg-white/10 transition-all cursor-pointer"
                  )}
                >
                  <option.icon className="w-8 h-8 text-pink-300 mb-2" />
                  <h4 className="font-semibold text-white text-sm">{option.label}</h4>
                  <p className="text-xs text-purple-200">{option.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button variant="secondary" className="w-full mt-4 bg-gradient-to-r from-amber-400 to-pink-500 text-white border-0 hover:from-amber-500 hover:to-pink-600">
              View Rewards Catalog
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-20 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 rounded-[3rem] bg-white/10 backdrop-blur-md border border-white/20 shadow-3xl">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-300 via-pink-400 to-violet-600 border-4 border-white/10 flex items-center justify-center text-white text-xs sm:text-sm font-black shadow-xl"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter italic">Join 2M+ Legacy Earners</p>
              <p className="text-xs sm:text-sm text-purple-200 font-bold uppercase tracking-widest">Your first 1,000 points await your command!</p>
            </div>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-purple-900 font-black py-4 px-10 rounded-2xl shadow-2xl hover:scale-105 transition-transform uppercase tracking-widest text-xs">
              <Users className="w-5 h-5 mr-3" />
              Claim My Legacy
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default Xtravaganza;

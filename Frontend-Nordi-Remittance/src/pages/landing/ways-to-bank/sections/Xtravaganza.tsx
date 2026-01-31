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
            className="absolute w-2 h-2 rounded-full bg-white"
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
          className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12"
        >
          {[
            { value: "₦500M+", label: "Rewards Given" },
            { value: "2M+", label: "Active Members" },
            { value: "10K+", label: "Winners Monthly" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-purple-200">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-4 mb-12"
        >
          {rewardTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={cn(
                "relative p-6 rounded-2xl overflow-hidden",
                "bg-white/10 backdrop-blur-sm border border-white/20",
                index === 2 && "md:scale-105 md:-translate-y-2"
              )}
            >
              {/* Tier Badge */}
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-bold mb-4",
                `bg-gradient-to-r ${tier.color}`
              )}>
                {tier.icon}
                {tier.name}
              </div>

              <p className="text-white/70 text-sm mb-4">
                {tier.pointsRequired === "0" ? "Start here" : `${tier.pointsRequired}+ points`}
              </p>

              <ul className="space-y-2">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-white/90">
                    <Check className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
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
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-pink-400 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Join 2M+ members earning rewards</p>
              <p className="text-sm text-purple-200">Your first 1,000 points are on us!</p>
            </div>
            <Button variant="secondary" className="ml-4 bg-white text-purple-900 hover:bg-purple-50">
              <Users className="w-4 h-4 mr-2" />
              Join Now
            </Button>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
};

export default Xtravaganza;

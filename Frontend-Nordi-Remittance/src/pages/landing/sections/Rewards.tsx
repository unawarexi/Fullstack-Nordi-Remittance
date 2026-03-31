// ============================================================================
// REWARDS SECTION - Rewards and benefits program
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Percent,
  Plane,
  Coffee,
  ShoppingBag,
  Fuel,
  Utensils,
  Film,
  ArrowRight,
  Star,
  Crown,
} from "lucide-react";
import { cn } from "@utils/cn";
import { Section } from "@components/layout/Section";
import { Container } from "@components/layout/Container";

// ========================
// REWARDS DATA
// ========================
interface Reward {
  icon: React.ReactNode;
  category: string;
  cashback: string;
}

const rewards: Reward[] = [
  { icon: <Fuel className="w-5 h-5" />, category: "Gas Stations", cashback: "3%" },
  { icon: <ShoppingBag className="w-5 h-5" />, category: "Groceries", cashback: "3%" },
  { icon: <Utensils className="w-5 h-5" />, category: "Dining", cashback: "2%" },
  { icon: <Plane className="w-5 h-5" />, category: "Travel", cashback: "2%" },
  { icon: <Film className="w-5 h-5" />, category: "Entertainment", cashback: "2%" },
  { icon: <Coffee className="w-5 h-5" />, category: "Everything Else", cashback: "1%" },
];

interface Tier {
  name: string;
  icon: React.ReactNode;
  requirement: string;
  benefits: string[];
  color: string;
}

const tiers: Tier[] = [
  {
    name: "Silver",
    icon: <Star className="w-5 h-5" />,
    requirement: "$0 - $25,000",
    benefits: ["1% base cashback", "Free ATM withdrawals", "Mobile banking"],
    color: "bg-neutral-400",
  },
  {
    name: "Gold",
    icon: <Star className="w-5 h-5" />,
    requirement: "$25,000 - $100,000",
    benefits: ["1.5% base cashback", "Priority support", "Fee-free wires"],
    color: "bg-amber-50 dark:bg-amber-900/200",
  },
  {
    name: "Platinum",
    icon: <Crown className="w-5 h-5" />,
    requirement: "$100,000+",
    benefits: ["2% base cashback", "Concierge service", "Airport lounge access"],
    color: "bg-neutral-700",
  },
];

// ========================
// REWARD CARD COMPONENT
// ========================
interface RewardCardProps {
  reward: Reward;
  index: number;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className={cn(
      "flex flex-col items-center p-3 sm:p-4 rounded-xl",
      "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
      "hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-700 transition-all"
    )}
  >
    <div className="p-3 sm:p-4 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-inner">
      {React.isValidElement(reward.icon) 
        ? React.cloneElement(reward.icon as React.ReactElement, { className: "w-6 h-6" })
        : reward.icon}
    </div>
    <span className="text-2xl sm:text-4xl font-black text-indigo-600 italic tabular-nums tracking-tighter">{reward.cashback}</span>
    <span className="text-[10px] sm:text-xs text-neutral-400 font-black uppercase tracking-widest text-center mt-2 opacity-80">
      {reward.category}
    </span>
  </motion.div>
);

// ========================
// TIER CARD COMPONENT
// ========================
interface TierCardProps {
  tier: Tier;
  index: number;
}

const TierCard: React.FC<TierCardProps> = ({ tier, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className={cn(
      "relative p-4 sm:p-5 rounded-xl",
      "bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700",
      "hover:shadow-lg dark:hover:shadow-neutral-900/50 transition-shadow"
    )}
  >
    <div className="flex items-center gap-3 mb-3 sm:mb-4">
      <div className={cn("p-2 rounded-lg text-white", tier.color)}>
        {tier.icon}
      </div>
      <div>
        <h4 className="font-semibold text-neutral-900 dark:text-white text-sm sm:text-base">{tier.name}</h4>
        <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">{tier.requirement}</p>
      </div>
    </div>
    <ul className="space-y-1.5 sm:space-y-2">
      {tier.benefits.map((benefit) => (
        <li key={benefit} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/300" />
          {benefit}
        </li>
      ))}
    </ul>
  </motion.div>
);

// ========================
// MAIN COMPONENT
// ========================
const Rewards: React.FC = () => {
  return (
    <Section background="light" className="py-8 sm:py-12 lg:py-16">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16">
          {/* Left - Cashback Categories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-3 sm:mb-4">
              <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Rewards Program
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
              Earn Cashback on Every Purchase
            </h2>
            <p className="mt-2 sm:mt-3 text-sm md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Turn your everyday spending into rewards. Earn up to 3% cashback on purchases
              across popular categories with no annual fee.
            </p>

            {/* Cashback Grid */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {rewards.map((reward, index) => (
                <RewardCard key={reward.category} reward={reward} index={index} />
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 flex items-center gap-6 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700">
              <div>
                <div className="text-2xl font-bold text-indigo-600">$125M+</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Cashback paid</div>
              </div>
              <div className="w-px h-10 bg-neutral-200" />
              <div>
                <div className="text-2xl font-bold text-indigo-600">2.5M</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Members</div>
              </div>
              <div className="w-px h-10 bg-neutral-200" />
              <div>
                <div className="text-2xl font-bold text-indigo-600">4.8★</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Avg rating</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Membership Tiers */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Membership Tiers
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Unlock more benefits as your relationship grows
              </p>
            </motion.div>

            <div className="space-y-4">
              {tiers.map((tier, index) => (
                <TierCard key={tier.name} tier={tier} index={index} />
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6"
            >
              <a
                href="/rewards"
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-3 rounded-xl",
                  "bg-indigo-600 text-white font-medium",
                  "hover:bg-indigo-700 transition-colors"
                )}
              >
                Join Rewards Program
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
                No annual fee • Instant enrollment • Start earning today
              </p>
            </motion.div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default Rewards;

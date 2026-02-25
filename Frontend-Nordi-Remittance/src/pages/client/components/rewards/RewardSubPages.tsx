// ============================================================================
// REWARDS SUB-PAGES — My Rewards, Redeem, Special Offers, Partner Discounts
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Gift, Star, Tag, Percent, Trophy, Zap,
  ShoppingBag, Coffee, Plane, CreditCard, Crown,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useUIStore } from "@store/ui.store";

/* ═══════ MY REWARDS ═══════ */
export const MyRewards: React.FC = () => {
  const tiers = [
    { name: "Silver", min: 0, max: 5000, color: "from-gray-400 to-gray-500" },
    { name: "Gold", min: 5000, max: 15000, color: "from-amber-400 to-yellow-500" },
    { name: "Platinum", min: 15000, max: 50000, color: "from-indigo-500 to-purple-500" },
    { name: "Diamond", min: 50000, max: 100000, color: "from-cyan-400 to-blue-500" },
  ];
  const points = 12450;
  const currentTier = tiers.find((t) => points >= t.min && points < t.max) || tiers[2];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="My Rewards"
          subtitle="Track your rewards and loyalty points"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Rewards", href: "/customer/rewards" },
            { label: "My Rewards" },
          ]}
        />
      </motion.div>

      <DashCard className="mb-6 text-center py-8">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl flex items-center justify-center text-white mb-4">
          <Trophy size={28} />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1">
          {points.toLocaleString()}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">Total Reward Points</p>
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${currentTier.color} text-white text-xs sm:text-sm font-medium`}>
          <Crown size={14} /> {currentTier.name} Member
        </div>
        {nextTier && (
          <div className="mt-6 max-w-xs mx-auto">
            <div className="flex justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{currentTier.name}</span>
              <span>{nextTier.name}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${nextTier.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              {(nextTier.min - points).toLocaleString()} points to {nextTier.name}
            </p>
          </div>
        )}
      </DashCard>

      <StatsGrid cols={3}>
        <StatCard label="This Month" value="+850" icon={<Zap size={20} />} iconColor="from-emerald-500 to-teal-500" />
        <StatCard label="Redeemed" value="3,200" icon={<Gift size={20} />} iconColor="from-pink-500 to-rose-500" />
        <StatCard label="Expiring Soon" value="500" icon={<Star size={20} />} iconColor="from-amber-500 to-orange-500" />
      </StatsGrid>
    </PageContainer>
  );
};

/* ═══════ REDEEM POINTS ═══════ */
export const RedeemPoints: React.FC = () => {
  const rewards = [
    { name: "Amazon Gift Card", points: 2500, icon: ShoppingBag, gradient: "from-amber-500 to-orange-500" },
    { name: "Coffee Voucher", points: 500, icon: Coffee, gradient: "from-amber-700 to-yellow-600" },
    { name: "Flight Miles", points: 5000, icon: Plane, gradient: "from-indigo-500 to-purple-500" },
    { name: "Cash Back", points: 1000, icon: CreditCard, gradient: "from-emerald-500 to-teal-500" },
    { name: "Movie Tickets", points: 800, icon: Star, gradient: "from-pink-500 to-rose-500" },
    { name: "Premium Subscription", points: 3000, icon: Crown, gradient: "from-violet-500 to-purple-600" },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Redeem Points"
          subtitle="Exchange your points for exciting rewards"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Rewards", href: "/customer/rewards" },
            { label: "Redeem" },
          ]}
        />
      </motion.div>

      <DashCard className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Available Points</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">12,450</p>
          </div>
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white">
            <Star size={24} />
          </div>
        </div>
      </DashCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((r) => (
          <motion.div key={r.name} variants={dashboardItemVariants}>
            <DashCard className="h-full flex flex-col">
              <div className={`w-12 h-12 bg-gradient-to-br ${r.gradient} rounded-2xl flex items-center justify-center text-white mb-4`}>
                <r.icon size={20} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{r.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{r.points.toLocaleString()} points</p>
              <div className="mt-auto">
                <motion.button
                  className={`w-full py-2 rounded-xl text-xs sm:text-sm font-medium transition-all bg-gradient-to-r ${r.gradient} text-white`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Redeem
                </motion.button>
              </div>
            </DashCard>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

/* ═══════ SPECIAL OFFERS ═══════ */
export const SpecialOffers: React.FC = () => {
  const offers = [
    { title: "2X Points Weekend", desc: "Earn double points on all card transactions this weekend", gradient: "from-indigo-600 to-purple-600", badge: "Limited Time" },
    { title: "Refer & Earn", desc: "Get 1,000 bonus points for every friend who joins", gradient: "from-emerald-600 to-teal-600", badge: "Ongoing" },
    { title: "Birthday Bonus", desc: "Celebrate with 500 free points on your birthday month", gradient: "from-pink-600 to-rose-600", badge: "Personal" },
    { title: "First Transfer Bonus", desc: "Earn 250 points on your first international transfer", gradient: "from-amber-600 to-orange-600", badge: "New" },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Special Offers"
          subtitle="Exclusive offers and promotions for you"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Rewards", href: "/customer/rewards" },
            { label: "Offers" },
          ]}
        />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {offers.map((o) => (
          <motion.div key={o.title} variants={dashboardItemVariants}>
            <div className={`relative bg-gradient-to-br ${o.gradient} rounded-2xl p-5 sm:p-6 text-white overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8" />
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-medium mb-3">
                {o.badge}
              </span>
              <h3 className="text-base sm:text-lg font-bold mb-2">{o.title}</h3>
              <p className="text-xs sm:text-sm text-white/80 mb-4">{o.desc}</p>
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs sm:text-sm font-medium transition-colors">
                Learn More
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

/* ═══════ PARTNER DISCOUNTS ═══════ */
export const PartnerDiscounts: React.FC = () => {
  const partners = [
    { name: "Amazon", discount: "15% off", category: "Shopping", icon: ShoppingBag },
    { name: "Starbucks", discount: "Buy 1 Get 1", category: "Food & Drink", icon: Coffee },
    { name: "Emirates", discount: "10% off flights", category: "Travel", icon: Plane },
    { name: "Netflix", discount: "1 Month Free", category: "Entertainment", icon: Star },
    { name: "Nike", discount: "20% off", category: "Fashion", icon: Tag },
    { name: "Uber", discount: "$10 credit", category: "Transport", icon: Zap },
  ];

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Partner Discounts"
          subtitle="Exclusive discounts from our partner brands"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Rewards", href: "/customer/rewards" },
            { label: "Partners" },
          ]}
        />
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((p) => (
          <motion.div key={p.name} variants={dashboardItemVariants}>
            <DashCard className="cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <p.icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">{p.category}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] sm:text-xs font-medium">
                  {p.discount}
                </span>
              </div>
            </DashCard>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
};

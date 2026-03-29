// ============================================================================
// REWARDS SUB-PAGES — My Rewards, Redeem, Special Offers, Partner Discounts
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Gift, Star, Tag, Percent, Trophy, Zap,
  ShoppingBag, Coffee, Plane, CreditCard, Crown,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard, StatCard, StatsGrid, ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useUIStore } from "@store/ui.store";


const MyRewards: React.FC = () => {
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

export default MyRewards;

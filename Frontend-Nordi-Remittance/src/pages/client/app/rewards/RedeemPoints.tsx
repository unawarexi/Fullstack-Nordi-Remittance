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


const RedeemPoints: React.FC = () => {
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

export default RedeemPoints;

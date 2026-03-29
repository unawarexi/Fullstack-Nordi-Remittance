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


const PartnerDiscounts: React.FC = () => {
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

export default PartnerDiscounts;

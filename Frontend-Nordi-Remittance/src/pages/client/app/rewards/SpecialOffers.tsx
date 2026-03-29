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


const SpecialOffers: React.FC = () => {
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

export default SpecialOffers;

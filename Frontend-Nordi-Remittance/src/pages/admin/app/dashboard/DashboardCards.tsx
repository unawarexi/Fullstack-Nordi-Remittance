import React from "react";
import { useNavigate } from "react-router-dom";
import { DashCard, SectionHeader, StatusBadge } from "@components/shared/DashboardPrimitives";
import { SkeletonBlock } from "@components/skeletons/Skeletons";
import { FiCreditCard, FiLock, FiShoppingBag, FiPlus } from "react-icons/fi";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DashboardCardsProps {
  cardsData: {
    totalCards: number;
    activeCards: number;
    frozenCards: number;
    totalSpending: number;
    virtualCards: number;
    physicalCards: number;
    recentCardActivity: any[];
  };
  isLoading: boolean;
}

const formatAmount = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(1)}K`;
  return `€${v.toLocaleString()}`;
};

const DashboardCards: React.FC<DashboardCardsProps> = ({ cardsData, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <DashCard>
        <SkeletonBlock className="h-5 w-36 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-8 w-full" />
              <SkeletonBlock className="h-3 w-16" />
            </div>
          ))}
        </div>
      </DashCard>
    );
  }

  const cardStats = [
    {
      icon: <FiCreditCard size={14} />,
      label: "Active",
      value: cardsData.activeCards,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      icon: <FiLock size={14} />,
      label: "Frozen",
      value: cardsData.frozenCards,
      color: "text-sky-500",
      bg: "bg-sky-50 dark:bg-sky-950/50",
    },
    {
      icon: <FiShoppingBag size={14} />,
      label: "Spending",
      value: formatAmount(cardsData.totalSpending),
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/50",
    },
  ];

  return (
    <DashCard hover onClick={() => navigate("/admin/cards")}>
      <SectionHeader
        title="Cards Overview"
        subtitle={`${cardsData.totalCards} total cards`}
        onActionClick={() => navigate("/admin/cards")}
      />

      {/* Card Type Split */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
          <FiCreditCard size={14} className="text-indigo-500" />
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{cardsData.virtualCards}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Virtual</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50">
          <FiPlus size={14} className="text-amber-500" />
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{cardsData.physicalCards}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Physical</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {cardStats.map(({ icon, label, value, color, bg }) => (
          <div key={label} className={`flex flex-col items-center p-2.5 rounded-xl ${bg}`}>
            <span className={`mb-1 ${color}`}>{icon}</span>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Card Activity */}
      {cardsData.recentCardActivity.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent Activity</p>
          {cardsData.recentCardActivity.slice(0, 3).map((activity: any, idx: number) => (
            <div
              key={activity.id || idx}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                  {activity.cardHolder || activity.user || "Card Holder"}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {activity.action || activity.type || "Transaction"} • {activity.time || ""}
                </p>
              </div>
              <StatusBadge status={activity.status || "active"} />
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
};

export default DashboardCards;

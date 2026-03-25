import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { StatCard, StatsGrid } from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton } from "@components/skeletons/Skeletons";

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalTransactions: number;
    totalRevenue: number;
    growthRate: number;
    usersChange: string | null;
    transactionsChange: string | null;
    revenueChange: string | null;
  };
  isLoading: boolean;
}

const formatRevenue = (v: number) => {
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `€${(v / 1_000).toFixed(1)}K`;
  return `€${v.toLocaleString()}`;
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) return <StatsGridSkeleton count={4} />;

  return (
    <StatsGrid cols={4}>
      <StatCard
        label="Total Users"
        value={stats.totalUsers.toLocaleString()}
        icon={<Users size={20} />}
        iconColor="from-blue-500 to-indigo-500"
        change={stats.usersChange ?? undefined}
        positive={!stats.usersChange?.startsWith("-")}
        onClick={() => navigate("/admin/users/all")}
        index={0}
      />
      <StatCard
        label="Transactions"
        value={stats.totalTransactions.toLocaleString()}
        icon={<CreditCard size={20} />}
        iconColor="from-emerald-500 to-teal-500"
        change={stats.transactionsChange ?? undefined}
        positive={!stats.transactionsChange?.startsWith("-")}
        onClick={() => navigate("/admin/transactions/all")}
        index={1}
      />
      <StatCard
        label="Revenue"
        value={formatRevenue(stats.totalRevenue)}
        icon={<DollarSign size={20} />}
        iconColor="from-purple-500 to-violet-500"
        change={stats.revenueChange ?? undefined}
        positive={!stats.revenueChange?.startsWith("-")}
        onClick={() => navigate("/admin/reports/financial")}
        index={2}
      />
      <StatCard
        label="Growth"
        value={`+${stats.growthRate}%`}
        icon={<TrendingUp size={20} />}
        iconColor="from-amber-500 to-orange-500"
        onClick={() => navigate("/admin/reports")}
        index={3}
      />
    </StatsGrid>
  );
};

export default DashboardStats;

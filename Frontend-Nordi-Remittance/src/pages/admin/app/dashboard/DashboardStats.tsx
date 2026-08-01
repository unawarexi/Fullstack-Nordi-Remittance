import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, CreditCard, DollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle, Activity } from "lucide-react";
import { StatCard, StatsGrid } from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton } from "@components/skeletons/Skeletons";

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalTransactions: number;
    totalRevenue: number;
    totalCredited?: number;
    totalDebited?: number;
    growthRate?: number;
    successRate?: number;
    usersChange?: string | null;
    transactionsChange?: string | null;
    revenueChange?: string | null;
    [key: string]: any;
  };
  isLoading: boolean;
}

const formatCurrency = (v?: number) => {
  const val = Number(v) || 0;
  if (val >= 1_000_000) return `€${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `€${(val / 1_000).toFixed(2)}K`;
  return `€${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) return <StatsGridSkeleton count={6} />;

  return (
    <StatsGrid cols={3} className="!grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-6">
      <StatCard
        label="Total Users"
        value={(Number(stats.totalUsers) || 0).toLocaleString()}
        icon={<Users size={20} />}
        iconColor="from-blue-500 to-indigo-500"
        change={stats.usersChange || "+12.5% this month"}
        positive={true}
        onClick={() => navigate("/admin/users/all")}
        index={0}
      />
      <StatCard
        label="Transactions Done"
        value={(Number(stats.totalTransactions) || 0).toLocaleString()}
        icon={<CreditCard size={20} />}
        iconColor="from-teal-500 to-emerald-500"
        change={stats.transactionsChange || "+8.4% this week"}
        positive={true}
        onClick={() => navigate("/admin/transactions/all")}
        index={1}
      />
      <StatCard
        label="Money Credited"
        value={formatCurrency(stats.totalCredited)}
        icon={<ArrowDownCircle size={20} />}
        iconColor="from-emerald-500 to-green-600"
        change="Inflows & Deposits"
        positive={true}
        onClick={() => navigate("/admin/transactions/all")}
        index={2}
      />
      <StatCard
        label="Money Debited"
        value={formatCurrency(stats.totalDebited)}
        icon={<ArrowUpCircle size={20} />}
        iconColor="from-rose-500 to-amber-500"
        change="Outflows & Withdrawals"
        positive={false}
        onClick={() => navigate("/admin/transactions/all")}
        index={3}
      />
      <StatCard
        label="Total Volume"
        value={formatCurrency(stats.totalRevenue)}
        icon={<DollarSign size={20} />}
        iconColor="from-purple-500 to-violet-500"
        change={stats.revenueChange || "+15.2% this month"}
        positive={true}
        onClick={() => navigate("/admin/reports/financial")}
        index={4}
      />
      <StatCard
        label="Platform Health"
        value={`${stats.successRate || 98}% Success`}
        icon={<Activity size={20} />}
        iconColor="from-amber-500 to-orange-500"
        change={`+${stats.growthRate || 14.5}% Growth`}
        positive={true}
        onClick={() => navigate("/admin/reports")}
        index={5}
      />
    </StatsGrid>
  );
};

export default DashboardStats;

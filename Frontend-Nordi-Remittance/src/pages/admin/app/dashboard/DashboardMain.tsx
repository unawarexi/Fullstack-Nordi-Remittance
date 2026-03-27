import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie,
  Pie, Cell, Legend,
} from "recharts";
import { DashCard, SectionHeader } from "@components/shared/DashboardPrimitives";
import { ChartSkeleton } from "@components/skeletons/Skeletons";
import { useInView } from "@hooks/useInView";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CHART_COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

interface DashboardMainProps {
  revenueData: { name: string; value: number }[];
  weeklyTransactions: { name: string; value: number }[];
  accountDistribution: { name: string; value: number }[];
  activityData: any[];
  isChartsLoading: boolean;
}

// ========================
// REVENUE CHART
// ========================
const RevenueChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  const navigate = useNavigate();

  if (data.length === 0) {
    return (
      <DashCard className="lg:col-span-2">
        <SectionHeader title="Revenue Trend" onActionClick={() => navigate("/admin/reports/financial")} />
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-12">No revenue data available</p>
      </DashCard>
    );
  }

  return (
    <DashCard className="lg:col-span-2" hover onClick={() => navigate("/admin/reports/financial")}>
      <SectionHeader title="Revenue Trend" subtitle="Monthly revenue overview" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
            <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashCard>
  );
};

// ========================
// WEEKLY TRANSACTIONS CHART
// ========================
const WeeklyTransactionsChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <DashCard hover onClick={() => navigate("/admin/transactions/all")}>
      <SectionHeader title="Weekly Transactions" onActionClick={() => navigate("/admin/transactions/all")} />
      <div className="h-56">
        {data.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-12">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashCard>
  );
};

// ========================
// ACCOUNT DISTRIBUTION PIE
// ========================
const AccountDistributionChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <DashCard hover onClick={() => navigate("/admin/accounts")}>
      <SectionHeader title="Account Distribution" onActionClick={() => navigate("/admin/accounts")} />
      <div className="h-56">
        {data.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-12">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={10} iconType="circle"
                formatter={(value: string) => <span className="text-xs text-gray-700 dark:text-gray-300">{value}</span>} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </RechartsPie>
          </ResponsiveContainer>
        )}
      </div>
    </DashCard>
  );
};

// ========================
// USER ACTIVITY CHART
// ========================
const UserActivityChart: React.FC<{ data: any[] }> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <DashCard className="lg:col-span-2" hover onClick={() => navigate("/admin/reports/users")}>
      <SectionHeader title="User Activity by Channel" onActionClick={() => navigate("/admin/reports/users")} />
      <div className="h-56">
        {data.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-12">No activity data</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconSize={10} formatter={(value: string) => <span className="text-xs">{value}</span>} />
              <Bar dataKey="mobile" name="Mobile App" stackId="a" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="web" name="Web Banking" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="branch" name="Branch Visits" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashCard>
  );
};

// ========================
// MAIN DASHBOARD CONTENT
// ========================
const DashboardMain: React.FC<DashboardMainProps> = ({
  revenueData,
  weeklyTransactions,
  accountDistribution,
  activityData,
  isChartsLoading,
}) => {
  const [chartsRef, chartsInView] = useInView();
  const [activityRef, activityInView] = useInView();

  return (
    <div className="flex-1 space-y-4">
      {/* Revenue Chart (always visible) */}
      {isChartsLoading ? <ChartSkeleton /> : <RevenueChart data={revenueData} />}

      {/* Weekly Transactions + Account Distribution — lazy */}
      <div ref={chartsRef}>
        {chartsInView ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeeklyTransactionsChart data={weeklyTransactions} />
            <AccountDistributionChart data={accountDistribution} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        )}
      </div>

      {/* User Activity — lazy */}
      <div ref={activityRef}>
        {activityInView ? (
          <UserActivityChart data={activityData} />
        ) : (
          <ChartSkeleton />
        )}
      </div>
    </div>
  );
};

export default DashboardMain;

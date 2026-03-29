import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  PieChart as PieChartIcon,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  FileBarChart,
  Globe,
  Shield,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  SectionHeader,
  FilterPill,
  ActionButton,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useReportsAnalytics } from "../../domain/useReportsAnalytics";

const timeFilters = ["7d", "30d", "90d", "1y"];

const reportSections = [
  { id: "financial", label: "Financial Reports", icon: <DollarSign size={18} />, color: "from-emerald-500 to-emerald-600" },
  { id: "users", label: "User Analytics", icon: <Users size={18} />, color: "from-blue-500 to-blue-600" },
  { id: "transactions", label: "Transaction Reports", icon: <BarChart3 size={18} />, color: "from-violet-500 to-violet-600" },
  { id: "risk", label: "Risk & Compliance", icon: <Shield size={18} />, color: "from-rose-500 to-rose-600" },
];

export default function ReportsAnalytics() {
  const {
    stats,
    revenueData,
    transactionVolume,
    userGrowthData,
    regionDistribution,
    riskMetrics,
    activeTime,
    activeSection,
    isLoading,
    setActiveTime,
    setActiveSection,
  } = useReportsAnalytics();

  return (
    <PageContainer>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Comprehensive reports, financial analytics, and compliance dashboards"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Reports & Analytics" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export All" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Schedule Report" icon={<Calendar size={14} />} onClick={() => {}} />
          </div>
        }
      />

      <StatsGrid>
        <StatCard label="Total Revenue" value={`€${(stats.totalRevenue / 1000000).toFixed(2)}M`} icon={<DollarSign size={18} />} iconColor="from-emerald-500 to-emerald-600" change="Revenue" positive index={0} />
        <StatCard label="Transaction Volume" value={stats.transactionVolume.toLocaleString()} icon={<BarChart3 size={18} />} iconColor="from-blue-500 to-blue-600" index={1} />
        <StatCard label="Active Users" value={stats.activeUsers.toLocaleString()} icon={<Users size={18} />} iconColor="from-violet-500 to-violet-600" index={2} />
        <StatCard label="Avg Transaction" value={`€${stats.avgTransaction.toLocaleString()}`} icon={<TrendingUp size={18} />} iconColor="from-amber-500 to-amber-600" index={3} />
      </StatsGrid>

      {/* Section Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        {reportSections.map((section) => (
          <motion.button
            key={section.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveSection(section.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeSection === section.id
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg"
                : "bg-white dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {section.icon}
            {section.label}
          </motion.button>
        ))}
      </div>

      {/* Time Filter */}
      <div className="flex gap-2 mb-4">
        {timeFilters.map((t) => (
          <FilterPill key={t} label={t} active={activeTime === t} onClick={() => setActiveTime(t as any)} />
        ))}
      </div>

      {/* Financial Reports Section */}
      {activeSection === "financial" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <DashCard>
            <SectionHeader title="Revenue Overview" subtitle="Monthly revenue, fees collected, and operational expenses" />
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb40" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, ""]} contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                  <Area type="monotone" dataKey="fees" stroke="#10b981" fill="url(#feeGrad)" strokeWidth={2} name="Fees" />
                  <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashCard>
        </motion.div>
      )}

      {/* User Analytics Section */}
      {activeSection === "users" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DashCard>
                <SectionHeader title="User Growth" subtitle="New registrations, active users, and churn over time" />
                <div className="h-[300px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb40" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Bar dataKey="newUsers" fill="#6366f1" radius={[4, 4, 0, 0]} name="New Users" />
                      <Bar dataKey="churnedUsers" fill="#ef4444" radius={[4, 4, 0, 0]} name="Churned" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DashCard>
            </div>
            <DashCard>
              <SectionHeader title="Regional Distribution" />
              <div className="h-[250px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={regionDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0} paddingAngle={3}>
                      {regionDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {regionDistribution.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-gray-600 dark:text-gray-300">{r.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{r.value}%</span>
                  </div>
                ))}
              </div>
            </DashCard>
          </div>
        </motion.div>
      )}

      {/* Transaction Reports Section */}
      {activeSection === "transactions" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <DashCard>
            <SectionHeader title="Transaction Volume by Type" subtitle="Domestic, international, and remittance transaction trends" />
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb40" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="domestic" fill="#6366f1" radius={[3, 3, 0, 0]} name="Domestic" />
                  <Bar dataKey="international" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="International" />
                  <Bar dataKey="remittance" fill="#a78bfa" radius={[3, 3, 0, 0]} name="Remittance" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashCard>
        </motion.div>
      )}

      {/* Risk & Compliance Section */}
      {activeSection === "risk" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <DashCard>
            <SectionHeader title="Risk & Compliance Metrics" subtitle="Fraud detection, AML compliance, and resolution performance" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {riskMetrics.map((metric, i) => (
                <motion.div key={metric.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{metric.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{metric.value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-[10px] font-medium ${metric.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {metric.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {metric.change}
                  </div>
                </motion.div>
              ))}
            </div>
          </DashCard>
        </motion.div>
      )}
    </PageContainer>
  );
}

import React, { useState } from "react";
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

const timeFilters = ["7d", "30d", "90d", "1y"];

const revenueData = [
  { month: "Sep", revenue: 320000, fees: 12800, expenses: 85000 },
  { month: "Oct", revenue: 385000, fees: 15400, expenses: 92000 },
  { month: "Nov", revenue: 410000, fees: 16400, expenses: 88000 },
  { month: "Dec", revenue: 520000, fees: 20800, expenses: 105000 },
  { month: "Jan", revenue: 480000, fees: 19200, expenses: 98000 },
  { month: "Feb", revenue: 545000, fees: 21800, expenses: 110000 },
  { month: "Mar", revenue: 610000, fees: 24400, expenses: 115000 },
];

const transactionVolume = [
  { month: "Sep", domestic: 12500, international: 4800, remittance: 3200 },
  { month: "Oct", domestic: 14200, international: 5300, remittance: 3800 },
  { month: "Nov", domestic: 13800, international: 5100, remittance: 3600 },
  { month: "Dec", domestic: 18200, international: 6800, remittance: 4500 },
  { month: "Jan", domestic: 16500, international: 6200, remittance: 4100 },
  { month: "Feb", domestic: 17800, international: 6500, remittance: 4300 },
  { month: "Mar", domestic: 19500, international: 7200, remittance: 4800 },
];

const userGrowthData = [
  { month: "Sep", newUsers: 1200, activeUsers: 8500, churnedUsers: 150 },
  { month: "Oct", newUsers: 1450, activeUsers: 9200, churnedUsers: 180 },
  { month: "Nov", newUsers: 1380, activeUsers: 9800, churnedUsers: 160 },
  { month: "Dec", newUsers: 1800, activeUsers: 10500, churnedUsers: 200 },
  { month: "Jan", newUsers: 1650, activeUsers: 11200, churnedUsers: 190 },
  { month: "Feb", newUsers: 1920, activeUsers: 12000, churnedUsers: 170 },
  { month: "Mar", newUsers: 2100, activeUsers: 13200, churnedUsers: 155 },
];

const regionDistribution = [
  { name: "Nordics", value: 45, color: "#6366f1" },
  { name: "Europe", value: 25, color: "#8b5cf6" },
  { name: "Africa", value: 18, color: "#a78bfa" },
  { name: "Americas", value: 8, color: "#c4b5fd" },
  { name: "Asia", value: 4, color: "#ddd6fe" },
];

const riskMetrics = [
  { label: "Fraud Detection Rate", value: "98.7%", change: "+0.3%", positive: true },
  { label: "False Positive Rate", value: "2.1%", change: "-0.5%", positive: true },
  { label: "Avg Resolution Time", value: "4.2h", change: "-18min", positive: true },
  { label: "AML Compliance Score", value: "96/100", change: "+2", positive: true },
];

const reportSections = [
  { id: "financial", label: "Financial Reports", icon: <DollarSign size={18} />, color: "from-emerald-500 to-emerald-600" },
  { id: "users", label: "User Analytics", icon: <Users size={18} />, color: "from-blue-500 to-blue-600" },
  { id: "transactions", label: "Transaction Reports", icon: <BarChart3 size={18} />, color: "from-violet-500 to-violet-600" },
  { id: "risk", label: "Risk & Compliance", icon: <Shield size={18} />, color: "from-rose-500 to-rose-600" },
];

export default function ReportsAnalytics() {
  const [activeTime, setActiveTime] = useState("30d");
  const [activeSection, setActiveSection] = useState("financial");

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
        <StatCard label="Total Revenue" value="€3.27M" icon={<DollarSign size={18} />} iconColor="from-emerald-500 to-emerald-600" change="+18.3% vs prior" positive index={0} />
        <StatCard label="Transaction Volume" value="112.5K" icon={<BarChart3 size={18} />} iconColor="from-blue-500 to-blue-600" change="+12.7% vs prior" positive index={1} />
        <StatCard label="Active Users" value="13,200" icon={<Users size={18} />} iconColor="from-violet-500 to-violet-600" change="+10% growth" positive index={2} />
        <StatCard label="Avg Transaction" value="€485" icon={<TrendingUp size={18} />} iconColor="from-amber-500 to-amber-600" change="+5.2% vs prior" positive index={3} />
      </StatsGrid>

      {/* Section Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        {reportSections.map((section) => (
          <motion.button
            key={section.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setActiveSection(section.id)}
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
          <FilterPill key={t} label={t} active={activeTime === t} onClick={() => setActiveTime(t)} />
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

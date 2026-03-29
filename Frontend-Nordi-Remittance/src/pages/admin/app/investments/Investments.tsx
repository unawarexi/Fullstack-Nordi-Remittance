import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  BarChart2,
  PieChart,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Briefcase,
  Landmark,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  FilterBar,
  FilterSelect,
  FilterPill,
  ActionButton,
  StatusBadge,
  SectionHeader,
  ProgressBar,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useToast } from "@store/toast.store";
import { useInvestmentsManagement } from "../../domain/useInvestmentsManagement";

const statusFilters = ["All", "Active", "Matured", "Pending", "Closed"];

const typeIcons: Record<string, React.ReactNode> = {
  fixed_deposit: <Landmark size={16} />,
  mutual_fund: <BarChart2 size={16} />,
  bond: <Shield size={16} />,
  equity: <TrendingUp size={16} />,
};

export default function AdminInvestments() {
  const toast = useToast();
  const {
    investments: filtered,
    portfolio,
    performanceData,
    stats,
    search,
    setSearch,
    statusFilter: activeStatus,
    setStatusFilter: setActiveStatus,
    typeFilter,
    setTypeFilter,
    refetch,
    isLoading,
  } = useInvestmentsManagement();

  const allocationData = portfolio.allocation;

  const totalAUM = portfolio.totalValue;
  const totalInvested = portfolio.totalInvested;
  const avgReturn = portfolio.returnPercentage;

  return (
    <PageContainer>
      <PageHeader
        title="Investment Products"
        subtitle="Manage investment portfolios, monitor performance, and approve applications"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Investments" },
        ]}
        actions={
          <div className="flex gap-2">
            <ActionButton label="Export" icon={<Download size={14} />} onClick={() => {}} variant="secondary" />
            <ActionButton label="Refresh" icon={<RefreshCw size={14} />} onClick={() => refetch()} />
          </div>
        }
      />

      <StatsGrid>
        <StatCard label="Total AUM" value={`€${(totalAUM / 1000).toFixed(0)}K`} icon={<DollarSign size={18} />} iconColor="from-blue-500 to-blue-600" change="+8.2%" positive index={0} />
        <StatCard label="Total Invested" value={`€${(totalInvested / 1000).toFixed(0)}K`} icon={<Briefcase size={18} />} iconColor="from-indigo-500 to-indigo-600" index={1} />
        <StatCard label="Avg Return" value={`${avgReturn.toFixed(1)}%`} icon={<TrendingUp size={18} />} iconColor="from-emerald-500 to-emerald-600" change="annualized" positive index={2} />
        <StatCard label="Active Investments" value={stats.activeInvestments} icon={<BarChart2 size={18} />} iconColor="from-purple-500 to-purple-600" index={3} />
      </StatsGrid>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DashCard className="lg:col-span-2">
          <SectionHeader title="Portfolio Performance" subtitle="Last 6 months" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} className="fill-gray-500 dark:fill-gray-400" />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} className="fill-gray-500 dark:fill-gray-400" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "var(--tooltip-bg, #fff)", border: "1px solid var(--tooltip-border, #e5e7eb)" }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#perfGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashCard>

        <DashCard>
          <SectionHeader title="Asset Allocation" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend layout="vertical" verticalAlign="middle" align="right" iconSize={8} iconType="circle" formatter={(value: string) => <span className="text-[10px] text-gray-600 dark:text-gray-400">{value}</span>} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </DashCard>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <FilterPill key={s} label={s} active={activeStatus === s} onClick={() => setActiveStatus(s as any)} />
        ))}
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by investor or product...">
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All Types" },
            { value: "fixed_deposit", label: "Fixed Deposit" },
            { value: "mutual_fund", label: "Mutual Fund" },
            { value: "bond", label: "Bonds" },
            { value: "equity", label: "Equity" },
          ]}
        />
      </FilterBar>

      {/* Investments Table */}
      <DashCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {["Investment", "Product", "Invested", "Current Value", "Return", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                    exit={{ opacity: 0 }}
                    className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">{typeIcons[inv.type]}</div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{inv.investor}</p>
                          <p className="text-[10px] text-gray-400">{inv.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-700 dark:text-gray-300">{inv.productName}</p>
                    </td>
                    <td className="px-4 py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">€{inv.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">€{inv.currentValue.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${inv.returns >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {inv.returns >= 0 ? "+" : ""}{inv.returns}%
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"><Eye size={14} /></motion.button>
                        {inv.status === "pending" && (
                          <motion.button whileHover={{ scale: 1.1 }} onClick={() => toast.success(`${inv.id} approved`)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"><CheckCircle size={14} /></motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Briefcase size={32} className="mx-auto mb-2" />
            <p className="text-sm">No investments found</p>
          </div>
        )}
      </DashCard>
    </PageContainer>
  );
}

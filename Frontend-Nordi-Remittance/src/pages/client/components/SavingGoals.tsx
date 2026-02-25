// ============================================================================
// SAVING GOALS — Savings goals dashboard
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  PiggyBank,
  Plus,
  Target,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Calendar,
  Zap,
  BarChart3,
  Gift,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  AccountListSkeleton,
} from "@components/skeletons";
import {
  useSavingsGoals,
} from "@hooks/queries/useInvestments";
import { useUIStore } from "@store/ui.store";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const goalColors = [
  { gradient: "from-indigo-500 to-purple-600", light: "bg-indigo-50", text: "text-indigo-600" },
  { gradient: "from-emerald-500 to-teal-600", light: "bg-emerald-50", text: "text-emerald-600" },
  { gradient: "from-amber-500 to-orange-600", light: "bg-amber-50", text: "text-amber-600" },
  { gradient: "from-rose-500 to-pink-600", light: "bg-rose-50", text: "text-rose-600" },
  { gradient: "from-blue-500 to-cyan-600", light: "bg-blue-50", text: "text-blue-600" },
  { gradient: "from-violet-500 to-purple-600", light: "bg-violet-50", text: "text-violet-600" },
];

const SavingGoals: React.FC = () => {
  const navigate = useNavigate();
  const showBalances = useUIStore((s) => s.preferences.showBalances);

  const { data: goalsData, isLoading } = useSavingsGoals();
  const goals = (goalsData as any)?.data ? (goalsData as any).data : goalsData || [];

  const formatCurrency = (amount: number, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);

  // Computed
  const totalSaved = goals.reduce((a: number, g: any) => a + (g.currentAmount || g.saved || 0), 0);
  const totalTarget = goals.reduce((a: number, g: any) => a + (g.targetAmount || g.target || 0), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <motion.div
      className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Savings Goals"
          subtitle="Set goals, save automatically, and track your progress"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Savings Goals" },
          ]}
          actions={
            <motion.button
              onClick={() => navigate("/customer/savings/create")}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} />
              New Goal
            </motion.button>
          }
        />
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" variants={itemVariants}>
          {[
            { label: "Total Saved", value: showBalances ? formatCurrency(totalSaved) : "••••••", icon: <PiggyBank size={20} />, color: "from-indigo-500 to-purple-500" },
            { label: "Target Amount", value: showBalances ? formatCurrency(totalTarget) : "••••••", icon: <Target size={20} />, color: "from-emerald-500 to-teal-500" },
            { label: "Active Goals", value: String(goals.length), icon: <Star size={20} />, color: "from-amber-500 to-orange-500" },
            { label: "Overall Progress", value: `${overallProgress.toFixed(0)}%`, icon: <TrendingUp size={20} />, color: "from-violet-500 to-purple-500" },
          ].map((stat) => (
            <motion.div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow" whileHover={{ y: -2 }}>
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>{stat.icon}</div>
              </div>
              <p className="text-2xl font-bold text-indigo-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Goals List */}
      {isLoading ? (
        <AccountListSkeleton count={4} />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No Savings Goals Yet"
          description="Create your first savings goal and start building towards your dreams."
          action={{
            label: "Create Goal",
            onClick: () => navigate("/customer/savings/create"),
          }}
        />
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8" variants={containerVariants}>
          {goals.map((goal: any, index: number) => {
            const colorSet = goalColors[index % goalColors.length];
            const saved = goal.currentAmount || goal.saved || 0;
            const target = goal.targetAmount || goal.target || 1;
            const progress = Math.min((saved / target) * 100, 100);
            const daysLeft = goal.daysRemaining || goal.daysLeft;

            return (
              <motion.div
                key={goal._id || goal.id || index}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer"
                variants={itemVariants}
                whileHover={{ y: -3 }}
                onClick={() => navigate("/customer/savings/goals")}
              >
                <div className={`h-1.5 bg-gradient-to-r ${colorSet.gradient}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${colorSet.light} ${colorSet.text}`}>
                        {goal.icon ? <span className="text-xl">{goal.icon}</span> : <PiggyBank size={20} />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {goal.name || goal.title || "Savings Goal"}
                        </h3>
                        {daysLeft && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={10} />
                            {daysLeft} days left
                          </p>
                        )}
                      </div>
                    </div>
                    {progress >= 100 && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium flex items-center gap-1">
                        <Sparkles size={10} /> Complete
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-bold text-indigo-900">
                        {showBalances ? formatCurrency(saved) : "••••••"}
                      </span>
                      <span className="text-gray-500">
                        of {showBalances ? formatCurrency(target) : "••••••"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <motion.div
                        className={`bg-gradient-to-r ${colorSet.gradient} h-2.5 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% achieved</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); navigate("/customer/savings/goals"); }}
                    >
                      <DollarSign size={12} />
                      Add Funds
                    </motion.button>
                    <motion.button
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium hover:bg-purple-100"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); navigate("/customer/savings/analytics"); }}
                    >
                      <BarChart3 size={12} />
                      Analytics
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={itemVariants}>
        {[
          { label: "My Goals", icon: <Target size={20} />, route: "/customer/savings/goals", color: "text-indigo-600 bg-indigo-50" },
          { label: "Create Goal", icon: <Plus size={20} />, route: "/customer/savings/create", color: "text-emerald-600 bg-emerald-50" },
          { label: "Auto-Save", icon: <Zap size={20} />, route: "/customer/savings/auto-save", color: "text-amber-600 bg-amber-50" },
          { label: "Analytics", icon: <BarChart3 size={20} />, route: "/customer/savings/analytics", color: "text-purple-600 bg-purple-50" },
        ].map((link) => (
          <motion.button
            key={link.label}
            onClick={() => navigate(link.route)}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md text-left"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`p-2 rounded-lg ${link.color}`}>{link.icon}</div>
            <div>
              <p className="text-sm font-medium text-indigo-900">{link.label}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">View <ChevronRight size={12} /></p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SavingGoals;

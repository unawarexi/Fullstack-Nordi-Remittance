// ============================================================================
// SAVINGS SUB-PAGES — Goals List, Create Goal, Auto-Save Rules, Analytics
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Target, Plus, PiggyBank, TrendingUp, BarChart3,
  Calendar, Clock, ArrowRight, Zap, Settings,
  CheckCircle2, DollarSign, Percent, ChevronRight,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { StatsGridSkeleton, AccountListSkeleton, FormSkeleton } from "@components/skeletons";
import { useSavingsGoals, useCreateSavingsGoal, useSavingsGoalProgress } from "@hooks/queries/useInvestments";
import { useUIStore } from "@store/ui.store";
import { useToastStore } from "@store/toast.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const goalColors = ["from-indigo-500 to-purple-500", "from-emerald-500 to-teal-500", "from-blue-500 to-cyan-500", "from-amber-500 to-orange-500", "from-pink-500 to-rose-500", "from-violet-500 to-fuchsia-500"];

// ========================
// SAVINGS GOALS LIST
// ========================
export const SavingsGoalsList: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data, isLoading } = useSavingsGoals();
  const goals = (data as any)?.data ? (data as any).data : data || [];

  const totalSaved = goals.reduce((a: number, g: any) => a + (g.currentAmount || 0), 0);
  const totalTarget = goals.reduce((a: number, g: any) => a + (g.targetAmount || 0), 0);

  const stats = [
    { label: "Total Saved", value: show ? fmt(totalSaved) : "••••••", icon: <PiggyBank size={18} />, color: "from-emerald-500 to-teal-500" },
    { label: "Total Target", value: show ? fmt(totalTarget) : "••••••", icon: <Target size={18} />, color: "from-indigo-500 to-purple-500" },
    { label: "Active Goals", value: String(goals.length), icon: <BarChart3 size={18} />, color: "from-blue-500 to-cyan-500" },
    { label: "Avg. Progress", value: totalTarget > 0 ? `${((totalSaved / totalTarget) * 100).toFixed(0)}%` : "0%", icon: <TrendingUp size={18} />, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Savings Goals" subtitle="Track all your savings goals"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Savings", href: "/customer/savings" }, { label: "Goals" }]}
          actions={<motion.button onClick={() => navigate("/customer/savings/create")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Plus size={16} /> New Goal</motion.button>} />
      </motion.div>

      {isLoading ? <StatsGridSkeleton count={4} /> : (
        <>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" variants={containerVariants}>
            {stats.map((s) => (
              <motion.div key={s.label} className="bg-white rounded-xl shadow-sm p-5" variants={itemVariants}>
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${s.color} text-white mb-3`}>{s.icon}</div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-indigo-900">{s.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {goals.length === 0 ? (
            <EmptyState title="No Savings Goals" description="Create your first savings goal to start building towards your dreams." action={{ label: "Create Goal", onClick: () => navigate("/customer/savings/create") }} />
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerVariants}>
              {goals.map((goal: any, i: number) => {
                const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                const color = goalColors[i % goalColors.length];
                return (
                  <motion.div key={goal._id || i} className="bg-white rounded-xl shadow-sm p-5" variants={itemVariants} whileHover={{ y: -2 }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white`}><Target size={18} /></div>
                        <div><h3 className="font-semibold text-gray-900">{goal.name}</h3><p className="text-xs text-gray-500">{goal.deadline ? `Due: ${new Date(goal.deadline).toLocaleDateString()}` : "No deadline"}</p></div>
                      </div>
                      <span className="text-xs text-gray-400">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
                      <motion.div className={`h-3 rounded-full bg-gradient-to-r ${color}`} initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.1 }} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Saved: <span className="font-semibold text-indigo-900">{show ? fmt(goal.currentAmount || 0) : "••••••"}</span></span>
                      <span className="text-gray-500">Target: <span className="font-semibold text-gray-900">{show ? fmt(goal.targetAmount || 0) : "••••••"}</span></span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

// ========================
// CREATE GOAL
// ========================
export const CreateGoal: React.FC = () => {
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.showToast);
  const createGoal = useCreateSavingsGoal();
  const [form, setForm] = useState({ name: "", targetAmount: "", deadline: "", description: "", autoSave: false, autoAmount: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.targetAmount) { showToast("Name and target are required", "error"); return; }
    createGoal.mutate({ name: form.name, targetAmount: Number(form.targetAmount), deadline: form.deadline || undefined, description: form.description } as any, {
      onSuccess: () => { showToast("Savings goal created!", "success"); navigate("/customer/savings/goals"); },
      onError: () => showToast("Failed to create goal", "error"),
    });
  };

  const icons = [
    { label: "Vacation", icon: "🏖️" }, { label: "Car", icon: "🚗" }, { label: "Home", icon: "🏡" },
    { label: "Education", icon: "📚" }, { label: "Emergency", icon: "🛟" }, { label: "Wedding", icon: "💍" },
    { label: "Tech", icon: "💻" }, { label: "Other", icon: "🎯" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Create Savings Goal" subtitle="Set a new financial target"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Savings", href: "/customer/savings" }, { label: "Create" }]} />
      </motion.div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-4">Goal Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Goal Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dream Vacation" className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Target Amount</label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span><input type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} placeholder="0.00" className="w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" required min={1} /></div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Target Date</label>
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Description (optional)</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What are you saving for?" rows={3} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" />
            </div>
          </div>
        </motion.div>

        <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-4">Choose Icon</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {icons.map((ic) => (
              <button key={ic.label} type="button" className="flex flex-col items-center gap-1 p-3 rounded-xl border hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                <span className="text-2xl">{ic.icon}</span>
                <span className="text-xs text-gray-500">{ic.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div className="flex gap-3" variants={itemVariants}>
          <motion.button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={createGoal.isPending}>
            {createGoal.isPending ? "Creating..." : "Create Goal"}
          </motion.button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
        </motion.div>
      </form>
    </motion.div>
  );
};

// ========================
// AUTO-SAVE RULES
// ========================
export const AutoSaveRules: React.FC = () => {
  const rules = [
    { id: 1, name: "Weekly Savings", amount: 50, frequency: "weekly", goal: "Emergency Fund", active: true, nextDate: "2024-02-05" },
    { id: 2, name: "Monthly Vacation Fund", amount: 200, frequency: "monthly", goal: "Dream Vacation", active: true, nextDate: "2024-02-15" },
    { id: 3, name: "Round-Up Savings", amount: 0, frequency: "per transaction", goal: "General Savings", active: false, nextDate: "—" },
  ];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Auto-Save Rules" subtitle="Automate your savings with recurring transfers"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Savings", href: "/customer/savings" }, { label: "Auto-Save" }]}
          actions={<motion.button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Plus size={16} /> New Rule</motion.button>} />
      </motion.div>

      <motion.div className="space-y-4 max-w-3xl" variants={containerVariants}>
        {rules.map((rule) => (
          <motion.div key={rule.id} className="bg-white rounded-xl shadow-sm p-5" variants={itemVariants}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${rule.active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"}`}><Zap size={20} /></div>
                <div>
                  <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                  <p className="text-sm text-gray-500">{rule.amount > 0 ? fmt(rule.amount) : "Round-up"} · {rule.frequency} · {rule.goal}</p>
                  {rule.nextDate !== "—" && <p className="text-xs text-gray-400 mt-0.5">Next: {new Date(rule.nextDate).toLocaleDateString()}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={rule.active} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
                <button className="p-2 text-gray-400 hover:text-gray-600"><Settings size={16} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="mt-6 bg-indigo-50 rounded-xl p-5 border border-indigo-100 max-w-3xl" variants={itemVariants}>
        <div className="flex items-start gap-3">
          <Zap size={20} className="text-indigo-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-indigo-900">Smart Auto-Save</h4>
            <p className="text-sm text-gray-600 mt-1">Set up rules to automatically transfer money to your savings goals. Choose from fixed amounts on a schedule, round-up savings from transactions, or percentage-based rules.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ========================
// SAVINGS ANALYTICS
// ========================
export const SavingsAnalytics: React.FC = () => {
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data, isLoading } = useSavingsGoals();
  const goals = (data as any)?.data ? (data as any).data : data || [];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlySavings = [200, 350, 280, 420, 500, 380, 450, 520, 600, 480, 550, 700];
  const maxSaving = Math.max(...monthlySavings);

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Savings Analytics" subtitle="Insights into your savings patterns"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Savings", href: "/customer/savings" }, { label: "Analytics" }]} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-6">Monthly Savings Trend</h3>
          <div className="flex items-end gap-2 h-48">
            {monthlySavings.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">{show ? `$${val}` : "•••"}</span>
                <motion.div className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-md" initial={{ height: 0 }} animate={{ height: `${(val / maxSaving) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                <span className="text-xs text-gray-500">{months[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="space-y-4" variants={itemVariants}>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
            <p className="text-sm text-indigo-200 mb-1">Total Saved (Year)</p>
            <p className="text-3xl font-bold">{show ? fmt(monthlySavings.reduce((a, b) => a + b, 0)) : "••••••"}</p>
            <p className="text-xs text-indigo-200 mt-2">↑ 23% vs last year</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Monthly Average</p>
            <p className="text-xl font-bold text-indigo-900">{show ? fmt(monthlySavings.reduce((a, b) => a + b, 0) / 12) : "••••••"}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">Best Month</p>
            <p className="text-xl font-bold text-emerald-600">{show ? fmt(maxSaving) : "••••••"}</p>
            <p className="text-xs text-gray-400">December</p>
          </div>
        </motion.div>
      </div>

      {goals.length > 0 && (
        <motion.div className="mt-6 bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-4">Goal Progress Summary</h3>
          <div className="space-y-3">
            {goals.map((g: any, i: number) => {
              const pctDone = g.targetAmount > 0 ? ((g.currentAmount || 0) / g.targetAmount) * 100 : 0;
              return (
                <div key={g._id || i} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 w-32 truncate">{g.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5"><div className={`h-2.5 rounded-full bg-gradient-to-r ${goalColors[i % goalColors.length]}`} style={{ width: `${Math.min(pctDone, 100)}%` }} /></div>
                  <span className="text-sm font-medium text-gray-900 w-14 text-right">{pctDone.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

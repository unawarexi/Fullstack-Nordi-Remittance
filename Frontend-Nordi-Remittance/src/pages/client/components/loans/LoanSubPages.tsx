// ============================================================================
// LOANS SUB-PAGES — Overview, Apply, Calculator, Credit Score
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Calculator, TrendingUp, Shield, FileText, Plus,
  DollarSign, Percent, Calendar, ChevronRight, CheckCircle2,
  Clock, ArrowRight, AlertCircle, BarChart3,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { TableSkeleton, FormSkeleton, StatsGridSkeleton } from "@components/skeletons";
import { useLoans, useLoanProducts, useCalculateEmi } from "@hooks/queries/useLoans";
import { useUIStore } from "@store/ui.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const fmt = (n: number, c = "USD") => new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

const statusColors: Record<string, { text: string; bg: string }> = {
  active: { text: "text-emerald-700", bg: "bg-emerald-50" }, pending: { text: "text-amber-700", bg: "bg-amber-50" },
  approved: { text: "text-blue-700", bg: "bg-blue-50" }, rejected: { text: "text-rose-700", bg: "bg-rose-50" },
  closed: { text: "text-gray-700", bg: "bg-gray-50" }, disbursed: { text: "text-indigo-700", bg: "bg-indigo-50" },
};

// ========================
// LOANS OVERVIEW
// ========================
export const LoansOverview: React.FC = () => {
  const navigate = useNavigate();
  const show = useUIStore((s) => s.preferences.showBalances);
  const { data, isLoading } = useLoans();
  const loans = data?.data || [];

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="My Loans" subtitle="View all your active and past loans"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Loans", href: "/customer/loans" }, { label: "Overview" }]}
          actions={<motion.button onClick={() => navigate("/customer/loans/apply")} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-sm text-sm font-medium" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}><Plus size={16} /> Apply</motion.button>} />
      </motion.div>

      {isLoading ? <TableSkeleton rows={5} cols={5} /> : loans.length === 0 ? (
        <EmptyState title="No Loans" description="Apply for a loan to get started." action={{ label: "Apply", onClick: () => navigate("/customer/loans/apply") }} />
      ) : (
        <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden" variants={itemVariants}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 p-4">Loan</th>
                <th className="text-left text-xs font-medium text-gray-500 p-4">Amount</th>
                <th className="text-left text-xs font-medium text-gray-500 p-4">Rate</th>
                <th className="text-left text-xs font-medium text-gray-500 p-4">Outstanding</th>
                <th className="text-left text-xs font-medium text-gray-500 p-4">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {loans.map((loan: any, i: number) => {
                  const status = loan.status?.toLowerCase() || "active";
                  const sC = statusColors[status] || statusColors.active;
                  return (
                    <tr key={loan._id || i} className="hover:bg-indigo-50/30 cursor-pointer transition-colors">
                      <td className="p-4"><p className="text-sm font-medium text-gray-900">{loan.name || loan.loanType || "Loan"}</p><p className="text-xs text-gray-500">{loan.reference || `#${i + 1}`}</p></td>
                      <td className="p-4 text-sm font-semibold text-indigo-900">{show ? fmt(loan.amount || 0) : "••••••"}</td>
                      <td className="p-4 text-sm text-gray-600">{loan.interestRate || "—"}%</td>
                      <td className="p-4 text-sm font-semibold text-gray-900">{show ? fmt(loan.outstandingBalance || loan.remainingAmount || 0) : "••••••"}</td>
                      <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${sC.text} ${sC.bg}`}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// APPLY FOR LOAN
// ========================
export const ApplyForLoan: React.FC = () => {
  const navigate = useNavigate();
  const { data: productsData, isLoading } = useLoanProducts();
  const products = (productsData as any)?.data ? (productsData as any).data : productsData || [];
  const [selected, setSelected] = useState("");

  const defaultProducts = [
    { name: "Personal Loan", desc: "Flexible personal financing", rate: "8.5%", max: 50000, term: "1-5 years", icon: <DollarSign size={20} /> },
    { name: "Business Loan", desc: "Fund your business growth", rate: "10.2%", max: 200000, term: "1-10 years", icon: <Briefcase size={20} /> },
    { name: "Education Loan", desc: "Invest in education", rate: "6.8%", max: 100000, term: "5-15 years", icon: <FileText size={20} /> },
    { name: "Home Improvement", desc: "Upgrade your home", rate: "7.5%", max: 75000, term: "1-7 years", icon: <TrendingUp size={20} /> },
  ];

  const displayProducts = products.length > 0 ? products : defaultProducts;

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Apply for Loan" subtitle="Choose a loan product that fits your needs"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Loans", href: "/customer/loans" }, { label: "Apply" }]} />
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl" variants={containerVariants}>
        {displayProducts.map((p: any, i: number) => (
          <motion.div key={i} variants={itemVariants}
            className={`bg-white rounded-xl shadow-sm p-5 cursor-pointer transition-all border-2 ${selected === (p.name || p.productName) ? "border-indigo-500 shadow-md" : "border-transparent hover:shadow-md"}`}
            whileHover={{ y: -3 }} onClick={() => setSelected(p.name || p.productName)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">{p.icon || <Briefcase size={20} />}</div>
              <div><h3 className="font-semibold text-gray-900">{p.name || p.productName}</h3><p className="text-xs text-gray-500">{p.desc || p.description}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">From</p><p className="text-sm font-bold text-indigo-600">{p.rate || p.interestRate || "—"}</p></div>
              <div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Up to</p><p className="text-sm font-bold text-gray-900">{fmt(p.max || p.maxAmount || p.maximumAmount || 0)}</p></div>
              <div className="p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Term</p><p className="text-sm font-bold text-gray-900">{p.term || p.tenure || "—"}</p></div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {selected && (
        <motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <motion.button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Continue Application →
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

// ========================
// LOAN CALCULATOR
// ========================
export const LoanCalculator: React.FC = () => {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(8.5);
  const [term, setTerm] = useState(36);

  const monthlyRate = rate / 100 / 12;
  const emi = monthlyRate > 0 ? (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1) : amount / term;
  const totalPayment = emi * term;
  const totalInterest = totalPayment - amount;

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Loan Calculator" subtitle="Estimate your monthly payments"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Loans", href: "/customer/loans" }, { label: "Calculator" }]} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <h3 className="text-lg font-semibold text-indigo-900 mb-6">Calculate EMI</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2"><label className="text-sm font-medium text-gray-700">Loan Amount</label><span className="text-sm font-bold text-indigo-600">{fmt(amount)}</span></div>
              <input type="range" min={1000} max={500000} step={1000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full accent-indigo-600" />
              <div className="flex justify-between text-xs text-gray-400"><span>$1,000</span><span>$500,000</span></div>
            </div>
            <div>
              <div className="flex justify-between mb-2"><label className="text-sm font-medium text-gray-700">Interest Rate</label><span className="text-sm font-bold text-indigo-600">{rate}%</span></div>
              <input type="range" min={1} max={30} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-indigo-600" />
              <div className="flex justify-between text-xs text-gray-400"><span>1%</span><span>30%</span></div>
            </div>
            <div>
              <div className="flex justify-between mb-2"><label className="text-sm font-medium text-gray-700">Loan Term (months)</label><span className="text-sm font-bold text-indigo-600">{term} months</span></div>
              <input type="range" min={6} max={360} step={6} value={term} onChange={(e) => setTerm(Number(e.target.value))} className="w-full accent-indigo-600" />
              <div className="flex justify-between text-xs text-gray-400"><span>6 mo</span><span>30 years</span></div>
            </div>
          </div>
        </motion.div>

        <motion.div className="space-y-4" variants={itemVariants}>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
            <p className="text-sm text-indigo-200 mb-1">Monthly EMI</p>
            <p className="text-4xl font-bold">{fmt(emi)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">Total Payment</p>
              <p className="text-xl font-bold text-indigo-900">{fmt(totalPayment)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">Total Interest</p>
              <p className="text-xl font-bold text-rose-600">{fmt(totalInterest)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Principal</span><span className="font-medium">{((amount / totalPayment) * 100).toFixed(1)}%</span></div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full" style={{ width: `${(amount / totalPayment) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Principal: {fmt(amount)}</span><span>Interest: {fmt(totalInterest)}</span></div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ========================
// CREDIT SCORE
// ========================
export const CreditScore: React.FC = () => {
  const score = 750;
  const maxScore = 900;
  const percentage = (score / maxScore) * 100;

  const getScoreLabel = (s: number) => { if (s >= 750) return { label: "Excellent", color: "text-emerald-600" }; if (s >= 700) return { label: "Good", color: "text-blue-600" }; if (s >= 650) return { label: "Fair", color: "text-amber-600" }; return { label: "Poor", color: "text-rose-600" }; };
  const { label, color } = getScoreLabel(score);

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Credit Score" subtitle="Monitor and improve your credit score"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Loans", href: "/customer/loans" }, { label: "Credit Score" }]} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        <motion.div className="bg-white rounded-xl shadow-sm p-8 text-center" variants={itemVariants}>
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" fill="none" stroke="#e5e7eb" strokeWidth="12" />
              <circle cx="100" cy="100" r="85" fill="none" stroke="url(#gradient)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${percentage * 5.34} ${534 - percentage * 5.34}`} />
              <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-indigo-900">{score}</p>
              <p className={`text-sm font-medium ${color}`}>{label}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Score range: 300 - {maxScore}</p>
          <p className="text-xs text-gray-400 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        <motion.div className="space-y-4" variants={itemVariants}>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-indigo-900 mb-4">Score Factors</h3>
            {[
              { label: "Payment History", score: "Excellent", pct: 95, color: "bg-emerald-500" },
              { label: "Credit Utilization", score: "Good", pct: 72, color: "bg-blue-500" },
              { label: "Credit Age", score: "Good", pct: 68, color: "bg-indigo-500" },
              { label: "Credit Mix", score: "Fair", pct: 55, color: "bg-amber-500" },
              { label: "Recent Inquiries", score: "Good", pct: 80, color: "bg-purple-500" },
            ].map((f) => (
              <div key={f.label} className="mb-3">
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-700">{f.label}</span><span className="font-medium text-gray-900">{f.score}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2"><div className={`${f.color} h-2 rounded-full`} style={{ width: `${f.pct}%` }} /></div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
            <h4 className="font-semibold text-indigo-900 mb-2">Tips to Improve</h4>
            <ul className="space-y-2">
              {["Pay bills on time", "Keep credit utilization below 30%", "Don't close old accounts", "Limit new credit applications"].map((tip) => (
                <li key={tip} className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={14} className="text-indigo-500" /> {tip}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

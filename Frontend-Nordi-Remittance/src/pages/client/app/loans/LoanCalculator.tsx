import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  CreditCard,
  Calculator,
  ShieldCheck,
  CalendarClock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  BadgeDollarSign,
  Percent,
  ChevronRight,
  Star,
  Info,
  Lightbulb,
  BarChart3,
  FileText,
  DollarSign,
  Wallet,
  Banknote,
} from "@constants/icons";

import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import PageHeader from "@components/shared/PageHeader";
import EmptyState from "@components/shared/EmptyState";
import {
  StatsGridSkeleton,
  TableSkeleton,
  FormSkeleton,
} from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useLoans, useLoanProducts } from "@hooks/queries/useLoans";
import { useUIStore } from "@store/ui.store";

const safeArray = (d: unknown): any[] => Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const fmtCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const loanStatusMap: Record<string, { label: string; variant: string }> = {
  active: { label: "Active", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "info" },
  rejected: { label: "Rejected", variant: "error" },
  closed: { label: "Closed", variant: "default" },
  overdue: { label: "Overdue", variant: "error" },
};


const LoanCalculator: React.FC = () => {
  const sidebarCollapsed = useUIStore((s) => s.sidebar.isCollapsed);

  const [amount, setAmount] = useState(25000);
  const [tenure, setTenure] = useState(60);
  const [interestRate, setInterestRate] = useState(8.5);

  // Local EMI calculation
  const localEmi = useMemo(() => {
    const r = interestRate / 12 / 100;
    if (r === 0) return amount / tenure;
    return (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
  }, [amount, tenure, interestRate]);

  const localTotalPayment = localEmi * tenure;
  const localTotalInterest = localTotalPayment - amount;

  const displayEmi = localEmi;
  const displayTotalInterest = localTotalInterest;
  const displayTotalPayment = localTotalPayment;

  return (
    <PageContainer>
      <PageHeader
        title="Loan Calculator"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Loans", href: "/loans" },
          { label: "Calculator" },
        ]}
      />

      <motion.div
        variants={dashboardItemVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6"
      >
        {/* Input Panel */}
        <div className="lg:col-span-3">
          <DashCard>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-6">
              Loan Parameters
            </h3>

            <div className="space-y-6">
              {/* Amount Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loan Amount
                  </label>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {fmt(amount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={500}
                  value={amount}
                  onChange={(e) => {
                    setAmount(Number(e.target.value));
                  }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-blue-600"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {fmt(1000)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {fmt(100000)}
                  </span>
                </div>
              </div>

              {/* Tenure Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loan Tenure
                  </label>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                    {tenure} months
                    {tenure >= 12 && (
                      <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                        ({(tenure / 12).toFixed(1)} yrs)
                      </span>
                    )}
                  </span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={360}
                  step={6}
                  value={tenure}
                  onChange={(e) => {
                    setTenure(Number(e.target.value));
                  }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-blue-600"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">6 mo</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">360 mo</span>
                </div>
              </div>

              {/* Interest Rate Input */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interest Rate (% per annum)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0.1}
                    max={50}
                    step={0.1}
                    value={interestRate}
                    onChange={(e) => {
                      setInterestRate(Number(e.target.value));
                    }}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              {/* Info */}
              <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium">
                <Calculator className="w-4 h-4" />
                EMI updates automatically
              </div>
            </div>
          </DashCard>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* EMI Result */}
          <DashCard>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                Monthly EMI
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {fmt(displayEmi)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Estimated
              </p>
            </div>
          </DashCard>

          {/* Breakdown */}
          <DashCard>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Payment Breakdown
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Principal Amount
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {fmt(amount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Total Interest
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-400">
                  {fmt(displayTotalInterest)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Total Payment
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {fmt(displayTotalPayment)}
                </span>
              </div>
            </div>
          </DashCard>

          {/* Ratio Visual */}
          <DashCard>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Principal vs Interest
            </h4>
            <div className="w-full h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex">
              <div
                className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                style={{
                  width: `${displayTotalPayment > 0 ? (amount / displayTotalPayment) * 100 : 50}%`,
                }}
              />
              <div
                className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                style={{
                  width: `${
                    displayTotalPayment > 0
                      ? (displayTotalInterest / displayTotalPayment) * 100
                      : 50
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Principal (
                  {displayTotalPayment > 0
                    ? ((amount / displayTotalPayment) * 100).toFixed(1)
                    : "50"}
                  %)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Interest (
                  {displayTotalPayment > 0
                    ? ((displayTotalInterest / displayTotalPayment) * 100).toFixed(1)
                    : "50"}
                  %)
                </span>
              </div>
            </div>
          </DashCard>
        </div>
      </motion.div>
    </PageContainer>
  );
};

// ─── CreditScore ──────────────────────────────────────────────────────────────

const SCORE_MIN = 300;
const SCORE_MAX = 850;

const getScoreColor = (score: number) => {
  if (score >= 750) return { stroke: "#22c55e", label: "Excellent", text: "text-green-600 dark:text-green-400" };
  if (score >= 700) return { stroke: "#3b82f6", label: "Good", text: "text-blue-600 dark:text-blue-400" };
  if (score >= 650) return { stroke: "#f59e0b", label: "Fair", text: "text-amber-600 dark:text-amber-400" };
  return { stroke: "#ef4444", label: "Poor", text: "text-red-600 dark:text-red-400" };
};

interface ScoreFactor {
  label: string;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

const defaultFactors: ScoreFactor[] = [
  {
    label: "Payment History",
    impact: "positive",
    description: "98% on-time payments over the last 24 months",
  },
  {
    label: "Credit Utilization",
    impact: "positive",
    description: "Currently using 22% of available credit",
  },
  {
    label: "Credit Age",
    impact: "neutral",
    description: "Average account age is 4.2 years",
  },
  {
    label: "Credit Mix",
    impact: "positive",
    description: "Good mix of credit card, auto loan, and mortgage",
  },
  {
    label: "Recent Inquiries",
    impact: "negative",
    description: "3 hard inquiries in the last 6 months",
  },
];

const improvementTips = [
  {
    icon: CalendarClock,
    title: "Pay bills on time",
    description: "Set up autopay to never miss a due date. Payment history is the #1 factor.",
  },
  {
    icon: BarChart3,
    title: "Keep utilization below 30%",
    description: "Try to use less than 30% of your total available credit across all cards.",
  },
  {
    icon: FileText,
    title: "Avoid unnecessary hard inquiries",
    description: "Only apply for new credit when necessary. Each inquiry can lower your score.",
  },
  {
    icon: Wallet,
    title: "Maintain old accounts",
    description: "Keep your oldest credit accounts open to increase your average credit age.",
  },
  {
    icon: ShieldCheck,
    title: "Monitor your credit report",
    description: "Check your report regularly for errors and dispute any inaccuracies promptly.",
  },
];

export default LoanCalculator;

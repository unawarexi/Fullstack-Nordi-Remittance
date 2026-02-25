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
} from "lucide-react";

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

// ─── LoansOverview ────────────────────────────────────────────────────────────

export const LoansOverview: React.FC = () => {
  const { data: loansData, isLoading } = useLoans();
  const sidebarCollapsed = useUIStore((s) => s.sidebar.isCollapsed);

  const loans = Array.isArray(loansData) ? loansData : (loansData as any)?.data ?? [];

  const stats = useMemo(() => {
    if (!loans.length)
      return { totalBorrowed: 0, activeLoans: 0, nextPayment: 0, nextPaymentDate: "" };

    const totalBorrowed = loans.reduce(
      (sum: number, l: any) => sum + (l.principalAmount ?? l.amount ?? 0),
      0
    );
    const activeLoans = loans.filter(
      (l: any) => l.status === "active" || l.status === "approved"
    ).length;

    const activeLoansList = loans.filter((l: any) => l.status === "active");
    const upcoming = activeLoansList
      .filter((l: any) => l.nextPaymentDate)
      .sort(
        (a: any, b: any) =>
          new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()
      );
    const nextPayment = upcoming[0]?.nextPaymentAmount ?? upcoming[0]?.emiAmount ?? 0;
    const nextPaymentDate = upcoming[0]?.nextPaymentDate ?? "";

    return { totalBorrowed, activeLoans, nextPayment, nextPaymentDate };
  }, [loans]);

  return (
    <PageContainer>
      <PageHeader
        title="Loans Overview"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Loans", href: "/loans" },
          { label: "Overview" },
        ]}
      />

      {isLoading ? (
        <>
          <StatsGridSkeleton count={3} />
          <TableSkeleton rows={5} />
        </>
      ) : (
        <motion.div
          variants={dashboardItemVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Stats */}
          <StatsGrid cols={3}>
            <StatCard
              label="Total Borrowed"
              value={fmt(stats.totalBorrowed)}
              icon={<Landmark size={20} />}
              iconColor="from-blue-500 to-indigo-500"
            />
            <StatCard
              label="Active Loans"
              value={String(stats.activeLoans)}
              icon={<FileText size={20} />}
              iconColor="from-emerald-500 to-teal-500"
            />
            <StatCard
              label="Next Payment"
              value={stats.nextPayment ? fmt(stats.nextPayment) : "—"}
              icon={<CalendarClock size={20} />}
              iconColor="from-amber-500 to-orange-500"
            />
          </StatsGrid>

          {/* Loans Table */}
          <DashCard padding="none">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Your Loans
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                All loan accounts and their current status
              </p>
            </div>

            {loans.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<Landmark size={48} />}
                  title="No loans yet"
                  description="You haven't taken any loans. Apply for one to get started."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Loan ID
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        EMI
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tenure
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {loans.map((loan: any, idx: number) => {
                      const status = loanStatusMap[loan.status] ?? {
                        label: loan.status,
                        variant: "default",
                      };
                      return (
                        <tr
                          key={loan.id ?? idx}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {loan.loanId ?? loan.id ?? `LN-${idx + 1}`}
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {loan.loanType ?? loan.type ?? "Personal"}
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            {fmt(loan.principalAmount ?? loan.amount ?? 0)}
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                            {loan.emiAmount ? fmt(loan.emiAmount) : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {loan.tenure ? `${loan.tenure} mo` : "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusBadge status={status.label} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DashCard>
        </motion.div>
      )}
    </PageContainer>
  );
};

// ─── ApplyForLoan ─────────────────────────────────────────────────────────────

export const ApplyForLoan: React.FC = () => {
  const { data: productsData, isLoading } = useLoanProducts();
  const sidebarCollapsed = useUIStore((s) => s.sidebar.isCollapsed);

  const products = Array.isArray(productsData) ? productsData : [];

  return (
    <PageContainer>
      <PageHeader
        title="Apply for a Loan"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Loans", href: "/loans" },
          { label: "Apply" },
        ]}
      />

      {isLoading ? (
        <FormSkeleton />
      ) : (
        <motion.div
          variants={dashboardItemVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {!products.length ? (
            <EmptyState
              icon={<Landmark size={48} />}
              title="No loan products available"
              description="There are no loan products available at the moment. Please check back later."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product: any, idx: number) => (
                <DashCard key={product.id ?? idx}>
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
                        <Landmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                          {product.name ?? product.loanType ?? "Loan Product"}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {product.description ?? "Flexible loan for your needs"}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4 flex-1">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Interest Rate
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {product.interestRate ?? product.rate ?? "—"}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Max Amount
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {product.maxAmount ? fmt(product.maxAmount) : "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Tenure
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {product.minTenure ?? 6}–{product.maxTenure ?? 360} months
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Processing Fee
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {product.processingFee ?? "1"}%
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Features
                        </p>
                        <ul className="space-y-1.5">
                          {product.features.slice(0, 4).map((feature: string, fIdx: number) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Apply Button */}
                    <button className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-medium transition-colors">
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </DashCard>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </PageContainer>
  );
};

// ─── LoanCalculator ───────────────────────────────────────────────────────────

export const LoanCalculator: React.FC = () => {
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

export const CreditScore: React.FC = () => {
  const sidebarCollapsed = useUIStore((s) => s.sidebar.isCollapsed);

  // Simulated score — in production you'd pull this from an API
  const score = 738;
  const scoreInfo = getScoreColor(score);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const normalised = (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  const dashOffset = circumference * (1 - normalised * 0.75); // 270° arc

  const impactIcon = (impact: string) => {
    if (impact === "positive")
      return <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />;
    if (impact === "negative")
      return <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />;
    return <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Credit Score"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Loans", href: "/loans" },
          { label: "Credit Score" },
        ]}
      />

      <motion.div
        variants={dashboardItemVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 sm:space-y-6"
      >
        {/* Score Ring + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* SVG Ring */}
          <DashCard>
            <div className="flex flex-col items-center justify-center py-4">
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                className="transform -rotate-[135deg]"
              >
                {/* Background arc */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  strokeWidth="14"
                  className="stroke-gray-200 dark:stroke-gray-700"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * 0.25}
                  strokeLinecap="round"
                />
                {/* Score arc */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  strokeWidth="14"
                  stroke={scoreInfo.stroke}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Centered text */}
              <div className="-mt-[130px] text-center mb-8">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{score}</p>
                <p className={`text-sm font-medium ${scoreInfo.text}`}>{scoreInfo.label}</p>
              </div>

              {/* Range labels */}
              <div className="flex items-center justify-between w-full px-4 mt-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">{SCORE_MIN}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{SCORE_MAX}</span>
              </div>
            </div>
          </DashCard>

          {/* Score Factors */}
          <div className="lg:col-span-2">
            <DashCard padding="none">
              <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                  Score Factors
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Key factors affecting your credit score
                </p>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {defaultFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 px-4 py-3 sm:px-6 sm:py-4"
                  >
                    <div className="mt-0.5">{impactIcon(factor.impact)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {factor.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {factor.description}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        factor.impact === "positive"
                          ? "Good"
                          : factor.impact === "negative"
                          ? "Needs Work"
                          : "Neutral"
                      }
                    />
                  </div>
                ))}
              </div>
            </DashCard>
          </div>
        </div>

        {/* Improvement Tips */}
        <DashCard>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Tips to Improve Your Score
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {improvementTips.map((tip, idx) => {
              const TipIcon = tip.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                >
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <TipIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      {tip.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </DashCard>

        {/* Score Scale Reference */}
        <DashCard>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-4">
            Credit Score Ranges
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { range: "300–649", label: "Poor", color: "bg-red-500 dark:bg-red-400" },
              { range: "650–699", label: "Fair", color: "bg-amber-500 dark:bg-amber-400" },
              { range: "700–749", label: "Good", color: "bg-blue-500 dark:bg-blue-400" },
              { range: "750–850", label: "Excellent", color: "bg-green-500 dark:bg-green-400" },
            ].map((band, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <div className={`w-3 h-3 rounded-full ${band.color}`} />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    {band.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{band.range}</p>
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      </motion.div>
    </PageContainer>
  );
};

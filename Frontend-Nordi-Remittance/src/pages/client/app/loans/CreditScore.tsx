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

import { PageContainer, DashCard, StatCard, StatsGrid, StatusBadge } from "@components/shared/DashboardPrimitives";
import PageHeader from "@components/shared/PageHeader";
import EmptyState from "@components/shared/EmptyState";
import { StatsGridSkeleton, TableSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientLoans, useClientLoanProducts } from "../../client-usecase/useloans-client-usecase";
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

const CreditScore: React.FC = () => {
  const sidebarCollapsed = useUIStore((s) => s.sidebar.isCollapsed);

  // Simulated score — in production you'd pull this from an API
  const score = 738;
  const scoreInfo = getScoreColor(score);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const normalised = (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  const dashOffset = circumference * (1 - normalised * 0.75); // 270° arc

  const impactIcon = (impact: string) => {
    if (impact === "positive") return <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />;
    if (impact === "negative") return <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />;
    return <Info className="h-4 w-4 text-gray-400 dark:text-gray-500" />;
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
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* SVG Ring */}
          <DashCard>
            <div className="flex flex-col items-center justify-center py-4">
              <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-[135deg] transform">
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
              <div className="-mt-[130px] mb-8 text-center">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{score}</p>
                <p className={`text-sm font-medium ${scoreInfo.text}`}>{scoreInfo.label}</p>
              </div>

              {/* Range labels */}
              <div className="mt-2 flex w-full items-center justify-between px-4">
                <span className="text-xs text-gray-400 dark:text-gray-500">{SCORE_MIN}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{SCORE_MAX}</span>
              </div>
            </div>
          </DashCard>

          {/* Score Factors */}
          <div className="lg:col-span-2">
            <DashCard padding="none">
              <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800 sm:px-6 sm:py-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Score Factors</h3>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Key factors affecting your credit score
                </p>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {defaultFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-start gap-3 px-4 py-3 sm:px-6 sm:py-4">
                    <div className="mt-0.5">{impactIcon(factor.impact)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{factor.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{factor.description}</p>
                    </div>
                    <StatusBadge
                      status={
                        factor.impact === "positive" ? "Good" : factor.impact === "negative" ? "Needs Work" : "Neutral"
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
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
              Tips to Improve Your Score
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {improvementTips.map((tip, idx) => {
              const TipIcon = tip.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
                    <TipIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{tip.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{tip.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </DashCard>

        {/* Score Scale Reference */}
        <DashCard>
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Credit Score Ranges</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { range: "300–649", label: "Poor", color: "bg-red-500 dark:bg-red-400" },
              { range: "650–699", label: "Fair", color: "bg-amber-500 dark:bg-amber-400" },
              { range: "700–749", label: "Good", color: "bg-blue-500 dark:bg-blue-400" },
              { range: "750–850", label: "Excellent", color: "bg-green-500 dark:bg-green-400" },
            ].map((band, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800"
              >
                <div className={`h-3 w-3 rounded-full ${band.color}`} />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{band.label}</p>
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

export default CreditScore;

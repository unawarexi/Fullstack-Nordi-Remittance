import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  CalendarClock,
  TrendingUp,
  TrendingDown,
  Info,
  Lightbulb,
  BarChart3,
  FileText,
  Wallet,
} from "@constants/icons";

import { PageContainer, DashCard, StatusBadge } from "@components/shared/DashboardPrimitives";
import PageHeader from "@components/shared/PageHeader";
import { StatsGridSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientEligibility } from "../../client-usecase/useloans-client-usecase";

/* eslint-disable @typescript-eslint/no-explicit-any */

const SCORE_MIN = 300;
const SCORE_MAX = 850;

const getScoreColor = (score: number) => {
  if (score >= 750) return { stroke: "#22c55e", label: "Excellent", text: "text-green-600 dark:text-green-400" };
  if (score >= 700) return { stroke: "#3b82f6", label: "Good", text: "text-blue-600 dark:text-blue-400" };
  if (score >= 650) return { stroke: "#f59e0b", label: "Fair", text: "text-amber-600 dark:text-amber-400" };
  return { stroke: "#ef4444", label: "Poor", text: "text-red-600 dark:text-red-400" };
};

const scoreTips = [
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
  const { eligibility, isLoading } = useClientEligibility();

  const score = eligibility.creditScore || 0;
  const scoreInfo = getScoreColor(score);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const normalised = score > 0 ? (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN) : 0;
  const dashOffset = circumference * (1 - normalised * 0.75); // 270° arc

  return (
    <PageContainer>
      <PageHeader
        title="Credit Score"
        breadcrumbs={[
          { label: "Dashboard", href: "/customer/dashboard" },
          { label: "Loans", href: "/customer/loans" },
          { label: "Credit Score" },
        ]}
      />

      {isLoading ? (
        <StatsGridSkeleton count={3} />
      ) : (
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
                  <circle
                    cx="100" cy="100" r={radius}
                    fill="none" strokeWidth="14"
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * 0.25}
                    strokeLinecap="round"
                  />
                  <circle
                    cx="100" cy="100" r={radius}
                    fill="none" strokeWidth="14"
                    stroke={score > 0 ? scoreInfo.stroke : "#d1d5db"}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="-mt-[130px] mb-8 text-center">
                  {score > 0 ? (
                    <>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">{score}</p>
                      <p className={`text-sm font-medium ${scoreInfo.text}`}>{scoreInfo.label}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No score yet</p>
                  )}
                </div>
                <div className="mt-2 flex w-full items-center justify-between px-4">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{SCORE_MIN}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{SCORE_MAX}</span>
                </div>
              </div>
            </DashCard>

            {/* Eligibility Summary */}
            <div className="lg:col-span-2">
              <DashCard>
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Loan Eligibility</h3>
                <div className="space-y-3">
                  {[
                    { label: "Eligible for Loans", value: eligibility.eligible ? "Yes" : "No", highlight: eligibility.eligible },
                    {
                      label: "Max Loan Amount",
                      value: eligibility.maxAmount
                        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(eligibility.maxAmount)
                        : "—",
                    },
                    {
                      label: "Estimated Monthly Income",
                      value: eligibility.monthlyIncome
                        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(eligibility.monthlyIncome)
                        : "—",
                    },
                    {
                      label: "Outstanding Debt",
                      value: eligibility.outstandingDebt != null
                        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(eligibility.outstandingDebt)
                        : "—",
                    },
                    { label: "Account Age", value: eligibility.accountAgeDays ? `${eligibility.accountAgeDays} days` : "—" },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                      <span className={`text-sm font-medium ${highlight === true ? "text-emerald-600 dark:text-emerald-400" : highlight === false ? "text-red-500 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                  {eligibility.reason && (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
                      {eligibility.reason}
                    </p>
                  )}
                </div>
              </DashCard>
            </div>
          </div>

          {/* Improvement Tips */}
          <DashCard>
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Tips to Improve Your Score</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {scoreTips.map((tip, idx) => {
                const TipIcon = tip.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
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
                { range: "300–649", label: "Poor", color: "bg-red-500" },
                { range: "650–699", label: "Fair", color: "bg-amber-500" },
                { range: "700–749", label: "Good", color: "bg-blue-500" },
                { range: "750–850", label: "Excellent", color: "bg-green-500" },
              ].map((band, idx) => (
                <div key={idx} className={`flex items-center gap-3 rounded-xl border p-3 ${score >= parseInt(band.range) ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20" : "border-gray-200 dark:border-gray-800"}`}>
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
      )}
    </PageContainer>
  );
};

export default CreditScore;


// ============================================================================
// APPLY FOR LOAN — Multi-step application form backed by /loans/apply
// Steps: 1 Eligibility check → 2 Loan details → 3 Review → 4 Confirmation
// ============================================================================

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Percent,
  CalendarClock,
  DollarSign,
  FileText,
  Wallet,
  BadgeDollarSign,
} from "@constants/icons";
import { PageContainer, DashCard, StatCard, StatsGrid, ActionButton } from "@components/shared/DashboardPrimitives";
import PageHeader from "@components/shared/PageHeader";
import { StatsGridSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import {
  useClientEligibility,
  useApplyForLoan,
} from "../../client-usecase/useloans-client-usecase";
import { useClientWallets } from "../../client-usecase/useaccounts-client-usecase";

/* eslint-disable @typescript-eslint/no-explicit-any */

const fmt = (v: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(v);

const LOAN_PURPOSES = [
  "Personal expenses",
  "Medical expenses",
  "Education",
  "Home improvement",
  "Business",
  "Debt consolidation",
  "Travel",
  "Other",
];

// ─── EMI local calc ───────────────────────────────────────────────────────────
function calcEmi(amount: number, annualRate: number, termMonths: number) {
  if (!amount || !termMonths) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return amount / termMonths;
  return (amount * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ["Eligibility", "Loan Details", "Review", "Confirmation"];

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="mb-6 flex items-center justify-center gap-0">
    {STEPS.map((label, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors
              ${i < current ? "bg-emerald-500 text-white" : i === current ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}
          >
            {i < current ? <CheckCircle2 size={16} /> : i + 1}
          </div>
          <span className={`mt-1 hidden text-[10px] sm:block ${i === current ? "font-semibold text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`mb-4 h-px w-12 sm:w-16 ${i < current ? "bg-emerald-400" : "bg-gray-200 dark:bg-gray-700"}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ApplyForLoan: React.FC = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    amount: 5000,
    termMonths: 12,
    purpose: "Personal expenses",
    disbursementWalletId: "",
  });
  const [submittedApp, setSubmittedApp] = useState<any>(null);

  const { eligibility, isLoading: eligLoading } = useClientEligibility();
  const { wallets, isLoading: walletsLoading } = useClientWallets();
  const applyMutation = useApplyForLoan();

  const activeWallets = useMemo(
    () => (wallets as any[]).filter((w: any) => w.status === "active" || !w.status),
    [wallets],
  );

  // Auto-select first wallet
  React.useEffect(() => {
    if (activeWallets.length && !form.disbursementWalletId) {
      setForm((f) => ({ ...f, disbursementWalletId: activeWallets[0]._id || activeWallets[0].id || "" }));
    }
  }, [activeWallets, form.disbursementWalletId]);

  // Derived interest rate based on credit score (mirrors backend logic)
  const estimatedRate = useMemo(() => {
    const score = eligibility.creditScore;
    if (score >= 700) return 8;
    if (score >= 650) return 10;
    if (score >= 600) return 12;
    return 15;
  }, [eligibility.creditScore]);

  const emi = useMemo(() => calcEmi(form.amount, estimatedRate, form.termMonths), [form.amount, estimatedRate, form.termMonths]);
  const totalRepayment = emi * form.termMonths;
  const totalInterest = totalRepayment - form.amount;

  const handleSubmit = async () => {
    applyMutation.mutate(
      {
        amount: form.amount,
        purpose: form.purpose,
        termMonths: form.termMonths,
        disbursementWalletId: form.disbursementWalletId,
      } as any,
      {
        onSuccess: (data: any) => {
          setSubmittedApp(data?.application || data);
          setStep(3);
        },
      },
    );
  };

  if (eligLoading || walletsLoading) {
    return (
      <PageContainer>
        <PageHeader title="Apply for a Loan" breadcrumbs={[{ label: "Loans", href: "/customer/loans" }, { label: "Apply" }]} />
        <StatsGridSkeleton count={3} />
        <FormSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Apply for a Loan"
        breadcrumbs={[
          { label: "Dashboard", href: "/customer/dashboard" },
          { label: "Loans", href: "/customer/loans" },
          { label: "Apply" },
        ]}
      />

      <motion.div variants={dashboardItemVariants} initial="hidden" animate="visible" className="mx-auto max-w-2xl space-y-6">
        {step < 3 && <StepIndicator current={step} />}

        <AnimatePresence mode="wait">
          {/* ── Step 0: Eligibility ── */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <DashCard>
                <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Your Loan Eligibility</h3>

                {!eligibility.eligible ? (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Not yet eligible</p>
                      <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                        {eligibility.reason || "Complete KYC verification and build transaction history to apply for loans."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">You're eligible to apply</p>
                        <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                          Pre-approved for up to {fmt(eligibility.maxAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        { label: "Credit Score", value: eligibility.creditScore || "—" },
                        { label: "Max Loan Amount", value: fmt(eligibility.maxAmount) },
                        { label: "Est. Monthly Income", value: eligibility.monthlyIncome ? fmt(eligibility.monthlyIncome) : "—" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.label}</p>
                          <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setStep(1)}
                        disabled={!eligibility.eligible}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Continue <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </DashCard>
            </motion.div>
          )}

          {/* ── Step 1: Loan Details ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <DashCard>
                <h3 className="mb-6 text-base font-semibold text-gray-900 dark:text-white">Loan Details</h3>
                <div className="space-y-5">
                  {/* Amount */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loan Amount</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{fmt(form.amount)}</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={eligibility.maxAmount || 50000}
                      step={100}
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600 dark:bg-gray-700"
                    />
                    <div className="mt-1 flex justify-between text-xs text-gray-400">
                      <span>{fmt(100)}</span>
                      <span>{fmt(eligibility.maxAmount || 50000)}</span>
                    </div>
                  </div>

                  {/* Term */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Repayment Term</label>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{form.termMonths} months</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={60}
                      step={1}
                      value={form.termMonths}
                      onChange={(e) => setForm((f) => ({ ...f, termMonths: Number(e.target.value) }))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600 dark:bg-gray-700"
                    />
                    <div className="mt-1 flex justify-between text-xs text-gray-400">
                      <span>1 mo</span>
                      <span>60 mo</span>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
                    <select
                      value={form.purpose}
                      onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      {LOAN_PURPOSES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Disbursement Wallet */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Disbursement Wallet</label>
                    {activeWallets.length === 0 ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400">No active wallets found. Please create a wallet first.</p>
                    ) : (
                      <select
                        value={form.disbursementWalletId}
                        onChange={(e) => setForm((f) => ({ ...f, disbursementWalletId: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      >
                        {activeWallets.map((w: any) => (
                          <option key={w._id || w.id} value={w._id || w.id}>
                            {w.walletNumber || w.accountNumber || "Wallet"} — {w.currency || "USD"}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* EMI Preview */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Estimated Summary</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] text-blue-500 dark:text-blue-300">Monthly EMI</p>
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-200">{fmt(emi)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-500 dark:text-blue-300">Interest (~{estimatedRate}%)</p>
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-200">{fmt(totalInterest)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-500 dark:text-blue-300">Total Repayment</p>
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-200">{fmt(totalRepayment)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <ActionButton label="Back" icon={<ArrowLeft size={16} />} variant="secondary" onClick={() => setStep(0)} />
                    <button
                      onClick={() => setStep(2)}
                      disabled={!form.disbursementWalletId || form.amount < 100}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Review Application <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </DashCard>
            </motion.div>
          )}

          {/* ── Step 2: Review ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <DashCard>
                <h3 className="mb-6 text-base font-semibold text-gray-900 dark:text-white">Review Your Application</h3>
                <div className="space-y-3">
                  {[
                    { label: "Loan Amount", value: fmt(form.amount) },
                    { label: "Term", value: `${form.termMonths} months` },
                    { label: "Purpose", value: form.purpose },
                    { label: "Estimated Rate", value: `~${estimatedRate}% p.a.` },
                    { label: "Monthly EMI", value: fmt(emi) },
                    { label: "Total Interest", value: fmt(totalInterest) },
                    { label: "Total Repayment", value: fmt(totalRepayment) },
                    {
                      label: "Disbursement Wallet",
                      value:
                        activeWallets.find(
                          (w: any) => (w._id || w.id) === form.disbursementWalletId,
                        )?.walletNumber || form.disbursementWalletId,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0 dark:border-gray-800"
                    >
                      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                  By submitting, you agree to the loan terms. The actual interest rate may vary based on final credit assessment.
                </p>

                <div className="mt-6 flex justify-between">
                  <ActionButton label="Back" icon={<ArrowLeft size={16} />} variant="secondary" onClick={() => setStep(1)} />
                    <button
                      onClick={handleSubmit}
                      disabled={applyMutation.isPending}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {applyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                      {applyMutation.isPending ? "Submitting…" : "Submit Application"}
                    </button>
                </div>
              </DashCard>
            </motion.div>
          )}

          {/* ── Step 3: Confirmation ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <DashCard>
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Application Submitted!</h3>
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Your loan application has been submitted for review. You'll receive an email once a decision is made.
                  </p>

                  {submittedApp && (
                    <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left dark:border-gray-700 dark:bg-gray-800/50">
                      {[
                        { label: "Application ID", value: submittedApp.applicationId || submittedApp.id || "—" },
                        { label: "Amount Requested", value: fmt(submittedApp.requestedAmount || form.amount) },
                        { label: "Monthly Payment", value: submittedApp.monthlyPayment ? fmt(submittedApp.monthlyPayment) : fmt(emi) },
                        { label: "Status", value: submittedApp.status || "submitted" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-1.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-white capitalize">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center gap-3">
                    <ActionButton
                      label="View My Applications"
                      variant="secondary"
                      onClick={() => window.location.href = "/customer/loans/overview"}
                    />
                    <ActionButton
                      label="Back to Loans"
                      onClick={() => window.location.href = "/customer/loans"}
                    />
                  </div>
                </div>
              </DashCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </PageContainer>
  );
};

export default ApplyForLoan;

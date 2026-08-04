// ============================================================================
// FIXED DEPOSITS
// ============================================================================
// UI-ONLY new feature — see SavingsAccount.tsx header comment for context.
// ============================================================================

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Percent, Shield, Plus, X } from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, DashCard, StatCard, StatsGrid } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useAccountApplicationsStore, SHOW_APPLICATION_DEV_PREVIEW } from "@store/accountApplications.store";
import { FIXED_DEPOSIT_RATES, FixedDepositApplication } from "../../types/AccountApplications.types";
import { SUPPORTED_WALLET_CURRENCIES } from "../../client-usecase/useaccounts-client-usecase";
import { ApplicationStatusCard } from "./components/ApplicationStatusCard";

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-colors";
const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const TERM_OPTIONS: FixedDepositApplication["termMonths"][] = [3, 6, 12, 24, 36];

const ApplyForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const applyForFixedDeposit = useAccountApplicationsStore((s) => s.applyForFixedDeposit);
  const [form, setForm] = useState({
    nickname: "",
    currency: "USD",
    principal: "",
    termMonths: 12 as FixedDepositApplication["termMonths"],
    autoRenew: false,
  });

  const rate = FIXED_DEPOSIT_RATES[form.termMonths];
  const principalNum = Number(form.principal) || 0;
  const projectedInterest = useMemo(
    () => (principalNum * rate * form.termMonths) / (100 * 12),
    [principalNum, rate, form.termMonths],
  );
  const maturityDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + form.termMonths);
    return d;
  }, [form.termMonths]);

  const canSubmit = principalNum > 0;

  const submit = () => {
    applyForFixedDeposit({
      currency: form.currency,
      nickname: form.nickname || undefined,
      principal: principalNum,
      termMonths: form.termMonths,
      interestRate: rate,
      maturityDate: maturityDate.toISOString(),
      autoRenew: form.autoRenew,
    });
    onClose();
  };

  return (
    <DashCard className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">Open a Fixed Deposit</h3>
        <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nickname (optional)</label>
            <input
              className={inputCls}
              placeholder="e.g. Term Deposit 1"
              value={form.nickname}
              onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select
              className={inputCls}
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            >
              {SUPPORTED_WALLET_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Principal Amount</label>
          <input
            type="number"
            min={0}
            className={inputCls}
            placeholder="0.00"
            value={form.principal}
            onChange={(e) => setForm((f) => ({ ...f, principal: e.target.value }))}
          />
        </div>

        <div>
          <label className={labelCls}>Term</label>
          <div className="grid grid-cols-5 gap-2">
            {TERM_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, termMonths: t }))}
                className={`rounded-xl border px-2 py-2.5 text-center text-xs font-medium transition-colors ${
                  form.termMonths === t
                    ? "border-amber-500 bg-amber-50 text-amber-600 dark:border-amber-400 dark:bg-amber-950/50 dark:text-amber-400"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {t}mo
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <div>
            <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">Auto-renew at maturity</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
              Roll principal + interest into a new term automatically instead of paying out.
            </p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, autoRenew: !f.autoRenew }))}
            className={`h-6 w-11 shrink-0 rounded-full transition-colors ${form.autoRenew ? "bg-amber-500" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${form.autoRenew ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>

        {/* Live projection — purely illustrative, backend will own real pricing */}
        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
          <p className="mb-2 text-xs font-semibold text-amber-700 dark:text-amber-400 sm:text-sm">Projected Payout</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">Rate</p>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{rate}%</p>
            </div>
            <div>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">Interest</p>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {fmt(projectedInterest, form.currency)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">Matures</p>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {maturityDate.toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-3 text-xs font-medium text-white disabled:opacity-50 sm:text-sm"
        >
          <Plus size={16} /> Submit Application
        </button>
        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 sm:text-xs">
          Withdrawing before maturity may reduce or forfeit the earned interest.
        </p>
      </div>
    </DashCard>
  );
};

const FixedDeposits: React.FC = () => {
  const [applying, setApplying] = useState(false);
  const applications = useAccountApplicationsStore((s) => s.getByType("fixed_deposit")) as FixedDepositApplication[];
  const approved = applications.filter((a) => a.status === "approved");

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Fixed Deposits"
          subtitle="Lock in a rate and earn guaranteed returns over a fixed term"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Fixed Deposits" },
          ]}
          actions={
            !applying && (
              <button
                onClick={() => setApplying(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-2 text-xs font-medium text-white sm:px-4 sm:text-sm"
              >
                <Plus size={16} /> New Deposit
              </button>
            )
          }
        />
      </motion.div>

      {applying && <ApplyForm onClose={() => setApplying(false)} />}

      {approved.length > 0 && (
        <StatsGrid cols={3}>
          <StatCard
            label="Total Deposits"
            value={fmt(approved.reduce((s, a) => s + a.principal, 0))}
            icon={<Lock size={20} />}
            iconColor="from-amber-500 to-orange-500"
          />
          <StatCard
            label="Avg. Rate"
            value={`${(approved.reduce((s, a) => s + a.interestRate, 0) / approved.length).toFixed(2)}% p.a.`}
            icon={<Percent size={20} />}
            iconColor="from-emerald-500 to-teal-500"
          />
          <StatCard
            label="Active Deposits"
            value={String(approved.length)}
            icon={<Shield size={20} />}
            iconColor="from-indigo-500 to-purple-500"
          />
        </StatsGrid>
      )}

      <DashCard className="mb-6 mt-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
          Indicative rates by term
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {TERM_OPTIONS.map((t) => (
            <div key={t} className="rounded-xl border border-gray-200 p-3 text-center dark:border-gray-700">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{t} months</p>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{FIXED_DEPOSIT_RATES[t]}%</p>
            </div>
          ))}
        </div>
      </DashCard>

      {applications.length === 0 && !applying ? (
        <EmptyState
          title="No Fixed Deposits"
          description="Lock in a great rate with a fixed deposit. Choose your term and earn guaranteed returns."
          action={{ label: "Open Fixed Deposit", onClick: () => setApplying(true) }}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationStatusCard
              key={app.id}
              application={app}
              showDevPreview={SHOW_APPLICATION_DEV_PREVIEW}
              fields={[
                { label: "Principal", value: fmt(app.principal, app.currency) },
                { label: "Term", value: `${app.termMonths} months` },
                { label: "Rate", value: `${app.interestRate}%` },
                { label: "Matures", value: new Date(app.maturityDate).toLocaleDateString() },
              ]}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default FixedDeposits;

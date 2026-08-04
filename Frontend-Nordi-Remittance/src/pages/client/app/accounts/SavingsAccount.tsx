// ============================================================================
// SAVINGS ACCOUNT
// ============================================================================
// UI-ONLY new feature (see types/AccountApplications.types.ts). There is no
// `savings` walletType on the backend — this page lets a user apply, and
// tracks the application locally until admin review + a real endpoint exist.
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Percent, ShieldCheck, Repeat, Plus, X } from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, DashCard, StatCard, StatsGrid } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useAccountApplicationsStore, SHOW_APPLICATION_DEV_PREVIEW } from "@store/account-application.store";
import { SAVINGS_INTEREST_RATE } from "../../../../types/account-application.types";
import { SUPPORTED_WALLET_CURRENCIES } from "../../client-usecase/useaccounts-client-usecase";
import { ApplicationStatusCard } from "../../components/application-status-card";

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-colors";
const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const ApplyForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const applyForSavings = useAccountApplicationsStore((s) => s.applyForSavings);
  const [form, setForm] = useState({
    nickname: "",
    currency: "USD",
    initialDeposit: "",
    goal: "",
    autoSave: false,
    autoSaveAmount: "",
  });

  const canSubmit = Number(form.initialDeposit) > 0;

  const submit = () => {
    applyForSavings({
      currency: form.currency,
      nickname: form.nickname || undefined,
      initialDeposit: Number(form.initialDeposit) || 0,
      goal: form.goal || undefined,
      autoSave: form.autoSave,
      autoSaveAmount: form.autoSave ? Number(form.autoSaveAmount) || undefined : undefined,
    });
    onClose();
  };

  return (
    <DashCard className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
          Apply for a Savings Account
        </h3>
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
              placeholder="e.g. Rainy Day Fund"
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
          <label className={labelCls}>Initial Deposit</label>
          <input
            type="number"
            min={0}
            className={inputCls}
            placeholder="0.00"
            value={form.initialDeposit}
            onChange={(e) => setForm((f) => ({ ...f, initialDeposit: e.target.value }))}
          />
        </div>
        <div>
          <label className={labelCls}>Savings Goal (optional)</label>
          <input
            className={inputCls}
            placeholder="e.g. Emergency fund, new car, tuition"
            value={form.goal}
            onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <div>
            <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">Round-up auto-save</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
              Automatically move a fixed amount into this account periodically once it's open.
            </p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, autoSave: !f.autoSave }))}
            className={`h-6 w-11 shrink-0 rounded-full transition-colors ${form.autoSave ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${form.autoSave ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>
        {form.autoSave && (
          <div>
            <label className={labelCls}>Auto-save Amount</label>
            <input
              type="number"
              min={0}
              className={inputCls}
              placeholder="0.00"
              value={form.autoSaveAmount}
              onChange={(e) => setForm((f) => ({ ...f, autoSaveAmount: e.target.value }))}
            />
          </div>
        )}

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-medium text-white disabled:opacity-50 sm:text-sm"
        >
          <Plus size={16} /> Submit Application
        </button>
        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 sm:text-xs">
          Your application is reviewed before the account is opened. You'll be notified once it's approved.
        </p>
      </div>
    </DashCard>
  );
};

const SavingsAccount: React.FC = () => {
  const [applying, setApplying] = useState(false);
  const applications = useAccountApplicationsStore((s) => s.getByType("savings"));
  const approved = applications.filter((a) => a.status === "approved");

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Savings Account"
          subtitle="Grow your money with competitive interest rates"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Savings" },
          ]}
          actions={
            !applying && (
              <button
                onClick={() => setApplying(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-xs font-medium text-white sm:px-4 sm:text-sm"
              >
                <Plus size={16} /> Apply
              </button>
            )
          }
        />
      </motion.div>

      {applying && <ApplyForm onClose={() => setApplying(false)} />}

      {approved.length > 0 && (
        <StatsGrid cols={3}>
          <StatCard
            label="Total Saved"
            value={fmt(approved.reduce((s, a) => s + (a.type === "savings" ? a.initialDeposit : 0), 0))}
            icon={<PiggyBank size={20} />}
            iconColor="from-emerald-500 to-teal-500"
          />
          <StatCard
            label="Interest Rate"
            value={`${SAVINGS_INTEREST_RATE}% p.a.`}
            icon={<Percent size={20} />}
            iconColor="from-indigo-500 to-purple-500"
          />
          <StatCard
            label="Accounts"
            value={String(approved.length)}
            icon={<ShieldCheck size={20} />}
            iconColor="from-amber-500 to-orange-500"
          />
        </StatsGrid>
      )}

      {/* How it works — no real content existed for this account type anywhere */}
      <DashCard className="mb-6 mt-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
          How a savings account works
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex gap-3">
            <Percent size={18} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Earns {SAVINGS_INTEREST_RATE}% per year, calculated daily and paid out monthly.
            </p>
          </div>
          <div className="flex gap-3">
            <Repeat size={18} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Up to 6 free withdrawals a month — extra withdrawals may carry a small fee.
            </p>
          </div>
          <div className="flex gap-3">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-500" />
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              No minimum balance required to keep the account open.
            </p>
          </div>
        </div>
      </DashCard>

      {applications.length === 0 && !applying ? (
        <EmptyState
          title="No Savings Accounts"
          description="Open a savings account to start earning interest on your deposits."
          action={{ label: "Apply for Savings Account", onClick: () => setApplying(true) }}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) =>
            app.type === "savings" ? (
              <ApplicationStatusCard
                key={app.id}
                application={app}
                showDevPreview={SHOW_APPLICATION_DEV_PREVIEW}
                fields={[
                  { label: "Currency", value: app.currency },
                  { label: "Initial Deposit", value: fmt(app.initialDeposit, app.currency) },
                  { label: "Goal", value: app.goal || "—" },
                  { label: "Auto-save", value: app.autoSave ? fmt(app.autoSaveAmount || 0, app.currency) : "Off" },
                ]}
              />
            ) : null,
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default SavingsAccount;

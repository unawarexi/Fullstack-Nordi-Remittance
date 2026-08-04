// ============================================================================
// CURRENT ACCOUNT
// ============================================================================
// UI-ONLY new feature — see SavingsAccount.tsx header comment for context.
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Repeat, ShieldCheck, TrendingUp, Plus, X } from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, DashCard, StatCard, StatsGrid } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useAccountApplicationsStore, SHOW_APPLICATION_DEV_PREVIEW } from "@store/accountApplications.store";
import { SUPPORTED_WALLET_CURRENCIES } from "../../client-usecase/useaccounts-client-usecase";
import { ApplicationStatusCard } from "./components/ApplicationStatusCard";

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";
const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const ApplyForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const applyForCurrent = useAccountApplicationsStore((s) => s.applyForCurrent);
  const [form, setForm] = useState({
    nickname: "",
    currency: "USD",
    purpose: "personal" as "personal" | "business",
    businessName: "",
    expectedMonthlyVolume: "",
    overdraftRequested: false,
  });

  const canSubmit = form.purpose === "personal" || form.businessName.trim() !== "";

  const submit = () => {
    applyForCurrent({
      currency: form.currency,
      nickname: form.nickname || undefined,
      purpose: form.purpose,
      businessName: form.purpose === "business" ? form.businessName : undefined,
      expectedMonthlyVolume: Number(form.expectedMonthlyVolume) || undefined,
      overdraftRequested: form.overdraftRequested,
    });
    onClose();
  };

  return (
    <DashCard className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
          Apply for a Current Account
        </h3>
        <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
          <X size={18} />
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>This account is for</label>
          <div className="grid grid-cols-2 gap-3">
            {(["personal", "business"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setForm((f) => ({ ...f, purpose: p }))}
                className={`rounded-xl border px-4 py-2.5 text-xs font-medium capitalize transition-colors sm:text-sm ${
                  form.purpose === p
                    ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-400"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {p} use
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Nickname (optional)</label>
            <input
              className={inputCls}
              placeholder="e.g. Daily Spending"
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

        {form.purpose === "business" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Business Name</label>
              <input
                className={inputCls}
                placeholder="Registered business name"
                value={form.businessName}
                onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Expected Monthly Volume</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                placeholder="0.00"
                value={form.expectedMonthlyVolume}
                onChange={(e) => setForm((f) => ({ ...f, expectedMonthlyVolume: e.target.value }))}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <div>
            <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">Request overdraft</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
              Subject to a separate credit review after the account is opened.
            </p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, overdraftRequested: !f.overdraftRequested }))}
            className={`h-6 w-11 shrink-0 rounded-full transition-colors ${form.overdraftRequested ? "bg-indigo-500" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${form.overdraftRequested ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>

        <button
          onClick={submit}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-medium text-white disabled:opacity-50 sm:text-sm"
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

const CurrentAccount: React.FC = () => {
  const [applying, setApplying] = useState(false);
  const applications = useAccountApplicationsStore((s) => s.getByType("current"));
  const approved = applications.filter((a) => a.status === "approved");

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Current Account"
          subtitle="Manage your everyday banking and business transactions"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Current" },
          ]}
          actions={
            !applying && (
              <button
                onClick={() => setApplying(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-xs font-medium text-white sm:px-4 sm:text-sm"
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
            label="Accounts"
            value={String(approved.length)}
            icon={<Building2 size={20} />}
            iconColor="from-indigo-500 to-purple-500"
          />
          <StatCard
            label="With Overdraft"
            value={String(approved.filter((a) => a.type === "current" && a.overdraftRequested).length)}
            icon={<TrendingUp size={20} />}
            iconColor="from-blue-500 to-cyan-500"
          />
          <StatCard
            label="Business Accounts"
            value={String(approved.filter((a) => a.type === "current" && a.purpose === "business").length)}
            icon={<ShieldCheck size={20} />}
            iconColor="from-amber-500 to-orange-500"
          />
        </StatsGrid>
      )}

      <DashCard className="mb-6 mt-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
          How a current account works
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex gap-3">
            <Repeat size={18} className="mt-0.5 shrink-0 text-indigo-500" />
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Unlimited transactions — built for frequent day-to-day spending and receiving.
            </p>
          </div>
          <div className="flex gap-3">
            <TrendingUp size={18} className="mt-0.5 shrink-0 text-indigo-500" />
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Optional overdraft for approved customers, reviewed separately from the account itself.
            </p>
          </div>
          <div className="flex gap-3">
            <Building2 size={18} className="mt-0.5 shrink-0 text-indigo-500" />
            <p className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
              Business current accounts support higher monthly transaction volumes.
            </p>
          </div>
        </div>
      </DashCard>

      {applications.length === 0 && !applying ? (
        <EmptyState
          title="No Current Accounts"
          description="Open a current account for your daily transactions."
          action={{ label: "Apply for Current Account", onClick: () => setApplying(true) }}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) =>
            app.type === "current" ? (
              <ApplicationStatusCard
                key={app.id}
                application={app}
                showDevPreview={SHOW_APPLICATION_DEV_PREVIEW}
                fields={[
                  { label: "Purpose", value: app.purpose === "business" ? app.businessName || "Business" : "Personal" },
                  { label: "Currency", value: app.currency },
                  { label: "Overdraft", value: app.overdraftRequested ? "Requested" : "Not requested" },
                  {
                    label: "Monthly Volume",
                    value: app.expectedMonthlyVolume ? fmt(app.expectedMonthlyVolume, app.currency) : "—",
                  },
                ]}
              />
            ) : null,
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default CurrentAccount;

// ============================================================================
// ACCOUNT LIMITS — new page
// ============================================================================
// Surfaces AccountAnalyticsService.getAccountLimits, which nothing on the
// frontend called before this. KYC status directly determines these bands
// (see baseLimits.pending vs baseLimits.approved on the backend), so it's
// shown front and center rather than as a side note.
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { StatsGridSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useClientAccountLimits } from "../../client-usecase/useaccounts-client-usecase";

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 0 }).format(n);

const UsageBar: React.FC<{ label: string; band: AccountLimitBand; currency?: string; icon: React.ReactNode }> = ({
  label,
  band,
  currency = "USD",
  icon,
}) => {
  const pct = band.limit > 0 ? Math.min(100, Math.round((band.used / band.limit) * 100)) : 0;
  const isHigh = pct >= 90;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
          {icon}
          {label}
        </div>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
          {fmt(band.used, currency)} / {fmt(band.limit, currency)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={`h-full rounded-full transition-all ${isHigh ? "bg-rose-500" : "bg-indigo-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 sm:text-xs">
        {fmt(band.remaining, currency)} remaining
      </p>
    </div>
  );
};

const AccountLimits: React.FC = () => {
  const { daily, monthly, perTransaction, kycStatus, walletLimits, isLoading } = useClientAccountLimits();
  const isApproved = kycStatus === "approved";

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Account Limits"
          subtitle="Your transaction limits and current usage"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Limits" },
          ]}
        />
      </motion.div>

      {isLoading ? (
        <StatsGridSkeleton count={2} />
      ) : (
        <>
          <DashCard
            className={`mb-6 flex items-center gap-3 ${
              isApproved
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
            }`}
          >
            {isApproved ? (
              <ShieldCheck size={22} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <ShieldAlert size={22} className="shrink-0 text-amber-600 dark:text-amber-400" />
            )}
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                KYC status: <span className="capitalize">{kycStatus}</span>
              </p>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 sm:text-xs">
                {isApproved
                  ? "Your limits are at the verified tier."
                  : "Complete KYC verification to raise your daily and monthly limits."}
              </p>
            </div>
          </DashCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashCard>
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Daily Limits</h3>
              <div className="space-y-5">
                {daily && (
                  <>
                    <UsageBar label="Transfers" band={daily.transfer} icon={<ArrowUpRight size={14} />} />
                    <UsageBar label="Withdrawals" band={daily.withdrawal} icon={<ArrowDownLeft size={14} />} />
                  </>
                )}
              </div>
            </DashCard>

            <DashCard>
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Monthly Limits</h3>
              <div className="space-y-5">
                {monthly && (
                  <>
                    <UsageBar label="Transfers" band={monthly.transfer} icon={<ArrowUpRight size={14} />} />
                    <UsageBar label="Withdrawals" band={monthly.withdrawal} icon={<ArrowDownLeft size={14} />} />
                  </>
                )}
              </div>
            </DashCard>
          </div>

          <DashCard className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                Per-Transaction Limit
              </h3>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{fmt(perTransaction)}</p>
            </div>
          </DashCard>

          {walletLimits.length > 0 && (
            <DashCard padding="none" className="mt-6">
              <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                  Per-Wallet Limit Rules
                </h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {walletLimits.map((l: any, i: number) => (
                  <div key={l._id || i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-xs font-medium capitalize text-gray-900 dark:text-white sm:text-sm">
                        {l.limitType} · {l.category}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                        Resets {l.resetDate ? new Date(l.resetDate).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                        {fmt(l.usedAmount || 0, l.currency)} / {fmt(l.amount, l.currency)}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        {l.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DashCard>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default AccountLimits;

// ============================================================================
// ACCOUNT APPLICATIONS — hub page
// ============================================================================
// Single place to see every Savings/Current/Fixed Deposit application and its
// status, instead of having to visit each product page separately.
// ============================================================================

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PiggyBank, Building2, Lock, ChevronRight } from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, FilterPill } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { SHOW_APPLICATION_DEV_PREVIEW } from "@store/account.store";
import { ACCOUNT_TYPE_LABELS } from "@domain/types/Accounts.types";
import { useClientAccountApplications } from "../../client-usecase/useaccounts-client-usecase";
import { ApplicationStatusCard } from "../../components/application-status-card";

const fmt = (n: number, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

const typeIcons: Record<AccountApplicationType, React.ReactNode> = {
  savings: <PiggyBank size={16} />,
  current: <Building2 size={16} />,
  fixed_deposit: <Lock size={16} />,
};

const typeRoutes: Record<AccountApplicationType, string> = {
  savings: "/customer/accounts/savings",
  current: "/customer/accounts/current",
  fixed_deposit: "/customer/accounts/fixed-deposits",
};

function fieldsFor(app: AccountApplication): Array<{ label: string; value: string }> {
  if (app.type === "savings") {
    return [
      { label: "Currency", value: app.currency },
      { label: "Initial Deposit", value: fmt(app.initialDeposit, app.currency) },
      { label: "Goal", value: app.goal || "—" },
    ];
  }
  if (app.type === "current") {
    return [
      { label: "Purpose", value: app.purpose === "business" ? app.businessName || "Business" : "Personal" },
      { label: "Currency", value: app.currency },
      { label: "Overdraft", value: app.overdraftRequested ? "Requested" : "Not requested" },
    ];
  }
  return [
    { label: "Principal", value: fmt(app.principal, app.currency) },
    { label: "Term", value: `${app.termMonths} months` },
    { label: "Rate", value: `${app.interestRate}%` },
  ];
}

const AccountApplications: React.FC = () => {
  const navigate = useNavigate();
  const { applications = [] } = useClientAccountApplications();
  const [statusFilter, setStatusFilter] = useState<"all" | AccountApplicationStatus>("all");

  const filtered = useMemo(
    () => (statusFilter === "all" ? applications : applications.filter((a) => a.status === statusFilter)),
    [applications, statusFilter],
  );

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Account Applications"
          subtitle="Track every Savings, Current, and Fixed Deposit application in one place"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Applications" },
          ]}
        />
      </motion.div>

      <motion.div className="mb-4 flex gap-2 overflow-x-auto pb-2" variants={dashboardItemVariants}>
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <FilterPill
            key={s}
            label={s.charAt(0).toUpperCase() + s.slice(1)}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          />
        ))}
      </motion.div>

      {applications.length === 0 ? (
        <EmptyState
          title="No Applications Yet"
          description="Apply for a Savings, Current, or Fixed Deposit account to see its status here."
          action={{ label: "Explore Account Types", onClick: () => navigate("/customer/accounts") }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nothing here" description={`No ${statusFilter} applications.`} />
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div key={app.id}>
              <button
                onClick={() => navigate(typeRoutes[app.type])}
                className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-indigo-500 dark:text-gray-400 sm:text-sm"
              >
                {typeIcons[app.type]}
                {ACCOUNT_TYPE_LABELS[app.type]}
                {app.nickname ? ` · ${app.nickname}` : ""}
                <ChevronRight size={12} />
              </button>
              <ApplicationStatusCard
                application={app}
                fields={fieldsFor(app)}
                showDevPreview={SHOW_APPLICATION_DEV_PREVIEW}
              />
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default AccountApplications;

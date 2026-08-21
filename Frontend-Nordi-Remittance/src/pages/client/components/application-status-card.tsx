// ============================================================================
// ApplicationStatusCard — shared UI for Savings/Current/FixedDeposit pages
// ============================================================================

import React from "react";
import { Clock, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { DashCard } from "@components/shared/DashboardPrimitives";
import { useCancelApplication } from "../../client-usecase/useaccounts-client-usecase";
import type { AccountApplication } from "../../../../domain/types/Accounts.types";

const statusStyles: Record<
  AccountApplication["status"],
  { bg: string; text: string; icon: React.ReactNode; label: string }
> = {
  pending: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-600 dark:text-amber-400",
    icon: <Clock size={14} />,
    label: "Pending Review",
  },
  approved: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: <CheckCircle2 size={14} />,
    label: "Approved",
  },
  rejected: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-600 dark:text-rose-400",
    icon: <XCircle size={14} />,
    label: "Not Approved",
  },
};

interface Props {
  application: AccountApplication;
  fields: Array<{ label: string; value: string }>;
  /** Set to true only in non-production builds so reviewers can preview approved/rejected states. */
  showDevPreview?: boolean;
}

export const ApplicationStatusCard: React.FC<Props> = ({ application, fields, showDevPreview }) => {
  const { mutate: cancelApplication } = useCancelApplication();
  const devSetStatus = () => alert("Dev preview status update is disabled when using real backend APIs.");
  const style = statusStyles[application.status];

  return (
    <DashCard>
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium sm:text-xs ${style.bg} ${style.text}`}
        >
          {style.icon}
          {style.label}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 sm:text-xs">
          Submitted {new Date(application.submittedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">{f.label}</p>
            <p className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">{f.value}</p>
          </div>
        ))}
      </div>

      {application.status === "rejected" && application.rejectionReason && (
        <p className="mt-3 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
          {application.rejectionReason}
        </p>
      )}

      {application.status === "pending" && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
          <button
            onClick={() => {
              if (confirm("Withdraw this application?")) cancelApplication(application.id);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Trash2 size={12} /> Withdraw Application
          </button>

          {showDevPreview && (
            <div className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-2 py-1 dark:border-gray-700">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">Dev preview</span>
              <button
                onClick={() => devSetStatus(application.id, "approved")}
                className="text-[10px] font-medium text-emerald-500 hover:underline"
              >
                Mark approved
              </button>
              <span className="text-gray-300">·</span>
              <button
                onClick={() => devSetStatus(application.id, "rejected", "Additional documentation required.")}
                className="text-[10px] font-medium text-rose-500 hover:underline"
              >
                Mark rejected
              </button>
            </div>
          )}
        </div>
      )}
    </DashCard>
  );
};

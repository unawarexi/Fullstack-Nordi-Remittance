// ============================================================================
// accountApplications.store — LOCAL-ONLY placeholder store
// ============================================================================
// Backs the "apply for Savings / Current / Fixed Deposit" UI. There is no
// server for this yet, so applications live in localStorage via zustand's
// persist middleware and never leave the browser.
//
// When the real backend lands (routes + admin review queue), replace the
// body of this store with react-query hooks that hit those endpoints, and
// keep the same exported shape (`applications`, `applyForX`, `cancelApplication`,
// `getByType`) so the page components in /pages/customer/accounts don't need
// to change — they only ever call `useAccountApplicationsStore`.
//
// `_devPreviewSetStatus` exists purely so the approved/rejected UI states can
// be reviewed before there's an admin to actually approve anything. Remove it
// once real approvals exist.
// ============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Single switch for the "Dev preview" approve/reject buttons rendered on
 * pending applications (see ApplicationStatusCard). Flip to `false` — or
 * delete the feature entirely — once the backend has real admin approval.
 */
export const SHOW_APPLICATION_DEV_PREVIEW = true;
import type {
  AccountApplication,
  AccountApplicationType,
  SavingsAccountApplication,
  CurrentAccountApplication,
  FixedDepositApplication,
} from "../types/account-application.types";

type NewSavingsInput = Omit<
  SavingsAccountApplication,
  "id" | "type" | "status" | "submittedAt" | "reviewedAt" | "rejectionReason"
>;
type NewCurrentInput = Omit<
  CurrentAccountApplication,
  "id" | "type" | "status" | "submittedAt" | "reviewedAt" | "rejectionReason"
>;
type NewFixedDepositInput = Omit<
  FixedDepositApplication,
  "id" | "type" | "status" | "submittedAt" | "reviewedAt" | "rejectionReason"
>;

interface AccountApplicationsState {
  applications: AccountApplication[];
  applyForSavings: (data: NewSavingsInput) => SavingsAccountApplication;
  applyForCurrent: (data: NewCurrentInput) => CurrentAccountApplication;
  applyForFixedDeposit: (data: NewFixedDepositInput) => FixedDepositApplication;
  cancelApplication: (id: string) => void;
  getByType: (type: AccountApplicationType) => AccountApplication[];
  /** Dev-only: lets you preview the approved/rejected UI before admin tooling exists. */
  _devPreviewSetStatus: (id: string, status: "approved" | "rejected", rejectionReason?: string) => void;
}

const genId = () => `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useAccountApplicationsStore = create<AccountApplicationsState>()(
  persist(
    (set, get) => ({
      applications: [],

      applyForSavings: (data) => {
        const application: SavingsAccountApplication = {
          id: genId(),
          type: "savings",
          status: "pending",
          submittedAt: new Date().toISOString(),
          ...data,
        };
        set((s) => ({ applications: [application, ...s.applications] }));
        return application;
      },

      applyForCurrent: (data) => {
        const application: CurrentAccountApplication = {
          id: genId(),
          type: "current",
          status: "pending",
          submittedAt: new Date().toISOString(),
          ...data,
        };
        set((s) => ({ applications: [application, ...s.applications] }));
        return application;
      },

      applyForFixedDeposit: (data) => {
        const application: FixedDepositApplication = {
          id: genId(),
          type: "fixed_deposit",
          status: "pending",
          submittedAt: new Date().toISOString(),
          ...data,
        };
        set((s) => ({ applications: [application, ...s.applications] }));
        return application;
      },

      cancelApplication: (id) => set((s) => ({ applications: s.applications.filter((a) => a.id !== id) })),

      getByType: (type) => get().applications.filter((a) => a.type === type),

      _devPreviewSetStatus: (id, status, rejectionReason) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status, rejectionReason, reviewedAt: new Date().toISOString() } : a,
          ),
        })),
    }),
    { name: "account-applications-store" },
  ),
);

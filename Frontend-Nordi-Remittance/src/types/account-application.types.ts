// ============================================================================
// ACCOUNT APPLICATIONS — types for the client-side account-opening flow
// ============================================================================
// There is no backend support for these yet. Wallets on the backend are only
// ever `personal` | `business`. Savings / Current / Fixed Deposit are product
// concepts the user applies for and an admin approves — that whole workflow
// (routes, model, admin review queue) still needs to be built server-side.
//
// This file + the accountApplications.store.ts it backs are placeholders so
// the UI can be built and reviewed now. Swap the store for real API calls
// once the backend exists; the page components only touch the store through
// its hook, so that swap should be contained to one file.
// ============================================================================

export type AccountApplicationType = "savings" | "current" | "fixed_deposit";
export type AccountApplicationStatus = "pending" | "approved" | "rejected";

export interface BaseAccountApplication {
  id: string;
  type: AccountApplicationType;
  status: AccountApplicationStatus;
  currency: string;
  nickname?: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface SavingsAccountApplication extends BaseAccountApplication {
  type: "savings";
  initialDeposit: number;
  goal?: string;
  autoSave: boolean;
  autoSaveAmount?: number;
}

export interface CurrentAccountApplication extends BaseAccountApplication {
  type: "current";
  purpose: "personal" | "business";
  businessName?: string;
  expectedMonthlyVolume?: number;
  overdraftRequested: boolean;
}

export interface FixedDepositApplication extends BaseAccountApplication {
  type: "fixed_deposit";
  principal: number;
  termMonths: 3 | 6 | 12 | 24 | 36;
  interestRate: number;
  maturityDate: string;
  autoRenew: boolean;
}

export type AccountApplication = SavingsAccountApplication | CurrentAccountApplication | FixedDepositApplication;

export const ACCOUNT_TYPE_LABELS: Record<AccountApplicationType, string> = {
  savings: "Savings Account",
  current: "Current Account",
  fixed_deposit: "Fixed Deposit",
};

/** Simple, editable-in-one-place indicative rates until the backend owns pricing. */
export const FIXED_DEPOSIT_RATES: Record<FixedDepositApplication["termMonths"], number> = {
  3: 3.5,
  6: 4.25,
  12: 5.25,
  24: 5.75,
  36: 6.1,
};

export const SAVINGS_INTEREST_RATE = 2.75;

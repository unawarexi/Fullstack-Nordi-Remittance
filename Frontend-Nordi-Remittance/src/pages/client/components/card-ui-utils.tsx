// ============================================================================
// CARDS MODULE — Shared UI utilities
// One canonical card visual + formatting/status logic, instead of five
// slightly-different copies drifting apart across pages.
// ============================================================================

import React from "react";
import { Wifi } from "@constants/icons";
import {
  CARD_BRANDS,
  type CardBrand,
  type CardStatus,
  type CardTransactionType,
  type ClientCard,
} from "@domain/types/Card.types";

/* ─── Formatting ─────────────────────────────────────────────────────────── */

export const fmt = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n || 0);

export const fmtDate = (value?: string | number | Date) => {
  if (!value) return "Recent";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Recent";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/* ─── Card status ────────────────────────────────────────────────────────── */

export const STATUS_META: Record<CardStatus, { label: string; dot: string; badgeClass: string }> = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
  pending_activation: {
    label: "Pending Activation",
    dot: "bg-amber-500",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  },
  blocked: {
    label: "Frozen",
    dot: "bg-slate-400",
    badgeClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
  expired: {
    label: "Expired",
    dot: "bg-gray-400",
    badgeClass: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
  stolen: {
    label: "Reported Stolen",
    dot: "bg-red-500",
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  },
  lost: {
    label: "Reported Lost",
    dot: "bg-orange-500",
    badgeClass: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
  },
};

/** True only for statuses the controller allows to be frozen/unfrozen (toggleFreezeCard) */
export const isFreezeable = (status: CardStatus) =>
  status === "active" || status === "blocked" || status === "pending_activation";

/** True for statuses the controller still allows funding on (fundCard) */
export const isFundable = (status: CardStatus) => !["blocked", "expired", "stolen", "lost"].includes(status);

/* ─── Card brand ─────────────────────────────────────────────────────────── */

export const BRAND_GRADIENT: Record<CardBrand, string> = {
  visa: "from-blue-700 via-blue-800 to-indigo-900",
  mastercard: "from-orange-500 via-red-500 to-red-700",
  amex: "from-sky-500 via-blue-600 to-blue-800",
  discover: "from-orange-400 via-orange-500 to-amber-600",
};

export const brandIcon = (brand: string) => CARD_BRANDS.find((b) => b.id === (brand || "").toLowerCase())?.icon;

/* ─── Transaction direction ──────────────────────────────────────────────── */

const CREDIT_TYPES: CardTransactionType[] = ["refund", "cash_advance"];

/** Money moving back onto the card vs. money leaving it — matches the schema's
 * transactionType enum, not a `type: "credit"` field that doesn't exist on the model. */
export const isCreditTxn = (transactionType: CardTransactionType) => CREDIT_TYPES.includes(transactionType);

export const txnTypeLabel: Record<CardTransactionType, string> = {
  purchase: "Purchase",
  refund: "Refund",
  withdrawal: "ATM Withdrawal",
  cash_advance: "Funds Added",
  fee: "Fee",
  interest: "Interest",
};

/* ─── Card face (the physical/virtual card visual) ──────────────────────── */

interface CardFaceProps {
  card: Pick<
    ClientCard,
    | "cardholderName"
    | "cardType"
    | "cardBrand"
    | "last4"
    | "expiryDate"
    | "balance"
    | "creditLimit"
    | "currency"
    | "status"
  >;
  show: boolean;
  size?: "default" | "compact";
}

export const CardFace: React.FC<CardFaceProps> = ({ card, show, size = "default" }) => {
  const gradient = BRAND_GRADIENT[card.cardBrand] || BRAND_GRADIENT.visa;
  const icon = brandIcon(card.cardBrand);
  const isDimmed =
    card.status === "blocked" || card.status === "expired" || card.status === "stolen" || card.status === "lost";
  const balanceValue = card.creditLimit && card.cardType === "credit" ? card.creditLimit : card.balance;

  return (
    <div
      className={`relative bg-gradient-to-br ${gradient} overflow-hidden rounded-2xl text-white shadow-lg transition-all ${
        size === "compact" ? "p-4" : "p-5 sm:p-6"
      } ${isDimmed ? "opacity-70 grayscale" : ""}`}
    >
      <div className="absolute right-0 top-0 -mr-10 -mt-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-24 w-24 rounded-full bg-white/5" />

      <div className="relative z-10 mb-6 flex items-start justify-between sm:mb-8">
        <div>
          <p className="text-xs capitalize text-white/70">{card.cardType === "virtual" ? "Virtual" : card.cardType}</p>
          <p className="text-sm font-medium">{card.cardholderName || "Cardholder"}</p>
        </div>
        <Wifi size={22} className="text-white/60" />
      </div>

      <p className="relative z-10 mb-4 font-mono text-lg tracking-widest sm:text-xl">
        •••• •••• •••• {card.last4 || "••••"}
      </p>

      <div className="relative z-10 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/60">
            {card.cardType === "credit" ? "Credit Limit" : "Balance"}
          </p>
          <p className="text-base font-bold sm:text-lg">{show ? fmt(balanceValue, card.currency) : "••••••"}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/60">Expires {card.expiryDate || "--/--"}</p>
          {icon && <img src={icon} alt={card.cardBrand} className="h-6 object-contain" />}
        </div>
      </div>
    </div>
  );
};

/* ─── Small status badge (used inline, distinct from DashboardPrimitives'
 * generic StatusBadge which doesn't know card-specific statuses) ────────── */

export const CardStatusPill: React.FC<{ status: CardStatus }> = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.active;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

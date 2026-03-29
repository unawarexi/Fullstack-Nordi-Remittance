// ============================================================================
// Client Dashboard — Shared Constants
// Keeps colour maps, quick-action configs, chart palette, etc. in one place
// so every dashboard component draws from the same source of truth.
// ============================================================================

import React from "react";
import {
  Send, Receipt, ArrowDownCircle, Repeat, QrCode,
  Wallet, CreditCard, TrendingUp, TrendingDown,
  DollarSign, MapPin, Upload,
} from "lucide-react";


/* ─── Quick Actions (main column) ─────────────────────────────────────────── */

export const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Send Money",
    icon: React.createElement(Send, { size: 20 }),
    color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
    hoverColor: "hover:bg-indigo-100 dark:hover:bg-indigo-950/80",
    route: "/customer/send",
  },
  {
    title: "Pay Bills",
    icon: React.createElement(Receipt, { size: 20 }),
    color: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
    hoverColor: "hover:bg-purple-100 dark:hover:bg-purple-950/80",
    route: "/customer/bills",
  },
  {
    title: "Deposit",
    icon: React.createElement(ArrowDownCircle, { size: 20 }),
    color: "bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400",
    hoverColor: "hover:bg-pink-100 dark:hover:bg-pink-950/80",
    route: "/customer/transactions",
  },
  {
    title: "Exchange",
    icon: React.createElement(Repeat, { size: 20 }),
    color: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
    hoverColor: "hover:bg-blue-100 dark:hover:bg-blue-950/80",
    route: "/customer/forex",
  },
  {
    title: "Scan & Pay",
    icon: React.createElement(QrCode, { size: 20 }),
    color: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
    hoverColor: "hover:bg-amber-100 dark:hover:bg-amber-950/80",
    route: "/customer/mobile/qr",
  },
];

/* ─── Sidebar Tools ───────────────────────────────────────────────────────── */

export const SIDEBAR_TOOLS: ToolLink[] = [
  {
    label: "Forex",
    icon: React.createElement(DollarSign, { size: 16 }),
    color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
    hover: "hover:bg-indigo-100 dark:hover:bg-indigo-950/80",
    route: "/customer/forex/rates",
  },
  {
    label: "Support",
    icon: React.createElement(MapPin, { size: 16 }),
    color: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-950/80",
    route: "/customer/support",
  },
  {
    label: "Docs",
    icon: React.createElement(Upload, { size: 16 }),
    color: "bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400",
    hover: "hover:bg-pink-100 dark:hover:bg-pink-950/80",
    route: "/customer/profile/documents",
  },
];

/* ─── Account Type Map ────────────────────────────────────────────────────── */

export const ACCOUNT_TYPE_MAP: Record<string, { icon: React.ReactNode; color: string }> = {
  savings: {
    icon: React.createElement(Wallet, { size: 16 }),
    color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
  },
  checking: {
    icon: React.createElement(CreditCard, { size: 16 }),
    color: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
  },
  business: {
    icon: React.createElement(TrendingUp, { size: 16 }),
    color: "bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400",
  },
  investment: {
    icon: React.createElement(TrendingUp, { size: 16 }),
    color: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
  },
  default: {
    icon: React.createElement(Wallet, { size: 16 }),
    color: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
  },
};

/* ─── Chart Palette ───────────────────────────────────────────────────────── */

export const CHART_COLORS = [
  "#4f46e5", "#7e22ce", "#db2777", "#0891b2",
  "#f59e0b", "#059669", "#e11d48", "#6366f1",
];

/* ─── Period Filters ──────────────────────────────────────────────────────── */

export const SPENDING_FILTER_OPTIONS = ["Week", "Month", "Quarter", "Year"] as const;

export const PERIOD_MAP: Record<string, "1W" | "1M" | "3M" | "1Y"> = {
  Week: "1W",
  Month: "1M",
  Quarter: "3M",
  Year: "1Y",
};

/* ─── Notification Type Colors ────────────────────────────────────────────── */

export const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
  warning: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
  error: "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400",
  success: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
  info: "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
};

/* ─── Insight Sentiment Map ───────────────────────────────────────────────── */

export const INSIGHT_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  positive: {
    icon: React.createElement(TrendingUp, { size: 14 }),
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50",
  },
  negative: {
    icon: React.createElement(TrendingDown, { size: 14 }),
    color: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50",
  },
  tip: {
    icon: React.createElement(TrendingUp, { size: 14 }),
    color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50",
  },
  info: {
    icon: React.createElement(TrendingUp, { size: 14 }),
    color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/50",
  },
};

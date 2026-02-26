// ============================================================================
// TRANSFER PRIMITIVES — Shared components for all send-money wizard screens
// ============================================================================
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@utils/cn";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  CheckCircle,
  XCircle,
  Printer,
} from "@constants/icons";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface WizardStep {
  label: string;
  icon?: React.ReactNode;
}

export interface AccountOption {
  id: string;
  name?: string;
  walletType?: string;
  accountNumber?: string;
  balance?: number;
  currency?: string;
  [key: string]: unknown;
}

// ─── Layout ──────────────────────────────────────────────────────────────────
export const TransferLayout: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      "min-h-full w-full bg-gray-50 dark:bg-gray-950 p-3 sm:p-4 lg:p-6",
      className,
    )}
  >
    <div className="w-full max-w-5xl mx-auto space-y-6">{children}</div>
  </div>
);

// ─── Step Indicator ──────────────────────────────────────────────────────────
export const StepIndicator: React.FC<{
  steps: WizardStep[];
  current: number;
  className?: string;
}> = ({ steps, current, className }) => (
  <div className={cn("flex items-center w-full", className)}>
    {steps.map((step, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center flex-shrink-0">
          <div
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold border-2 transition-all duration-300",
              i < current && "bg-emerald-500 border-emerald-500 text-white",
              i === current &&
                "bg-indigo-600 border-indigo-600 text-white scale-110",
              i > current &&
                "bg-transparent border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500",
            )}
          >
            {i < current ? <Check size={16} /> : i + 1}
          </div>
          <span
            className={cn(
              "mt-1.5 text-[11px] sm:text-xs font-medium text-center max-w-[80px] leading-tight",
              i <= current
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-500",
            )}
          >
            {step.label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={cn(
              "flex-1 h-0.5 mx-1.5 sm:mx-3 transition-all duration-500",
              i < current ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800",
            )}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Animated step wrapper ───────────────────────────────────────────────────
export const StepContent: React.FC<{
  step: number;
  children: React.ReactNode;
}> = ({ step, children }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

// ─── Wizard Navigation ──────────────────────────────────────────────────────
export const WizardNav: React.FC<{
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  showBack?: boolean;
}> = ({
  onBack,
  onNext,
  nextLabel = "Continue",
  loading,
  disabled,
  showBack = true,
}) => (
  <div className="flex items-center justify-between pt-6">
    {showBack && onBack ? (
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>
    ) : (
      <div />
    )}
    <button
      type={onNext ? "button" : "submit"}
      onClick={onNext}
      disabled={disabled || loading}
      className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {nextLabel}
      {!loading && <ChevronRight size={16} />}
    </button>
  </div>
);

// ─── Section Card ────────────────────────────────────────────────────────────
export const TCard: React.FC<{
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, icon, children, className }) => (
  <div
    className={cn(
      "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-6",
      className,
    )}
  >
    {(title || icon) && (
      <div className="flex items-center gap-3 mb-5">
        {icon && (
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
            {icon}
          </div>
        )}
        <div>
          {title && (
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    )}
    {children}
  </div>
);

// ─── Form Fields ─────────────────────────────────────────────────────────────
interface FieldBase {
  label: string;
  error?: string;
  touched?: boolean;
  hint?: string;
}

type TInputProps = FieldBase &
  React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode };

export const TInput: React.FC<TInputProps> = ({
  label,
  error,
  touched,
  icon,
  hint,
  className,
  ...props
}) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={cn(
          "w-full px-3 py-2.5 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors",
          icon && "pl-10",
          error && touched
            ? "border-red-400 dark:border-red-500"
            : "border-gray-200 dark:border-gray-700",
        )}
      />
    </div>
    {hint && !(error && touched) && (
      <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>
    )}
    {error && touched && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

type TSelectProps = FieldBase &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: { value: string; label: string }[];
    placeholder?: string;
  };

export const TSelect: React.FC<TSelectProps> = ({
  label,
  error,
  touched,
  options,
  placeholder,
  className,
  ...props
}) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <select
      {...props}
      className={cn(
        "w-full px-3 py-2.5 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors",
        error && touched
          ? "border-red-400 dark:border-red-500"
          : "border-gray-200 dark:border-gray-700",
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    {error && touched && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

type TTextareaProps = FieldBase &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TTextarea: React.FC<TTextareaProps> = ({
  label,
  error,
  touched,
  className,
  ...props
}) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <textarea
      {...props}
      className={cn(
        "w-full px-3 py-2.5 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
        "placeholder:text-gray-400 dark:placeholder:text-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none",
        error && touched
          ? "border-red-400 dark:border-red-500"
          : "border-gray-200 dark:border-gray-700",
      )}
    />
    {error && touched && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export const TCheckbox: React.FC<{
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  error?: string;
  touched?: boolean;
}> = ({ label, checked, onChange, name, error, touched }) => (
  <div>
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-800"
      />
      <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
        {label}
      </span>
    </label>
    {error && touched && (
      <p className="text-xs text-red-500 mt-1 ml-7">{error}</p>
    )}
  </div>
);

// ─── Account Selector ────────────────────────────────────────────────────────
export const AccountSelector: React.FC<{
  accounts: AccountOption[];
  selected: string;
  onSelect: (id: string) => void;
  loading?: boolean;
  label?: string;
}> = ({ accounts, selected, onSelect, loading, label = "Select Account" }) => (
  <div className="space-y-3">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    {loading ? (
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    ) : accounts.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        No accounts available
      </p>
    ) : (
      <div className="grid gap-3 sm:grid-cols-2">
        {accounts.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            className={cn(
              "flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all",
              selected === a.id
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-1 ring-indigo-500/50"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                selected === a.id
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
              )}
            >
              {(a.currency || "USD").charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {a.name || a.walletType || "Account"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {a.accountNumber
                  ? `••••${String(a.accountNumber).slice(-4)}`
                  : `ID: ${a.id.slice(0, 8)}`}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {typeof a.balance === "number"
                  ? `$${a.balance.toLocaleString()}`
                  : "—"}
              </p>
              <p className="text-[11px] text-gray-400">{a.currency || "USD"}</p>
            </div>
            {selected === a.id && (
              <Check
                size={16}
                className="text-indigo-500 flex-shrink-0 ml-1"
              />
            )}
          </button>
        ))}
      </div>
    )}
  </div>
);

// ─── Review Components ───────────────────────────────────────────────────────
export const ReviewRow: React.FC<{
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between py-2.5">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span
      className={cn(
        "text-sm font-medium text-right",
        highlight
          ? "text-indigo-600 dark:text-indigo-400 text-base font-semibold"
          : "text-gray-900 dark:text-white",
      )}
    >
      {value}
    </span>
  </div>
);

export const ReviewSection: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-indigo-500">{icon}</span>}
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </span>
        </div>
        <ChevronRight
          size={16}
          className={cn(
            "text-gray-400 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-1 divide-y divide-gray-100 dark:divide-gray-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Fee Summary ─────────────────────────────────────────────────────────────
export const FeeSummary: React.FC<{
  rows: { label: string; value: string; highlight?: boolean }[];
  className?: string;
}> = ({ rows, className }) => (
  <div
    className={cn(
      "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-2",
      className,
    )}
  >
    {rows.map((r, i) => (
      <div
        key={i}
        className={cn(
          "flex justify-between text-sm",
          r.highlight &&
            "font-semibold pt-2 border-t border-gray-200 dark:border-gray-700",
        )}
      >
        <span
          className={
            r.highlight
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }
        >
          {r.label}
        </span>
        <span
          className={
            r.highlight
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-900 dark:text-white"
          }
        >
          {r.value}
        </span>
      </div>
    ))}
  </div>
);

// ─── Transfer Result ─────────────────────────────────────────────────────────
export const TransferResult: React.FC<{
  success: boolean;
  title: string;
  subtitle?: string;
  reference?: string;
  details?: { label: string; value: string }[];
  onNewTransfer: () => void;
  onDownloadReceipt?: () => void;
}> = ({
  success,
  title,
  subtitle,
  reference,
  details,
  onNewTransfer,
  onDownloadReceipt,
}) => {
  const [copied, setCopied] = useState(false);
  const copyRef = () => {
    if (!reference) return;
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-6"
    >
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
            success
              ? "bg-emerald-100 dark:bg-emerald-900/30"
              : "bg-red-100 dark:bg-red-900/30",
          )}
        >
          {success ? (
            <CheckCircle size={32} className="text-emerald-500" />
          ) : (
            <XCircle size={32} className="text-red-500" />
          )}
        </div>
      </motion.div>

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Reference */}
      {reference && (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Ref:
          </span>
          <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
            {reference}
          </span>
          <button
            type="button"
            onClick={copyRef}
            className="text-gray-400 hover:text-indigo-500 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}

      {/* Details */}
      {details && details.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 max-w-md mx-auto text-left divide-y divide-gray-100 dark:divide-gray-800">
          {details.map((d, i) => (
            <div key={i} className="flex justify-between py-2.5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {d.label}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {d.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onNewTransfer}
          className="px-6 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          New Transfer
        </button>
        {onDownloadReceipt && (
          <button
            type="button"
            onClick={onDownloadReceipt}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Printer size={14} /> Receipt
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const safeArray = (d: unknown): any[] =>
  Array.isArray(d)
    ? d
    : Array.isArray((d as any)?.data)
      ? (d as any).data
      : [];

export const formatCurrency = (
  amount: number | string,
  currency = "USD",
): string => {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(n)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(n);
};

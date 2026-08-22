// ============================================================================
// WalletOperations — Admin-initiated credit / debit / transfer operations
// Endpoints:
//   POST /admin/operations/credit
//   POST /admin/operations/debit
//   POST /admin/operations/transfer
// ============================================================================
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { PageContainer, DashCard, SectionHeader } from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import apiClient from "@core/api/client";
import { ApiEndpoints } from "@core/api/endpoint";
import { useToast } from "@store/toast.store";
import { useAccountsManagement, useWalletCombobox, useWalletOperationForm } from "../../admin-usecase/useadmin-account-usecase";
import { useAllUsers } from "../../admin-usecase/useadmin-users-usercase";

type OperationType = "credit" | "debit" | "transfer";

const SUPPORTED_CURRENCIES = ["EUR", "USD", "GBP", "NGN", "KES", "GHS", "ZAR", "CAD", "AUD"];

const opConfig = {
  credit: {
    label: "Credit Wallet",
    desc: "Add funds to a user's wallet. Requires canAdjustBalances permission.",
    icon: <ArrowDownLeft size={20} />,
    color: "from-emerald-500 to-teal-600",
    badgeColor: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
    endpoint: ApiEndpoints.adminOpsCredit,
  },
  debit: {
    label: "Debit Wallet",
    desc: "Remove funds from a user's wallet. Requires canAdjustBalances permission.",
    icon: <ArrowUpRight size={20} />,
    color: "from-rose-500 to-red-600",
    badgeColor: "bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400",
    endpoint: ApiEndpoints.adminOpsDebit,
  },
  transfer: {
    label: "Admin Transfer",
    desc: "Transfer funds between two users' wallets. Requires canAdjustBalances permission.",
    icon: <ArrowLeftRight size={20} />,
    color: "from-indigo-500 to-blue-600",
    badgeColor: "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400",
    endpoint: ApiEndpoints.adminOpsTransfer,
  },
};

function UserWalletCombobox({
  value,
  onChange,
  label,
  placeholder,
  accounts,
  users,
}: {
  value: string;
  onChange: (val: string) => void;
  label: string;
  placeholder: string;
  accounts: any[];
  users: any[];
}) {
  const { 
    open, 
    setOpen, 
    search, 
    setSearch, 
    debouncedSearch, 
    isLoading, 
    filtered, 
    selectedAcc, 
    selectedUser 
  } = useWalletCombobox(value, accounts, users);

  const fieldClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-950/30";
  const labelClass = "mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400";

  return (
    <div className="relative">
      <label className={labelClass}>{label}</label>
      <div className={`${fieldClass} flex cursor-pointer items-center justify-between`} onClick={() => setOpen(!open)}>
        {selectedAcc ? (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gray-200">
              {selectedUser?.avatar ? (
                <img src={selectedUser.avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {(selectedAcc.owner[0] || "?").toUpperCase()}
                </div>
              )}
            </div>
            <span className="truncate">
              {selectedAcc.owner} ({selectedAcc.accountNumber}) - {selectedAcc.currency} {selectedAcc.balance}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>

      {open && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="sticky top-0 border-b border-gray-100 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
            <input
              autoFocus
              placeholder="Search by name or account number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full rounded bg-gray-50 px-2 py-1.5 text-sm outline-none dark:bg-gray-900 dark:text-white"
            />
          </div>
          {isLoading && debouncedSearch.length >= 3 ? (
            <div className="p-3 text-center text-xs text-gray-500">Searching...</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-center text-xs text-gray-500">No accounts found.</div>
          ) : (
            <div className="p-1">
              {filtered.map((acc) => {
                const u = users.find((u) => u.email === acc.email) || { avatar: acc.userAvatar };
                return (
                  <div
                    key={acc.id}
                    onClick={() => {
                      onChange(acc.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-200">
                      {u?.avatar ? (
                        <img src={u.avatar} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                          {(acc.owner[0] || "?").toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{acc.owner}</span>
                      <span className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                        {acc.accountNumber} • {acc.currency} {acc.balance}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OperationForm({ type, onSuccess }: { type: OperationType; onSuccess: () => void }) {
  const config = opConfig[type];

  const { form, setForm, set, loading, lastResult, isValid, handleSubmit } = useWalletOperationForm(
    type,
    config.endpoint,
    config.label,
    onSuccess
  );

  const { allAccounts } = useAccountsManagement();
  const { allUsers } = useAllUsers();

  const fieldClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-950/30";
  const labelClass = "mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Wallet ID fields */}
      {type === "transfer" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UserWalletCombobox
            label="From Account"
            placeholder="Select source account..."
            value={form.fromWalletId}
            onChange={(val) => setForm((f) => ({ ...f, fromWalletId: val }))}
            accounts={allAccounts}
            users={allUsers}
          />
          <UserWalletCombobox
            label="To Account"
            placeholder="Select destination account..."
            value={form.toWalletId}
            onChange={(val) => setForm((f) => ({ ...f, toWalletId: val }))}
            accounts={allAccounts}
            users={allUsers}
          />
        </div>
      ) : (
        <UserWalletCombobox
          label="Target Account"
          placeholder="Select account..."
          value={form.walletId}
          onChange={(val) => setForm((f) => ({ ...f, walletId: val }))}
          accounts={allAccounts}
          users={allUsers}
        />
      )}

      {/* Amount + Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Amount</label>
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              min="0.01"
              step="0.01"
              className={`${fieldClass} pl-8`}
              placeholder="0.00"
              value={form.amount}
              onChange={set("amount")}
              required
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <select className={fieldClass} value={form.currency} onChange={set("currency")}>
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <input
          className={fieldClass}
          placeholder="Transaction description visible to user"
          value={form.description}
          onChange={set("description")}
        />
      </div>

      {/* Reason */}
      <div>
        <label className={labelClass}>
          Internal Reason <span className="text-gray-400">(audit log)</span>
        </label>
        <textarea
          className={`${fieldClass} resize-none`}
          rows={2}
          placeholder="Reason for audit trail..."
          value={form.reason}
          onChange={set("reason")}
        />
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/30 dark:bg-amber-950/20">
        <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
        <p className="text-xs text-amber-700 dark:text-amber-300">
          This operation is audited and irreversible. Ensure wallet IDs and amounts are correct before submitting.
        </p>
      </div>

      <motion.button
        type="submit"
        disabled={loading || !isValid()}
        whileHover={{ scale: isValid() ? 1.01 : 1 }}
        whileTap={{ scale: 0.98 }}
        className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${config.color} py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : config.icon}
        {loading ? "Processing…" : config.label}
      </motion.button>

      {/* Success result */}
      {lastResult && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/20"
        >
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Operation successful</p>
          </div>
          {lastResult?.transaction?.reference && (
            <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
              Ref: {lastResult.transaction.reference}
            </p>
          )}
        </motion.div>
      )}
    </form>
  );
}

export default function WalletOperations() {
  const [activeOp, setActiveOp] = useState<OperationType>("credit");

  return (
    <PageContainer>
      <PageHeader
        title="Wallet Operations"
        subtitle="Admin-initiated financial operations: credit, debit, and transfer between wallets"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Accounts", href: "/admin/accounts" },
          { label: "Operations" },
        ]}
      />

      <div className="mb-6 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/30 dark:bg-blue-950/20">
        <Info size={15} className="mt-0.5 shrink-0 text-blue-500" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          All operations require <strong>canAdjustBalances</strong> permission and are recorded in the audit log. A 20%
          tax may be applied on credits based on server policy.
        </p>
      </div>

      {/* Operation selector */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {(["credit", "debit", "transfer"] as OperationType[]).map((op) => {
          const cfg = opConfig[op];
          const active = activeOp === op;
          return (
            <motion.button
              key={op}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveOp(op)}
              className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-transparent bg-white shadow-md ring-2 ring-indigo-200 dark:bg-gray-900 dark:ring-indigo-700"
                  : "border-gray-100 bg-white hover:border-gray-200 dark:border-gray-800 dark:bg-gray-900/50"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.color} text-white shadow-sm`}
              >
                {cfg.icon}
              </div>
              <div>
                <p
                  className={`text-xs font-semibold ${active ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}
                >
                  {cfg.label}
                </p>
                <p className="mt-0.5 text-[10px] leading-snug text-gray-400">{cfg.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashCard>
          <SectionHeader title={opConfig[activeOp].label} subtitle="Complete the form below to execute the operation" />
          <div className="mt-4">
            <OperationForm key={activeOp} type={activeOp} onSuccess={() => {}} />
          </div>
        </DashCard>

        {/* Help panel */}
        <DashCard>
          <SectionHeader title="Operation Guide" subtitle="How each operation works" />
          <div className="mt-4 space-y-4">
            {(["credit", "debit", "transfer"] as OperationType[]).map((op) => {
              const cfg = opConfig[op];
              return (
                <div key={op} className="flex gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${cfg.color} text-xs text-white`}
                  >
                    {cfg.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{cfg.label}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">{cfg.desc}</p>
                  </div>
                </div>
              );
            })}
            <div className="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400">Account Selection</p>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-500">
                You can select an account from the searchable dropdown list. The list displays the user's profile
                picture, name, account number, and current balance for easy identification.
              </p>
            </div>
          </div>
        </DashCard>
      </div>
    </PageContainer>
  );
}

// ============================================================================
// INSTANT PAYMENT — 2-step wizard
// Steps: 1) Payment Details  2) Review & Confirm
// ============================================================================
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Zap,
  User,
  Building,
  DollarSign,
  Shield,
  Lock,
  Info,
  Clock,
} from "@constants/icons";
import { useWallets } from "@hooks/queries/useAccounts";
import {
  useTransfer,
  useRecentRecipients,
} from "@hooks/queries/useTransactions";
import {
  TransferLayout,
  StepIndicator,
  StepContent,
  WizardNav,
  TCard,
  TInput,
  TTextarea,
  AccountSelector,
  ReviewRow,
  ReviewSection,
  FeeSummary,
  TransferResult,
  safeArray,
  formatCurrency,
} from "@components/shared/TransferPrimitives";
import type { WizardStep, AccountOption } from "@components/shared/TransferPrimitives";

// ─── Constants ───────────────────────────────────────────────────────────────
const STEPS: WizardStep[] = [{ label: "Details" }, { label: "Confirm" }];
const LIMITS = { perTransaction: 5000, daily: 10000, remaining: 8500 };

// ─── Validation ──────────────────────────────────────────────────────────────
const schema = Yup.object({
  recipientName: Yup.string().required("Recipient name is required"),
  accountNumber: Yup.string()
    .required("Account number is required")
    .matches(/^\d{10,12}$/, "10-12 digits required"),
  bankName: Yup.string().required("Bank name is required"),
  fromAccount: Yup.string().required("Select a source account"),
  amount: Yup.number()
    .required("Enter an amount")
    .positive("Must be positive")
    .max(LIMITS.perTransaction, `Max $${LIMITS.perTransaction.toLocaleString()}`),
  description: Yup.string().max(100),
  securityCode: Yup.string()
    .required("Security code is required")
    .matches(/^\d{6}$/, "6-digit code required"),
});

// ─── Component ───────────────────────────────────────────────────────────────
const InstantPayment: React.FC = () => {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    reference?: string;
  } | null>(null);

  // Hooks
  const { data: walletsRaw, isLoading: walletsLoading } = useWallets();
  const { data: recentRaw } = useRecentRecipients(6);
  const transfer = useTransfer();

  const wallets: AccountOption[] = safeArray(walletsRaw);
  const recentRecipients = safeArray(recentRaw);

  // Form
  const formik = useFormik({
    initialValues: {
      recipientName: "",
      accountNumber: "",
      bankName: "",
      fromAccount: "",
      amount: "",
      description: "",
      securityCode: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const selectedAccount = wallets.find((w) => w.id === values.fromAccount);
      transfer.mutate(
        {
          sourceAccountId: values.fromAccount as any,
          destinationAccountId: values.accountNumber as any,
          amount: Number(values.amount),
          currency: (selectedAccount?.currency || "USD") as any,
          description: values.description || undefined,
          pin: values.securityCode,
        },
        {
          onSuccess: (data: any) => {
            setResult({
              success: true,
              reference:
                data?.referenceNumber ||
                data?.id ||
                `TXN${Date.now().toString().slice(-9)}`,
            });
          },
          onError: () => {
            setResult({ success: false });
          },
        },
      );
    },
  });

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleChange,
    handleBlur,
    handleSubmit,
    setTouched,
  } = formik;

  const goNext = async () => {
    const fieldsByStep: Record<number, string[]> = {
      0: ["recipientName", "accountNumber", "bankName", "fromAccount", "amount"],
      1: ["securityCode"],
    };
    const fields = fieldsByStep[step] || [];
    const touchMap: Record<string, boolean> = {};
    fields.forEach((f) => (touchMap[f] = true));
    setTouched(touchMap, true);
    const errs = await formik.validateForm();
    if (fields.some((f) => (errs as any)[f])) return;
    if (step < 1) setStep(step + 1);
    else handleSubmit();
  };

  const selectedAccount = wallets.find((w) => w.id === values.fromAccount);

  // ─── Fill from recent recipient ─────────────────────────────────────
  const selectRecent = (r: any) => {
    setFieldValue(
      "recipientName",
      `${r.firstName || ""} ${r.lastName || ""}`.trim() || r.name || "",
    );
    setFieldValue(
      "accountNumber",
      (r.bankAccount?.accountNumber || r.accountNumber || "").replace(
        /\*+/g,
        "",
      ),
    );
    setFieldValue(
      "bankName",
      r.bankAccount?.bankName || r.bankName || "",
    );
  };

  // ─── Result Screen ──────────────────────────────────────────────────
  if (result) {
    return (
      <TransferLayout>
        <TCard>
          <TransferResult
            success={result.success}
            title={result.success ? "Payment Sent!" : "Payment Failed"}
            subtitle={
              result.success
                ? `$${Number(values.amount).toFixed(2)} sent instantly to ${values.recipientName}.`
                : "Something went wrong. Please try again."
            }
            reference={result.reference}
            details={
              result.success
                ? [
                    { label: "Amount", value: formatCurrency(values.amount) },
                    { label: "Fee", value: "$0.00" },
                    { label: "Recipient", value: values.recipientName },
                    { label: "Status", value: "Instant" },
                  ]
                : undefined
            }
            onNewTransfer={() => {
              formik.resetForm();
              setStep(0);
              setResult(null);
            }}
          />
        </TCard>
      </TransferLayout>
    );
  }

  // ─── Wizard ─────────────────────────────────────────────────────────
  return (
    <TransferLayout>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30">
          <Zap size={20} className="text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Instant Payment
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Send money instantly with zero fees.
          </p>
        </div>
      </div>

      <TCard>
        <StepIndicator steps={STEPS} current={step} />
      </TCard>

      <StepContent step={step}>
        {/* ── Step 0: Payment Details ── */}
        {step === 0 && (
          <div className="space-y-6">
            {/* Recent recipients */}
            {recentRecipients.length > 0 && (
              <TCard
                title="Recent Recipients"
                subtitle="Tap to auto-fill"
              >
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {recentRecipients.slice(0, 6).map((r: any) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => selectRecent(r)}
                      className="flex flex-col items-center gap-1.5 min-w-[72px] p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        {(r.firstName || r.name || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate max-w-[68px]">
                        {r.firstName || r.name || "—"}
                      </span>
                    </button>
                  ))}
                </div>
              </TCard>
            )}

            {/* Recipient details */}
            <TCard title="Recipient" icon={<User size={18} />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <TInput
                  label="Recipient Name"
                  name="recipientName"
                  value={values.recipientName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Full name"
                  error={errors.recipientName}
                  touched={touched.recipientName}
                  icon={<User size={16} />}
                />
                <TInput
                  label="Account Number"
                  name="accountNumber"
                  value={values.accountNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10-12 digits"
                  error={errors.accountNumber}
                  touched={touched.accountNumber}
                />
                <TInput
                  label="Bank Name"
                  name="bankName"
                  value={values.bankName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Bank name"
                  error={errors.bankName}
                  touched={touched.bankName}
                  icon={<Building size={16} />}
                />
                <TInput
                  label="Amount"
                  name="amount"
                  type="number"
                  value={values.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  error={errors.amount}
                  touched={touched.amount}
                  icon={<DollarSign size={16} />}
                />
                <TTextarea
                  label="Description (optional)"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="What's this for?"
                  rows={2}
                  error={errors.description}
                  touched={touched.description}
                  className="sm:col-span-2"
                />
              </div>
            </TCard>

            <TCard title="Payment Source" icon={<Building size={18} />}>
              <AccountSelector
                accounts={wallets}
                selected={values.fromAccount}
                onSelect={(id) => setFieldValue("fromAccount", id)}
                loading={walletsLoading}
              />
              {errors.fromAccount && touched.fromAccount && (
                <p className="text-xs text-red-500 mt-2">
                  {errors.fromAccount}
                </p>
              )}
            </TCard>

            {/* Fee info */}
            {values.amount && (
              <FeeSummary
                rows={[
                  {
                    label: "Transfer amount",
                    value: formatCurrency(values.amount),
                  },
                  { label: "Fee", value: "$0.00 (Free)" },
                  {
                    label: "Total",
                    value: formatCurrency(values.amount),
                    highlight: true,
                  },
                ]}
              />
            )}

            {/* Limits */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Per Transfer",
                  value: `$${LIMITS.perTransaction.toLocaleString()}`,
                },
                {
                  label: "Daily Limit",
                  value: `$${LIMITS.daily.toLocaleString()}`,
                },
                {
                  label: "Remaining",
                  value: `$${LIMITS.remaining.toLocaleString()}`,
                },
              ].map((l) => (
                <div
                  key={l.label}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-center"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {l.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    {l.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Review & Confirm ── */}
        {step === 1 && (
          <div className="space-y-6">
            <ReviewSection title="Payment Details" icon={<Zap size={16} />}>
              <ReviewRow
                label="Amount"
                value={formatCurrency(values.amount)}
                highlight
              />
              <ReviewRow label="Fee" value="$0.00 (Instant)" />
              <ReviewRow
                label="Total"
                value={formatCurrency(values.amount)}
                highlight
              />
              {values.description && (
                <ReviewRow
                  label="Description"
                  value={values.description}
                />
              )}
            </ReviewSection>

            <ReviewSection title="Recipient" icon={<User size={16} />}>
              <ReviewRow label="Name" value={values.recipientName} />
              <ReviewRow
                label="Account"
                value={`••••${values.accountNumber.slice(-4)}`}
              />
              <ReviewRow label="Bank" value={values.bankName} />
            </ReviewSection>

            <ReviewSection
              title="Payment Source"
              icon={<Building size={16} />}
            >
              <ReviewRow
                label="Account"
                value={
                  selectedAccount?.name ||
                  selectedAccount?.walletType ||
                  "—"
                }
              />
              <ReviewRow
                label="Balance"
                value={
                  typeof selectedAccount?.balance === "number"
                    ? formatCurrency(selectedAccount.balance)
                    : "—"
                }
              />
            </ReviewSection>

            {/* Security code */}
            <TCard title="Security Verification" icon={<Shield size={18} />}>
              <TInput
                label="Enter your 6-digit security code"
                name="securityCode"
                type="password"
                maxLength={6}
                value={values.securityCode}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••"
                error={errors.securityCode}
                touched={touched.securityCode}
                icon={<Lock size={16} />}
                className="max-w-xs"
              />
            </TCard>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
              <Clock
                size={16}
                className="text-emerald-500 mt-0.5 flex-shrink-0"
              />
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Instant payments are processed immediately. The recipient will
                receive the funds within seconds.
              </p>
            </div>
          </div>
        )}
      </StepContent>

      <WizardNav
        showBack={step > 0}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={goNext}
        nextLabel={step === 1 ? "Pay Now" : "Continue"}
        loading={transfer.isPending}
      />

      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 justify-center pb-4">
        <Info size={12} />
        <span>
          Instant payments are free and protected by end-to-end encryption.
        </span>
      </div>
    </TransferLayout>
  );
};

export default InstantPayment;

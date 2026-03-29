// ============================================================================
// DOMESTIC TRANSFER — 3-step wizard
// Steps: 1) Account & Recipient  2) Transfer Details  3) Review & Confirm
// ============================================================================
import React, { useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Building,
  User,
  DollarSign,
  Calendar,
  FileText,
  Clock,
  Send,
  Shield,
  Search,
  Star,
  Info,
} from "@constants/icons";
import { useClientWallets, useClientBeneficiaries } from "../../domain/useAccountsDomain";
import { useTransfer } from "../../domain/useTransactionsDomain";
import {
  TransferLayout,
  StepIndicator,
  StepContent,
  WizardNav,
  TCard,
  TInput,
  TCheckbox,
  AccountSelector,
  ReviewRow,
  ReviewSection,
  FeeSummary,
  TransferResult,
  formatCurrency,
} from "@components/shared/TransferPrimitives";
import type { WizardStep, AccountOption } from "@components/shared/TransferPrimitives";

// ─── Constants ───────────────────────────────────────────────────────────────
const STEPS: WizardStep[] = [
  { label: "Account" },
  { label: "Details" },
  { label: "Review" },
];

const TRANSFER_TYPES = [
  { value: "standard", label: "Standard (Free)", fee: 0, eta: "1-3 business days" },
  { value: "same_day", label: "Same-Day ($5.00)", fee: 5, eta: "Same day" },
  { value: "wire", label: "Wire ($25.00)", fee: 25, eta: "Within hours" },
];

// ─── Validation ──────────────────────────────────────────────────────────────
const schema = Yup.object({
  fromAccount: Yup.string().required("Select a source account"),
  recipientType: Yup.string().oneOf(["existing", "new"]).required(),
  beneficiaryId: Yup.string().when("recipientType", {
    is: "existing",
    then: (s) => s.required("Select a recipient"),
    otherwise: (s) => s.notRequired(),
  }),
  accountName: Yup.string().when("recipientType", {
    is: "new",
    then: (s) => s.required("Name is required").min(2),
    otherwise: (s) => s.notRequired(),
  }),
  accountNumber: Yup.string().when("recipientType", {
    is: "new",
    then: (s) =>
      s.required("Account number is required").matches(/^\d{8,17}$/, "8-17 digits"),
    otherwise: (s) => s.notRequired(),
  }),
  routingNumber: Yup.string().when("recipientType", {
    is: "new",
    then: (s) =>
      s.required("Routing number is required").matches(/^\d{9}$/, "Exactly 9 digits"),
    otherwise: (s) => s.notRequired(),
  }),
  bankName: Yup.string().when("recipientType", {
    is: "new",
    then: (s) => s.required("Bank name is required"),
    otherwise: (s) => s.notRequired(),
  }),
  amount: Yup.number()
    .required("Enter an amount")
    .positive("Must be positive")
    .max(10000, "Max $10,000 per transfer"),
  transferType: Yup.string().required("Select transfer type"),
  transferDate: Yup.string().required("Select a date"),
  reference: Yup.string().max(50),
  saveBeneficiary: Yup.boolean(),
  agreeTos: Yup.boolean().oneOf([true], "You must agree to the terms"),
});

// ─── Component ───────────────────────────────────────────────────────────────
const DomesticTransfer: React.FC = () => {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    reference?: string;
  } | null>(null);
  const [beneficiarySearch, setBeneficiarySearch] = useState("");

  // Hooks
  const { wallets: walletsArr, isLoading: walletsLoading } = useClientWallets();
  const { beneficiaries: beneficiariesArr, isLoading: beneLoading } = useClientBeneficiaries();
  const transfer = useTransfer();

  const wallets: AccountOption[] = walletsArr;
  const beneficiaries = beneficiariesArr;

  const filteredBeneficiaries = useMemo(
    () =>
      beneficiarySearch
        ? beneficiaries.filter(
            (b: any) =>
              (b.name || b.firstName || "")
                .toLowerCase()
                .includes(beneficiarySearch.toLowerCase()) ||
              (b.accountNumber || "").includes(beneficiarySearch),
          )
        : beneficiaries,
    [beneficiaries, beneficiarySearch],
  );

  // Form
  const formik = useFormik({
    initialValues: {
      fromAccount: "",
      recipientType: "existing" as "existing" | "new",
      beneficiaryId: "",
      accountName: "",
      accountNumber: "",
      routingNumber: "",
      bankName: "",
      amount: "",
      transferType: "standard",
      transferDate: new Date().toISOString().split("T")[0],
      reference: "",
      saveBeneficiary: false,
      agreeTos: false,
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const selectedAccount = wallets.find((w) => w.id === values.fromAccount);
      transfer.mutate(
        {
          sourceAccountId: values.fromAccount as any,
          destinationAccountId: (values.beneficiaryId ||
            values.accountNumber) as any,
          amount: Number(values.amount),
          currency: (selectedAccount?.currency || "USD") as any,
          description: values.reference || undefined,
        },
        {
          onSuccess: (data: any) => {
            setResult({
              success: true,
              reference:
                data?.referenceNumber ||
                data?.id ||
                `DOM${Date.now().toString().slice(-7)}`,
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

  // Per-step validation
  const goNext = async () => {
    const fieldsByStep: Record<number, string[]> = {
      0: [
        "fromAccount",
        ...(values.recipientType === "existing"
          ? ["beneficiaryId"]
          : ["accountName", "accountNumber", "routingNumber", "bankName"]),
      ],
      1: ["amount", "transferType", "transferDate"],
      2: ["agreeTos"],
    };
    const fields = fieldsByStep[step] || [];
    const touchMap: Record<string, boolean> = {};
    fields.forEach((f) => (touchMap[f] = true));
    setTouched(touchMap, true);
    const errs = await formik.validateForm();
    if (fields.some((f) => (errs as any)[f])) return;
    if (step < 2) setStep(step + 1);
    else handleSubmit();
  };

  // Derived
  const selectedAccount = wallets.find((w) => w.id === values.fromAccount);
  const selectedBeneficiary = beneficiaries.find(
    (b: any) => b.id === values.beneficiaryId,
  );
  const transferTypeInfo = TRANSFER_TYPES.find(
    (t) => t.value === values.transferType,
  );
  const fee = transferTypeInfo?.fee ?? 0;
  const total = (Number(values.amount) || 0) + fee;

  // ─── Result Screen ──────────────────────────────────────────────────
  if (result) {
    return (
      <TransferLayout>
        <TCard>
          <TransferResult
            success={result.success}
            title={result.success ? "Transfer Submitted!" : "Transfer Failed"}
            subtitle={
              result.success
                ? "Your domestic transfer is being processed."
                : "Something went wrong. Please try again."
            }
            reference={result.reference}
            details={
              result.success
                ? [
                    { label: "Amount", value: formatCurrency(values.amount) },
                    {
                      label: "Fee",
                      value: fee === 0 ? "Free" : formatCurrency(fee),
                    },
                    { label: "Total", value: formatCurrency(total) },
                    {
                      label: "Speed",
                      value: transferTypeInfo?.eta || "Standard",
                    },
                    {
                      label: "Recipient",
                      value:
                        selectedBeneficiary?.name ||
                        selectedBeneficiary?.firstName ||
                        values.accountName ||
                        "—",
                    },
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
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Domestic Transfer
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Send money to any US bank account securely.
        </p>
      </div>

      {/* Steps */}
      <TCard>
        <StepIndicator steps={STEPS} current={step} />
      </TCard>

      {/* Step Content */}
      <StepContent step={step}>
        {/* ── Step 0: Account & Recipient ── */}
        {step === 0 && (
          <div className="space-y-6">
            <TCard title="From Account" icon={<Building size={18} />}>
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

            <TCard title="Recipient" icon={<User size={18} />}>
              {/* Toggle */}
              <div className="flex gap-2 mb-4">
                {(["existing", "new"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFieldValue("recipientType", t);
                      setFieldValue("beneficiaryId", "");
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      values.recipientType === t
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {t === "existing" ? "Saved Recipient" : "New Recipient"}
                  </button>
                ))}
              </div>

              {values.recipientType === "existing" ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={beneficiarySearch}
                      onChange={(e) => setBeneficiarySearch(e.target.value)}
                      placeholder="Search recipients…"
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {beneLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : filteredBeneficiaries.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                      No recipients found
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {filteredBeneficiaries.map((b: any) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setFieldValue("beneficiaryId", b.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            values.beneficiaryId === b.id
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                            {(b.name || b.firstName || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {b.name ||
                                `${b.firstName || ""} ${b.lastName || ""}`.trim()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {b.bankAccount?.bankName ||
                                b.bankName ||
                                "Bank"}{" "}
                              ••••
                              {(
                                b.bankAccount?.accountNumber ||
                                b.accountNumber ||
                                ""
                              ).slice(-4)}
                            </p>
                          </div>
                          {b.isFavorite && (
                            <Star
                              size={14}
                              className="text-amber-400 flex-shrink-0"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.beneficiaryId && touched.beneficiaryId && (
                    <p className="text-xs text-red-500">
                      {errors.beneficiaryId}
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <TInput
                    label="Account Holder Name"
                    name="accountName"
                    value={values.accountName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Full name"
                    error={errors.accountName}
                    touched={touched.accountName}
                    icon={<User size={16} />}
                  />
                  <TInput
                    label="Account Number"
                    name="accountNumber"
                    value={values.accountNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="8-17 digits"
                    error={errors.accountNumber}
                    touched={touched.accountNumber}
                  />
                  <TInput
                    label="Routing Number"
                    name="routingNumber"
                    value={values.routingNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="9 digits"
                    error={errors.routingNumber}
                    touched={touched.routingNumber}
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
                  <div className="sm:col-span-2">
                    <TCheckbox
                      name="saveBeneficiary"
                      label="Save this recipient for future transfers"
                      checked={values.saveBeneficiary}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </TCard>
          </div>
        )}

        {/* ── Step 1: Transfer Details ── */}
        {step === 1 && (
          <div className="space-y-6">
            <TCard title="Transfer Details" icon={<DollarSign size={18} />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <TInput
                  label="Amount (USD)"
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
                <TInput
                  label="Transfer Date"
                  name="transferDate"
                  type="date"
                  value={values.transferDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.transferDate}
                  touched={touched.transferDate}
                  icon={<Calendar size={16} />}
                />
              </div>

              {/* Transfer type */}
              <div className="mt-5 space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transfer Speed
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {TRANSFER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setFieldValue("transferType", t.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        values.transferType === t.value
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-1 ring-indigo-500/50"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-indigo-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {t.value === "standard"
                            ? "Standard"
                            : t.value === "same_day"
                              ? "Same-Day"
                              : "Wire"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.eta}
                      </p>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                        {t.fee === 0 ? "Free" : `$${t.fee.toFixed(2)}`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div className="mt-5">
                <TInput
                  label="Reference / Memo (optional)"
                  name="reference"
                  value={values.reference}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Rent payment"
                  error={errors.reference}
                  touched={touched.reference}
                  icon={<FileText size={16} />}
                  hint="Max 50 characters"
                />
              </div>
            </TCard>

            {values.amount && (
              <FeeSummary
                rows={[
                  {
                    label: "Transfer amount",
                    value: formatCurrency(values.amount),
                  },
                  {
                    label: "Fee",
                    value: fee === 0 ? "Free" : formatCurrency(fee),
                  },
                  {
                    label: "Total",
                    value: formatCurrency(total),
                    highlight: true,
                  },
                ]}
              />
            )}
          </div>
        )}

        {/* ── Step 2: Review & Confirm ── */}
        {step === 2 && (
          <div className="space-y-6">
            <ReviewSection title="Transfer Details" icon={<Send size={16} />}>
              <ReviewRow
                label="Amount"
                value={formatCurrency(values.amount)}
                highlight
              />
              <ReviewRow
                label="Speed"
                value={transferTypeInfo?.label || "Standard"}
              />
              <ReviewRow
                label="Fee"
                value={fee === 0 ? "Free" : formatCurrency(fee)}
              />
              <ReviewRow
                label="Total"
                value={formatCurrency(total)}
                highlight
              />
              <ReviewRow label="Date" value={values.transferDate} />
              {values.reference && (
                <ReviewRow label="Reference" value={values.reference} />
              )}
            </ReviewSection>

            <ReviewSection
              title="From Account"
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

            <ReviewSection title="To Recipient" icon={<User size={16} />}>
              {values.recipientType === "existing" ? (
                <>
                  <ReviewRow
                    label="Name"
                    value={
                      selectedBeneficiary?.name ||
                      `${selectedBeneficiary?.firstName || ""} ${selectedBeneficiary?.lastName || ""}`.trim() ||
                      "—"
                    }
                  />
                  <ReviewRow
                    label="Bank"
                    value={
                      selectedBeneficiary?.bankAccount?.bankName ||
                      selectedBeneficiary?.bankName ||
                      "—"
                    }
                  />
                </>
              ) : (
                <>
                  <ReviewRow label="Name" value={values.accountName} />
                  <ReviewRow
                    label="Account"
                    value={`••••${values.accountNumber.slice(-4)}`}
                  />
                  <ReviewRow
                    label="Routing"
                    value={values.routingNumber}
                  />
                  <ReviewRow label="Bank" value={values.bankName} />
                </>
              )}
            </ReviewSection>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
              <Shield
                size={16}
                className="text-amber-500 mt-0.5 flex-shrink-0"
              />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Please verify all details before confirming. This action cannot
                be reversed once processed.
              </p>
            </div>

            <TCheckbox
              name="agreeTos"
              label="I agree to the transfer terms and authorize this transaction."
              checked={values.agreeTos}
              onChange={handleChange}
              error={errors.agreeTos}
              touched={touched.agreeTos}
            />
          </div>
        )}
      </StepContent>

      {/* Navigation */}
      <WizardNav
        showBack={step > 0}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={goNext}
        nextLabel={step === 2 ? "Confirm & Send" : "Continue"}
        loading={transfer.isPending}
        disabled={step === 2 && !values.agreeTos}
      />

      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 justify-center pb-4">
        <Info size={12} />
        <span>Transfers are encrypted and processed securely.</span>
      </div>
    </TransferLayout>
  );
};

export default DomesticTransfer;

// ============================================================================
// INTERNATIONAL TRANSFER — 4-step wizard
// Steps: 1) Source Account  2) Recipient  3) Amount & Delivery  4) Review
// ============================================================================
import React, { useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Globe,
  Building2,
  User,
  DollarSign,
  RefreshCw,
  Send,
  Shield,
  Search,
  Clock,
  Info,
  AlertTriangle,
} from "@constants/icons";
import { useClientWallets } from "../../client-usecase/useaccounts-client-usecase";
import {
  useSendRemittance,
  useRemittanceQuote,
  useClientRemittanceCountries,
  useClientRecipients,
  useCreateRecipient,
} from "../../client-usecase/usetransaction-client-usecase";
import {
  TransferLayout,
  StepIndicator,
  StepContent,
  WizardNav,
  TCard,
  TInput,
  TSelect,
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
const STEPS: WizardStep[] = [{ label: "Account" }, { label: "Recipient" }, { label: "Amount" }, { label: "Review" }];

const CURRENCIES = [
  { value: "USD", label: "🇺🇸 USD — US Dollar" },
  { value: "EUR", label: "🇪🇺 EUR — Euro" },
  { value: "GBP", label: "🇬🇧 GBP — British Pound" },
  { value: "JPY", label: "🇯🇵 JPY — Japanese Yen" },
  { value: "CAD", label: "🇨🇦 CAD — Canadian Dollar" },
  { value: "AUD", label: "🇦🇺 AUD — Australian Dollar" },
  { value: "CHF", label: "🇨🇭 CHF — Swiss Franc" },
  { value: "CNY", label: "🇨🇳 CNY — Chinese Yuan" },
  { value: "INR", label: "🇮🇳 INR — Indian Rupee" },
  { value: "SGD", label: "🇸🇬 SGD — Singapore Dollar" },
];

const PURPOSES = [
  { value: "family", label: "Family Support" },
  { value: "business", label: "Business Payment" },
  { value: "education", label: "Education" },
  { value: "investment", label: "Investment" },
  { value: "property", label: "Property" },
  { value: "medical", label: "Medical" },
  { value: "gift", label: "Gift" },
  { value: "other", label: "Other" },
];

const DELIVERY_OPTS = [
  { value: "bank_transfer", label: "Bank Transfer", fee: 15, eta: "2-5 business days" },
  { value: "mobile_money", label: "Mobile Money", fee: 10, eta: "1-2 business days" },
  { value: "cash_pickup", label: "Cash Pickup", fee: 20, eta: "Same day" },
];

// ─── Validation ──────────────────────────────────────────────────────────────
const schema = Yup.object({
  fromAccount: Yup.string().required("Select a source account"),
  recipientType: Yup.string().oneOf(["existing", "new"]).required(),
  recipientId: Yup.string().when("recipientType", {
    is: "existing",
    then: (s) => s.required("Select a recipient"),
    otherwise: (s) => s.notRequired(),
  }),
  recipientName: Yup.string().when("recipientType", {
    is: "new",
    then: (s) => s.required("Recipient name is required").min(2),
    otherwise: (s) => s.notRequired(),
  }),
  recipientAccount: Yup.string().when("recipientType", {
    is: "new",
    then: (s) => s.required("Account / IBAN is required"),
    otherwise: (s) => s.notRequired(),
  }),
  bankName: Yup.string().when("recipientType", {
    is: "new",
    then: (s) => s.required("Bank name is required"),
    otherwise: (s) => s.notRequired(),
  }),
  swiftCode: Yup.string().when("recipientType", {
    is: "new",
    then: (s) =>
      s.required("SWIFT/BIC is required").matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i, "Invalid SWIFT code"),
    otherwise: (s) => s.notRequired(),
  }),
  country: Yup.string().when("recipientType", {
    is: "new",
    then: (s) => s.required("Country is required"),
    otherwise: (s) => s.notRequired(),
  }),
  amount: Yup.number().required("Enter an amount").positive("Must be positive").max(50000, "Max $50,000 per transfer"),
  currency: Yup.string().required("Select a currency"),
  purpose: Yup.string().required("Select a purpose"),
  deliveryMethod: Yup.string().required("Select delivery method"),
  reference: Yup.string().max(140),
  agreeTos: Yup.boolean().oneOf([true], "You must agree to the terms"),
  agreeCompliance: Yup.boolean().oneOf([true], "Required"),
});

// ─── Component ───────────────────────────────────────────────────────────────
const InternationalTransfer: React.FC = () => {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    reference?: string;
  } | null>(null);
  const [recipientSearch, setRecipientSearch] = useState("");

  // Hooks
  const { wallets: walletsArr, isLoading: walletsLoading } = useClientWallets();
  const { countries: countriesArr } = useClientRemittanceCountries();
  const { recipients: recipientsArr, isLoading: recipientsLoading } = useClientRecipients();
  const remittance = useSendRemittance();
  const quote = useRemittanceQuote();
  const createRecipient = useCreateRecipient();

  const wallets: AccountOption[] = walletsArr;
  const countries = countriesArr;
  const recipients = recipientsArr;

  const filteredRecipients = useMemo(
    () =>
      recipientSearch
        ? recipients.filter(
            (r: any) =>
              (r.firstName || r.name || "").toLowerCase().includes(recipientSearch.toLowerCase()) ||
              (r.country || "").toLowerCase().includes(recipientSearch.toLowerCase()),
          )
        : recipients,
    [recipients, recipientSearch],
  );

  const countryOptions = useMemo(() => {
    if (countries.length > 0)
      return countries.map((c: any) => ({
        value: c.code || c.id || c.name,
        label: c.name || c.code,
      }));
    // Fallback popular countries
    return [
      { value: "GB", label: "United Kingdom" },
      { value: "DE", label: "Germany" },
      { value: "FR", label: "France" },
      { value: "JP", label: "Japan" },
      { value: "IN", label: "India" },
      { value: "CN", label: "China" },
      { value: "NG", label: "Nigeria" },
      { value: "KE", label: "Kenya" },
      { value: "PH", label: "Philippines" },
      { value: "MX", label: "Mexico" },
    ];
  }, [countries]);

  // Form
  const formik = useFormik({
    initialValues: {
      fromAccount: "",
      recipientType: "new" as "existing" | "new",
      recipientId: "",
      recipientName: "",
      recipientAccount: "",
      bankName: "",
      swiftCode: "",
      country: "",
      amount: "",
      currency: "EUR",
      purpose: "",
      deliveryMethod: "bank_transfer",
      reference: "",
      agreeTos: false,
      agreeCompliance: false,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const selectedAccount = wallets.find((w) => w.id === values.fromAccount);
      let recipientId = values.recipientId;

      // Create new recipient if needed
      if (values.recipientType === "new" && !recipientId) {
        try {
          const newRecipient = await createRecipient.mutateAsync({
            type: "international" as any,
            firstName: values.recipientName.split(" ")[0] || values.recipientName,
            lastName: values.recipientName.split(" ").slice(1).join(" ") || "",
            country: values.country,
            currency: values.currency as any,
            deliveryMethod: values.deliveryMethod as any,
            bankDetails: {
              bankName: values.bankName,
              accountNumber: values.recipientAccount,
              swiftCode: values.swiftCode,
            },
          });
          recipientId = (newRecipient as any)?.id || "";
        } catch {
          setResult({ success: false });
          return;
        }
      }

      remittance.mutate(
        {
          sourceAccountId: values.fromAccount as any,
          recipientId: recipientId as any,
          amount: Number(values.amount),
          sourceCurrency: (selectedAccount?.currency || "USD") as any,
          destinationCurrency: values.currency as any,
          deliveryMethod: values.deliveryMethod as any,
          purpose: values.purpose,
          reference: values.reference || undefined,
        },
        {
          onSuccess: (data: any) => {
            setResult({
              success: true,
              reference: data?.referenceNumber || data?.id || `INTL${Date.now().toString().slice(-7)}`,
            });
          },
          onError: () => {
            setResult({ success: false });
          },
        },
      );
    },
  });

  const { values, errors, touched, setFieldValue, handleChange, handleBlur, handleSubmit, setTouched } = formik;

  // Per-step validation
  const goNext = async () => {
    const fieldsByStep: Record<number, string[]> = {
      0: ["fromAccount"],
      1:
        values.recipientType === "existing"
          ? ["recipientId"]
          : ["recipientName", "recipientAccount", "bankName", "swiftCode", "country"],
      2: ["amount", "currency", "purpose", "deliveryMethod"],
      3: ["agreeTos", "agreeCompliance"],
    };
    const fields = fieldsByStep[step] || [];
    const touchMap: Record<string, boolean> = {};
    fields.forEach((f) => (touchMap[f] = true));
    setTouched(touchMap, true);
    const errs = await formik.validateForm();
    if (fields.some((f) => (errs as any)[f])) return;

    if (step === 2) {
      // Get quote
      const selectedAccount = wallets.find((w) => w.id === values.fromAccount);
      quote.mutate({
        amount: Number(values.amount),
        sourceCurrency: (selectedAccount?.currency || "USD") as any,
        destinationCurrency: values.currency as any,
        destinationCountry: values.country,
        deliveryMethod: values.deliveryMethod as any,
      });
    }

    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  // Derived
  const selectedAccount = wallets.find((w) => w.id === values.fromAccount);
  const selectedRecipient = recipients.find((r: any) => r.id === values.recipientId);
  const deliveryInfo = DELIVERY_OPTS.find((d) => d.value === values.deliveryMethod);
  const fee = deliveryInfo?.fee ?? 15;
  const total = (Number(values.amount) || 0) + fee;
  const quoteData = quote.data as any;
  const exchangeRate = quoteData?.exchangeRate || quoteData?.rate || null;

  // ─── Result Screen ──────────────────────────────────────────────────
  if (result) {
    return (
      <TransferLayout>
        <TCard>
          <TransferResult
            success={result.success}
            title={result.success ? "Remittance Submitted!" : "Transfer Failed"}
            subtitle={
              result.success
                ? "Your international transfer is being processed."
                : "Something went wrong. Please try again."
            }
            reference={result.reference}
            details={
              result.success
                ? [
                    {
                      label: "Amount",
                      value: formatCurrency(values.amount),
                    },
                    { label: "Currency", value: values.currency },
                    {
                      label: "Fee",
                      value: formatCurrency(fee),
                    },
                    {
                      label: "Delivery",
                      value: deliveryInfo?.label || "Bank Transfer",
                    },
                    { label: "ETA", value: deliveryInfo?.eta || "—" },
                    {
                      label: "Recipient",
                      value: selectedRecipient?.firstName || selectedRecipient?.name || values.recipientName || "—",
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
        <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">International Transfer</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Send money abroad securely and at competitive rates.
        </p>
      </div>

      <TCard>
        <StepIndicator steps={STEPS} current={step} />
      </TCard>

      <StepContent step={step}>
        {/* ── Step 0: Source Account ── */}
        {step === 0 && (
          <TCard title="Source Account" icon={<Building2 size={18} />}>
            <AccountSelector
              accounts={wallets}
              selected={values.fromAccount}
              onSelect={(id) => setFieldValue("fromAccount", id)}
              loading={walletsLoading}
            />
            {errors.fromAccount && touched.fromAccount && (
              <p className="mt-2 text-xs text-red-500">{errors.fromAccount}</p>
            )}
          </TCard>
        )}

        {/* ── Step 1: Recipient ── */}
        {step === 1 && (
          <div className="space-y-6">
            <TCard title="Recipient" icon={<User size={18} />}>
              {/* Toggle */}
              <div className="mb-4 flex gap-2">
                {(["existing", "new"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setFieldValue("recipientType", t);
                      setFieldValue("recipientId", "");
                    }}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                      values.recipientType === t
                        ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {t === "existing" ? "Saved Recipient" : "New Recipient"}
                  </button>
                ))}
              </div>

              {values.recipientType === "existing" ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      placeholder="Search recipients…"
                      className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                    />
                  </div>

                  {recipientsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                      ))}
                    </div>
                  ) : filteredRecipients.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No recipients found</p>
                  ) : (
                    <div className="max-h-60 space-y-2 overflow-y-auto">
                      {filteredRecipients.map((r: any) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setFieldValue("recipientId", r.id);
                            setFieldValue("country", r.country || "");
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                            values.recipientId === r.id
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                          }`}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {(r.firstName || r.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {`${r.firstName || ""} ${r.lastName || ""}`.trim() || r.name || "—"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {r.country || "—"} · {r.currency || "—"}
                            </p>
                          </div>
                          {r.isFavorite && <span className="text-xs text-amber-400">★</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.recipientId && touched.recipientId && (
                    <p className="text-xs text-red-500">{errors.recipientId}</p>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <TInput
                    label="Recipient Full Name"
                    name="recipientName"
                    value={values.recipientName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Full legal name"
                    error={errors.recipientName}
                    touched={touched.recipientName}
                    icon={<User size={16} />}
                  />
                  <TInput
                    label="Account / IBAN"
                    name="recipientAccount"
                    value={values.recipientAccount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Account number or IBAN"
                    error={errors.recipientAccount}
                    touched={touched.recipientAccount}
                  />
                  <TInput
                    label="Bank Name"
                    name="bankName"
                    value={values.bankName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Recipient's bank"
                    error={errors.bankName}
                    touched={touched.bankName}
                    icon={<Building2 size={16} />}
                  />
                  <TInput
                    label="SWIFT / BIC Code"
                    name="swiftCode"
                    value={values.swiftCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. DEUTDEFF"
                    error={errors.swiftCode}
                    touched={touched.swiftCode}
                    hint="8 or 11 characters"
                  />
                  <TSelect
                    label="Country"
                    name="country"
                    value={values.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    options={countryOptions}
                    placeholder="Select country"
                    error={errors.country}
                    touched={touched.country}
                    className="sm:col-span-2"
                  />
                </div>
              )}
            </TCard>
          </div>
        )}

        {/* ── Step 2: Amount & Delivery ── */}
        {step === 2 && (
          <div className="space-y-6">
            <TCard title="Transfer Amount" icon={<DollarSign size={18} />}>
              <div className="grid gap-4 sm:grid-cols-2">
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
                <TSelect
                  label="Destination Currency"
                  name="currency"
                  value={values.currency}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={CURRENCIES}
                  error={errors.currency}
                  touched={touched.currency}
                />
              </div>

              {/* Exchange rate info */}
              {exchangeRate && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800/40 dark:bg-blue-950/20">
                  <RefreshCw size={16} className="flex-shrink-0 text-blue-500" />
                  <div className="text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Exchange Rate: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      1 {selectedAccount?.currency || "USD"} = {Number(exchangeRate).toFixed(4)} {values.currency}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-5">
                <TSelect
                  label="Purpose of Transfer"
                  name="purpose"
                  value={values.purpose}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  options={PURPOSES}
                  placeholder="Select purpose"
                  error={errors.purpose}
                  touched={touched.purpose}
                />
              </div>
            </TCard>

            <TCard title="Delivery Method" icon={<Clock size={18} />}>
              <div className="grid gap-3 sm:grid-cols-3">
                {DELIVERY_OPTS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setFieldValue("deliveryMethod", d.value)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      values.deliveryMethod === d.value
                        ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/50 dark:bg-indigo-950/30"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">{d.label}</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{d.eta}</p>
                    <p className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      ${d.fee.toFixed(2)} fee
                    </p>
                  </button>
                ))}
              </div>
            </TCard>

            <TInput
              label="Reference (optional)"
              name="reference"
              value={values.reference}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Payment reference"
              error={errors.reference}
              touched={touched.reference}
              hint="Max 140 characters"
            />

            {values.amount && (
              <FeeSummary
                rows={[
                  {
                    label: "Transfer amount",
                    value: formatCurrency(values.amount),
                  },
                  {
                    label: "Delivery fee",
                    value: formatCurrency(fee),
                  },
                  ...(exchangeRate
                    ? [
                        {
                          label: `≈ Recipient gets`,
                          value: `${(Number(values.amount) * Number(exchangeRate)).toFixed(2)} ${values.currency}`,
                        },
                      ]
                    : []),
                  {
                    label: "Total deducted",
                    value: formatCurrency(total),
                    highlight: true,
                  },
                ]}
              />
            )}
          </div>
        )}

        {/* ── Step 3: Review & Confirm ── */}
        {step === 3 && (
          <div className="space-y-6">
            <ReviewSection title="Transfer Details" icon={<Send size={16} />}>
              <ReviewRow label="Amount" value={formatCurrency(values.amount)} highlight />
              <ReviewRow label="Currency" value={values.currency} />
              {exchangeRate && (
                <ReviewRow
                  label="Recipient gets"
                  value={`≈ ${(Number(values.amount) * Number(exchangeRate)).toFixed(2)} ${values.currency}`}
                />
              )}
              <ReviewRow label="Delivery" value={deliveryInfo?.label || "—"} />
              <ReviewRow label="Fee" value={formatCurrency(fee)} />
              <ReviewRow label="Total" value={formatCurrency(total)} highlight />
              <ReviewRow label="Purpose" value={PURPOSES.find((p) => p.value === values.purpose)?.label || "—"} />
              {values.reference && <ReviewRow label="Reference" value={values.reference} />}
            </ReviewSection>

            <ReviewSection title="From Account" icon={<Building2 size={16} />}>
              <ReviewRow label="Account" value={selectedAccount?.name || selectedAccount?.walletType || "—"} />
              <ReviewRow
                label="Balance"
                value={typeof selectedAccount?.balance === "number" ? formatCurrency(selectedAccount.balance) : "—"}
              />
            </ReviewSection>

            <ReviewSection title="Recipient" icon={<Globe size={16} />}>
              {values.recipientType === "existing" ? (
                <>
                  <ReviewRow
                    label="Name"
                    value={
                      `${selectedRecipient?.firstName || ""} ${selectedRecipient?.lastName || ""}`.trim() ||
                      selectedRecipient?.name ||
                      "—"
                    }
                  />
                  <ReviewRow label="Country" value={selectedRecipient?.country || "—"} />
                </>
              ) : (
                <>
                  <ReviewRow label="Name" value={values.recipientName} />
                  <ReviewRow label="Account" value={values.recipientAccount} />
                  <ReviewRow label="Bank" value={values.bankName} />
                  <ReviewRow label="SWIFT" value={values.swiftCode} />
                  <ReviewRow label="Country" value={values.country} />
                </>
              )}
            </ReviewSection>

            {/* Warnings */}
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/40 dark:bg-amber-950/20">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
              <div className="space-y-1 text-xs text-amber-700 dark:text-amber-400">
                <p>
                  International transfers may take up to 5 business days. Exchange rates are indicative and may vary at
                  time of processing.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <TCheckbox
                name="agreeTos"
                label="I agree to the international transfer terms and conditions."
                checked={values.agreeTos}
                onChange={handleChange}
                error={errors.agreeTos}
                touched={touched.agreeTos}
              />
              <TCheckbox
                name="agreeCompliance"
                label="I confirm this transfer complies with all applicable sanctions and regulations."
                checked={values.agreeCompliance}
                onChange={handleChange}
                error={errors.agreeCompliance}
                touched={touched.agreeCompliance}
              />
            </div>
          </div>
        )}
      </StepContent>

      <WizardNav
        showBack={step > 0}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={goNext}
        nextLabel={step === 3 ? "Confirm & Send" : "Continue"}
        loading={remittance.isPending || createRecipient.isPending}
        disabled={step === 3 && (!values.agreeTos || !values.agreeCompliance)}
      />

      <div className="flex items-center justify-center gap-2 pb-4 text-xs text-gray-400 dark:text-gray-500">
        <Shield size={12} />
        <span>Protected by bank-grade encryption. Regulated international transfer.</span>
      </div>
    </TransferLayout>
  );
};

export default InternationalTransfer;

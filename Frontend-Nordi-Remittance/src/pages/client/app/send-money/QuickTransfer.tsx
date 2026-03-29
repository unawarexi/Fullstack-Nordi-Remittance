// ============================================================================
// QUICK TRANSFER — 3-step wizard
// Steps: 1) Recipient  2) Payment Details  3) Review & Send
// ============================================================================
import React, { useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Users,
  User,
  Phone,
  Mail,
  DollarSign,
  Send,
  Shield,
  Search,
  Zap,
  CreditCard,
  Star,
  Info,
  Lock,
} from "@constants/icons";
import { useClientWallets } from "../../domain/useAccountsDomain";
import {
  useTransferToUser,
  useClientRecentRecipients,
} from "../../domain/useTransactionsDomain";
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
  formatCurrency,
} from "@components/shared/TransferPrimitives";
import type { WizardStep, AccountOption } from "@components/shared/TransferPrimitives";

// ─── Constants ───────────────────────────────────────────────────────────────
const STEPS: WizardStep[] = [
  { label: "Recipient" },
  { label: "Payment" },
  { label: "Review" },
];

const P2P_NETWORKS = [
  { value: "zelle", label: "Zelle", fee: "Free", eta: "Instant" },
  { value: "venmo", label: "Venmo", fee: "Free", eta: "1-3 days" },
  { value: "paypal", label: "PayPal", fee: "0.5%", eta: "Instant" },
  { value: "cashapp", label: "Cash App", fee: "Free", eta: "1-2 days" },
];

const LIMITS = { perTransaction: 2000, daily: 5000, remaining: 4500 };

// ─── Validation ──────────────────────────────────────────────────────────────
const schema = Yup.object({
  recipientMethod: Yup.string()
    .oneOf(["contact", "phone", "email"])
    .required(),
  recipientId: Yup.string().when("recipientMethod", {
    is: "contact",
    then: (s) => s.required("Select a contact"),
    otherwise: (s) => s.notRequired(),
  }),
  recipientPhone: Yup.string().when("recipientMethod", {
    is: "phone",
    then: (s) =>
      s
        .required("Phone number is required")
        .matches(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
    otherwise: (s) => s.notRequired(),
  }),
  recipientEmail: Yup.string().when("recipientMethod", {
    is: "email",
    then: (s) => s.required("Email is required").email("Invalid email"),
    otherwise: (s) => s.notRequired(),
  }),
  amount: Yup.number()
    .required("Enter an amount")
    .positive("Must be positive")
    .max(LIMITS.perTransaction, `Max $${LIMITS.perTransaction.toLocaleString()} per transfer`),
  fromAccount: Yup.string().required("Select a payment source"),
  network: Yup.string().required("Select a transfer network"),
  memo: Yup.string().max(100),
  pin: Yup.string()
    .required("Enter your PIN")
    .matches(/^\d{4}$/, "4-digit PIN required"),
});

// ─── Component ───────────────────────────────────────────────────────────────
const QuickTransfer: React.FC = () => {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<{
    success: boolean;
    reference?: string;
  } | null>(null);
  const [contactSearch, setContactSearch] = useState("");

  // Hooks
  const { wallets: walletsArr, isLoading: walletsLoading } = useClientWallets();
  const { recipients: recentArr, isLoading: recipientsLoading } =
    useClientRecentRecipients(20);
  const transferToUser = useTransferToUser();

  const wallets: AccountOption[] = walletsArr;
  const recentContacts = recentArr;

  const filteredContacts = useMemo(
    () =>
      contactSearch
        ? recentContacts.filter(
            (c: any) =>
              (c.firstName || c.name || "")
                .toLowerCase()
                .includes(contactSearch.toLowerCase()) ||
              (c.email || c.phone || "").includes(contactSearch),
          )
        : recentContacts,
    [recentContacts, contactSearch],
  );

  // Form
  const formik = useFormik({
    initialValues: {
      recipientMethod: "contact" as "contact" | "phone" | "email",
      recipientId: "",
      recipientPhone: "",
      recipientEmail: "",
      amount: "",
      fromAccount: "",
      network: "zelle",
      memo: "",
      pin: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const selectedAccount = wallets.find((w) => w.id === values.fromAccount);
      const contact = recentContacts.find(
        (c: any) => c.id === values.recipientId,
      );
      const email =
        values.recipientMethod === "email"
          ? values.recipientEmail
          : values.recipientMethod === "contact"
            ? contact?.email || ""
            : "";

      transferToUser.mutate(
        {
          sourceAccountId: values.fromAccount as any,
          recipientEmail: email || values.recipientPhone,
          amount: Number(values.amount),
          currency: (selectedAccount?.currency || "USD") as any,
          description: values.memo || undefined,
          pin: values.pin,
        },
        {
          onSuccess: (data: any) => {
            setResult({
              success: true,
              reference:
                data?.referenceNumber ||
                data?.id ||
                `QT${Date.now().toString().slice(-9)}`,
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
      0:
        values.recipientMethod === "contact"
          ? ["recipientId"]
          : values.recipientMethod === "phone"
            ? ["recipientPhone"]
            : ["recipientEmail"],
      1: ["amount", "fromAccount", "network"],
      2: ["pin"],
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
  const selectedContact = recentContacts.find(
    (c: any) => c.id === values.recipientId,
  );
  const networkInfo = P2P_NETWORKS.find((n) => n.value === values.network);

  const recipientDisplay =
    values.recipientMethod === "contact"
      ? selectedContact?.firstName ||
        selectedContact?.name ||
        "—"
      : values.recipientMethod === "phone"
        ? values.recipientPhone
        : values.recipientEmail;

  // ─── Result Screen ──────────────────────────────────────────────────
  if (result) {
    return (
      <TransferLayout>
        <TCard>
          <TransferResult
            success={result.success}
            title={result.success ? "Money Sent!" : "Transfer Failed"}
            subtitle={
              result.success
                ? `Your quick transfer to ${recipientDisplay} is being processed.`
                : "Something went wrong. Please try again."
            }
            reference={result.reference}
            details={
              result.success
                ? [
                    { label: "Amount", value: formatCurrency(values.amount) },
                    {
                      label: "Network",
                      value: networkInfo?.label || "—",
                    },
                    { label: "To", value: recipientDisplay || "—" },
                    { label: "ETA", value: networkInfo?.eta || "—" },
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Quick Transfer
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Send money instantly to friends and family.
        </p>
      </div>

      <TCard>
        <StepIndicator steps={STEPS} current={step} />
      </TCard>

      <StepContent step={step}>
        {/* ── Step 0: Recipient ── */}
        {step === 0 && (
          <div className="space-y-6">
            <TCard title="Choose Recipient" icon={<Users size={18} />}>
              {/* Method tabs */}
              <div className="flex gap-2 mb-5">
                {[
                  { key: "contact" as const, label: "Contacts", icon: <Users size={14} /> },
                  { key: "phone" as const, label: "Phone", icon: <Phone size={14} /> },
                  { key: "email" as const, label: "Email", icon: <Mail size={14} /> },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setFieldValue("recipientMethod", t.key);
                      setFieldValue("recipientId", "");
                      setFieldValue("recipientPhone", "");
                      setFieldValue("recipientEmail", "");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      values.recipientMethod === t.key
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {values.recipientMethod === "contact" && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      placeholder="Search contacts…"
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {recipientsLoading ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                      No contacts found
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
                      {filteredContacts.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFieldValue("recipientId", c.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            values.recipientId === c.id
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {(c.firstName || c.name || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {`${c.firstName || ""} ${c.lastName || ""}`.trim() ||
                                c.name ||
                                "—"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {c.email || c.phone || "—"}
                            </p>
                          </div>
                          {c.isFavorite && (
                            <Star
                              size={12}
                              className="text-amber-400 flex-shrink-0"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.recipientId && touched.recipientId && (
                    <p className="text-xs text-red-500">{errors.recipientId}</p>
                  )}
                </div>
              )}

              {values.recipientMethod === "phone" && (
                <TInput
                  label="Phone Number"
                  name="recipientPhone"
                  type="tel"
                  value={values.recipientPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+1 234 567 8900"
                  error={errors.recipientPhone}
                  touched={touched.recipientPhone}
                  icon={<Phone size={16} />}
                />
              )}

              {values.recipientMethod === "email" && (
                <TInput
                  label="Email Address"
                  name="recipientEmail"
                  type="email"
                  value={values.recipientEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="recipient@example.com"
                  error={errors.recipientEmail}
                  touched={touched.recipientEmail}
                  icon={<Mail size={16} />}
                />
              )}
            </TCard>

            {/* Limits info */}
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

        {/* ── Step 1: Payment Details ── */}
        {step === 1 && (
          <div className="space-y-6">
            <TCard title="Payment Details" icon={<DollarSign size={18} />}>
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
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sending to
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white truncate">
                      {recipientDisplay}
                    </span>
                  </div>
                </div>
              </div>
            </TCard>

            <TCard title="Payment Source" icon={<CreditCard size={18} />}>
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

            <TCard title="Transfer Network" icon={<Zap size={18} />}>
              <div className="grid gap-3 sm:grid-cols-2">
                {P2P_NETWORKS.map((n) => (
                  <button
                    key={n.value}
                    type="button"
                    onClick={() => setFieldValue("network", n.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      values.network === n.value
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ring-1 ring-indigo-500/50"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white block">
                      {n.label}
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Fee: {n.fee}
                      </span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {n.eta}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </TCard>

            <TTextarea
              label="Memo (optional)"
              name="memo"
              value={values.memo}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="What's this for?"
              rows={2}
              error={errors.memo}
              touched={touched.memo}
            />
          </div>
        )}

        {/* ── Step 2: Review & PIN ── */}
        {step === 2 && (
          <div className="space-y-6">
            <ReviewSection title="Transfer Summary" icon={<Send size={16} />}>
              <ReviewRow
                label="Amount"
                value={formatCurrency(values.amount)}
                highlight
              />
              <ReviewRow
                label="Network"
                value={networkInfo?.label || "—"}
              />
              <ReviewRow label="Fee" value={networkInfo?.fee || "Free"} />
              <ReviewRow label="ETA" value={networkInfo?.eta || "—"} />
              {values.memo && (
                <ReviewRow label="Memo" value={values.memo} />
              )}
            </ReviewSection>

            <ReviewSection title="Recipient" icon={<User size={16} />}>
              <ReviewRow label="To" value={recipientDisplay || "—"} />
              <ReviewRow
                label="Method"
                value={
                  values.recipientMethod === "contact"
                    ? "Saved Contact"
                    : values.recipientMethod === "phone"
                      ? "Phone Number"
                      : "Email"
                }
              />
            </ReviewSection>

            <ReviewSection
              title="Payment Source"
              icon={<CreditCard size={16} />}
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

            {/* PIN */}
            <TCard title="Security" icon={<Lock size={18} />}>
              <TInput
                label="Enter your 4-digit PIN"
                name="pin"
                type="password"
                maxLength={4}
                value={values.pin}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••"
                error={errors.pin}
                touched={touched.pin}
                icon={<Lock size={16} />}
                className="max-w-xs"
              />
            </TCard>
          </div>
        )}
      </StepContent>

      <WizardNav
        showBack={step > 0}
        onBack={step > 0 ? () => setStep(step - 1) : undefined}
        onNext={goNext}
        nextLabel={step === 2 ? "Send Money" : "Continue"}
        loading={transferToUser.isPending}
      />

      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 justify-center pb-4">
        <Info size={12} />
        <span>Quick transfers are instant and secure.</span>
      </div>
    </TransferLayout>
  );
};

export default QuickTransfer;

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Activity,
  Globe,
  RotateCcw,
  CreditCard,
  Minus,
  Plus,
  ArrowRightLeft,
  X,
  Loader2,
  Search,
  User,
  Building2,
  MapPin,
} from "lucide-react";
import {
  PageContainer,
  DashCard,
  StatCard,
  StatsGrid,
  FilterBar,
  FilterSelect,
  FilterPill,
  ActionButton,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { PageHeader } from "@components/shared/PageHeader";
import { useToast } from "@store/toast.store";
import { useTransactionManagement } from "../../admin-usecase/useTransactionManagement";
import { useSearchUsers } from "@hooks/api-queries";
import { formatCurrency } from "@core/algo/financial";
import { UserEligibilityModal } from "@components/shared/UserEligibilityModal";
import { useEligibilityError } from "@hooks/useEligibilityError";

// ============================================================================
// CONSTANTS
// ============================================================================

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "processing", label: "Processing" },
  { value: "cancelled", label: "Cancelled" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "transfer", label: "Transfer" },
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "remittance", label: "International" },
];

const timeFilters = ["Today", "This Week", "This Month", "This Quarter", "All Time"];

const typeIcons: Record<string, React.ReactNode> = {
  transfer: <ArrowRightLeft size={14} />,
  deposit: <ArrowDownLeft size={14} />,
  withdrawal: <ArrowUpRight size={14} />,
  remittance: <Globe size={14} />,
  international: <Globe size={14} />,
};

const currencySymbol = (c: string) =>
  c === "EUR" ? "€" : c === "USD" ? "$" : c === "GBP" ? "£" : c === "SEK" ? "kr" : c;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// ============================================================================
// USER SEARCH DROPDOWN
// ============================================================================

function UserSearchSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (userId: string, user: any) => void;
  label: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: usersRaw, isLoading } = useSearchUsers(
    searchTerm.length >= 2 ? { query: searchTerm, limit: 10 } : undefined,
  );

  const users = useMemo(() => {
    if (!usersRaw) return [];
    const outer: any = usersRaw;
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.users || [];
    return raw.map((u: any) => ({
      id: u._id || u.id,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email || "",
      accountNumber: u.accountNumber || "",
    }));
  }, [usersRaw]);

  return (
    <div className="relative">
      <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </label>
      {selectedUser ? (
        <div className="mt-1 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <User size={12} className="text-gray-400" />
            <span className="text-xs text-gray-900 dark:text-white">
              {selectedUser.firstName} {selectedUser.lastName}
            </span>
            <span className="text-[10px] text-gray-400">{selectedUser.email}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              onChange("", null);
              setSearchTerm("");
            }}
            className="text-gray-400 hover:text-rose-500"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="relative mt-1">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {isOpen && searchTerm.length >= 2 && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              {isLoading ? (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
                  <Loader2 size={12} className="animate-spin" /> Searching...
                </div>
              ) : users.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400">No users found</div>
              ) : (
                users.map((u: any) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      onChange(u.id, u);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="w-full border-b border-gray-100 px-3 py-2 text-left last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >
                    <p className="text-xs text-gray-900 dark:text-white">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {u.email} {u.accountNumber ? `• ${u.accountNumber}` : ""}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INPUT HELPER
// ============================================================================

const inputCls =
  "w-full mt-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none";
const labelCls = "text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium";

// ============================================================================
// WALLET OPERATION MODAL (Credit / Debit)
// ============================================================================

function WalletOperationModal({
  type,
  onClose,
  onSubmit,
  isLoading,
}: {
  type: "credit" | "debit";
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [description, setDescription] = useState("");
  const [isInternational, setIsInternational] = useState(false);
  const [transactionType, setTransactionType] = useState(type === "credit" ? "deposit" : "withdrawal");

  // Sender details (for credit — who is sending money to the user)
  const [senderName, setSenderName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderAccount, setSenderAccount] = useState("");
  const [senderOrganisation, setSenderOrganisation] = useState("");
  const [senderBankName, setSenderBankName] = useState("");
  const [senderSwiftBic, setSenderSwiftBic] = useState("");
  const [senderIban, setSenderIban] = useState("");

  // Recipient details (for debit — who receives the money from the user)
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [recipientOrganisation, setRecipientOrganisation] = useState("");
  const [recipientBankName, setRecipientBankName] = useState("");
  const [recipientSwiftBic, setRecipientSwiftBic] = useState("");
  const [recipientIban, setRecipientIban] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !amount) return;

    const payload: any = {
      userId,
      amount: parseFloat(amount),
      currency,
      description,
      transactionType,
      metadata: {
        isInternational,
        transferType: isInternational ? "international" : "domestic",
      },
    };

    if (type === "credit") {
      payload.metadata.sender = {
        name: senderName || undefined,
        address: senderAddress || undefined,
        accountNumber: senderAccount || undefined,
        organisation: senderOrganisation || undefined,
        bankName: senderBankName || undefined,
        swiftBic: senderSwiftBic || undefined,
        iban: senderIban || undefined,
      };
    } else {
      payload.metadata.recipient = {
        name: recipientName || undefined,
        address: recipientAddress || undefined,
        accountNumber: recipientAccount || undefined,
        organisation: recipientOrganisation || undefined,
        bankName: recipientBankName || undefined,
        swiftBic: recipientSwiftBic || undefined,
        iban: recipientIban || undefined,
      };
    }

    onSubmit(payload);
  };

  const isCredit = type === "credit";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            {isCredit ? <Plus size={16} className="text-emerald-500" /> : <Minus size={16} className="text-rose-500" />}
            {isCredit ? "Credit User Wallet" : "Debit User Wallet"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* User Selection */}
          <UserSearchSelect value={userId} onChange={(id) => setUserId(id)} label="Select User" />

          {/* Transfer Type Toggle */}
          <div>
            <label className={labelCls}>Transfer Type</label>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setIsInternational(false)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  !isInternational
                    ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <Building2 size={12} /> Domestic
              </button>
              <button
                type="button"
                onClick={() => setIsInternational(true)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  isInternational
                    ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                <Globe size={12} /> International
              </button>
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="SEK">SEK</option>
                <option value="NOK">NOK</option>
                <option value="DKK">DKK</option>
              </select>
            </div>
          </div>

          {/* Transaction Type */}
          <div>
            <label className={labelCls}>Transaction Type</label>
            <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className={inputCls}>
              {isCredit ? (
                <>
                  <option value="deposit">Deposit</option>
                  <option value="refund">Refund</option>
                  <option value="transfer">Transfer</option>
                  <option value="payment">Payment</option>
                </>
              ) : (
                <>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="fee">Fee</option>
                  <option value="transfer">Transfer</option>
                  <option value="payment">Payment</option>
                </>
              )}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reason for this operation"
              className={inputCls}
            />
          </div>

          {/* Tax Notice (credit only) */}
          {isCredit && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
              Note: A 20% tax will be applied on credit operations as per policy.
            </p>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              {isCredit ? (
                <>
                  <ArrowDownLeft size={13} className="text-emerald-500" /> Sender Details
                </>
              ) : (
                <>
                  <ArrowUpRight size={13} className="text-rose-500" /> Recipient Details
                </>
              )}
            </p>
          </div>

          {/* Sender Details (Credit) */}
          {isCredit && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Sender Name</label>
                  <input
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Full name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Organisation</label>
                  <input
                    value={senderOrganisation}
                    onChange={(e) => setSenderOrganisation(e.target.value)}
                    placeholder="Company / Org"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Sender Address</label>
                <input
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  placeholder="Full address"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Account Number</label>
                  <input
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                    placeholder="Account / IBAN"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Bank Name</label>
                  <input
                    value={senderBankName}
                    onChange={(e) => setSenderBankName(e.target.value)}
                    placeholder="Bank name"
                    className={inputCls}
                  />
                </div>
              </div>
              {isInternational && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>SWIFT / BIC</label>
                    <input
                      value={senderSwiftBic}
                      onChange={(e) => setSenderSwiftBic(e.target.value)}
                      placeholder="e.g. NDEASESSXXX"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>IBAN</label>
                    <input
                      value={senderIban}
                      onChange={(e) => setSenderIban(e.target.value)}
                      placeholder="e.g. SE3550000000054910000003"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recipient Details (Debit) */}
          {!isCredit && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Recipient Name</label>
                  <input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Full name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Organisation</label>
                  <input
                    value={recipientOrganisation}
                    onChange={(e) => setRecipientOrganisation(e.target.value)}
                    placeholder="Company / Org"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Recipient Address</label>
                <input
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Full address"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Account Number</label>
                  <input
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    placeholder="Account / IBAN"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Bank Name</label>
                  <input
                    value={recipientBankName}
                    onChange={(e) => setRecipientBankName(e.target.value)}
                    placeholder="Bank name"
                    className={inputCls}
                  />
                </div>
              </div>
              {isInternational && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>SWIFT / BIC</label>
                    <input
                      value={recipientSwiftBic}
                      onChange={(e) => setRecipientSwiftBic(e.target.value)}
                      placeholder="e.g. NDEASESSXXX"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>IBAN</label>
                    <input
                      value={recipientIban}
                      onChange={(e) => setRecipientIban(e.target.value)}
                      placeholder="e.g. SE3550000000054910000003"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !userId || !amount}
              className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-white disabled:opacity-50 ${
                isCredit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isLoading && <Loader2 size={12} className="animate-spin" />}
              {isCredit ? "Credit Wallet" : "Debit Wallet"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function TransactionActionModal({
  type,
  txId,
  onClose,
  onSubmit,
  isLoading,
}: {
  type: "approve" | "reject";
  txId: string;
  onClose: () => void;
  onSubmit: (note: string) => void;
  isLoading: boolean;
}) {
  const [note, setNote] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            {type === "approve" ? (
              <CheckCircle size={16} className="text-emerald-500" />
            ) : (
              <XCircle size={16} className="text-rose-500" />
            )}
            {type === "approve" ? "Approve Transaction" : "Reject Transaction"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={16} />
          </button>
        </div>
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Transaction ID: <span className="font-mono text-gray-700 dark:text-gray-300">{txId}</span>
        </p>
        <div className="mb-4">
          <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {type === "approve" ? "Note (optional)" : "Reason (required)"}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={type === "approve" ? "Add a note..." : "Provide rejection reason..."}
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            required={type === "reject"}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(note)}
            disabled={isLoading || (type === "reject" && !note.trim())}
            className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-white disabled:opacity-50 ${
              type === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {isLoading && <Loader2 size={12} className="animate-spin" />}
            {type === "approve" ? "Approve" : "Reject"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TransactionDetailPanel({
  transaction,
  onClose,
  onApprove,
  onReject,
}: {
  transaction: any;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  if (!transaction) return null;

  const rows = [
    { label: "Reference", value: transaction.reference ?? transaction.id },
    { label: "Type", value: transaction.type },
    { label: "Status", value: transaction.status },
    { label: "Amount", value: formatCurrency(transaction.amount ?? 0, transaction.currency ?? "EUR") },
    {
      label: "Fee",
      value: transaction.fee != null ? formatCurrency(transaction.fee, transaction.currency ?? "EUR") : "—",
    },
    {
      label: "Net Amount",
      value: transaction.netAmount != null ? formatCurrency(transaction.netAmount, transaction.currency ?? "EUR") : "—",
    },
    { label: "Currency", value: transaction.currency ?? "—" },
    { label: "Description", value: transaction.description ?? "—" },
    {
      label: "Date",
      value: transaction.createdAt
        ? new Date(transaction.createdAt).toLocaleString()
        : transaction.date
          ? new Date(transaction.date).toLocaleString()
          : "—",
    },
    { label: "Failure Reason", value: transaction.failureReason ?? "—" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 sm:rounded-xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Transaction Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-2 p-4">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-start justify-between border-b border-gray-50 py-1.5 dark:border-gray-800/50"
            >
              <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">{r.label}</span>
              <span className="max-w-[60%] text-right text-xs text-gray-900 dark:text-white">
                {r.label === "Status" ? <StatusBadge status={r.value} /> : r.value}
              </span>
            </div>
          ))}
        </div>
        {transaction.status === "pending" && (
          <div className="flex gap-2 border-t border-gray-200 p-4 dark:border-gray-800">
            {onApprove && (
              <button
                onClick={onApprove}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
              >
                <CheckCircle size={12} /> Approve
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white hover:bg-rose-700"
              >
                <XCircle size={12} /> Reject
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AllTransactions() {
  const toast = useToast();
  const {
    transactions,
    stats,
    isLoading,
    isRefetching,
    isMutating,
    filters,
    updateFilter,
    resetFilters,
    page,
    setPage,
    pagination,
    pageNumbers,
    selectedTxId,
    setSelectedTxId,
    actionModal,
    setActionModal,
    approveTransaction,
    rejectTransaction,
    creditUser,
    debitUser,
    refetch,
    rawTransactions,
  } = useTransactionManagement();

  const [walletModal, setWalletModal] = useState<"credit" | "debit" | null>(null);
  const eligibility = useEligibilityError();

  const selectedTransaction = rawTransactions.find((tx: any) => tx.id === selectedTxId);

  const hasActiveFilters = filters.status !== "all" || filters.type !== "all" || filters.timeRange !== "all";

  return (
    <PageContainer>
      <PageHeader
        title="All Transactions"
        subtitle="Complete transaction management — credit, debit, approve, reject, and monitor"
        breadcrumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Transactions", href: "/admin/transactions" },
          { label: "All" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <ActionButton
              label="Credit User"
              icon={<Plus size={14} />}
              onClick={() => setWalletModal("credit")}
              variant="primary"
            />
            <ActionButton
              label="Debit User"
              icon={<Minus size={14} />}
              onClick={() => setWalletModal("debit")}
              variant="secondary"
            />
            <ActionButton
              label="Refresh"
              icon={<RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />}
              onClick={refetch}
              variant="secondary"
            />
          </div>
        }
      />

      {/* Stats */}
      <StatsGrid>
        <StatCard
          label="Total Transactions"
          value={stats.total.toLocaleString()}
          icon={<Activity size={18} />}
          iconColor="from-blue-500 to-blue-600"
          change={`${stats.processing} processing`}
          positive
          index={0}
        />
        <StatCard
          label="Total Volume"
          value={formatCurrency(stats.volume, "EUR")}
          icon={<DollarSign size={18} />}
          iconColor="from-emerald-500 to-emerald-600"
          change={`${stats.completed} completed`}
          positive
          index={1}
        />
        <StatCard
          label="Pending Review"
          value={stats.pending}
          icon={<Clock size={18} />}
          iconColor="from-amber-500 to-amber-600"
          change={`${stats.failed} failed`}
          positive={false}
          index={2}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle size={18} />}
          iconColor="from-green-500 to-green-600"
          change=""
          positive
          index={3}
        />
      </StatsGrid>

      {/* Time Filters */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {timeFilters.map((t) => (
          <FilterPill
            key={t}
            label={t}
            active={filters.timeRange === (t === "All Time" ? "all" : t)}
            onClick={() => updateFilter("timeRange", t === "All Time" ? "all" : t)}
          />
        ))}
      </div>

      {/* Search & Filters */}
      <FilterBar
        searchValue={filters.search}
        onSearchChange={(v) => updateFilter("search", v)}
        searchPlaceholder="Search by reference, user, email, or description..."
      >
        <FilterSelect value={filters.status} onChange={(v) => updateFilter("status", v)} options={statusOptions} />
        <FilterSelect value={filters.type} onChange={(v) => updateFilter("type", v)} options={typeOptions} />
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400"
          >
            <RotateCcw size={12} /> Reset
          </motion.button>
        )}
      </FilterBar>

      {/* Loading State */}
      {isLoading ? (
        <DashCard>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={24} className="mb-2 animate-spin text-blue-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading transactions...</p>
          </div>
        </DashCard>
      ) : (
        /* Transactions Table */
        <DashCard padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  {["Transaction", "User", "Type", "Amount", "Status", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {transactions.map((tx: any, i: number) => {
                    const userName = tx.sourceWallet?.user?.fullName ?? tx.user ?? "—";
                    const userEmail = tx.sourceWallet?.user?.email ?? tx.email ?? "";
                    const txType = tx.type ?? "transfer";
                    const currency = tx.currency ?? "EUR";

                    return (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.02 } }}
                        exit={{ opacity: 0, x: -20 }}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800/50 dark:hover:bg-gray-800/30"
                      >
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                            {tx.reference ?? tx.id}
                          </p>
                          <p className="font-mono text-[10px] text-gray-400">{tx.id?.substring(0, 12)}...</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-900 dark:text-white sm:text-sm">{userName}</p>
                          <p className="text-[10px] text-gray-400">{userEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs capitalize text-gray-600 dark:text-gray-300">
                            {typeIcons[txType] ?? <CreditCard size={14} />} {txType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold sm:text-sm ${
                              txType === "deposit"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : txType === "withdrawal"
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {txType === "deposit" ? "+" : txType === "withdrawal" ? "-" : ""}
                            {currencySymbol(currency)}
                            {(tx.amount ?? 0).toLocaleString()}
                          </span>
                          {tx.fee > 0 && (
                            <p className="text-[10px] text-gray-400">
                              Fee: {currencySymbol(currency)}
                              {tx.fee.toLocaleString()}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(tx.createdAt ?? tx.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          <br />
                          <span className="text-[10px]">
                            {new Date(tx.createdAt ?? tx.date).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedTxId(tx.id)}
                              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                              title="View details"
                            >
                              <Eye size={14} />
                            </motion.button>
                            {tx.status === "pending" && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setActionModal({ type: "approve", txId: tx.id })}
                                  className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                                  title="Approve"
                                >
                                  <CheckCircle size={14} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setActionModal({ type: "reject", txId: tx.id })}
                                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                  title="Reject"
                                >
                                  <XCircle size={14} />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <AlertTriangle size={32} className="mb-2" />
              <p className="text-sm">No transactions found</p>
              <p className="mt-1 text-xs">Try adjusting your filters</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
              Showing {pagination.items.length} of {pagination.total} transactions
            </p>
            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Previous
              </motion.button>
              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-gray-400">
                    ...
                  </span>
                ) : (
                  <motion.button
                    key={p}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(p as number)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs ${
                      page === p
                        ? "border-blue-500 bg-blue-50 font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {p}
                  </motion.button>
                ),
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Next
              </motion.button>
            </div>
          </div>
        </DashCard>
      )}

      {/* Modals */}
      <AnimatePresence>
        {walletModal && (
          <WalletOperationModal
            type={walletModal}
            isLoading={isMutating}
            onClose={() => setWalletModal(null)}
            onSubmit={(data) => {
              const callbacks = {
                onSuccess: () => {
                  toast.success(
                    walletModal === "credit" ? "Wallet credited successfully" : "Wallet debited successfully",
                  );
                  setWalletModal(null);
                  refetch();
                },
                onError: (err: any) => {
                  if (!eligibility.handleError(err)) {
                    toast.error(err?.response?.data?.message ?? err?.message ?? `Failed to ${walletModal} wallet`);
                  }
                  setWalletModal(null);
                },
              };
              if (walletModal === "credit") {
                creditUser(data, callbacks);
              } else {
                debitUser(data, callbacks);
              }
            }}
          />
        )}

        {actionModal && actionModal.txId && (actionModal.type === "approve" || actionModal.type === "reject") && (
          <TransactionActionModal
            type={actionModal.type}
            txId={actionModal.txId}
            isLoading={isMutating}
            onClose={() => setActionModal(null)}
            onSubmit={(note) => {
              const errorCallbacks = {
                onError: (err: any) => {
                  if (!eligibility.handleError(err)) {
                    toast.error(err?.response?.data?.message ?? err?.message ?? "Operation failed");
                  }
                },
              };
              if (actionModal.type === "approve") {
                approveTransaction(actionModal.txId!, note, errorCallbacks);
                toast.success("Transaction approved");
              } else {
                rejectTransaction(actionModal.txId!, note, errorCallbacks);
                toast.info("Transaction rejected");
              }
              setActionModal(null);
            }}
          />
        )}

        {selectedTxId && selectedTransaction && (
          <TransactionDetailPanel
            transaction={selectedTransaction}
            onClose={() => setSelectedTxId(null)}
            onApprove={
              selectedTransaction.status === "pending"
                ? () => {
                    setSelectedTxId(null);
                    setActionModal({ type: "approve", txId: selectedTransaction.id });
                  }
                : undefined
            }
            onReject={
              selectedTransaction.status === "pending"
                ? () => {
                    setSelectedTxId(null);
                    setActionModal({ type: "reject", txId: selectedTransaction.id });
                  }
                : undefined
            }
          />
        )}
      </AnimatePresence>

      {/* User Eligibility Modal — shown when admin operations fail due to KYC/block status */}
      <UserEligibilityModal
        isOpen={eligibility.isOpen}
        onClose={eligibility.close}
        error={eligibility.error}
        onResolved={() => refetch()}
      />
    </PageContainer>
  );
}

// ============================================================================
// MY ACCOUNTS — Main accounts dashboard (Dark mode + Shared Primitives)
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Plus,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  PiggyBank,
  Building2,
  Briefcase,
  Download,
  ChevronRight,
  X,
  ShieldCheck,
  Users,
  Loader2,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { StatsGridSkeleton, AccountListSkeleton } from "@components/skeletons";
import {
  useClientWallets,
  useClientAccountSummary,
  useCreateWallet,
  SUPPORTED_WALLET_CURRENCIES,
  type ClientWallet,
} from "../../client-usecase/useaccounts-client-usecase";
import { useAuthStore } from "@store/auth.store";
import { useUIStore } from "@store/ui.store";
import {
  PageContainer,
  StatCard,
  StatsGrid,
  DashCard,
  FilterPill,
  ActionButton,
  QuickLinkCard,
  QuickLinksGrid,
  StatusBadge,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants, cardRevealVariants } from "@core/animation/Animation";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Only "personal" | "business" exist on the backend today.
const walletTypeIcons: Record<ClientWallet["type"], React.ReactNode> = {
  personal: <Wallet size={20} />,
  business: <Briefcase size={20} />,
};

const walletTypeColors: Record<ClientWallet["type"], string> = {
  personal: "from-indigo-500 to-purple-600",
  business: "from-amber-500 to-orange-600",
};

const formatCurrency = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);

// ─── New Wallet Modal ────────────────────────────────────────────────────────
// Wires up WalletService.createWallet, which previously had no UI anywhere.
const NewWalletModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [walletType, setWalletType] = useState<"personal" | "business">("personal");
  const [currency, setCurrency] = useState<string>("USD");
  const createWallet = useCreateWallet();

  const handleSubmit = () => {
    createWallet.mutate({ walletType, currency: currency as Currency }, { onSuccess: () => onClose() });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-t-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:rounded-2xl sm:p-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">Add a Wallet</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                  Wallet type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["personal", "business"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setWalletType(t)}
                      className={`rounded-xl border px-4 py-2.5 text-xs font-medium capitalize transition-colors sm:text-sm ${
                        walletType === t
                          ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-400"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-indigo-400"
                >
                  {SUPPORTED_WALLET_CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {createWallet.isError && (
                <p className="text-xs text-rose-500">
                  {(createWallet.error as any)?.response?.data?.message || "Couldn't create wallet. Try again."}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={createWallet.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-medium text-white disabled:opacity-60 sm:text-sm"
              >
                {createWallet.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {createWallet.isPending ? "Creating..." : "Create Wallet"}
              </button>
              <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 sm:text-xs">
                Up to 5 wallets per account. Looking for Savings, Current, or Fixed Deposit instead?{" "}
                <span className="font-medium text-indigo-500 dark:text-indigo-400">
                  Apply from the account products section below.
                </span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MyAccounts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const showBalances = useUIStore((s) => s.preferences.showBalances);
  const toggleShowBalances = useUIStore((s) => s.toggleShowBalances);
  const [selectedType, setSelectedType] = useState<"all" | ClientWallet["type"]>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const { wallets, isLoading: walletsLoading } = useClientWallets();
  const { summary, isLoading: summaryLoading } = useClientAccountSummary();

  const isLoading = walletsLoading || summaryLoading;

  const filteredWallets = selectedType === "all" ? wallets : wallets.filter((w) => w.type === selectedType);

  const accountTypes: Array<"all" | ClientWallet["type"]> = ["all", "personal", "business"];

  return (
    <PageContainer>
      <NewWalletModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Header */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="My Accounts"
          subtitle={
            user?.firstName
              ? `Welcome back, ${user.firstName}. Manage all your accounts here.`
              : "Manage all your bank accounts in one place"
          }
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "My Accounts" }]}
          actions={
            <div className="flex gap-2 sm:gap-3">
              <ActionButton
                label={showBalances ? "Hide" : "Show"}
                icon={showBalances ? <EyeOff size={16} /> : <Eye size={16} />}
                variant="secondary"
                onClick={() => toggleShowBalances()}
              />
              <ActionButton label="New Wallet" icon={<Plus size={16} />} onClick={() => setModalOpen(true)} />
            </div>
          }
        />
      </motion.div>

      {/* Stats — field names match AccountAnalyticsService.getAccountSummary exactly */}
      {isLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <StatsGrid cols={4}>
          <StatCard
            label={`Total Balance (${summary.primaryCurrency})`}
            value={showBalances ? formatCurrency(summary.totalBalance, summary.primaryCurrency) : "••••••"}
            icon={<Wallet size={20} />}
            iconColor="from-indigo-500 to-purple-500"
            index={0}
          />
          <StatCard
            label="Incoming (30d)"
            value={showBalances ? formatCurrency(summary.incoming, summary.primaryCurrency) : "••••••"}
            icon={<ArrowDownLeft size={20} />}
            iconColor="from-emerald-500 to-teal-500"
            positive
            index={1}
          />
          <StatCard
            label="Outgoing (30d)"
            value={showBalances ? formatCurrency(summary.outgoing, summary.primaryCurrency) : "••••••"}
            icon={<ArrowUpRight size={20} />}
            iconColor="from-rose-500 to-pink-500"
            positive={false}
            index={2}
          />
          <StatCard
            label="Active Wallets"
            value={String(summary.walletsCount || wallets.length || 0)}
            icon={<CreditCard size={20} />}
            iconColor="from-amber-500 to-orange-500"
            index={3}
          />
        </StatsGrid>
      )}

      {/* Filter Tabs */}
      <motion.div
        className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto pb-2 sm:mb-6"
        variants={dashboardItemVariants}
      >
        {accountTypes.map((type) => (
          <FilterPill
            key={type}
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            active={selectedType === type}
            onClick={() => setSelectedType(type)}
          />
        ))}
      </motion.div>

      {/* Wallet Cards */}
      {isLoading ? (
        <AccountListSkeleton count={3} />
      ) : filteredWallets.length === 0 ? (
        <EmptyState
          title="No Wallets Found"
          description={
            selectedType === "all"
              ? "You don't have any wallets yet. Add your first wallet to get started."
              : `No ${selectedType} wallets found.`
          }
          action={{ label: "Add Wallet", onClick: () => setModalOpen(true) }}
        />
      ) : (
        <motion.div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredWallets.map((wallet, index) => (
            <motion.div
              key={wallet.id || index}
              custom={index}
              variants={cardRevealVariants}
              initial="hidden"
              animate="visible"
            >
              <DashCard
                className="cursor-pointer overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
                padding="none"
                hover
              >
                <div className={`h-1.5 bg-gradient-to-r ${walletTypeColors[wallet.type]}`} />
                <div className="p-4 sm:p-5" onClick={() => navigate(`/customer/accounts/${wallet.id}`)}>
                  <div className="mb-3 flex items-center justify-between sm:mb-4">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div
                        className={`rounded-xl bg-gradient-to-br p-2 sm:p-2.5 ${walletTypeColors[wallet.type]} text-white`}
                      >
                        {walletTypeIcons[wallet.type]}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold capitalize text-gray-900 dark:text-white sm:text-base">
                          {wallet.type} Wallet {wallet.isPrimary && <span className="text-indigo-500">· Primary</span>}
                        </h3>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                          •••• {wallet.walletNumber.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={wallet.status} />
                  </div>

                  {/* Balance — wallets can hold more than one currency, so we show each one */}
                  <div className="mb-3 sm:mb-4">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">Available Balance</p>
                    {wallet.balancesByCurrency.length <= 1 ? (
                      <p className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                        {showBalances
                          ? formatCurrency(wallet.primaryCurrencyBalance, wallet.primaryCurrency)
                          : "••••••"}
                      </p>
                    ) : (
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                        {wallet.balancesByCurrency.map((b) => (
                          <span key={b.currency} className="text-sm font-bold text-gray-900 dark:text-white">
                            {showBalances ? formatCurrency(b.amount, b.currency) : "••••••"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-950/80 sm:py-2 sm:text-sm"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/customer/send/domestic");
                      }}
                    >
                      <ArrowUpRight size={14} />
                      Send
                    </motion.button>
                    <motion.button
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-purple-50 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-400 dark:hover:bg-purple-950/80 sm:py-2 sm:text-sm"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customer/accounts/${wallet.id}`);
                      }}
                    >
                      <ChevronRight size={14} />
                      Details
                    </motion.button>
                  </div>
                </div>
              </DashCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Account Products — the new application-based account types (part 2). No wallets
          of these types exist on the backend yet; this section always routes to the
          apply/manage pages. */}
      <motion.div variants={dashboardItemVariants} className="mt-8">
        <DashCard className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-semibold sm:text-lg">Open a new account type</h3>
              <p className="mt-1 text-xs text-indigo-100 sm:text-sm">
                Savings, Current, and Fixed Deposit accounts are opened by application and reviewed by our team.
              </p>
            </div>
            <button
              onClick={() => navigate("/customer/accounts/applications")}
              className="whitespace-nowrap rounded-xl bg-white/15 px-4 py-2 text-xs font-medium backdrop-blur-sm transition-colors hover:bg-white/25 sm:text-sm"
            >
              Track my applications
            </button>
          </div>
        </DashCard>
      </motion.div>

      {/* Quick Links */}
      <QuickLinksGrid>
        <QuickLinkCard
          label="Savings Account"
          icon={<PiggyBank size={20} />}
          route="/customer/accounts/savings"
          iconColor="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
        />
        <QuickLinkCard
          label="Current Account"
          icon={<Building2 size={20} />}
          route="/customer/accounts/current"
          iconColor="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
        />
        <QuickLinkCard
          label="Fixed Deposits"
          icon={<Briefcase size={20} />}
          route="/customer/accounts/fixed-deposits"
          iconColor="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50"
        />
        <QuickLinkCard
          label="Statements"
          icon={<Download size={20} />}
          route="/customer/accounts/statements"
          iconColor="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50"
        />
        <QuickLinkCard
          label="Limits"
          icon={<ShieldCheck size={20} />}
          route="/customer/accounts/limits"
          iconColor="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50"
        />
        <QuickLinkCard
          label="Beneficiaries"
          icon={<Users size={20} />}
          route="/customer/accounts/beneficiaries"
          iconColor="text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50"
        />
      </QuickLinksGrid>
    </PageContainer>
  );
};

export default MyAccounts;

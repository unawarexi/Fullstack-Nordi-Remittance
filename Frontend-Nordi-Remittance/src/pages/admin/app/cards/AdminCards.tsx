// ============================================================================
// ADMIN CARDS — Executive Card Management & Applications Dashboard
// Strictly consumes domain hook without raw APIs or mutations in UI component
// ============================================================================

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Loader2,
  X,
  PlusCircle,
  MinusCircle,
  User,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { StatsGridSkeleton, TableSkeleton } from "@components/skeletons";
import { PageContainer, StatCard, StatsGrid, DashCard, StatusBadge } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useAdminCards } from "../../admin-usecase/useAdminCards";

/* eslint-disable @typescript-eslint/no-explicit-any */

const AdminCards: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    modalOpen,
    modalAction,
    selectedItem,
    amountInput,
    setAmountInput,
    reasonInput,
    setReasonInput,
    cardsList,
    filteredCards,
    applicationsList,
    cardsLoading,
    appsLoading,
    isActionPending,
    totalBalance,
    activeCardsCount,
    pendingAppsCount,
    formatCurrency,
    handleOpenModal,
    handleCloseModal,
    handleModalSubmit,
    handleStatusChange,
  } = useAdminCards();

  return (
    <PageContainer>
      {/* Page Header */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Card Operations & Management"
          subtitle="Oversee user debit/credit cards, fund balances, adjust limits, and process applications."
          breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Cards Management" }]}
        />
      </motion.div>

      {/* Stats Overview */}
      {cardsLoading ? (
        <StatsGridSkeleton count={4} />
      ) : (
        <StatsGrid cols={4}>
          <StatCard
            label="Total Deployed Cards"
            value={cardsList.length}
            icon={<CreditCard size={20} />}
            iconColor="from-indigo-500 to-purple-600"
            index={0}
          />
          <StatCard
            label="Active Cards"
            value={activeCardsCount}
            icon={<CheckCircle size={20} />}
            iconColor="from-emerald-500 to-teal-600"
            index={1}
          />
          <StatCard
            label="Pending Applications"
            value={pendingAppsCount}
            icon={<AlertCircle size={20} />}
            iconColor="from-amber-500 to-orange-600"
            index={2}
          />
          <StatCard
            label="Total Card Balances"
            value={formatCurrency(totalBalance)}
            icon={<DollarSign size={20} />}
            iconColor="from-blue-500 to-indigo-600"
            index={3}
          />
        </StatsGrid>
      )}

      {/* Navigation Tabs */}
      <div className="my-6 flex gap-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("cards")}
          className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
            activeTab === "cards"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <CreditCard size={16} /> All Deployed Cards ({cardsList.length})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
            activeTab === "applications"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
          }`}
        >
          <AlertCircle size={16} /> Card Applications ({applicationsList.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "cards" && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="shadow-xs flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-700/60 dark:bg-gray-800/80 sm:flex-row">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search cardholder, number, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:outline-hidden w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
              />
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Filter size={16} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="focus:outline-hidden rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked / Frozen</option>
                <option value="pending_activation">Pending Activation</option>
                <option value="expired">Expired / Cancelled</option>
              </select>
            </div>
          </div>

          {/* Cards Grid / Table */}
          {cardsLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : filteredCards.length === 0 ? (
            <EmptyState
              title="No cards found"
              description="No user cards match your current search and filter criteria."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card: any) => (
                <DashCard
                  key={card._id || card.id || card.cardId}
                  className="flex flex-col justify-between border border-gray-100 p-5 shadow-md transition-all hover:shadow-lg dark:border-gray-700/60"
                  hover
                >
                  <div>
                    {/* Card Top Row */}
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                          {card.cardType || "DEBIT"} • {card.cardBrand?.toUpperCase() || "VISA"}
                        </span>
                        <h4 className="mt-2 flex items-center gap-1.5 text-base font-bold text-gray-900 dark:text-white">
                          <User size={15} className="text-gray-400" />
                          {card.cardholderName || "CARD HOLDER"}
                        </h4>
                        <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                          {card.cardNumber || "•••• •••• •••• ••••"}
                        </p>
                      </div>
                      <StatusBadge status={card.status || "pending"} />
                    </div>

                    {/* Financial Summary */}
                    <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3 dark:border-gray-700/40 dark:bg-gray-800/50">
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">
                          Balance
                        </span>
                        <p className="text-base font-extrabold text-gray-900 dark:text-white">
                          {formatCurrency(card.balance || 0, card.currency || "USD")}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500">
                          Credit Limit
                        </span>
                        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                          {card.cardType === "credit"
                            ? formatCurrency(card.creditLimit || 5000, card.currency || "USD")
                            : "N/A (Debit)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-700/60">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenModal("fund", card)}
                        className="shadow-2xs flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                      >
                        <PlusCircle size={14} /> Fund Card
                      </button>
                      <button
                        onClick={() => handleOpenModal("withdraw", card)}
                        className="shadow-2xs flex w-full items-center justify-center gap-1 rounded-xl bg-amber-50 px-2.5 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
                      >
                        <MinusCircle size={14} /> Withdraw
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {card.cardType === "credit" && (
                        <button
                          onClick={() => handleOpenModal("upgrade", card)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-50 px-2 py-1.5 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400"
                        >
                          <TrendingUp size={13} /> Upgrade Limit
                        </button>
                      )}
                      {card.status !== "active" ? (
                        <button
                          onClick={() => handleStatusChange(card, "active")}
                          className="shadow-2xs flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 px-2 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700"
                        >
                          <Unlock size={13} /> Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(card, "blocked")}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 px-2 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
                        >
                          <Lock size={13} /> Block
                        </button>
                      )}
                    </div>
                  </div>
                </DashCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications Tab Content */}
      {activeTab === "applications" && (
        <div>
          {appsLoading ? (
            <TableSkeleton rows={4} cols={6} />
          ) : applicationsList.length === 0 ? (
            <EmptyState
              title="No Card Applications"
              description="There are currently no pending or historical card applications awaiting admin review."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md dark:border-gray-700/60 dark:bg-gray-800/90">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="dark:bg-gray-750 border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold uppercase text-gray-400 dark:border-gray-700">
                      <th className="px-5 py-3.5">Applicant</th>
                      <th className="px-4 py-3.5">Card Type</th>
                      <th className="px-4 py-3.5">Requested Limit</th>
                      <th className="px-4 py-3.5">Date</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700 dark:divide-gray-700/60 dark:text-gray-200">
                    {applicationsList.map((app: any) => (
                      <tr key={app._id || app.id} className="dark:hover:bg-gray-750/40 transition hover:bg-gray-50/60">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {app.user?.firstName ? `${app.user.firstName} ${app.user.lastName}` : "User Applicant"}
                          </div>
                          <div className="text-xs text-gray-400">{app.user?.email || String(app.user || "N/A")}</div>
                        </td>
                        <td className="px-4 py-4 font-semibold capitalize">
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                            {app.cardType || "debit"} ({app.isVirtual ? "Virtual" : "Physical"})
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                          {app.cardType === "credit"
                            ? formatCurrency(app.requestedLimit || 5000, app.currency || "USD")
                            : "Standard Debit"}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Recent"}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={app.status || "pending"} />
                        </td>
                        <td className="space-x-2 px-5 py-4 text-right">
                          {app.status === "pending" || app.status === "under_review" || !app.status ? (
                            <>
                              <button
                                onClick={() => handleOpenModal("approve", app)}
                                className="shadow-2xs rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenModal("reject", app)}
                                className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-xs font-medium italic text-gray-400">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Action Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            >
              <button
                onClick={handleCloseModal}
                className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
              <h3 className="mb-1 text-lg font-bold capitalize text-gray-900 dark:text-white">
                {modalAction === "fund" && `Add Funds to Card`}
                {modalAction === "withdraw" && `Remove Funds from Card`}
                {modalAction === "upgrade" && `Upgrade Credit Limit`}
                {modalAction === "approve" && `Approve Card Application`}
                {modalAction === "reject" && `Decline Card Application`}
              </h3>
              <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">
                {selectedItem?.cardholderName
                  ? `Cardholder: ${selectedItem.cardholderName}`
                  : `Target ID: ${selectedItem?._id || selectedItem?.id}`}
              </p>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                {(modalAction === "fund" ||
                  modalAction === "withdraw" ||
                  modalAction === "upgrade" ||
                  modalAction === "approve") && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {modalAction === "fund" || modalAction === "withdraw"
                        ? "Amount ($)"
                        : "Approved Credit Limit ($)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="e.g. 500.00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      required={modalAction !== "approve"}
                      className="focus:outline-hidden w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {modalAction === "reject" ? "Rejection Reason" : "Admin Notes / Reference (Optional)"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      modalAction === "reject"
                        ? "e.g. Failed verification checks"
                        : "e.g. Approved per support ticket #1049"
                    }
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    required={modalAction === "reject"}
                    className="focus:outline-hidden w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionPending}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isActionPending && <Loader2 size={16} className="animate-spin" />}
                    Confirm {modalAction}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default AdminCards;

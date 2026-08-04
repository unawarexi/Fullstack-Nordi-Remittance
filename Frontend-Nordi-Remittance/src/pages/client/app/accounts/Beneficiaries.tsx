// ============================================================================
// BENEFICIARIES — new page
// ============================================================================
// BeneficiaryService (getBeneficiaries / addBeneficiary / removeBeneficiary)
// and its hooks already existed and worked — nothing on the frontend rendered
// them anywhere. This page is the missing piece.
// ============================================================================

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Loader2, Building2, Mail } from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { AccountListSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import {
  useClientBeneficiaries,
  useAddBeneficiary,
  useRemoveBeneficiary,
} from "../../client-usecase/useaccounts-client-usecase";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";
const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const AddBeneficiaryModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [form, setForm] = useState({
    accountNumber: "",
    email: "",
    name: "",
    nickname: "",
    bankName: "",
    bankCode: "",
  });
  const addBeneficiary = useAddBeneficiary();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSubmit = form.accountNumber.trim() !== "" || form.email.trim() !== "";

  const handleSubmit = () => {
    addBeneficiary.mutate(
      {
        accountNumber: form.accountNumber || undefined,
        email: form.email || undefined,
        name: form.name || undefined,
        nickname: form.nickname || undefined,
        bankName: form.bankName || undefined,
        bankCode: form.bankCode || undefined,
        type: form.bankName ? "external" : "internal",
      },
      {
        onSuccess: () => {
          setForm({ accountNumber: "", email: "", name: "", nickname: "", bankName: "", bankCode: "" });
          onClose();
        },
      },
    );
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
              <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">Add Beneficiary</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 sm:text-xs">
                Provide an account number (internal transfer) or an email — at least one is required.
              </p>
              <div>
                <label className={labelCls}>Account Number</label>
                <input
                  className={inputCls}
                  value={form.accountNumber}
                  onChange={set("accountNumber")}
                  placeholder="0123456789"
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} value={form.email} onChange={set("email")} placeholder="name@example.com" />
              </div>
              <div>
                <label className={labelCls}>Full Name</label>
                <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Jane Doe" />
              </div>
              <div>
                <label className={labelCls}>Nickname (optional)</label>
                <input className={inputCls} value={form.nickname} onChange={set("nickname")} placeholder="Landlord" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Bank Name (external)</label>
                  <input className={inputCls} value={form.bankName} onChange={set("bankName")} placeholder="Optional" />
                </div>
                <div>
                  <label className={labelCls}>Bank Code</label>
                  <input className={inputCls} value={form.bankCode} onChange={set("bankCode")} placeholder="Optional" />
                </div>
              </div>

              {addBeneficiary.isError && (
                <p className="text-xs text-rose-500">
                  {(addBeneficiary.error as any)?.response?.data?.message || "Couldn't add beneficiary. Try again."}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || addBeneficiary.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-medium text-white disabled:opacity-50 sm:text-sm"
              >
                {addBeneficiary.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {addBeneficiary.isPending ? "Adding..." : "Add Beneficiary"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Beneficiaries: React.FC = () => {
  const { beneficiaries, isLoading } = useClientBeneficiaries();
  const removeBeneficiary = useRemoveBeneficiary();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const handleRemove = (id: string) => {
    setPendingRemoveId(id);
    removeBeneficiary.mutate(id as UUID, { onSettled: () => setPendingRemoveId(null) });
  };

  return (
    <PageContainer>
      <AddBeneficiaryModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Beneficiaries"
          subtitle="Saved recipients for faster transfers"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Accounts", href: "/customer/accounts" },
            { label: "Beneficiaries" },
          ]}
          actions={
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-medium text-white sm:text-sm"
            >
              <Plus size={16} /> Add Beneficiary
            </button>
          }
        />
      </motion.div>

      {isLoading ? (
        <AccountListSkeleton count={3} />
      ) : beneficiaries.length === 0 ? (
        <EmptyState
          title="No Beneficiaries Yet"
          description="Save people you send money to often so you don't have to re-enter their details every time."
          action={{ label: "Add Beneficiary", onClick: () => setModalOpen(true) }}
        />
      ) : (
        <DashCard padding="none">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {beneficiaries.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    {b.type === "external" ? <Building2 size={18} /> : <Mail size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                      {b.nickname || b.name}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                      {b.accountNumber ? `•••• ${b.accountNumber.slice(-4)}` : b.email}
                      {b.bankName ? ` · ${b.bankName}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(b.id)}
                  disabled={pendingRemoveId === b.id}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50 dark:hover:bg-rose-950/30"
                >
                  {pendingRemoveId === b.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            ))}
          </div>
        </DashCard>
      )}
    </PageContainer>
  );
};

export default Beneficiaries;

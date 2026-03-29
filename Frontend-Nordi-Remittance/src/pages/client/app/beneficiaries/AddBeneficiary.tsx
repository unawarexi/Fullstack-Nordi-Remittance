// ============================================================================
// BENEFICIARY SUB-PAGES — All, Add, Categories, Recent Recipients
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, UserPlus, FolderOpen, Search, Trash2, Star,
  Building2, User, Globe, Phone,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard,
} from "@components/shared/DashboardPrimitives";
import { AccountListSkeleton, FormSkeleton } from "@components/skeletons";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useBeneficiaries, useAddBeneficiary, useRemoveBeneficiary } from "@hooks/queries/useAccounts";
import { useToastStore } from "@store/toast.store";

const safeArray = (d: unknown): any[] => Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];


const AddBeneficiary: React.FC = () => {
  const addMutation = useAddBeneficiary();
  const { showToast } = useToastStore();
  const [form, setForm] = useState({ name: "", accountNumber: "", bankName: "", ifsc: "", type: "individual" });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.accountNumber) {
      showToast("Name and account number are required", "error");
      return;
    }
    try {
      await addMutation.mutateAsync(form);
      showToast("Beneficiary added successfully", "success");
      setForm({ name: "", accountNumber: "", bankName: "", ifsc: "", type: "individual" });
    } catch {
      showToast("Failed to add beneficiary", "error");
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors";
  const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Add Beneficiary"
          subtitle="Add a new beneficiary for quick transfers"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Beneficiaries", href: "/customer/beneficiaries" },
            { label: "Add New" },
          ]}
        />
      </motion.div>

      <div className="max-w-2xl">
        <DashCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>Beneficiary Type</label>
              <div className="flex gap-3">
                {[
                  { v: "individual", icon: User, label: "Individual" },
                  { v: "business", icon: Building2, label: "Business" },
                  { v: "international", icon: Globe, label: "International" },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, type: opt.v }))}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      form.type === opt.v
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <opt.icon size={14} /> {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Full Name</label>
              <input type="text" value={form.name} onChange={set("name")} placeholder="John Doe" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Account Number</label>
              <input type="text" value={form.accountNumber} onChange={set("accountNumber")} placeholder="Enter account number" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Bank Name</label>
                <input type="text" value={form.bankName} onChange={set("bankName")} placeholder="Bank name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>IFSC / SWIFT Code</label>
                <input type="text" value={form.ifsc} onChange={set("ifsc")} placeholder="Code" className={inputCls} />
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium disabled:opacity-50 mt-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {addMutation.isPending ? "Adding…" : <><UserPlus size={16} /> Add Beneficiary</>}
            </motion.button>
          </form>
        </DashCard>
      </div>
    </PageContainer>
  );
};

export default AddBeneficiary;

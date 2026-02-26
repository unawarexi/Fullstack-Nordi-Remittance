// ============================================================================
// PROFILE SUB-PAGES — Language & Region, Document Center
// Dark mode + DashboardPrimitives + grey borders + responsive + real hooks
// ============================================================================

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Globe, FileText, Upload, Eye, AlertCircle, Shield,
  Loader2, FileCheck, Clock, CheckCircle2, Trash2,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useToastStore } from "@store/toast.store";
import { useKycDocuments, useKycStatus, useUploadKycDocument, useDeleteKycDocument } from "@hooks/queries/useKyc";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";

/* ═══════════════════════════════════════════════════════════════════════════
   LANGUAGE & REGION
   ═══════════════════════════════════════════════════════════════════════════ */
export const LanguageRegion: React.FC = () => {
  const { showToast } = useToastStore();
  const [lang, setLang] = useState("en");
  const [region, setRegion] = useState("us");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("UTC");

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "sw", name: "Kiswahili", flag: "🇰🇪" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "fi", name: "Suomi", flag: "🇫🇮" },
    { code: "sv", name: "Svenska", flag: "🇸🇪" },
    { code: "no", name: "Norsk", flag: "🇳🇴" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  ];

  const save = () => showToast("Preferences saved", "success");

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Language & Region"
          subtitle="Set your preferred language, region, and formats"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Profile", href: "/customer/profile" },
            { label: "Language & Region" },
          ]}
        />
      </motion.div>

      <div className="max-w-3xl space-y-4 sm:space-y-6">
        {/* Language */}
        <motion.div variants={dashboardItemVariants}>
          <DashCard>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Globe size={16} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Language</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    lang === l.code
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-lg">{l.flag}</span> {l.name}
                </button>
              ))}
            </div>
          </DashCard>
        </motion.div>

        {/* Regional Settings */}
        <motion.div variants={dashboardItemVariants}>
          <DashCard>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Globe size={16} />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Regional Settings</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Region
                </label>
                <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls}>
                  <option value="us">United States</option>
                  <option value="gb">United Kingdom</option>
                  <option value="eu">European Union</option>
                  <option value="ng">Nigeria</option>
                  <option value="ke">Kenya</option>
                  <option value="za">South Africa</option>
                  <option value="fi">Finland</option>
                  <option value="se">Sweden</option>
                  <option value="no">Norway</option>
                  <option value="in">India</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Timezone
                </label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputCls}>
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="America/New_York">Eastern Time (GMT-5)</option>
                  <option value="America/Chicago">Central Time (GMT-6)</option>
                  <option value="America/Los_Angeles">Pacific Time (GMT-8)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                  <option value="Europe/Helsinki">Helsinki (GMT+2)</option>
                  <option value="Europe/Stockholm">Stockholm (GMT+1)</option>
                  <option value="Europe/Oslo">Oslo (GMT+1)</option>
                  <option value="Africa/Lagos">Lagos (GMT+1)</option>
                  <option value="Africa/Nairobi">Nairobi (GMT+3)</option>
                  <option value="Asia/Kolkata">India (GMT+5:30)</option>
                  <option value="Asia/Shanghai">China (GMT+8)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Date Format
                </label>
                <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className={inputCls}>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Currency Display
                </label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="NGN">NGN (₦)</option>
                  <option value="KES">KES (KSh)</option>
                  <option value="ZAR">ZAR (R)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="SEK">SEK (kr)</option>
                  <option value="NOK">NOK (kr)</option>
                </select>
              </div>
            </div>
          </DashCard>
        </motion.div>

        {/* Save */}
        <motion.div variants={dashboardItemVariants}>
          <motion.button
            onClick={save}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Save Preferences
          </motion.button>
        </motion.div>
      </div>
    </PageContainer>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   DOCUMENT CENTER — Real KYC hooks
   ═══════════════════════════════════════════════════════════════════════════ */
const safeArr = (d: unknown): any[] =>
  Array.isArray(d) ? d : Array.isArray((d as any)?.data) ? (d as any).data : [];

export const DocumentCenter: React.FC = () => {
  const { showToast } = useToastStore();
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Hooks ── */
  const { data: docsData, isLoading: docsLoading } = useKycDocuments();
  const { data: kycData } = useKycStatus();
  const uploadDoc = useUploadKycDocument();
  const deleteDoc = useDeleteKycDocument();

  const documents = safeArr(docsData);
  const kyc = ((kycData ?? {}) as Record<string, any>);

  const [selectedType, setSelectedType] = useState("passport");

  const statusColor = (s: string) => {
    switch (s) {
      case "verified": case "approved": return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300";
      case "pending": case "in_review": return "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300";
      case "rejected": return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadDoc.mutate({
      documentType: selectedType as any,
      frontImage: file,
    });
    e.target.value = "";
  };

  return (
    <PageContainer>
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Document Center"
          subtitle="Upload and manage your verification documents"
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Profile", href: "/customer/profile" },
            { label: "Documents" },
          ]}
        />
      </motion.div>

      <div className="max-w-3xl space-y-4 sm:space-y-6">
        {/* ── KYC Status Banner ── */}
        <motion.div variants={dashboardItemVariants}>
          <DashCard>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Shield size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Verification Status
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Level: <span className="font-medium capitalize">{kyc.level || "None"}</span>
                  {" • "}Status: <span className="font-medium capitalize">{(kyc.status || "pending").replace(/_/g, " ")}</span>
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize ${statusColor(kyc.status || "pending")}`}>
                {(kyc.status || "pending").replace(/_/g, " ")}
              </span>
            </div>
            {/* KYC Steps */}
            {(kyc.completedSteps?.length > 0 || kyc.pendingSteps?.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                {(kyc.completedSteps || []).map((s: string) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={10} /> {s.replace(/_/g, " ")}
                  </span>
                ))}
                {(kyc.pendingSteps || []).map((s: string) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                    <Clock size={10} /> {s.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </DashCard>
        </motion.div>

        {/* ── Upload Section ── */}
        <motion.div variants={dashboardItemVariants}>
          <DashCard>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Upload New Document</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Document Type
                </label>
                <select
                  value={selectedType}
                  onChange={(ev) => setSelectedType(ev.target.value)}
                  className={inputCls}
                >
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver&apos;s License</option>
                  <option value="proof_of_address">Proof of Address</option>
                  <option value="tax_document">Tax Document</option>
                  <option value="selfie">Selfie with ID</option>
                </select>
              </div>
              <div className="flex items-end">
                <motion.button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadDoc.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 w-full justify-center bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {uploadDoc.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Choose File & Upload
                </motion.button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Accepted formats: PDF, JPG, PNG. Maximum file size: 10MB.
            </p>
          </DashCard>
        </motion.div>

        {/* ── Document List ── */}
        <motion.div variants={dashboardItemVariants}>
          <DashCard padding="none">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                  Your Documents
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {documents.length} document{documents.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {docsLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                      <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No Documents"
                  description="Upload your documents to get verified and unlock higher limits."
                />
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id || doc.type}
                    className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        doc.status === "approved" || doc.status === "verified"
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                          : doc.status === "rejected"
                          ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"
                          : "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
                      }`}>
                        {doc.status === "approved" || doc.status === "verified"
                          ? <FileCheck size={16} />
                          : doc.status === "rejected"
                          ? <AlertCircle size={16} />
                          : <FileText size={16} />}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {(doc.type || "Document").replace(/_/g, " ")}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {doc.documentNumber ? `#${doc.documentNumber} • ` : ""}
                          {doc.expiryDate
                            ? `Expires ${new Date(doc.expiryDate).toLocaleDateString()}`
                            : "No expiry set"}
                        </p>
                        {doc.rejectionReason && (
                          <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-1">
                            <AlertCircle size={10} /> {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusColor(doc.status)}`}>
                        {(doc.status || "pending").replace(/_/g, " ")}
                      </span>
                      {doc.frontImageUrl && (
                        <a
                          href={doc.frontImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="View document"
                        >
                          <Eye size={14} />
                        </a>
                      )}
                      {doc.id && doc.status !== "approved" && doc.status !== "verified" && (
                        <button
                          onClick={() => deleteDoc.mutate(doc.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashCard>
        </motion.div>
      </div>
    </PageContainer>
  );
};

// ============================================================================
// PROFILE SUB-PAGES — Language & Region, Document Center
// Dark mode + DashboardPrimitives + grey borders + responsive typography
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, FileText, Upload, Download, CheckCircle2,
  Clock, Trash2, Eye,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { EmptyState } from "@components/shared/EmptyState";
import {
  PageContainer, DashCard,
} from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useToastStore } from "@store/toast.store";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";
const labelCls = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

/* ═══════ LANGUAGE & REGION ═══════ */
export const LanguageRegion: React.FC = () => {
  const { showToast } = useToastStore();
  const [lang, setLang] = useState("en");
  const [region, setRegion] = useState("us");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [currency, setCurrency] = useState("USD");

  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "sw", name: "Kiswahili", flag: "🇰🇪" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
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

      <div className="max-w-2xl">
        <DashCard className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Language</h3>
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

        <DashCard>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Regional Settings</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls}>
                <option value="us">United States</option>
                <option value="gb">United Kingdom</option>
                <option value="eu">European Union</option>
                <option value="ng">Nigeria</option>
                <option value="ke">Kenya</option>
                <option value="za">South Africa</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Date Format</label>
                <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className={inputCls}>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Currency Display</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="NGN">NGN (₦)</option>
                  <option value="KES">KES (KSh)</option>
                </select>
              </div>
            </div>
            <motion.button
              onClick={save}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-medium mt-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Save Preferences
            </motion.button>
          </div>
        </DashCard>
      </div>
    </PageContainer>
  );
};

/* ═══════ DOCUMENT CENTER ═══════ */
export const DocumentCenter: React.FC = () => {
  const { showToast } = useToastStore();

  const documents = [
    { name: "ID Verification", type: "pdf", date: "Mar 10, 2025", status: "verified", size: "1.2 MB" },
    { name: "Proof of Address", type: "pdf", date: "Feb 28, 2025", status: "verified", size: "850 KB" },
    { name: "Tax Return 2024", type: "pdf", date: "Jan 15, 2025", status: "pending", size: "2.1 MB" },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case "verified": return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300";
      case "pending": return "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300";
      case "rejected": return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
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

      <div className="max-w-2xl">
        <DashCard className="mb-6">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
            onClick={() => showToast("Upload feature coming soon", "info")}
          >
            <div className="w-12 h-12 mx-auto bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
              <Upload size={22} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Upload Document</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Drag & drop or click to browse. PDF, JPG, PNG up to 10MB.
            </p>
          </div>
        </DashCard>

        <DashCard padding="none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Your Documents</h3>
          </div>
          {documents.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No Documents" description="Upload your documents to get verified." />
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{doc.name}</h4>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        {doc.date} • {doc.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashCard>
      </div>
    </PageContainer>
  );
};

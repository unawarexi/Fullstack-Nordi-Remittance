// ============================================================================
// PROFILE SUB-PAGES — Language & Region, Document Center
// (Personal & Communication preferences already exist)
// ============================================================================

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, FileText, Upload, Download, CheckCircle2,
  Clock, Eye, Trash2, Languages, MapPin, Calendar,
} from "lucide-react";
import PageHeader from "@components/shared/PageHeader";
import { useToastStore } from "@store/toast.store";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ========================
// LANGUAGE & REGION
// ========================
export const LanguageRegion: React.FC = () => {
  const showToast = useToastStore((s) => s.showToast);
  const [language, setLanguage] = useState("en");
  const [region, setRegion] = useState("us");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [currency, setCurrency] = useState("USD");

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "pt", label: "Português", flag: "🇧🇷" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "no", label: "Norsk", flag: "🇳🇴" },
    { code: "sv", label: "Svenska", flag: "🇸🇪" },
  ];

  const regions = [
    { code: "us", label: "United States" }, { code: "eu", label: "European Union" },
    { code: "uk", label: "United Kingdom" }, { code: "ca", label: "Canada" },
    { code: "au", label: "Australia" }, { code: "no", label: "Norway" },
  ];

  const handleSave = () => showToast("Preferences saved!", "success");

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Language & Region" subtitle="Set your language and regional preferences"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Profile", href: "/customer/profile" }, { label: "Language & Region" }]} />
      </motion.div>

      <div className="max-w-2xl space-y-6">
        <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2"><Languages size={18} /> Language</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {languages.map((lang) => (
              <button key={lang.code} onClick={() => setLanguage(lang.code)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${language === lang.code ? "border-indigo-500 bg-indigo-50" : "border-transparent bg-gray-50 hover:bg-gray-100"}`}>
                <span className="text-2xl block">{lang.flag}</span>
                <span className="text-xs font-medium text-gray-700 mt-1 block">{lang.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div className="bg-white rounded-xl shadow-sm p-6" variants={itemVariants}>
          <h3 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2"><MapPin size={18} /> Region & Formatting</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                {regions.map((r) => <option key={r.code} value={r.code}>{r.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Date Format</label>
                <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Display Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="NOK">NOK (kr)</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.button onClick={handleSave} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} variants={itemVariants}>
          Save Preferences
        </motion.button>
      </div>
    </motion.div>
  );
};

// ========================
// DOCUMENT CENTER
// ========================
export const DocumentCenter: React.FC = () => {
  const documents = [
    { name: "Identity Verification", type: "ID", status: "verified", date: "2024-01-15", expires: "2029-01-15" },
    { name: "Proof of Address", type: "Utility Bill", status: "verified", date: "2024-01-10", expires: "2024-07-10" },
    { name: "Tax Documents (W-9)", type: "Tax", status: "pending", date: "2024-01-28", expires: "—" },
    { name: "Bank Statement", type: "Financial", status: "verified", date: "2024-01-01", expires: "—" },
  ];

  const statusMap: Record<string, { text: string; bg: string; icon: React.ReactNode }> = {
    verified: { text: "text-emerald-700", bg: "bg-emerald-50", icon: <CheckCircle2 size={14} /> },
    pending: { text: "text-amber-700", bg: "bg-amber-50", icon: <Clock size={14} /> },
    rejected: { text: "text-rose-700", bg: "bg-rose-50", icon: <Trash2 size={14} /> },
  };

  return (
    <motion.div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-full" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <PageHeader title="Document Center" subtitle="Manage your uploaded documents"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Profile", href: "/customer/profile" }, { label: "Documents" }]} />
      </motion.div>

      <div className="max-w-3xl">
        <motion.div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-8 text-center mb-6 hover:border-indigo-400 transition-colors cursor-pointer" variants={itemVariants}>
          <Upload size={32} className="mx-auto text-gray-400 mb-3" />
          <h3 className="font-semibold text-gray-900 text-sm">Upload New Document</h3>
          <p className="text-xs text-gray-500 mt-1">Drag & drop or click to browse. PDF, JPG, PNG up to 10MB</p>
        </motion.div>

        <motion.div className="space-y-3" variants={containerVariants}>
          {documents.map((doc, i) => {
            const sM = statusMap[doc.status] || statusMap.pending;
            return (
              <motion.div key={i} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between" variants={itemVariants}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600"><FileText size={20} /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{doc.name}</h3>
                    <p className="text-xs text-gray-500">{doc.type} · Uploaded {new Date(doc.date).toLocaleDateString()}</p>
                    {doc.expires !== "—" && <p className="text-xs text-gray-400">Expires: {new Date(doc.expires).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 ${sM.text} ${sM.bg}`}>{sM.icon} {doc.status}</span>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Eye size={16} /></button>
                  <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Download size={16} /></button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

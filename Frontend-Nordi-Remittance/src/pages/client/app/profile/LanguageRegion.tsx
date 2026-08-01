// ============================================================================
// PROFILE SUB-PAGES — Language & Region, Document Center
// Dark mode + DashboardPrimitives + grey borders + responsive + real hooks
// ============================================================================

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  FileText,
  Eye,
  Shield,
  Clock,
  CheckCircle2,
  Image,
  Camera,
  PenTool,
  ScanFace,
  Download,
  ExternalLink,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useToastStore } from "@store/toast.store";
import { useClientProfile } from "../../client-usecase/useprofile-client-usecase";

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";

/* ═══════════════════════════════════════════════════════════════════════════
   LANGUAGE & REGION
   ═══════════════════════════════════════════════════════════════════════════ */

const LanguageRegion: React.FC = () => {
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
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Globe size={16} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Language</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium transition-all sm:text-sm ${
                    lang === l.code
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Globe size={16} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Regional Settings</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:text-xs">
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
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:text-xs">
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
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:text-xs">
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
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:text-xs">
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
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-medium text-white sm:text-sm"
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
   PROFILE DOCUMENT CARD — Handles both images and documents/PDFs
   ═══════════════════════════════════════════════════════════════════════════ */
const isImageUrl = (url: string): boolean => {
  const lower = url.toLowerCase();
  // Check common image extensions
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|avif)(\?|$)/i.test(lower)) return true;
  // Cloudinary image delivery
  if (lower.includes("/image/upload/")) return true;
  // If raw/upload and no obvious doc extension, try as image
  if (lower.includes("/raw/upload/") && !/\.(pdf|doc|docx|xls|xlsx|csv|txt|zip)(\?|$)/i.test(lower)) return true;
  return false;
};

const isPdfUrl = (url: string): boolean => {
  return /\.pdf(\?|$)/i.test(url.toLowerCase());
};

const ProfileDocCard: React.FC<{
  url: string;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  detail?: string;
  expiry?: string | null;
  fileType: "image" | "auto";
}> = ({ url, label, icon, iconBg, detail, expiry, fileType }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Determine render mode
  const forceImage = fileType === "image";
  const likelyImage = forceImage || isImageUrl(url);
  const likelyPdf = isPdfUrl(url);

  // For Cloudinary raw URLs, try converting to image URL for preview
  const imagePreviewUrl = url.includes("/raw/upload/") ? url.replace("/raw/upload/", "/image/upload/") : url;

  const handleImgLoad = useCallback(() => setImgLoaded(true), []);
  const handleImgError = useCallback(() => setImgFailed(true), []);

  const showImage = likelyImage && !imgFailed;
  const showDocPlaceholder = !showImage;

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-indigo-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-700"
      whileHover={{ y: -2 }}
    >
      {/* ── Preview area ── */}
      <div className="relative h-44 overflow-hidden bg-gray-50 dark:bg-gray-800">
        {/* Try image rendering */}
        {(likelyImage || !likelyPdf) && !imgFailed && (
          <img
            src={imagePreviewUrl}
            alt={label}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={handleImgLoad}
            onError={handleImgError}
            crossOrigin="anonymous"
          />
        )}

        {/* Loading shimmer while image is loading */}
        {likelyImage && !imgFailed && !imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
        )}

        {/* Document / PDF placeholder (when image fails or file is a document) */}
        {(imgFailed || likelyPdf || (!likelyImage && !imgLoaded)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <div className={`rounded-2xl p-4 ${iconBg}`}>{likelyPdf ? <FileText size={32} /> : icon}</div>
            <span className="text-center text-xs font-medium text-gray-600 dark:text-gray-400">
              {likelyPdf ? "PDF Document" : "Document File"}
            </span>
            <span className="max-w-[90%] truncate text-center text-[10px] text-gray-400 dark:text-gray-500">
              {url.split("/").pop()?.split("?")[0] || label}
            </span>
          </div>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-lg transition-colors hover:bg-indigo-50 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-indigo-950/50"
          >
            <Eye size={14} /> View
          </a>
          <a
            href={url}
            download
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-lg transition-colors hover:bg-indigo-700"
          >
            <Download size={14} /> Download
          </a>
        </div>
      </div>

      {/* ── Info footer ── */}
      <div className="border-t border-gray-100 p-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className={`rounded-lg p-1.5 ${iconBg} flex-shrink-0`}>{icon}</div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-xs font-medium text-gray-900 dark:text-white sm:text-sm">{label}</h4>
            {detail && <p className="truncate text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">{detail}</p>}
            {expiry && <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">Expires {expiry}</p>}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 rounded-lg bg-gray-100 p-1.5 text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default LanguageRegion;

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

const isImageUrl = (url: string): boolean => {
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|avif)(\?|$)/i.test(lower)) return true;
  if (lower.includes("/image/upload/")) return true;
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

  const forceImage = fileType === "image";
  const likelyImage = forceImage || isImageUrl(url);
  const likelyPdf = isPdfUrl(url);

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
      <div className="relative h-44 overflow-hidden bg-gray-50 dark:bg-gray-800">
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

        {likelyImage && !imgFailed && !imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
        )}

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

const DocumentCenter: React.FC = () => {
  /* ── Hooks ── */
  const { user: profile, isLoading: profileLoading } = useClientProfile();

  const kycStatus = (profile.kycStatus || "pending") as string;

  const capitalize = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "");

  const fmtDate = (d?: string | null) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  /* ── Build profile documents array from user profile fields ── */
  const profileDocuments = [
    {
      key: "profilePicture",
      label: "Profile Picture",
      url: profile.profilePicture || profile._raw?.avatar,
      icon: <Camera size={18} />,
      iconBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
      fileType: "image" as const,
    },
    {
      key: "governmentId",
      label: "Government ID",
      url: profile._raw?.governmentId,
      icon: <Shield size={18} />,
      iconBg: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
      detail: profile._raw?.idType ? `${capitalize(profile._raw.idType)} • ${profile._raw.idNumber || ""}` : undefined,
      expiry: profile._raw?.idExpiryDate,
      fileType: "auto" as const,
    },
    {
      key: "proofOfAddress",
      label: "Proof of Address",
      url: profile._raw?.proofOfAddress,
      icon: <FileText size={18} />,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
      detail: profile._raw?.addressDocType ? capitalize(profile._raw.addressDocType) : undefined,
      fileType: "auto" as const,
    },
    {
      key: "selfieWithId",
      label: "Selfie with ID",
      url: profile._raw?.selfieWithId,
      icon: <ScanFace size={18} />,
      iconBg: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
      fileType: "image" as const,
    },
    {
      key: "signature",
      label: "Signature",
      url: profile._raw?.signature,
      icon: <PenTool size={18} />,
      iconBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
      fileType: "auto" as const,
    },
  ].filter((d) => !!d.url);

  const statusColor = (s: string) => {
    switch (s) {
      case "verified":
      case "approved":
        return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300";
      case "pending":
      case "in_review":
        return "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
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

      <div className="max-w-3xl space-y-4 sm:space-y-6">
        {/* ── KYC Status Banner ── */}
        <motion.div variants={dashboardItemVariants}>
          <DashCard>
            <div className="flex items-center gap-3">
              <div
                className={`rounded-xl p-2.5 ${
                  kycStatus === "verified" || kycStatus === "approved"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                }`}
              >
                {kycStatus === "verified" || kycStatus === "approved" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Shield size={18} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Verification Status</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Status: <span className="font-medium capitalize">{kycStatus.replace(/_/g, " ")}</span>
                  {" • "}
                  {profileDocuments.length} document{profileDocuments.length !== 1 ? "s" : ""} on file
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusColor(kycStatus)}`}
              >
                {kycStatus.replace(/_/g, " ")}
              </span>
            </div>
          </DashCard>
        </motion.div>

        {/* ── Profile Documents (from user profile) ── */}
        {profileLoading ? (
          <motion.div variants={dashboardItemVariants}>
            <DashCard>
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-52 rounded-xl bg-gray-100 dark:bg-gray-800" />
                  ))}
                </div>
              </div>
            </DashCard>
          </motion.div>
        ) : profileDocuments.length > 0 ? (
          <motion.div variants={dashboardItemVariants}>
            <DashCard>
              <div className="mb-4 flex items-center gap-2">
                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <Image size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                    Your Documents &amp; Files
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                    {profileDocuments.length} file{profileDocuments.length !== 1 ? "s" : ""} uploaded from your profile
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profileDocuments.map((doc) => (
                  <ProfileDocCard
                    key={doc.key}
                    url={doc.url}
                    label={doc.label}
                    icon={doc.icon}
                    iconBg={doc.iconBg}
                    detail={doc.detail}
                    expiry={doc.expiry ? fmtDate(doc.expiry) : undefined}
                    fileType={doc.fileType}
                  />
                ))}
              </div>
            </DashCard>
          </motion.div>
        ) : null}
      </div>
    </PageContainer>
  );
};

export default DocumentCenter;

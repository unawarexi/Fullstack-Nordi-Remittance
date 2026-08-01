// ============================================================================
// PERSONAL INFORMATION — Client profile view page
// Uses useUserProfile, useUserAddress, useUserEmployment
// Dark mode + DashboardPrimitives + grey borders + responsive
// ============================================================================

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit3,
  Briefcase,
  Building2,
  Globe,
  CheckCircle2,
  Clock,
  Landmark,
  BadgeCheck,
  Banknote,
  Star,
  Target,
  CreditCard,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { PageContainer, DashCard, StatsGrid, StatCard } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import { useAuth } from "@store/auth.store";
import {
  useClientProfile,
  useClientAddress,
  useClientEmployment,
  useClientBankAccounts,
} from "../../client-usecase/useprofile-client-usecase";

/* ── Helpers ─────────────────────────────────────────────────────────── */
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

const capitalize = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : null);

/* ── InfoField ───────────────────────────────────────────────────────── */
const InfoField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
  verified?: boolean;
}> = ({ icon, label, value, verified }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 rounded-lg bg-gray-100 p-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:text-xs">
        {label}
      </p>
      <div className="mt-0.5 flex items-center gap-1.5">
        <p className="truncate text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
          {value ?? "Not provided"}
        </p>
        {verified && <CheckCircle2 size={13} className="flex-shrink-0 text-emerald-500" />}
      </div>
    </div>
  </div>
);

/* ── SectionCard ─────────────────────────────────────────────────────── */
const SectionCard: React.FC<{
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({
  icon,
  iconBg = "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
  title,
  action,
  children,
}) => (
  <motion.div variants={dashboardItemVariants}>
    <DashCard>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </DashCard>
  </motion.div>
);

/* ── KYC Badge ───────────────────────────────────────────────────────── */
const KycBadge: React.FC<{ status?: string }> = ({ status }) => {
  const map: Record<string, string> = {
    approved: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    verified: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300",
    pending: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
    in_review: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    rejected: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    none: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  };
  const cls = map[status || "none"] || map.none;
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${cls}`}>
      KYC: {capitalize(status) || "Not Started"}
    </span>
  );
};

/* ── Shimmer ─────────────────────────────────────────────────────────── */
const Shimmer: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className || ""}`} />
);

/* ── Loading Skeleton ────────────────────────────────────────────────── */
const ProfileSkeleton: React.FC = () => (
  <PageContainer>
    <div className="space-y-6">
      <Shimmer className="h-8 w-64" />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <Shimmer className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-5 w-48" />
            <Shimmer className="h-4 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
          >
            <Shimmer className="mb-2 h-4 w-20" />
            <Shimmer className="h-6 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <Shimmer className="mb-4 h-5 w-40" />
            <div className="space-y-3">
              <Shimmer className="h-10 w-full" />
              <Shimmer className="h-10 w-full" />
              <Shimmer className="h-10 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </PageContainer>
);

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
const PersonalInformation: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  /* ── Data Hooks ── */
  const { user: profileData, isLoading: pLoad } = useClientProfile();
  const { address: addressData, isLoading: aLoad } = useClientAddress();
  const { employment: employmentData, isLoading: eLoad } = useClientEmployment();
  const { accounts: banks } = useClientBankAccounts();

  if (pLoad) return <ProfileSkeleton />;

  /* Merge profile + auth fallback */
  const p = { ...(authUser || {}), ...((profileData as any) || {}) } as Record<string, any>;
  const addr = ((addressData as any) || {}) as Record<string, any>;
  const emp = ((employmentData as any) || {}) as Record<string, any>;

  const initials =
    [p.firstName, p.lastName]
      .filter(Boolean)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "?";

  /* Derive KYC level from kycStatus on the User model */
  const kycStatusRaw = (p.kycStatus || "pending") as string;
  const kycLevel =
    kycStatusRaw === "verified" || kycStatusRaw === "approved"
      ? "verified"
      : kycStatusRaw === "in_review"
        ? "in review"
        : kycStatusRaw === "rejected"
          ? "rejected"
          : "pending";
  const kycPercent =
    kycStatusRaw === "verified" || kycStatusRaw === "approved"
      ? 100
      : kycStatusRaw === "in_review"
        ? 60
        : kycStatusRaw === "rejected"
          ? 0
          : 25;

  const avatar = p.profilePicture || p.avatar;

  return (
    <PageContainer>
      {/* ── Header ── */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Personal Information"
          subtitle="View and manage your profile details"
          breadcrumbs={[{ label: "Dashboard", href: "/customer/dashboard" }, { label: "Profile" }]}
          actions={
            <motion.button
              onClick={() => navigate("/customer/profile/edit")}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700 sm:text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit3 size={15} /> Edit Profile
            </motion.button>
          }
        />
      </motion.div>

      {/* ── Profile Summary Card ── */}
      <motion.div variants={dashboardItemVariants} className="mb-4 sm:mb-6">
        <DashCard>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white sm:h-20 sm:w-20 sm:text-2xl">
              {avatar ? <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" /> : initials}
            </div>
            {/* Name & info */}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-gray-900 dark:text-white sm:text-xl">
                {[p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ") || "User"}
              </h2>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{p.email}</p>
              {p.phone && <p className="truncate text-xs text-gray-400 dark:text-gray-500">{p.phone}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <KycBadge status={p.kycStatus} />
                {p.isEmailVerified && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    ✓ Email Verified
                  </span>
                )}
                {p.isPhoneVerified && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    ✓ Phone Verified
                  </span>
                )}
              </div>
            </div>
            {/* Account ID */}
            <div className="hidden text-right sm:block">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">Account ID</p>
              <p className="font-mono text-xs text-gray-700 dark:text-gray-300 sm:text-sm">
                {p.accountNumber || p.id?.slice(0, 12) || "—"}
              </p>
            </div>
          </div>
        </DashCard>
      </motion.div>

      {/* ── Quick Stats ── */}
      <motion.div variants={dashboardItemVariants} className="mb-4 sm:mb-6">
        <StatsGrid cols={4}>
          <StatCard
            label="Account Status"
            value={capitalize(p.accountStatus || p.status) || "Active"}
            icon={<ShieldCheck size={20} />}
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="KYC Level"
            value={capitalize(kycLevel) || "None"}
            icon={<BadgeCheck size={20} />}
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Member Since"
            value={fmtDate(p.createdAt) || "—"}
            icon={<Calendar size={20} />}
            iconColor="text-purple-600 dark:text-purple-400"
          />
          <StatCard
            label="Last Login"
            value={fmtDate(p.lastLogin) || "—"}
            icon={<Clock size={20} />}
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </StatsGrid>
      </motion.div>

      {/* ── Details Grid ── */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-6 sm:gap-6 lg:grid-cols-2">
        {/* Personal Details */}
        <SectionCard
          icon={<User size={16} />}
          iconBg="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
          title="Personal Details"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoField icon={<User size={14} />} label="First Name" value={p.firstName} />
            <InfoField icon={<User size={14} />} label="Last Name" value={p.lastName} />
            <InfoField icon={<User size={14} />} label="Middle Name" value={p.middleName} />
            <InfoField icon={<Calendar size={14} />} label="Date of Birth" value={fmtDate(p.dateOfBirth)} />
            <InfoField icon={<User size={14} />} label="Gender" value={capitalize(p.gender)} />
            <InfoField icon={<Globe size={14} />} label="Nationality" value={p.nationality} />
            <InfoField icon={<Globe size={14} />} label="Country" value={p.countryOfResidence || p.country} />
            <InfoField icon={<Star size={14} />} label="Marital Status" value={capitalize(p.maritalStatus)} />
          </div>
        </SectionCard>

        {/* Contact Information */}
        <SectionCard
          icon={<Mail size={16} />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
          title="Contact Information"
        >
          <div className="space-y-3">
            <InfoField icon={<Mail size={14} />} label="Email Address" value={p.email} verified={p.isEmailVerified} />
            <InfoField icon={<Phone size={14} />} label="Phone Number" value={p.phone} verified={p.isPhoneVerified} />
            <InfoField icon={<Phone size={14} />} label="Alternative Phone" value={p.alternativePhone} />
            <InfoField icon={<CreditCard size={14} />} label="Account Type" value={capitalize(p.accountType)} />
            <InfoField
              icon={<Globe size={14} />}
              label="Preferred Currency"
              value={p.preferredCurrency || p.currency}
            />
          </div>
        </SectionCard>

        {/* Address */}
        <SectionCard
          icon={<MapPin size={16} />}
          iconBg="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
          title="Address"
        >
          {aLoad ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Shimmer key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoField icon={<MapPin size={14} />} label="Street" value={addr.street || p.homeAddress} />
              <InfoField icon={<Building2 size={14} />} label="City" value={addr.city || p.city} />
              <InfoField icon={<MapPin size={14} />} label="State / Province" value={addr.state || p.state} />
              <InfoField icon={<MapPin size={14} />} label="Postal Code" value={addr.postalCode || p.zipCode} />
              <InfoField icon={<Globe size={14} />} label="Country" value={addr.country || p.country} />
            </div>
          )}
        </SectionCard>

        {/* Employment & Financial */}
        <SectionCard
          icon={<Briefcase size={16} />}
          iconBg="bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
          title="Employment & Financial"
        >
          {eLoad ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Shimmer key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoField
                icon={<Briefcase size={14} />}
                label="Employment Status"
                value={capitalize(emp.status || p.employmentStatus)}
              />
              <InfoField icon={<Building2 size={14} />} label="Employer" value={emp.employer || p.employerName} />
              <InfoField icon={<Briefcase size={14} />} label="Job Title" value={emp.jobTitle || p.occupation} />
              <InfoField icon={<Target size={14} />} label="Industry" value={emp.industry} />
              <InfoField
                icon={<Banknote size={14} />}
                label="Annual Income"
                value={
                  emp.annualIncome ? `$${Number(emp.annualIncome).toLocaleString()}` : p.monthlyIncomeRange || null
                }
              />
              <InfoField
                icon={<Banknote size={14} />}
                label="Source of Funds"
                value={capitalize(emp.sourceOfFunds || p.sourceOfIncome)}
              />
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── KYC Verification ── */}
      <motion.div variants={dashboardItemVariants} className="mb-4 sm:mb-6">
        <DashCard>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <ShieldCheck size={16} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">KYC Verification</h3>
            </div>
            <KycBadge status={kycStatusRaw} />
          </div>
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Verification Progress</span>
                <span className="font-semibold">{kycPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${kycPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Document checklist derived from profile fields */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: "Government ID", ok: !!p.governmentId },
                { label: "Proof of Address", ok: !!p.proofOfAddress },
                { label: "Selfie with ID", ok: !!p.selfieWithId },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-xl p-2.5 ${
                    item.ok
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                  }`}
                >
                  {item.ok ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </DashCard>
      </motion.div>

      {/* ── Bank Accounts ── */}
      <motion.div variants={dashboardItemVariants}>
        <DashCard>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
                <Landmark size={16} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">Linked Bank Accounts</h3>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {banks.length} account{banks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {banks.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                <Landmark size={22} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No bank accounts linked yet</p>
              <button
                onClick={() => navigate("/customer/profile/edit")}
                className="mt-2 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Add a bank account →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {banks.map((bank: any, i: number) => (
                <div
                  key={bank.id || i}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-cyan-100 p-2 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400">
                      <Landmark size={14} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                          {bank.bankName || "Bank Account"}
                        </p>
                        {bank.isPrimary && (
                          <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                            PRIMARY
                          </span>
                        )}
                        {bank.isVerified && <CheckCircle2 size={12} className="text-emerald-500" />}
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 sm:text-xs">
                        {bank.accountName ? `${bank.accountName} • ` : ""}
                        ••••{bank.accountNumber?.slice(-4) || "****"} • {bank.currency || "USD"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashCard>
      </motion.div>
    </PageContainer>
  );
};

export default PersonalInformation;

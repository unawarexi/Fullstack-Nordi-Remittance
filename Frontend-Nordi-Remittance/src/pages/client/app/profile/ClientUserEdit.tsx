// ============================================================================
// CLIENT USER EDIT — Self-service profile editing
// Uses useUpdateProfile, useUpdateAddress, useUpdateEmployment mutations
// Dark mode + DashboardPrimitives + grey borders + responsive
// ============================================================================

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User, MapPin, Briefcase, Loader2, Check, Trash2, Edit3,
} from "@constants/icons";
import PageHeader from "@components/shared/PageHeader";
import { PageContainer, DashCard } from "@components/shared/DashboardPrimitives";
import { dashboardItemVariants } from "@core/animation/Animation";
import {
  useClientProfile, useClientAddress, useClientEmployment,
  useUpdateProfile, useUpdateAddress, useUpdateEmployment,
  useUpdateAvatar, useDeleteAvatar,
} from "../../domain/useProfileDomain";

/* ── Helpers ─────────────────────────────────────────────────────────── */
const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";
const labelCls =
  "block text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5";

const tabs = [
  { key: "personal" as const, label: "Personal", icon: <User size={14} /> },
  { key: "address" as const, label: "Address", icon: <MapPin size={14} /> },
  { key: "employment" as const, label: "Employment", icon: <Briefcase size={14} /> },
];
type Tab = "personal" | "address" | "employment";

/* ══════════════════════════════════════════════════════════════════════════ */
const ClientUserEdit: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("personal");

  /* ── Data hooks ── */
  const { user: profileData } = useClientProfile();
  const { address: addressData } = useClientAddress();
  const { employment: employmentData } = useClientEmployment();

  /* ── Mutation hooks ── */
  const updateProfile = useUpdateProfile();
  const updateAddress = useUpdateAddress();
  const updateEmployment = useUpdateEmployment();
  const updateAvatar = useUpdateAvatar();
  const deleteAvatar = useDeleteAvatar();

  const p = ((profileData ?? {}) as Record<string, any>);
  const a = ((addressData ?? {}) as Record<string, any>);
  const e = ((employmentData ?? {}) as Record<string, any>);

  /* ── Form State ── */
  const [personal, setPersonal] = useState({
    firstName: "", lastName: "", middleName: "", phone: "",
    dateOfBirth: "", gender: "" as string,
  });
  const [address, setAddress] = useState({
    street: "", city: "", state: "", country: "", postalCode: "",
  });
  const [employment, setEmployment] = useState({
    status: "" as string, employer: "", jobTitle: "",
    industry: "", annualIncome: "", sourceOfFunds: "",
  });

  /* Seed form from API data */
  useEffect(() => {
    if (p.firstName) setPersonal({
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      middleName: p.middleName || "",
      phone: p.phone || "",
      dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split("T")[0] : "",
      gender: p.gender || "",
    });
  }, [profileData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (a.street || a.city) setAddress({
      street: a.street || "",
      city: a.city || "",
      state: a.state || "",
      country: a.country || "",
      postalCode: a.postalCode || "",
    });
  }, [addressData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (e.status || e.employer) setEmployment({
      status: e.status || "",
      employer: e.employer || "",
      jobTitle: e.jobTitle || "",
      industry: e.industry || "",
      annualIncome: e.annualIncome ? String(e.annualIncome) : "",
      sourceOfFunds: e.sourceOfFunds || "",
    });
  }, [employmentData]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Handlers ── */
  const savePersonal = () => {
    updateProfile.mutate({
      firstName: personal.firstName || undefined,
      lastName: personal.lastName || undefined,
      middleName: personal.middleName || undefined,
      phone: personal.phone || undefined,
      dateOfBirth: personal.dateOfBirth || undefined,
      gender: (personal.gender as any) || undefined,
    });
  };

  const saveAddress = () => {
    updateAddress.mutate({
      street: address.street || undefined,
      city: address.city || undefined,
      state: address.state || undefined,
      country: address.country || undefined,
      postalCode: address.postalCode || undefined,
    });
  };

  const saveEmployment = () => {
    updateEmployment.mutate({
      status: (employment.status as any) || undefined,
      employer: employment.employer || undefined,
      jobTitle: employment.jobTitle || undefined,
      industry: employment.industry || undefined,
      annualIncome: employment.annualIncome ? Number(employment.annualIncome) : undefined,
      sourceOfFunds: employment.sourceOfFunds || undefined,
    });
  };

  const handleAvatarUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (file) updateAvatar.mutate(file);
  };

  const avatarSrc = p.profilePicture || p.avatar;
  const initials = [p.firstName, p.lastName]
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <PageContainer>
      {/* ── Header ── */}
      <motion.div variants={dashboardItemVariants}>
        <PageHeader
          title="Edit Profile"
          subtitle="Update your personal information"
          showBackButton
          onBack={() => navigate("/customer/profile")}
          breadcrumbs={[
            { label: "Dashboard", href: "/customer/dashboard" },
            { label: "Profile", href: "/customer/profile" },
            { label: "Edit" },
          ]}
        />
      </motion.div>

      {/* ── Avatar Section ── */}
      <motion.div variants={dashboardItemVariants} className="mb-4 sm:mb-6">
        <DashCard>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold overflow-hidden">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                ) : initials}
              </div>
              <label className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700 transition-colors">
                <Edit3 size={11} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Profile Photo</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">JPG, PNG or GIF, max 5MB</p>
              {avatarSrc && (
                <button
                  onClick={() => deleteAvatar.mutate()}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  <Trash2 size={12} /> Remove photo
                </button>
              )}
            </div>
          </div>
        </DashCard>
      </motion.div>

      {/* ── Tab Navigation ── */}
      <motion.div variants={dashboardItemVariants} className="mb-4 sm:mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 flex-1 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === t.key
                  ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Tab Content ── */}
      <motion.div variants={dashboardItemVariants}>
        {/* PERSONAL TAB */}
        {activeTab === "personal" && (
          <DashCard>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-4">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>First Name</label>
                <input
                  className={inputCls}
                  value={personal.firstName}
                  onChange={(ev) => setPersonal({ ...personal, firstName: ev.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className={labelCls}>Last Name</label>
                <input
                  className={inputCls}
                  value={personal.lastName}
                  onChange={(ev) => setPersonal({ ...personal, lastName: ev.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className={labelCls}>Middle Name</label>
                <input
                  className={inputCls}
                  value={personal.middleName}
                  onChange={(ev) => setPersonal({ ...personal, middleName: ev.target.value })}
                  placeholder="Enter middle name"
                />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  className={inputCls}
                  value={personal.phone}
                  onChange={(ev) => setPersonal({ ...personal, phone: ev.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className={labelCls}>Date of Birth</label>
                <input
                  type="date"
                  className={inputCls}
                  value={personal.dateOfBirth}
                  onChange={(ev) => setPersonal({ ...personal, dateOfBirth: ev.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select
                  className={inputCls}
                  value={personal.gender}
                  onChange={(ev) => setPersonal({ ...personal, gender: ev.target.value })}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <motion.button
                onClick={savePersonal}
                disabled={updateProfile.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {updateProfile.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save Personal Info
              </motion.button>
            </div>
          </DashCard>
        )}

        {/* ADDRESS TAB */}
        {activeTab === "address" && (
          <DashCard>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-4">
              Address Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Street Address</label>
                <input
                  className={inputCls}
                  value={address.street}
                  onChange={(ev) => setAddress({ ...address, street: ev.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input
                  className={inputCls}
                  value={address.city}
                  onChange={(ev) => setAddress({ ...address, city: ev.target.value })}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className={labelCls}>State / Province</label>
                <input
                  className={inputCls}
                  value={address.state}
                  onChange={(ev) => setAddress({ ...address, state: ev.target.value })}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className={labelCls}>Postal Code</label>
                <input
                  className={inputCls}
                  value={address.postalCode}
                  onChange={(ev) => setAddress({ ...address, postalCode: ev.target.value })}
                  placeholder="10001"
                />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input
                  className={inputCls}
                  value={address.country}
                  onChange={(ev) => setAddress({ ...address, country: ev.target.value })}
                  placeholder="Enter country"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <motion.button
                onClick={saveAddress}
                disabled={updateAddress.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {updateAddress.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save Address
              </motion.button>
            </div>
          </DashCard>
        )}

        {/* EMPLOYMENT TAB */}
        {activeTab === "employment" && (
          <DashCard>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-4">
              Employment & Financial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Employment Status</label>
                <select
                  className={inputCls}
                  value={employment.status}
                  onChange={(ev) => setEmployment({ ...employment, status: ev.target.value })}
                >
                  <option value="">Select status</option>
                  <option value="employed">Employed</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Employer Name</label>
                <input
                  className={inputCls}
                  value={employment.employer}
                  onChange={(ev) => setEmployment({ ...employment, employer: ev.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className={labelCls}>Job Title</label>
                <input
                  className={inputCls}
                  value={employment.jobTitle}
                  onChange={(ev) => setEmployment({ ...employment, jobTitle: ev.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div>
                <label className={labelCls}>Industry</label>
                <input
                  className={inputCls}
                  value={employment.industry}
                  onChange={(ev) => setEmployment({ ...employment, industry: ev.target.value })}
                  placeholder="Technology"
                />
              </div>
              <div>
                <label className={labelCls}>Annual Income ($)</label>
                <input
                  type="number"
                  className={inputCls}
                  value={employment.annualIncome}
                  onChange={(ev) => setEmployment({ ...employment, annualIncome: ev.target.value })}
                  placeholder="50000"
                />
              </div>
              <div>
                <label className={labelCls}>Source of Funds</label>
                <input
                  className={inputCls}
                  value={employment.sourceOfFunds}
                  onChange={(ev) => setEmployment({ ...employment, sourceOfFunds: ev.target.value })}
                  placeholder="Employment income"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <motion.button
                onClick={saveEmployment}
                disabled={updateEmployment.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-medium rounded-xl transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {updateEmployment.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save Employment Info
              </motion.button>
            </div>
          </DashCard>
        )}
      </motion.div>
    </PageContainer>
  );
};

export default ClientUserEdit;

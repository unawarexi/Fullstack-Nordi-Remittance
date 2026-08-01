/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, ShieldCheck, Edit, Lock, Unlock, FileCheck, FileBadge } from "lucide-react";
import { useUserDetail } from "../../admin-usecase/useUserDetail";
import UserTransfer from "./UserTransfer";
import useThemeStore from "@store/theme.store";

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const {
    user,
    isLoading: loading,
    confirmAction,
    setConfirmAction,
    activateDeactivate,
    lockUnlock,
    changeKycStatus,
  } = useUserDetail(id || "");
  const [activeTab, setActiveTab] = useState("personal");

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    if (!status) return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200";
    switch (status.toLowerCase()) {
      case "verified":
      case "approved":
        return "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400";
      case "pending":
        return "bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400";
      case "rejected":
        return "bg-error-50 text-error-700 dark:bg-error-900/30 dark:text-error-400";
      default:
        return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-md dark:bg-neutral-900">
          <div className="mb-4 text-5xl text-error-500">!</div>
          <h2 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">User Not Found</h2>
          <p className="mb-4 text-neutral-600 dark:text-neutral-400">The requested user could not be found.</p>
          <button
            className="rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
            onClick={() => navigate("/admin/users/all")}
          >
            Back to User List
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto max-w-6xl px-4 py-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-6 flex items-center justify-between" variants={itemVariants}>
        <div className="flex items-center">
          <button
            className="mr-4 rounded-full p-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            onClick={() => navigate("/admin/users")}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">User Details</h1>
            <p className="text-neutral-500 dark:text-neutral-400">Manage and view user information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <motion.button
            className="flex items-center rounded-lg bg-secondary-500 px-4 py-2 text-white hover:bg-secondary-600"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/admin/users/${id}/edit`)}
          >
            <Edit size={16} className="mr-2" />
            Edit User
          </motion.button>
          <motion.button
            className={`px-4 py-2 ${user.isActive ? "bg-error-500 hover:bg-error-600" : "bg-success-500 hover:bg-success-600"} flex items-center rounded-lg text-white`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfirmAction({ type: "activate", visible: true })}
          >
            {user.isActive ? (
              <>
                <Lock size={16} className="mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Unlock size={16} className="mr-2" />
                Activate
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* User Summary Card */}
      <motion.div
        className="mb-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
        variants={itemVariants}
      >
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <div className="mb-4 h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-neutral-200 dark:border-neutral-700 md:mb-0 md:mr-6">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-200 dark:bg-neutral-700">
                <User size={40} className="text-neutral-400 dark:text-neutral-500" />
              </div>
            )}
          </div>

          <div className="flex-grow text-center md:text-left">
            <h2 className="mb-1 text-xl font-bold text-neutral-900 dark:text-white">
              {[user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") || "N/A"}
            </h2>
            <p className="mb-3 text-neutral-500 dark:text-neutral-400">{user.email || "N/A"}</p>

            <div className="mb-4 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className={`rounded-full px-3 py-1 text-xs ${getStatusColor(user.kycStatus)}`}>
                KYC: {user.kycStatus ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1) : "N/A"}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs ${user.isActive ? "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"}`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs ${user.isLocked ? "bg-error-50 text-error-700 dark:bg-error-900/30 dark:text-error-400" : "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400"}`}
              >
                {user.isLocked ? "Locked" : "Unlocked"}
              </span>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                {user.accountType ? user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1) : "N/A"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">Account Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.accountNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">Last Login</p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">Currency</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.currency || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col space-y-2 md:ml-6 md:mt-0">
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">ID Number</span>
              <span className="font-medium text-neutral-900 dark:text-white">{user.idNumber || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">ID Type</span>
              <span className="font-medium capitalize text-neutral-900 dark:text-white">
                {user.idType ? user.idType.replace("_", " ") : "N/A"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">ID Expiry</span>
              <span className="font-medium text-neutral-900 dark:text-white">
                {user.idExpiryDate ? formatDate(user.idExpiryDate) : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div
        className="mb-6 flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-700"
        variants={itemVariants}
      >
        <button
          className={`border-b-2 px-6 py-3 text-sm font-medium ${activeTab === "personal" ? "border-primary-500 text-primary-500" : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"}`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Details
        </button>
        <button
          className={`border-b-2 px-6 py-3 text-sm font-medium ${activeTab === "account" ? "border-primary-500 text-primary-500" : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"}`}
          onClick={() => setActiveTab("account")}
        >
          Account Details
        </button>
        <button
          className={`border-b-2 px-6 py-3 text-sm font-medium ${activeTab === "financial" ? "border-primary-500 text-primary-500" : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"}`}
          onClick={() => setActiveTab("financial")}
        >
          Financial Info
        </button>
        <button
          className={`border-b-2 px-6 py-3 text-sm font-medium ${activeTab === "security" ? "border-primary-500 text-primary-500" : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"}`}
          onClick={() => setActiveTab("security")}
        >
          Security Settings
        </button>
        <button
          className={`border-b-2 px-6 py-3 text-sm font-medium ${activeTab === "documents" ? "border-primary-500 text-primary-500" : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"}`}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </button>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        className="mb-6 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
        variants={itemVariants}
      >
        {/* Personal Details Tab */}
        {activeTab === "personal" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Personal Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Full Name</p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {[user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") || "N/A"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Date of Birth</p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {user.dateOfBirth ? formatDate(user.dateOfBirth) : "N/A"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Gender</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.gender || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Nationality</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.nationality || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Country of Residence</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.countryOfResidence || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Marital Status</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.maritalStatus || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Email</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.email || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Mobile Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.mobileNumber || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Alternative Phone</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.alternativePhone || "N/A"}</p>
              </div>
            </div>

            <h3 className="mb-4 mt-8 text-lg font-bold text-neutral-900 dark:text-white">Address Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Home Address</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.homeAddress || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">City</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.city || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">State/Province</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.stateProvince || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Zip/Postal Code</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.zipCode || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Country</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.country || "N/A"}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Account Details Tab */}
        {activeTab === "account" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Account Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Account Type</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.accountType || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Account Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.accountNumber || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Account Name</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.accountName || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Currency</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.currency || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Initial Deposit</p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {user.currency}{" "}
                  {typeof user.initialDeposit === "number" ? user.initialDeposit.toLocaleString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Referral Code</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.referralCode || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Invite Code</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.inviteCode || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Status</p>
                <p className={`font-medium ${user.isActive ? "text-success-500" : "text-error-500"}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Last Login</p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Financial Info Tab */}
        {activeTab === "financial" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Financial Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Source of Income</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">
                  {user.sourceOfIncome ? user.sourceOfIncome.replace("_", " ") : "N/A"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Monthly Income Range</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.monthlyIncomeRange || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Employment Status</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">
                  {user.employmentStatus || "N/A"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Employer Name</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.employerName || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Occupation</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">{user.occupation || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Tax Identification Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.taxIdentificationNumber || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Social Security Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.socialSecurityNumber || "N/A"}</p>
              </div>
            </div>

            <h3 className="mb-4 mt-8 text-lg font-bold text-neutral-900 dark:text-white">Bank Account Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Bank Name</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.bankName || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Bank Address</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.bankAddress || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">IBAN Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.ibanNumber || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Routing Number</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.routingNumber || "N/A"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">SWIFT/BIC</p>
                <p className="font-medium text-neutral-900 dark:text-white">{user.swiftBic || "N/A"}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Settings Tab */}
        {activeTab === "security" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Security Settings</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Two-Factor Authentication</p>
                <p className={`font-medium ${user.enableTwoFactor ? "text-success-500" : "text-error-500"}`}>
                  {user.enableTwoFactor ? "Enabled" : "Disabled"}
                </p>
              </div>
              {user.enableTwoFactor && (
                <div>
                  <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Two-Factor Method</p>
                  <p className="font-medium capitalize text-neutral-900 dark:text-white">
                    {user.twoFactorMethod || "N/A"}
                  </p>
                </div>
              )}
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Account Lock Status</p>
                <p className={`font-medium ${user.isLocked ? "text-error-500" : "text-success-500"}`}>
                  {user.isLocked ? "Locked" : "Unlocked"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Login Attempts</p>
                <p className="font-medium text-neutral-900 dark:text-white">
                  {user.loginAttempts ? user.loginAttempts.length : "0"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">Security Question</p>
                <p className="font-medium capitalize text-neutral-900 dark:text-white">
                  {user.securityQuestion ? user.securityQuestion.replace("_", " ") : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">Account Actions</h3>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  className={`px-4 py-2 ${user.isActive ? "bg-error-500 hover:bg-error-600" : "bg-success-500 hover:bg-success-600"} flex items-center rounded-lg text-white`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirmAction({ type: "activate", visible: true })}
                >
                  {user.isActive ? (
                    <>
                      <Lock size={16} className="mr-2" />
                      Deactivate Account
                    </>
                  ) : (
                    <>
                      <Unlock size={16} className="mr-2" />
                      Activate Account
                    </>
                  )}
                </motion.button>

                <motion.button
                  className={`px-4 py-2 ${user.isLocked ? "bg-success-500 hover:bg-success-600" : "bg-error-500 hover:bg-error-600"} flex items-center rounded-lg text-white`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirmAction({ type: "lock", visible: true })}
                >
                  {user.isLocked ? (
                    <>
                      <Unlock size={16} className="mr-2" />
                      Unlock Account
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="mr-2" />
                      Lock Account
                    </>
                  )}
                </motion.button>

                <motion.button
                  className="flex items-center rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/admin/users/${id}/reset-password`)}
                >
                  <Lock size={16} className="mr-2" />
                  Reset Password
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">User Documents</h3>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                <h4 className="mb-3 font-medium text-neutral-900 dark:text-white">Government ID</h4>
                <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-700">
                  {user.governmentId ? (
                    <img src={user.governmentId} alt="Government ID" className="h-full w-full object-contain" />
                  ) : (
                    <FileBadge size={48} className="text-neutral-400 dark:text-neutral-500" />
                  )}
                </div>
                <div className="space-y-2 text-sm text-neutral-900 dark:text-white">
                  <p>
                    <span className="text-neutral-500 dark:text-neutral-400">ID Type:</span> {user.idType || "N/A"}
                  </p>
                  <p>
                    <span className="text-neutral-500 dark:text-neutral-400">ID Number:</span> {user.idNumber || "N/A"}
                  </p>
                  <p>
                    <span className="text-neutral-500 dark:text-neutral-400">ID Expiry:</span>{" "}
                    {user.idExpiryDate ? formatDate(user.idExpiryDate) : "N/A"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                <h4 className="mb-3 font-medium text-neutral-900 dark:text-white">Proof of Address</h4>
                <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-700">
                  {user.proofOfAddress ? (
                    <img src={user.proofOfAddress} alt="Proof of Address" className="h-full w-full object-contain" />
                  ) : (
                    <FileBadge size={48} className="text-neutral-400 dark:text-neutral-500" />
                  )}
                </div>
                <div className="space-y-2 text-sm text-neutral-900 dark:text-white">
                  <p>
                    <span className="text-neutral-500 dark:text-neutral-400">Document Type:</span>{" "}
                    {user.addressDocType || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                <h4 className="mb-3 font-medium text-neutral-900 dark:text-white">Selfie with ID</h4>
                <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-700">
                  {user.selfieWithId ? (
                    <img src={user.selfieWithId} alt="Selfie with ID" className="h-full w-full object-contain" />
                  ) : (
                    <User size={48} className="text-neutral-400 dark:text-neutral-500" />
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                <h4 className="mb-3 font-medium text-neutral-900 dark:text-white">Signature</h4>
                <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-700">
                  {user.signature ? (
                    <img src={user.signature} alt="Signature" className="h-full w-full object-contain" />
                  ) : (
                    <FileCheck size={48} className="text-neutral-400 dark:text-neutral-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">KYC Status Management</h3>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  className={`px-4 py-2 ${user.kycStatus === "verified" ? "bg-neutral-400 dark:bg-neutral-600" : "bg-success-500 hover:bg-success-600"} flex items-center rounded-lg text-white`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={user.kycStatus === "verified"}
                  onClick={() => setConfirmAction({ type: "kyc-verify", visible: true })}
                >
                  <ShieldCheck size={16} className="mr-2" />
                  Verify KYC
                </motion.button>

                <motion.button
                  className={`px-4 py-2 ${user.kycStatus === "pending" ? "bg-neutral-400 dark:bg-neutral-600" : "bg-secondary-600 hover:bg-secondary-700"} flex items-center rounded-lg text-white`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={user.kycStatus === "pending"}
                  onClick={() => setConfirmAction({ type: "kyc-pending", visible: true })}
                >
                  <Calendar size={16} className="mr-2" />
                  Mark as Pending
                </motion.button>

                <motion.button
                  className={`px-4 py-2 ${user.kycStatus === "rejected" ? "bg-neutral-400 dark:bg-neutral-600" : "bg-error-500 hover:bg-error-600"} flex items-center rounded-lg text-white`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={user.kycStatus === "rejected"}
                  onClick={() => setConfirmAction({ type: "kyc-reject", visible: true })}
                >
                  <Lock size={16} className="mr-2" />
                  Reject KYC
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Confirmation Dialog */}
      {confirmAction && confirmAction.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60">
          <motion.div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-800"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="mb-4 text-xl font-bold text-neutral-900 dark:text-white">Confirm Action</h3>
            {confirmAction.type === "activate" && (
              <p className="mb-6 text-neutral-700 dark:text-neutral-300">
                Are you sure you want to {user.isActive ? "deactivate" : "activate"} this user account?
                {user.isActive
                  ? " The user will no longer be able to access their account."
                  : " The user will regain access to their account."}
              </p>
            )}
            {confirmAction.type === "lock" && (
              <p className="mb-6 text-neutral-700 dark:text-neutral-300">
                Are you sure you want to {user.isLocked ? "unlock" : "lock"} this user account?
                {user.isLocked
                  ? " The user will be able to log in again."
                  : " The user will be prevented from logging in."}
              </p>
            )}
            {confirmAction.type === "kyc-verify" && (
              <p className="mb-6 text-neutral-700 dark:text-neutral-300">
                Are you sure you want to verify this user's KYC? This will grant them full access to all platform
                features.
              </p>
            )}
            {confirmAction.type === "kyc-pending" && (
              <p className="mb-6 text-neutral-700 dark:text-neutral-300">
                Are you sure you want to mark this user's KYC as pending? This will limit their access to some platform
                features.
              </p>
            )}
            {confirmAction.type === "kyc-reject" && (
              <p className="mb-6 text-neutral-700 dark:text-neutral-300">
                Are you sure you want to reject this user's KYC? This will significantly restrict their account
                functionality.
              </p>
            )}

            <div className="flex justify-end space-x-3">
              <button
                className="rounded bg-neutral-200 px-4 py-2 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-primary-500 px-4 py-2 text-white hover:bg-primary-600"
                onClick={() => {
                  if (confirmAction.type === "activate") {
                    activateDeactivate();
                  } else if (confirmAction.type === "lock") {
                    lockUnlock();
                  } else if (confirmAction.type === "kyc-verify") {
                    changeKycStatus("verified");
                  } else if (confirmAction.type === "kyc-pending") {
                    changeKycStatus("pending");
                  } else if (confirmAction.type === "kyc-reject") {
                    changeKycStatus("rejected");
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Render UserTransfer below the details section */}
      <div className="mt-8">
        <UserTransfer />
      </div>
    </motion.div>
  );
};

export default UserDetail;

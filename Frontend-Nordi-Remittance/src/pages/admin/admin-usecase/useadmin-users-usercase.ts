import { useState, useEffect, useCallback, useMemo } from "react";
import Banks from "@core/data/Banks";
import {
  useSearchUsers,
  useUpdateUserStatus,
  useAdminDashboardStats,
  useDeleteUser,
  useAdminUpdateUser,
  useAdminResetUserPassword,
  useAdminReviewKyc,
  useAdminUserDetails,
} from "@hooks/api-queries";
import { useAdminUsersStore } from "@store/users.store";
import { applyFilterPipeline, textSearchFilter, enumFilter } from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// CONSTANTS
// ============================================================================

const PAGE_SIZE = 20;
const TOTAL_STEPS = 7;

const STEP_FIELDS: Record<number, string[]> = {
  1: [
    "firstName",
    "middleName",
    "lastName",
    "dateOfBirth",
    "gender",
    "nationality",
    "countryOfResidence",
    "maritalStatus",
  ],
  2: [
    "profilePicture",
    "governmentId",
    "idType",
    "idNumber",
    "idExpiryDate",
    "proofOfAddress",
    "addressDocType",
    "socialSecurityNumber",
    "taxIdentificationNumber",
  ],
  3: ["email", "mobileNumber", "alternativePhone", "homeAddress", "city", "stateProvince", "zipCode", "country"],
  4: [
    "accountType",
    "currency",
    "sourceOfIncome",
    "monthlyIncomeRange",
    "initialDeposit",
    "employmentStatus",
    "employerName",
    "occupation",
  ],
  5: ["accountName", "accountNumber", "bankName", "bankAddress", "ibanNumber", "routingNumber", "swiftBic"],
  6: ["password", "confirmPassword", "securityQuestion", "securityAnswer", "enableTwoFactor", "twoFactorMethod"],
  7: [
    "agreeToTerms",
    "agreeToPrivacy",
    "agreeToDataSharing",
    "referralCode",
    "selfieWithId",
    "signature",
    "inviteCode",
  ],
};

const STEP_TITLES = [
  "Personal Details",
  "Identity Verification",
  "Contact Information",
  "Banking Preferences",
  "Bank Account Details",
  "Security Setup",
  "Terms & Verification",
];

// ============================================================================
// NORMALIZERS — raw API response → typed domain objects
// ============================================================================

function normalizeUserRow(u: any): AdminUserRow {
  return {
    id: u._id || u.id,
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    email: u.email || "",
    phone: u.phone || u.mobileNumber || "",
    avatar: u.avatar || u.profilePicture || "",
    accountNumber: u.accountNumber || "",
    accountType: u.accountType || "personal",
    status: u.accountStatus || u.status || (u.isActive ? "active" : "inactive"),
    kycStatus: u.kycStatus || "pending",
    kycLevel: u.kycLevel || "none",
    lastLogin: u.lastLogin || u.lastLoginAt || null,
    currency: u.currency || "EUR",
    isActive: !!u.isActive,
    isLocked: !!u.isLocked,
    emailVerified: !!u.emailVerified,
    phoneVerified: !!u.phoneVerified,
    role: u.role || "user",
    authProvider: u.authProvider || "local",
    createdAt: u.createdAt || "",
  };
}

function normalizeUserDetail(u: any): AdminUserDetail {
  return {
    _id: u._id || u.id || "",
    firstName: u.firstName || "",
    middleName: u.middleName || "",
    lastName: u.lastName || "",
    dateOfBirth: u.dateOfBirth || "",
    gender: u.gender || "",
    nationality: u.nationality || "",
    countryOfResidence: u.countryOfResidence || "",
    maritalStatus: u.maritalStatus || "",
    profilePicture: u.profilePicture || "",
    governmentId: u.governmentId || "",
    idType: u.idType || "",
    idNumber: u.idNumber || "",
    idExpiryDate: u.idExpiryDate || "",
    proofOfAddress: u.proofOfAddress || "",
    addressDocType: u.addressDocType || "",
    socialSecurityNumber: u.socialSecurityNumber || "",
    taxIdentificationNumber: u.taxIdentificationNumber || "",
    email: u.email || "",
    mobileNumber: u.mobileNumber || u.phone || "",
    alternativePhone: u.alternativePhone || "",
    homeAddress: u.homeAddress || "",
    city: u.city || "",
    stateProvince: u.stateProvince || "",
    zipCode: u.zipCode || "",
    country: u.country || u.countryOfResidence || "",
    accountType: u.accountType || "",
    currency: u.currency || "",
    sourceOfIncome: u.sourceOfIncome || "",
    monthlyIncomeRange: u.monthlyIncomeRange || "",
    initialDeposit: u.initialDeposit ?? 0,
    employmentStatus: u.employmentStatus || "",
    employerName: u.employerName || "",
    occupation: u.occupation || "",
    accountName: u.accountName || "",
    accountNumber: u.accountNumber || "",
    bankName: u.bankName || "",
    bankAddress: u.bankAddress || "",
    ibanNumber: u.ibanNumber || "",
    routingNumber: u.routingNumber || "",
    swiftBic: u.swiftBic || "",
    securityQuestion: u.securityQuestion || "",
    enableTwoFactor: !!u.enableTwoFactor || !!u.twoFactorEnabled,
    twoFactorMethod: u.twoFactorMethod || "",
    referralCode: u.referralCode || "",
    selfieWithId: u.selfieWithId || "",
    signature: u.signature || "",
    inviteCode: u.inviteCode || "",
    isActive: !!u.isActive,
    status: u.accountStatus || u.status || (u.isActive ? "active" : "inactive"),
    kycStatus: u.kycStatus || "pending",
    kycLevel: u.kycLevel || "none",
    lastLogin: u.lastLogin || u.lastLoginAt || null,
    lastLoginIp: u.lastLoginIp || null,
    isLocked: !!u.isLocked,
    lockReason: u.lockReason || "",
    loginAttempts: u.loginAttempts || [],
    mustChangePassword: !!u.mustChangePassword,
    emailVerified: !!u.emailVerified,
    phoneVerified: !!u.phoneVerified,
    clerkUserId: u.clerkUserId || "",
    authProvider: u.authProvider || "local",
    role: u.role || "user",
    createdAt: u.createdAt || "",
    updatedAt: u.updatedAt || "",
  };
}

function unwrapArray(outer: any): any[] {
  if (Array.isArray(outer)) return outer;
  if (Array.isArray(outer?.data?.data)) return outer.data.data;
  if (Array.isArray(outer?.data)) return outer.data;
  if (Array.isArray(outer?.users)) return outer.users;
  return [];
}

// ============================================================================
// useCreateUser — Multi-step user creation form logic (UI only)
// Backend: POST /api/v1/auth/register/full
// ============================================================================

export function useCreateUser() {
  const {
    createStep: step,
    selectedCountry,
    filePreviews,
    showSuccess,
    showError,
    setCreateStep,
    setSelectedCountry,
    updateFilePreview,
    setShowSuccess,
    setShowError,
  } = useAdminUsersStore();

  // Countries are ephemeral fetched data — not UI state, so local hook is correct
  const countries = useCountriesFetch();

  const banks: SelectOption[] = useMemo(
    () => Banks.banks.map((b) => ({ value: b, label: b })).sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  const isLastStep = step === TOTAL_STEPS;

  const nextStep = useCallback(() => {
    if (step < TOTAL_STEPS) setCreateStep(step + 1);
  }, [step, setCreateStep]);

  const prevStep = useCallback(() => {
    if (step > 1) setCreateStep(step - 1);
  }, [step, setCreateStep]);

  const goToStep = useCallback(
    (s: number) => {
      if (s >= 1 && s <= TOTAL_STEPS) setCreateStep(s);
    },
    [setCreateStep],
  );

  const getFieldsForStep = useCallback((s: number) => STEP_FIELDS[s] || [], []);

  const handleFileChange = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement>,
      setFieldValue: (field: string, value: any) => void,
      fieldName: keyof AdminFilePreviews,
    ) => {
      const file = event.currentTarget.files?.[0];
      if (!file) return;
      setFieldValue(fieldName, file);

      const reader = new FileReader();
      reader.onloadend = () => {
        updateFilePreview(fieldName, reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [updateFilePreview],
  );

  return {
    step,
    totalSteps: TOTAL_STEPS,
    isLastStep,
    stepTitle: STEP_TITLES[step - 1],
    stepTitles: STEP_TITLES,
    nextStep,
    prevStep,
    goToStep,
    getFieldsForStep,
    countries,
    banks,
    selectedCountry,
    setSelectedCountry,
    filePreviews,
    handleFileChange,
    showSuccess,
    showError,
    setShowSuccess,
    setShowError,
  };
}

/** Ephemeral API data fetch — not UI state, so useState is correct here */
function useCountriesFetch(): CountryOption[] {
  const [countries, setCountries] = useState<CountryOption[]>([]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,idd")
      .then((res) => res.json())
      .then((data: any[]) => {
        setCountries(
          data
            .map((c: any) => ({
              value: c.cca2,
              label: c.name.common,
              code: c.idd.root + (c.idd.suffixes?.[0] ?? ""),
            }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        );
      })
      .catch(() => {});
  }, []);

  return countries;
}

// ============================================================================
// useAllUsers — User listing with filter pipeline, sorting & pagination
// Backend: GET /api/v1/admin/users/search  → CustomerManagementService
//          GET /api/v1/admin/dashboard     → AdminDashboardService
// ============================================================================

export function useAllUsers() {
  const {
    search,
    statusFilter,
    kycFilter,
    page,
    setSearch,
    setStatusFilter,
    setKycFilter,
    setPage,
    resetFilters,
    setExpandedUserId,
  } = useAdminUsersStore();

  const { data: usersRaw, isLoading, refetch } = useSearchUsers({ page: 1, limit: 500 });
  const { data: statsRaw } = useAdminDashboardStats();
  const updateStatus = useUpdateUserStatus();

  // --- Normalize ---
  const rawUsers = useMemo<AdminUserRow[]>(() => unwrapArray(usersRaw).map(normalizeUserRow), [usersRaw]);

  // --- Filter pipeline (mirrors useadmin-account-usecase pattern) ---
  const filtered = useMemo(() => {
    const predicates: ((item: AdminUserRow) => boolean)[] = [];

    if (search) {
      predicates.push(
        textSearchFilter(search, [
          (u) => u.firstName,
          (u) => u.lastName,
          (u) => u.email,
          (u) => u.accountNumber,
          (u) => u.phone,
        ]),
      );
    }
    if (statusFilter !== "all") {
      predicates.push(enumFilter((u) => u.status, [statusFilter]));
    }
    if (kycFilter !== "all") {
      predicates.push(enumFilter((u) => u.kycStatus, [kycFilter]));
    }

    const result = applyFilterPipeline(rawUsers, predicates);
    return multiKeySort(result, [{ getter: (u: AdminUserRow) => new Date(u.createdAt || 0), direction: "desc" }]);
  }, [rawUsers, search, statusFilter, kycFilter]);

  // --- Pagination ---
  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  // --- Stats ---
  const stats = useMemo<AdminUserStats>(() => {
    const s: any = statsRaw || {};
    const activeCount = rawUsers.filter((u) => u.isActive).length;
    const blockedCount = rawUsers.filter((u) => u.status === "suspended" || u.status === "banned").length;
    const pendingKycCount = rawUsers.filter((u) => u.kycStatus === "pending").length;
    return {
      totalUsers: rawUsers.length || s.totalUsers || 0,
      activeUsers: activeCount || s.activeUsers || 0,
      pendingKyc: pendingKycCount || s.pendingKyc || 0,
      blockedUsers: blockedCount || s.blockedUsers || 0,
      newUsersToday: s.newUsersToday ?? 0,
      verifiedUsers: s.verifiedUsers ?? 0,
    };
  }, [rawUsers, statsRaw]);

  return {
    users: paginatedResult.items,
    allUsers: filtered,
    rawUsers,
    stats,
    search,
    statusFilter,
    kycFilter,
    page,
    isLoading,
    isMutating: updateStatus.isPending,
    pagination: paginatedResult,
    pageNumbers,
    setSearch,
    setStatusFilter,
    setKycFilter,
    setPage,
    setExpandedUserId,
    resetFilters,
    refetch,
    updateStatus,
    deleteUser: useDeleteUser(),
  };
}

// ============================================================================
// useUserDetail — Single user detail, status, KYC & data mutations
// Backend: GET    /api/v1/admin/users/:userId        → getUserDetails
//          PUT    /api/v1/admin/users/:userId/status  → updateUserStatus
//          PUT    /api/v1/admin/users/:userId          → updateUser
//          POST   /api/v1/admin/users/:userId/reset-password
//          DELETE /api/v1/admin/users/:userId
//          PATCH  /api/v1/kyc/admin/users/:userId/review
// ============================================================================

export function useUserDetail(userId: string) {
  const { data: userRaw, isLoading, refetch } = useAdminUserDetails(userId as any);
  const updateStatus = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useAdminUpdateUser();
  const resetPassword = useAdminResetUserPassword();
  const reviewKyc = useAdminReviewKyc();
  const { confirmAction, setConfirmAction } = useAdminUsersStore();

  // --- Normalize detail + related entities ---
  const { user, wallets, recentTransactions, loans, cards, investments, savingsGoals } = useMemo(() => {
    if (!userRaw) {
      return {
        user: null,
        wallets: [],
        recentTransactions: [],
        loans: [],
        cards: [],
        investments: [],
        savingsGoals: [],
      };
    }
    const raw: any = userRaw;
    const u: any = raw?.user || raw?.data?.user || raw?.data || raw;
    return {
      user: normalizeUserDetail(u),
      wallets: raw?.wallets || [],
      recentTransactions: raw?.recentTransactions || [],
      loans: raw?.loans || [],
      cards: raw?.cards || [],
      investments: raw?.investments || [],
      savingsGoals: raw?.savingsGoals || [],
    };
  }, [userRaw]);

  // ── Status actions ─────────────────────────────────────────────────────────

  const activateDeactivate = useCallback(() => {
    if (!user || !userId) return;
    const newStatus = user.isActive ? "suspended" : "active";
    updateStatus.mutate(
      {
        userId: userId as any,
        data: {
          status: newStatus as any,
          reason: `Admin ${newStatus === "active" ? "activated" : "deactivated"} account`,
        },
      },
      {
        onSuccess: () => {
          refetch();
          setConfirmAction(null);
        },
      },
    );
  }, [user, userId, updateStatus, refetch, setConfirmAction]);

  const lockUnlock = useCallback(() => {
    if (!user || !userId) return;
    const newStatus = user.isLocked ? "active" : "suspended";
    updateStatus.mutate(
      {
        userId: userId as any,
        data: { status: newStatus as any, reason: `Admin ${user.isLocked ? "unlocked" : "locked"} account` },
      },
      {
        onSuccess: () => {
          refetch();
          setConfirmAction(null);
        },
      },
    );
  }, [user, userId, updateStatus, refetch, setConfirmAction]);

  const banUser = useCallback(
    (reason = "Banned by admin for policy violation") => {
      if (!userId) return;
      updateStatus.mutate(
        { userId: userId as any, data: { status: "banned" as any, reason } },
        {
          onSuccess: () => {
            refetch();
            setConfirmAction(null);
          },
        },
      );
    },
    [userId, updateStatus, refetch, setConfirmAction],
  );

  const blockUser = useCallback(
    (reason = "Blocked by admin") => {
      if (!userId) return;
      updateStatus.mutate(
        { userId: userId as any, data: { status: "suspended" as any, reason } },
        {
          onSuccess: () => {
            refetch();
            setConfirmAction(null);
          },
        },
      );
    },
    [userId, updateStatus, refetch, setConfirmAction],
  );

  const restrictUser = useCallback(
    (reason = "Account restricted by admin") => {
      if (!userId) return;
      updateStatus.mutate(
        { userId: userId as any, data: { status: "restricted" as any, reason } },
        {
          onSuccess: () => {
            refetch();
            setConfirmAction(null);
          },
        },
      );
    },
    [userId, updateStatus, refetch, setConfirmAction],
  );

  // ── KYC actions ────────────────────────────────────────────────────────────

  const changeKycStatus = useCallback(
    (kycStatus: string, rejectionReason?: string) => {
      if (!userId) return;
      const statusMap: Record<string, "approved" | "rejected" | "pending"> = {
        verified: "approved",
        approved: "approved",
        pending: "pending",
        rejected: "rejected",
      };
      const mappedStatus = statusMap[kycStatus] || "pending";
      reviewKyc.mutate(
        { userId, data: { status: mappedStatus, ...(rejectionReason ? { rejectionReason } : {}) } },
        {
          onSuccess: () => {
            refetch();
            setConfirmAction(null);
          },
        },
      );
    },
    [userId, reviewKyc, refetch, setConfirmAction],
  );

  // ── Data mutations ─────────────────────────────────────────────────────────

  const updateUser = useCallback(
    (data: any) => {
      if (!userId) return;
      updateUserMutation.mutate({ userId: userId as any, data }, { onSuccess: () => refetch() });
    },
    [userId, updateUserMutation, refetch],
  );

  const resetUserPassword = useCallback(() => {
    if (!userId) return;
    resetPassword.mutate(userId as any);
  }, [userId, resetPassword]);

  const deleteUser = useCallback(() => {
    if (!userId) return;
    deleteUserMutation.mutate(userId as any, { onSuccess: () => setConfirmAction(null) });
  }, [userId, deleteUserMutation, setConfirmAction]);

  return {
    // Data
    user,
    wallets,
    recentTransactions,
    loans,
    cards,
    investments,
    savingsGoals,

    // State
    isLoading,
    refetch,
    confirmAction,
    setConfirmAction,

    // Status
    activateDeactivate,
    lockUnlock,
    banUser,
    blockUser,
    restrictUser,

    // KYC
    changeKycStatus,
    isReviewingKyc: reviewKyc.isPending,

    // Data mutations
    updateUser,
    resetUserPassword,
    deleteUser,

    // Loading
    isUpdating: updateStatus.isPending || updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isResettingPassword: resetPassword.isPending,
  };
}

// ============================================================================
// useBlockedUsers — Lists suspended/banned users with unblock capability
// ============================================================================

export function useBlockedUsers() {
  const [filters, setFilters] = useState<{
    search: string;
    status: "suspended" | "banned" | "all";
    page: number;
    limit: number;
  }>({
    search: "",
    status: "all",
    page: 1,
    limit: 10,
  });

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.search) params.query = filters.search;
    // Always filter for blocked statuses
    if (filters.status === "all") {
      params.status = "suspended,banned";
    } else {
      params.status = filters.status;
    }
    return params;
  }, [filters]);

  const { data: usersRaw, isLoading, refetch } = useSearchUsers(queryParams);
  const updateStatus = useUpdateUserStatus();

  const users = useMemo(() => {
    const outer: any = usersRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.users || [];
    return raw.map((u: any) => ({
      id: u._id || u.id,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email || "",
      status: u.status || "suspended",
      kycStatus: u.kycStatus || "pending",
      blockedAt: u.updatedAt || u.blockedAt || "",
      reason: u.statusReason || u.reason || "No reason provided",
      lastLogin: u.lastLogin || null,
    }));
  }, [usersRaw]);

  const pagination = useMemo(() => {
    const raw: any = usersRaw || {};
    const pag = raw?.data?.pagination || raw?.pagination || raw?.meta?.pagination || {};
    const total = pag.total || raw.total || raw.totalCount || users.length;
    return {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: pag.totalPages || Math.max(1, Math.ceil(total / filters.limit)),
    };
  }, [usersRaw, users.length, filters.page, filters.limit]);

  const setSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search, page: 1 }));
  }, []);

  const setStatusFilter = useCallback((status: "suspended" | "banned" | "all") => {
    setFilters((f) => ({ ...f, status, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  const unblockUser = useCallback(
    (userId: string) => {
      updateStatus.mutate({ userId: userId as any, data: { status: "active" as any, reason: "Unblocked by admin" } });
    },
    [updateStatus],
  );

  return {
    users,
    pagination,
    filters,
    isLoading,
    setSearch,
    setStatusFilter,
    setPage,
    refetch,
    unblockUser,
    isUnblocking: updateStatus.isPending,
  };
}

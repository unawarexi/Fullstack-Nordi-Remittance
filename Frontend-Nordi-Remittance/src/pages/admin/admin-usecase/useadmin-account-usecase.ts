import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useAdminWallets,
  useAdminUpdateWalletStatus,
  useAdminPendingApplications,
  useAdminApproveApplication,
  useAdminRejectApplication,
} from "@hooks/api-queries/useAccounts";
import { useAdminDashboardStats } from "@hooks/api-queries";
import { applyFilterPipeline, textSearchFilter, enumFilter } from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";
import { useAdminStore } from "@store/admin.store";
import { useAccountStore } from "@store/account.store";
import apiClient from "@core/api/client";
import { useToast } from "@store/toast.store";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useAccountsManagement — Aggregates admin wallet listing, filters & actions
// ============================================================================

export type AccountStatusFilter = "All" | "Active" | "Dormant" | "Frozen" | "Closed";
export type AccountTypeFilter = "all" | "savings" | "current" | "fixed-deposit" | "wallet";

const PAGE_SIZE = 20;

export function useAccountsManagement() {
  const { accountsState, setModuleState, expandedId, setExpandedId } = useAdminStore();
  const { search, statusFilter, typeFilter, page } = accountsState;

  const { data: walletsRaw, isLoading, refetch } = useAdminWallets({ page: 1, limit: 500 });
  const { data: statsRaw } = useAdminDashboardStats();
  const updateWalletStatus = useAdminUpdateWalletStatus();

  // --- Normalize raw wallet data ---
  const rawAccounts = useMemo(() => {
    const outer: any = walletsRaw || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.wallets || [];
    return raw.map((w: any) => {
      const balancesMap: Record<string, number> =
        w.balances instanceof Map ? Object.fromEntries(w.balances) : w.balances || {};
      const totalBalance = Object.values(balancesMap).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0);
      return {
        id: w._id || w.walletNumber || w.id || "",
        userId: typeof w.user === "string" ? w.user : w.user?._id || w.userId || "",
        owner:
          w.user?.firstName && w.user?.lastName ? `${w.user.firstName} ${w.user.lastName}` : w.userName || "Unknown",
        email: w.user?.email || w.email || "",
        type: w.walletType || w.accountType || "wallet",
        accountNumber: w.walletNumber || w.accountNumber || "",
        balance: totalBalance,
        currency: w.currency || "EUR",
        status: w.status || "active",
        interestRate: w.interestRate ?? 0,
        opened: w.createdAt || "",
        lastActivity: w.updatedAt || w.lastTransactionAt || "",
      };
    });
  }, [walletsRaw]);

  // --- Filter Pipeline ---
  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];
    if (search) {
      predicates.push(
        textSearchFilter(search, [(a) => a.owner ?? "", (a) => a.accountNumber ?? "", (a) => a.email ?? ""]),
      );
    }
    if (statusFilter !== "All") {
      predicates.push(enumFilter((a) => a.status ?? "", [statusFilter.toLowerCase()]));
    }
    if (typeFilter !== "all") {
      predicates.push(enumFilter((a) => a.type ?? "", [typeFilter]));
    }
    const result = applyFilterPipeline(rawAccounts, predicates);
    return multiKeySort(result, [{ getter: (a: any) => new Date(a.lastActivity || a.opened || 0), direction: "desc" }]);
  }, [rawAccounts, search, statusFilter, typeFilter]);

  // --- Pagination ---
  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  // --- Stats ---
  const stats = useMemo(() => {
    const totalBalance = rawAccounts.reduce((sum: number, a: any) => sum + a.balance, 0);
    const activeCount = rawAccounts.filter((a: any) => a.status === "active").length;
    const dormantCount = rawAccounts.filter((a: any) => a.status === "dormant" || a.status === "suspended").length;
    const s: any = statsRaw || {};
    return {
      totalBalance,
      activeAccounts: activeCount || s.activeAccounts || 0,
      dormantAccounts: dormantCount,
      totalAccounts: rawAccounts.length || s.totalAccounts || 0,
    };
  }, [rawAccounts, statsRaw]);

  // --- Actions ---
  const updateStatus = useCallback(
    (walletId: string, status: "active" | "suspended" | "closed", reason: string) => {
      updateWalletStatus.mutate(
        { walletId: walletId as any, data: { status, reason } },
        { onSuccess: () => refetch() },
      );
    },
    [updateWalletStatus, refetch],
  );

  const freezeAccount = useCallback(
    (walletId: string) => updateStatus(walletId, "suspended", "Frozen by admin"),
    [updateStatus],
  );

  const unfreezeAccount = useCallback(
    (walletId: string) => updateStatus(walletId, "active", "Unfrozen by admin"),
    [updateStatus],
  );

  const closeAccount = useCallback(
    (walletId: string) => updateStatus(walletId, "closed", "Closed by admin"),
    [updateStatus],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setModuleState("accountsState", { search: value, page: 1 });
    },
    [setModuleState],
  );

  const handleStatusFilter = useCallback(
    (value: AccountStatusFilter) => {
      setModuleState("accountsState", { statusFilter: value, page: 1 });
    },
    [setModuleState],
  );

  const handleTypeFilter = useCallback(
    (value: AccountTypeFilter) => {
      setModuleState("accountsState", { typeFilter: value, page: 1 });
    },
    [setModuleState],
  );

  return {
    accounts: paginatedResult.items,
    allAccounts: filtered,
    rawAccounts,
    stats,
    search,
    statusFilter,
    typeFilter,
    page,
    expandedId,
    isLoading,
    isMutating: updateWalletStatus.isPending,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: handleSearch,
    setStatusFilter: handleStatusFilter,
    setTypeFilter: handleTypeFilter,
    setPage: (p: number) => setModuleState("accountsState", { page: p }),
    setExpandedId,
    freezeAccount,
    unfreezeAccount,
    closeAccount,
    refetch,
  };
}

// ============================================================================
// useApplicationsManagement — Admin account application review
// ============================================================================

export type ApplicationStatusFilter = "all" | "pending" | "approved" | "rejected";

export function useApplicationsManagement() {
  const { applicationsState, setModuleState, rejectDialogId, setRejectDialogId, rejectReason, setRejectReason } =
    useAdminStore();
  const { search, statusFilter, typeFilter, page } = applicationsState;

  const { data: raw, isLoading, refetch } = useAdminPendingApplications();
  const approveMutation = useAdminApproveApplication();
  const rejectMutation = useAdminRejectApplication();

  const rawApplications = useMemo<any[]>(() => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray((raw as any).applications)) return (raw as any).applications;
    if (Array.isArray((raw as any).data)) return (raw as any).data;
    return [];
  }, [raw]);

  const filtered = useMemo(() => {
    let items = rawApplications;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.user?.firstName?.toLowerCase().includes(q) ||
          a.user?.lastName?.toLowerCase().includes(q) ||
          a.user?.email?.toLowerCase().includes(q) ||
          a.type?.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      items = items.filter((a) => a.status === statusFilter);
    }
    if (typeFilter !== "all") {
      items = items.filter((a) => a.type === typeFilter);
    }
    return [...items].sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
  }, [rawApplications, search, statusFilter, typeFilter]);

  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  const stats = useMemo(
    () => ({
      total: rawApplications.length,
      pending: rawApplications.filter((a) => a.status === "pending").length,
      approved: rawApplications.filter((a) => a.status === "approved").length,
      rejected: rawApplications.filter((a) => a.status === "rejected").length,
    }),
    [rawApplications],
  );

  const approveApplication = useCallback(
    (applicationId: string) => {
      approveMutation.mutate(applicationId, { onSuccess: () => refetch() });
    },
    [approveMutation, refetch],
  );

  const rejectApplication = useCallback(
    (applicationId: string, reason: string) => {
      rejectMutation.mutate(
        { applicationId, reason },
        {
          onSuccess: () => {
            setRejectDialogId(null);
            setRejectReason("");
            refetch();
          },
        },
      );
    },
    [rejectMutation, refetch],
  );

  return {
    applications: paginatedResult.items,
    allApplications: filtered,
    rawApplications,
    stats,
    search,
    statusFilter,
    typeFilter,
    page,
    rejectDialogId,
    rejectReason,
    isLoading,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: (v: string) => setModuleState("applicationsState", { search: v, page: 1 }),
    setStatusFilter: (v: ApplicationStatusFilter) => setModuleState("applicationsState", { statusFilter: v, page: 1 }),
    setTypeFilter: (v: string) => setModuleState("applicationsState", { typeFilter: v, page: 1 }),
    setPage: (p: number) => setModuleState("applicationsState", { page: p }),
    setRejectDialogId,
    setRejectReason,
    approveApplication,
    rejectApplication,
    refetch,
  };
}

// ============================================================================
// useWalletCombobox — Encapsulates dynamic fetching and selection
// ============================================================================
export function useWalletCombobox(value: string, accounts: any[], users: any[]) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { cachedAccounts, cacheAccounts } = useAccountStore();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Dynamically fetch wallets if user types 3+ characters
  const { data: searchData, isLoading } = useAdminWallets(
    debouncedSearch.length >= 3 ? { query: debouncedSearch, limit: 20 } : { limit: 1 }
  );

  const dynamicAccounts = useMemo(() => {
    if (debouncedSearch.length < 3 || !searchData) return [];
    const outer: any = searchData || {};
    const raw: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data)
          ? outer.data
          : outer?.wallets || [];
    return raw.map((w: any) => {
      const balancesMap: Record<string, number> =
        w.balances instanceof Map ? Object.fromEntries(w.balances) : w.balances || {};
      const totalBalance = Object.values(balancesMap).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0);
      return {
        id: w._id || w.walletNumber || w.id || "",
        userId: typeof w.user === "string" ? w.user : w.user?._id || w.userId || "",
        owner:
          w.user?.firstName && w.user?.lastName ? `${w.user.firstName} ${w.user.lastName}` : w.userName || "Unknown",
        email: w.user?.email || w.email || "",
        type: w.walletType || w.accountType || "wallet",
        accountNumber: w.walletNumber || w.accountNumber || "",
        balance: totalBalance,
        currency: w.currency || "EUR",
        status: w.status || "active",
        userAvatar: w.user?.avatar,
      };
    });
  }, [searchData, debouncedSearch]);

  useEffect(() => {
    if (dynamicAccounts.length > 0) {
      cacheAccounts(dynamicAccounts);
    }
  }, [dynamicAccounts, cacheAccounts]);

  const selectedAcc = accounts.find((a) => a.id === value) || cachedAccounts[value] || dynamicAccounts.find((a) => a.id === value);
  const selectedUser = selectedAcc ? users.find((u) => u.email === selectedAcc.email) || { avatar: selectedAcc.userAvatar } : null;

  const filtered = (debouncedSearch.length >= 3 ? dynamicAccounts : accounts)
    .filter((a) => {
      const q = search.toLowerCase();
      return (
        a.owner.toLowerCase().includes(q) ||
        a.accountNumber.includes(q) ||
        (a.email && a.email.toLowerCase().includes(q))
      );
    })
    .slice(0, 50);

  return { open, setOpen, search, setSearch, debouncedSearch, isLoading, filtered, selectedAcc, selectedUser };
}

// ============================================================================
// useWalletOperationForm — Encapsulates wallet operations logic
// ============================================================================
export function useWalletOperationForm(
  type: "credit" | "debit" | "transfer",
  endpoint: string,
  label: string,
  onSuccess: () => void,
  accounts: any[]
) {
  const toast = useToast();
  
  const [form, setForm] = useState({
    walletId: "",
    fromWalletId: "",
    toWalletId: "",
    amount: "",
    currency: "EUR",
    description: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const buildPayload = () => {
    const amount = parseFloat(form.amount);
    if (type === "transfer") {
      const fromAcc = accounts.find((a) => a.id === form.fromWalletId);
      const toAcc = accounts.find((a) => a.id === form.toWalletId);
      return {
        fromUserId: fromAcc?.userId || form.fromWalletId.trim(),
        toUserId: toAcc?.userId || form.toWalletId.trim(),
        amount,
        currency: form.currency,
        description: form.description.trim() || `Admin transfer of ${amount} ${form.currency}`,
        reason: form.reason.trim() || "Admin initiated transfer",
      };
    }
    const targetAcc = accounts.find((a) => a.id === form.walletId);
    return {
      userId: targetAcc?.userId || form.walletId.trim(),
      amount,
      currency: form.currency,
      description: form.description.trim() || `Admin ${type} of ${amount} ${form.currency}`,
      reason: form.reason.trim() || `Admin initiated ${type}`,
    };
  };

  const isValid = () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return false;
    if (type === "transfer") return form.fromWalletId.trim() && form.toWalletId.trim();
    return !!form.walletId.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;
    if (!confirm(`Confirm ${label} of ${form.amount} ${form.currency}?`)) return;

    setLoading(true);
    try {
      const res = await apiClient.post(endpoint, buildPayload());
      setLastResult(res.data);
      toast.success(`${label} successful`);
      setForm({
        walletId: "",
        fromWalletId: "",
        toWalletId: "",
        amount: "",
        currency: "EUR",
        description: "",
        reason: "",
      });
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `${label} failed`);
    } finally {
      setLoading(false);
    }
  };

  return { form, setForm, set, loading, lastResult, isValid, handleSubmit };
}

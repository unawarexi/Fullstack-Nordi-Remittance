import { useState, useMemo, useCallback } from "react";
import {
  useFraudSignals,
  useFraudCases,
  useFraudAnalytics,
  useUpdateFraudSignal,
  useUpdateFraudCase,
  useSecurityEvents,
} from "@hooks/api-queries";
import { applyFilterPipeline, textSearchFilter, enumFilter } from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useFraudManagement — Aggregates fraud monitoring, cases & alert actions
// ============================================================================

export type FraudSeverityFilter = "all" | "critical" | "high" | "medium" | "low";
export type FraudStatusFilter = "all" | "open" | "investigating" | "resolved" | "dismissed";

const PAGE_SIZE = 20;

export function useFraudManagement() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<FraudSeverityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<FraudStatusFilter>("all");
  const [activeTab, setActiveTab] = useState<"alerts" | "cases" | "events">("alerts");
  const [page, setPage] = useState(1);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const { data: signalsRaw, isLoading: signalsLoading, refetch: refetchSignals } = useFraudSignals();
  const { data: casesRaw, isLoading: casesLoading, refetch: refetchCases } = useFraudCases();
  const { data: analyticsRaw } = useFraudAnalytics();
  const { data: eventsRaw, isLoading: eventsLoading } = useSecurityEvents();
  const updateSignal = useUpdateFraudSignal();
  const updateCase = useUpdateFraudCase();

  // --- Normalize fraud alerts/signals ---
  const rawAlerts = useMemo(() => {
    const raw: any[] = Array.isArray(signalsRaw)
      ? signalsRaw
      : Array.isArray((signalsRaw as any)?.data)
        ? (signalsRaw as any).data
        : [];
    return raw.map((s: any) => ({
      id: s._id || s.id || "",
      title: s.description || s.title || s.type || "Alert",
      type: s.type || s.category || "suspicious_activity",
      severity: s.severity || s.riskLevel || "medium",
      status: s.status || "open",
      user: s.userName || s.user?.name || s.userId || "Unknown",
      userId: s.userId || "",
      email: s.email || s.user?.email || "",
      amount: s.amount ?? 0,
      description: s.description || "",
      detectedAt: s.createdAt || s.detectedAt || "",
      transactionId: s.transactionId || "",
      transactionCount: s.transactionCount ?? s.txCount ?? 0,
      location: s.location || s.ipAddress || s.country || "",
    }));
  }, [signalsRaw]);

  // --- Normalize fraud cases ---
  const rawCases = useMemo(() => {
    const raw: any[] = Array.isArray(casesRaw)
      ? casesRaw
      : Array.isArray((casesRaw as any)?.data)
        ? (casesRaw as any).data
        : [];
    return raw.map((c: any) => ({
      id: c._id || c.id || "",
      title: c.title || c.description || "Fraud Case",
      type: c.type || c.category || "investigation",
      severity: c.severity || c.riskLevel || "medium",
      status: c.status || "open",
      assignedTo: c.assignedTo || c.investigator || "",
      relatedSignals: c.relatedSignals?.length || 0,
      createdAt: c.createdAt || "",
      updatedAt: c.updatedAt || "",
      resolution: c.resolution || "",
    }));
  }, [casesRaw]);

  // --- Normalize security events ---
  const rawEvents = useMemo(() => {
    const raw: any[] = Array.isArray(eventsRaw)
      ? eventsRaw
      : Array.isArray((eventsRaw as any)?.data)
        ? (eventsRaw as any).data
        : [];
    return raw.map((e: any) => ({
      id: e._id || e.id || "",
      type: e.type || e.eventType || "login_attempt",
      severity: e.severity || "low",
      description: e.description || e.details || "",
      userId: e.userId || "",
      ipAddress: e.ipAddress || e.ip || "",
      timestamp: e.createdAt || e.timestamp || "",
    }));
  }, [eventsRaw]);

  // --- Analytics ---
  const analytics = useMemo(() => {
    const a: any = analyticsRaw || {};
    return {
      totalAlerts: rawAlerts.length,
      openCases: rawCases.filter((c) => c.status === "open" || c.status === "investigating").length,
      resolvedCases: rawCases.filter((c) => c.status === "resolved" || c.status === "closed").length,
      criticalAlerts: rawAlerts.filter((a) => a.severity === "critical").length,
      highRiskAlerts: rawAlerts.filter((a) => a.severity === "high").length,
      blockedTransactions: a.blockedTransactions ?? 0,
      riskScore: a.riskScore ?? a.overallRiskScore ?? 0,
      falsePositiveRate: a.falsePositiveRate ?? 0,
    };
  }, [analyticsRaw, rawAlerts, rawCases]);

  // --- Filter active tab data ---
  const activeData = activeTab === "alerts" ? rawAlerts : activeTab === "cases" ? rawCases : rawEvents;

  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];
    if (search) {
      predicates.push(
        textSearchFilter(search, [
          (i) => i.title ?? i.description ?? "",
          (i) => i.type ?? "",
          (i) => i.user ?? i.userId ?? "",
          (i) => i.id ?? "",
        ]),
      );
    }
    if (severityFilter !== "all") {
      predicates.push(enumFilter((i) => i.severity ?? "", [severityFilter]));
    }
    if (statusFilter !== "all") {
      predicates.push(enumFilter((i) => i.status ?? "", [statusFilter]));
    }
    const result = applyFilterPipeline(activeData, predicates);
    return multiKeySort(result, [
      { getter: (i: any) => new Date(i.detectedAt || i.createdAt || i.timestamp || 0), direction: "desc" },
    ]);
  }, [activeData, search, severityFilter, statusFilter]);

  // --- Pagination ---
  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  // --- Actions ---
  const dismissAlert = useCallback(
    (signalId: string, callbacks?: { onSuccess?: () => void }) => {
      updateSignal.mutate(
        { signalId: signalId as any, data: { status: "dismissed" as any } },
        {
          onSuccess: () => {
            refetchSignals();
            callbacks?.onSuccess?.();
          },
        },
      );
    },
    [updateSignal, refetchSignals],
  );

  const escalateAlert = useCallback(
    (signalId: string, callbacks?: { onSuccess?: () => void }) => {
      updateSignal.mutate(
        { signalId: signalId as any, data: { status: "investigating", severity: "high" } },
        {
          onSuccess: () => {
            refetchSignals();
            callbacks?.onSuccess?.();
          },
        },
      );
    },
    [updateSignal, refetchSignals],
  );

  const resolveCase = useCallback(
    (caseId: string, resolution: string, callbacks?: { onSuccess?: () => void }) => {
      updateCase.mutate(
        { caseId: caseId as any, data: { status: "resolved", resolution } },
        {
          onSuccess: () => {
            refetchCases();
            callbacks?.onSuccess?.();
          },
        },
      );
    },
    [updateCase, refetchCases],
  );

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const refetch = useCallback(() => {
    refetchSignals();
    refetchCases();
  }, [refetchSignals, refetchCases]);

  return {
    items: paginatedResult.items,
    allItems: filtered,
    alerts: rawAlerts,
    cases: rawCases,
    events: rawEvents,
    analytics,
    search,
    severityFilter,
    statusFilter,
    activeTab,
    page,
    selectedAlertId,
    isLoading: signalsLoading || casesLoading,
    isEventsLoading: eventsLoading,
    isMutating: updateSignal.isPending || updateCase.isPending,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: handleSearch,
    setSeverityFilter: useCallback((v: FraudSeverityFilter) => {
      setSeverityFilter(v);
      setPage(1);
    }, []),
    setStatusFilter: useCallback((v: FraudStatusFilter) => {
      setStatusFilter(v);
      setPage(1);
    }, []),
    setActiveTab,
    setPage,
    setSelectedAlertId,
    dismissAlert,
    escalateAlert,
    resolveCase,
    refetch,
  };
}

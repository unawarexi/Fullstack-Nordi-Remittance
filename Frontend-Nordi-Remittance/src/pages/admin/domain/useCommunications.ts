import { useState, useMemo, useCallback } from "react";
import { useNotifications } from "@hooks/queries";
import {
  applyFilterPipeline,
  textSearchFilter,
  enumFilter,
} from "@core/algo/filter";
import { multiKeySort } from "@core/algo/sort";
import { paginate, getPageNumbers } from "@core/algo/pagination";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ============================================================================
// useCommunications — Email, SMS, Push, & Campaign management
// ============================================================================

type CommunicationSection = "email" | "sms" | "push" | "campaigns";
type CategoryFilter = "all" | "onboarding" | "verification" | "transaction" | "security" | "report" | "marketing";

const PAGE_SIZE = 20;

export function useCommunications() {
  const [activeSection, setActiveSection] = useState<CommunicationSection>("email");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(1);

  // Fetch notifications as the closest available backend data for templates/campaigns
  const { data: notificationsRaw, isLoading, refetch } = useNotifications({ limit: 500 });

  // --- Normalize notifications into template-like structures ---
  const rawNotifications = useMemo(() => {
    const outer: any = notificationsRaw || {};
    const items: any[] = Array.isArray(outer)
      ? outer
      : Array.isArray(outer?.data?.data)
        ? outer.data.data
        : Array.isArray(outer?.data?.notifications)
          ? outer.data.notifications
          : Array.isArray(outer?.data)
            ? outer.data
            : [];
    return items;
  }, [notificationsRaw]);

  // --- Categorize notifications by type into template buckets ---
  const emailTemplates = useMemo(() => {
    const emails = rawNotifications.filter((n: any) => n.channel === "email" || n.type === "email");
    if (emails.length > 0) {
      return emails.map((n: any) => ({
        id: n._id || n.id || "",
        name: n.title || n.subject || n.name || "Email Template",
        subject: n.subject || n.title || "",
        category: n.category || n.templateType || "transaction",
        status: n.status || "active",
        lastEdited: n.updatedAt || n.createdAt || "",
        sentCount: n.sentCount || n.deliveredCount || 0,
        openRate: n.openRate || 0,
      }));
    }
    // Fallback: return configurable defaults when no backend data
    return [
      { id: "ET-001", name: "Welcome Email", subject: "Welcome to Nordi Remittance!", category: "onboarding", status: "active", lastEdited: "", sentCount: 0, openRate: 0 },
      { id: "ET-002", name: "KYC Approved", subject: "Your identity has been verified", category: "verification", status: "active", lastEdited: "", sentCount: 0, openRate: 0 },
      { id: "ET-003", name: "KYC Rejected", subject: "Additional documents required", category: "verification", status: "active", lastEdited: "", sentCount: 0, openRate: 0 },
      { id: "ET-004", name: "Transaction Confirmation", subject: "Your transfer of {{amount}} was successful", category: "transaction", status: "active", lastEdited: "", sentCount: 0, openRate: 0 },
      { id: "ET-005", name: "Password Reset", subject: "Reset your password", category: "security", status: "active", lastEdited: "", sentCount: 0, openRate: 0 },
      { id: "ET-006", name: "Monthly Statement", subject: "Your monthly account statement", category: "report", status: "draft", lastEdited: "", sentCount: 0, openRate: 0 },
      { id: "ET-007", name: "Promotional Offer", subject: "Special rates on international transfers!", category: "marketing", status: "draft", lastEdited: "", sentCount: 0, openRate: 0 },
    ];
  }, [rawNotifications]);

  const smsTemplates = useMemo(() => {
    const sms = rawNotifications.filter((n: any) => n.channel === "sms" || n.type === "sms");
    if (sms.length > 0) {
      return sms.map((n: any) => ({
        id: n._id || n.id || "",
        name: n.title || n.name || "SMS Template",
        message: n.body || n.message || n.content || "",
        category: n.category || "transaction",
        status: n.status || "active",
        sentCount: n.sentCount || n.deliveredCount || 0,
      }));
    }
    return [
      { id: "SMS-001", name: "OTP Verification", message: "Your Nordi verification code is {{code}}. Expires in 5 min.", category: "security", status: "active", sentCount: 0 },
      { id: "SMS-002", name: "Transfer Alert", message: "{{amount}} sent to {{recipient}}. Ref: {{ref}}", category: "transaction", status: "active", sentCount: 0 },
      { id: "SMS-003", name: "Login Alert", message: "New login detected on your Nordi account from {{device}}.", category: "security", status: "active", sentCount: 0 },
      { id: "SMS-004", name: "Deposit Received", message: "{{amount}} deposited to your wallet. Balance: {{balance}}", category: "transaction", status: "active", sentCount: 0 },
    ];
  }, [rawNotifications]);

  const pushTemplates = useMemo(() => {
    const push = rawNotifications.filter((n: any) => n.channel === "push" || n.type === "push");
    if (push.length > 0) {
      return push.map((n: any) => ({
        id: n._id || n.id || "",
        name: n.name || n.title || "Push Notification",
        title: n.title || "",
        body: n.body || n.message || "",
        status: n.status || "active",
        sentCount: n.sentCount || n.deliveredCount || 0,
      }));
    }
    return [
      { id: "PUSH-001", name: "Transfer Complete", title: "Transfer Successful", body: "Your transfer of {{amount}} to {{name}} is complete.", status: "active", sentCount: 0 },
      { id: "PUSH-002", name: "Loan Approved", title: "Loan Application Approved", body: "Your loan of {{amount}} has been approved!", status: "active", sentCount: 0 },
      { id: "PUSH-003", name: "Promo Rate", title: "Special Exchange Rate!", body: "Send money to {{country}} at just {{rate}} today.", status: "draft", sentCount: 0 },
    ];
  }, [rawNotifications]);

  const campaigns = useMemo(() => {
    const cmp = rawNotifications.filter((n: any) => n.type === "campaign" || n.isCampaign);
    if (cmp.length > 0) {
      return cmp.map((n: any) => ({
        id: n._id || n.id || "",
        name: n.name || n.title || "Campaign",
        type: n.channel || n.campaignType || "email",
        status: n.status || "draft",
        recipients: n.recipientsCount || n.recipients || 0,
        opened: n.openedCount || 0,
        clicked: n.clickedCount || 0,
        sentDate: n.sentAt || n.createdAt || "",
      }));
    }
    return [
      { id: "CMP-001", name: "Q1 New User Welcome", type: "email", status: "completed", recipients: 0, opened: 0, clicked: 0, sentDate: "" },
      { id: "CMP-002", name: "Remittance Promo - Africa", type: "email+sms", status: "active", recipients: 0, opened: 0, clicked: 0, sentDate: "" },
      { id: "CMP-003", name: "Feature Announcement - Cards", type: "push", status: "scheduled", recipients: 0, opened: 0, clicked: 0, sentDate: "" },
      { id: "CMP-004", name: "Re-engagement Campaign", type: "email", status: "draft", recipients: 0, opened: 0, clicked: 0, sentDate: "" },
    ];
  }, [rawNotifications]);

  // --- Active section data ---
  const activeData = useMemo(() => {
    switch (activeSection) {
      case "email": return emailTemplates;
      case "sms": return smsTemplates;
      case "push": return pushTemplates;
      case "campaigns": return campaigns;
      default: return emailTemplates;
    }
  }, [activeSection, emailTemplates, smsTemplates, pushTemplates, campaigns]);

  // --- Filter pipeline ---
  const filtered = useMemo(() => {
    const predicates: ((item: any) => boolean)[] = [];
    if (search) {
      predicates.push(
        textSearchFilter(search, [
          (i) => i.name || "",
          (i) => i.subject || i.message || i.title || i.body || "",
          (i) => i.category || i.type || "",
        ]),
      );
    }
    if (categoryFilter !== "all") {
      predicates.push(enumFilter((i) => i.category ?? i.type ?? "", [categoryFilter]));
    }
    const result = applyFilterPipeline(activeData, predicates);
    return multiKeySort(result, [
      { getter: (i: any) => new Date(i.lastEdited || i.sentDate || 0), direction: "desc" },
    ]);
  }, [activeData, search, categoryFilter]);

  // --- Pagination ---
  const paginatedResult = useMemo(() => paginate(filtered, page, PAGE_SIZE), [filtered, page]);
  const pageNumbers = useMemo(
    () => getPageNumbers(paginatedResult.page, paginatedResult.totalPages),
    [paginatedResult.page, paginatedResult.totalPages],
  );

  // --- Stats ---
  const stats = useMemo(() => ({
    emailCount: emailTemplates.length,
    smsCount: smsTemplates.length,
    pushCount: pushTemplates.length,
    activeCampaigns: campaigns.filter((c) => c.status === "active").length,
  }), [emailTemplates, smsTemplates, pushTemplates, campaigns]);

  return {
    items: paginatedResult.items,
    emailTemplates,
    smsTemplates,
    pushTemplates,
    campaigns,
    stats,
    search,
    categoryFilter,
    activeSection,
    page,
    isLoading,
    pagination: paginatedResult,
    pageNumbers,
    setSearch: useCallback((v: string) => { setSearch(v); setPage(1); }, []),
    setCategoryFilter: useCallback((v: CategoryFilter) => { setCategoryFilter(v); setPage(1); }, []),
    setActiveSection,
    setPage,
    refetch,
  };
}

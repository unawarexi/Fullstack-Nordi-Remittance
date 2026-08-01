import { LegalRepository } from '../../domain/repository/legal.repository';
import { useToastStore } from '../../store/toast.store';
import { queryKeys } from '../../core/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ============================================================================
// LEGAL HOOKS - TanStack Query hooks for disputes, reports, and legal documents
// ============================================================================


// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

interface DisputeFilters {
  status?: DisputeStatus;
  type?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface ReportFilters {
  type?: string;
  year?: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// QUERIES - DISPUTES
// ============================================================================

/**
 * Get all disputes
 */
export const useDisputes = (filters?: DisputeFilters) => {
  return useQuery({
    queryKey: queryKeys.legal.disputes(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await LegalRepository.getDisputes(filters);
      return response;
    },
  });
};

/**
 * Get dispute by ID
 */
export const useDispute = (disputeId: UUID) => {
  return useQuery({
    queryKey: queryKeys.legal.disputeDetail(disputeId),
    queryFn: async () => {
      const response = await LegalRepository.getDisputeById(disputeId);
      return response.data;
    },
    enabled: !!disputeId,
  });
};

/**
 * Get dispute messages/communication
 */
export const useDisputeMessages = (disputeId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.legal.disputeDetail(disputeId), "messages"],
    queryFn: async () => {
      const response = await LegalRepository.getDisputeById(disputeId);
      return response.data.timeline || [];
    },
    enabled: !!disputeId,
    refetchInterval: 30000, // Refresh messages every 30 seconds
  });
};

/**
 * Get dispute documents
 */
export const useDisputeDocuments = (disputeId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.legal.disputeDetail(disputeId), "documents"],
    queryFn: async () => {
      const response = await LegalRepository.getDisputeById(disputeId);
      return response.data.documents || [];
    },
    enabled: !!disputeId,
  });
};

// ============================================================================
// QUERIES - REPORTS & STATEMENTS
// ============================================================================

/**
 * Get all reports
 */
export const useReports = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: queryKeys.legal.reports(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await LegalRepository.getReports(filters);
      return response;
    },
  });
};

/**
 * Get report by ID
 */
export const useReport = (reportId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.legal.reports(), reportId],
    queryFn: async () => {
      const response = await LegalRepository.getReportById(reportId);
      return response.data;
    },
    enabled: !!reportId,
  });
};

/**
 * Get available report types
 */
export const useReportTypes = () => {
  return useQuery({
    queryKey: [...queryKeys.legal.all, "report-types"],
    queryFn: async () => {
      return [{ id: '1', name: 'Transaction History' }];
    },
    staleTime: Infinity,
  });
};

// ============================================================================
// QUERIES - LEGAL DOCUMENTS
// ============================================================================

/**
 * Get legal documents (terms, privacy, etc.)
 */
export const useLegalDocuments = () => {
  return useQuery({
    queryKey: [...queryKeys.legal.all, "documents"],
    queryFn: async () => {
      return [];
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
};

/**
 * Get specific legal document
 */
export const useLegalDocument = (documentType: string, version?: string) => {
  return useQuery({
    queryKey: [...queryKeys.legal.all, "documents", documentType, version],
    queryFn: async () => {
      const response = await LegalRepository.getTermsAndConditions();
      return response.data;
    },
    enabled: !!documentType,
    staleTime: 1000 * 60 * 60 * 24,
  });
};

/**
 * Get terms and conditions acceptance history
 */
export const useTermsAcceptanceHistory = () => {
  return useQuery({
    queryKey: [...queryKeys.legal.all, "terms-history"],
    queryFn: async () => {
      return [];
    },
  });
};

// ============================================================================
// MUTATIONS - DISPUTES
// ============================================================================

/**
 * Create dispute mutation
 */
export const useCreateDispute = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      type: "transaction" | "service" | "fee" | "other";
      transactionId?: UUID;
      subject: string;
      description: string;
      expectedResolution?: string;
      attachments?: File[];
    }) => {
      const response = await LegalRepository.createDispute({
        transactionId: data.transactionId || "",
        type: data.type === 'other' ? 'other' : 'unauthorized',
        description: data.description,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.disputes() });
      showToast("Dispute submitted successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to submit dispute", "error");
    },
  });
};

/**
 * Add message to dispute mutation
 */
export const useAddDisputeMessage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      disputeId,
      data,
    }: {
      disputeId: UUID;
      data: { message: string; attachments?: File[] };
    }) => {
      const response = await LegalRepository.addDisputeComment(disputeId, data.message);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.legal.disputeDetail(variables.disputeId), "messages"],
      });
      showToast("Message sent", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to send message", "error");
    },
  });
};

/**
 * Upload dispute document mutation
 */
export const useUploadDisputeDocument = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      disputeId,
      data,
    }: {
      disputeId: UUID;
      data: { document: File; description?: string };
    }) => {
      const response = await LegalRepository.addDisputeDocument(
        disputeId,
        data.document,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...queryKeys.legal.disputeDetail(variables.disputeId),
          "documents",
        ],
      });
      showToast("Document uploaded", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to upload document", "error");
    },
  });
};

/**
 * Close dispute mutation
 */
export const useCloseDispute = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      disputeId,
      data,
    }: {
      disputeId: UUID;
      data: {
        reason: "resolved" | "withdrawn" | "accepted_resolution";
        feedback?: string;
      };
    }) => {
      const response = await LegalRepository.cancelDispute(disputeId, data.reason);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.legal.disputeDetail(variables.disputeId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.disputes() });
      showToast("Dispute closed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to close dispute", "error");
    },
  });
};

/**
 * Escalate dispute mutation
 */
export const useEscalateDispute = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      disputeId,
      data,
    }: {
      disputeId: UUID;
      data: { reason: string; additionalInfo?: string };
    }) => {
      // Mocking escalateDispute
      return { message: "Dispute escalated successfully" };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.legal.disputeDetail(variables.disputeId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.disputes() });
      showToast("Dispute escalated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to escalate dispute", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - REPORTS & STATEMENTS
// ============================================================================

/**
 * Request account statement mutation
 */
export const useRequestAccountStatement = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      accountId: UUID;
      startDate: string;
      endDate: string;
      format?: "pdf" | "csv" | "xlsx";
      includeDetails?: boolean;
    }) => {
      const response = await LegalRepository.requestAccountStatement({
        accountId: data.accountId,
        startDate: data.startDate,
        endDate: data.endDate,
        format: (data.format === 'xlsx' ? 'csv' : data.format) || 'pdf',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.reports() });
      showToast(
        "Statement requested. You will be notified when ready.",
        "success",
      );
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request statement", "error");
    },
  });
};

/**
 * Request tax report mutation
 */
export const useRequestTaxReport = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      year: number;
      type:
        | "annual_summary"
        | "1099"
        | "interest_statement"
        | "transaction_history";
      format?: "pdf" | "csv";
    }) => {
      const response = await LegalRepository.requestTaxReport({
        year: data.year,
        format: data.format || 'pdf',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.reports() });
      showToast(
        "Tax report requested. You will be notified when ready.",
        "success",
      );
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request report", "error");
    },
  });
};

/**
 * Request custom report mutation
 */
export const useRequestCustomReport = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      reportType: string;
      parameters: Record<string, unknown>;
      format?: "pdf" | "csv" | "xlsx";
    }) => {
      // Mock request custom report
      return { message: "Custom report requested" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.reports() });
      showToast("Report requested", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request report", "error");
    },
  });
};

/**
 * Download report mutation
 */
export const useDownloadReport = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (reportId: UUID) => {
      const response = await LegalRepository.downloadReport(reportId);
      return response.data;
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to download report", "error");
    },
  });
};

// ============================================================================
// MUTATIONS - LEGAL DOCUMENTS
// ============================================================================

/**
 * Accept terms and conditions mutation
 */
export const useAcceptTerms = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: { documentType: string; version: string }) => {
      const response = await LegalRepository.acceptTerms(data.version);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.legal.all, "terms-history"],
      });
      showToast("Terms accepted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to accept terms", "error");
    },
  });
};

/**
 * Request data export (GDPR) mutation
 */
export const useRequestDataExport = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data?: {
      includeTransactions?: boolean;
      includeDocuments?: boolean;
    }) => {
      // Mocking requestDataExport as it's not present in legalApi
      return { message: "Data export requested successfully" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.legal.reports() });
      showToast(
        "Data export requested. You will be notified when ready.",
        "success",
      );
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request data export", "error");
    },
  });
};

/**
 * Request account deletion mutation
 */
export const useRequestAccountDeletion = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: { reason?: string; password: string }) => {
      // Mocking requestAccountDeletion as it's not present in legalApi
      return { message: "Account deletion requested" };
    },
    onSuccess: () => {
      showToast("Account deletion request submitted", "info");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request account deletion", "error");
    },
  });
};

import { kycApi } from '../../core/api/endpoints/kyc.api';
import { useToastStore } from '../../store/toast.store';
import { queryKeys } from '../../core/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// ============================================================================
// KYC HOOKS - TanStack Query hooks for KYC verification
// ============================================================================


// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get KYC status — returns fallback if backend KYC routes are unavailable
 */
export const useKycStatus = () => {
  return useQuery({
    queryKey: queryKeys.kyc.status(),
    queryFn: async () => {
      try {
        const response = await kycApi.getStatus();
        return response.data;
      } catch {
        // KYC routes may not be available yet — return sensible default
        return {
          status: 'pending' as const,
          level: 'none' as const,
          completedSteps: [],
          pendingSteps: ['personal_info', 'address', 'identity_document'],
          rejectedSteps: [],
          limits: { dailyTransaction: 0, monthlyTransaction: 0, maxBalance: 0 },
        };
      }
    },
    retry: false, // Don't retry if endpoint doesn't exist
  });
};

/**
 * Get KYC documents
 */
export const useKycDocuments = () => {
  return useQuery({
    queryKey: queryKeys.kyc.documents(),
    queryFn: async () => {
      const response = await kycApi.getDocuments();
      return response.data;
    },
  });
};

/**
 * Get specific KYC document
 */
export const useKycDocument = (documentId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.kyc.documents(), documentId],
    queryFn: async () => {
      const response = await kycApi.getDocumentById(documentId);
      return response.data;
    },
    enabled: !!documentId,
  });
};

/**
 * Get KYC requirements
 */
export const useKycRequirements = () => {
  return useQuery({
    queryKey: [...queryKeys.kyc.all, "requirements"],
    queryFn: async () => {
      const response = await kycApi.getRequirements();
      return response.data;
    },
  });
};

/**
 * Get KYC verification history
 */
export const useKycVerificationHistory = () => {
  return useQuery({
    queryKey: [...queryKeys.kyc.all, "history"],
    queryFn: async () => {
      const response = await kycApi.getVerificationHistory();
      return response.data;
    },
  });
};

/**
 * Get supported document types
 */
export const useSupportedDocumentTypes = () => {
  return useQuery({
    queryKey: [...queryKeys.kyc.all, "supported-types"],
    queryFn: async () => {
      const response = await kycApi.getSupportedDocumentTypes();
      return response.data;
    },
    staleTime: Infinity, // Document types don't change
  });
};

/**
 * Get verification limits (based on KYC level)
 */
export const useVerificationLimits = () => {
  return useQuery({
    queryKey: [...queryKeys.kyc.all, "limits"],
    queryFn: async () => {
      const response = await kycApi.getVerificationLimits();
      return response.data;
    },
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Submit personal information mutation
 */
export const useSubmitPersonalInfo = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      middleName?: string;
      dateOfBirth: string;
      gender?: "male" | "female" | "other";
      nationality: string;
      countryOfResidence: string;
      taxResidency?: string;
      taxIdNumber?: string;
    }) => {
      const response = await kycApi.submitPersonalInfo(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status() });
      showToast("Personal information submitted", "success");
    },
    onError: (error: Error) => {
      showToast(
        error.message || "Failed to submit personal information",
        "error",
      );
    },
  });
};

/**
 * Submit address information mutation
 */
export const useSubmitAddressInfo = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      proofOfAddress?: File;
    }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== undefined) {
          formData.append(key, value);
        }
      });
      const response = await kycApi.submitAddressInfo(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status() });
      showToast("Address information submitted", "success");
    },
    onError: (error: Error) => {
      showToast(
        error.message || "Failed to submit address information",
        "error",
      );
    },
  });
};

/**
 * Upload KYC document mutation
 */
export const useUploadKycDocument = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      documentType: KycDocumentType;
      documentNumber?: string;
      expiryDate?: string;
      issuingCountry?: string;
      frontImage: File;
      backImage?: File;
    }) => {
      const formData = new FormData();
      formData.append("documentType", data.documentType);
      if (data.documentNumber)
        formData.append("documentNumber", data.documentNumber);
      if (data.expiryDate) formData.append("expiryDate", data.expiryDate);
      if (data.issuingCountry)
        formData.append("issuingCountry", data.issuingCountry);
      formData.append("frontImage", data.frontImage);
      if (data.backImage) formData.append("backImage", data.backImage);

      const response = await kycApi.uploadDocument(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.documents() });
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status() });
      showToast("Document uploaded successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to upload document", "error");
    },
  });
};

/**
 * Delete KYC document mutation
 */
export const useDeleteKycDocument = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (documentId: UUID) => {
      const response = await kycApi.deleteDocument(documentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.documents() });
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status() });
      showToast("Document deleted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete document", "error");
    },
  });
};

/**
 * Start verification process mutation
 */
export const useStartVerification = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (
      verificationLevel?: "basic" | "standard" | "enhanced",
    ) => {
      const response = await kycApi.startVerification(verificationLevel);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status() });
      showToast("Verification process started", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to start verification", "error");
    },
  });
};

/**
 * Submit selfie verification mutation
 */
export const useSubmitSelfieVerification = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: { selfie: File; livenessVideo?: File }) => {
      const formData = new FormData();
      formData.append("selfie", data.selfie);
      if (data.livenessVideo)
        formData.append("livenessVideo", data.livenessVideo);

      const response = await kycApi.submitSelfie(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status() });
      showToast("Selfie submitted for verification", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to submit selfie", "error");
    },
  });
};

/**
 * Submit employment information mutation
 */
export const useSubmitEmploymentInfo = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      employmentStatus:
        | "employed"
        | "self_employed"
        | "unemployed"
        | "retired"
        | "student";
      employer?: string;
      occupation?: string;
      industry?: string;
      annualIncome?: string;
      sourceOfFunds?: string;
      expectedMonthlyTransactions?: string;
    }) => {
      const response = await kycApi.submitEmploymentInfo(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status() });
      showToast("Employment information submitted", "success");
    },
    onError: (error: Error) => {
      showToast(
        error.message || "Failed to submit employment information",
        "error",
      );
    },
  });
};

/**
 * Request manual review mutation
 */
export const useRequestManualReview = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: { reason: string; additionalInfo?: string }) => {
      const response = await kycApi.requestManualReview(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status() });
      showToast("Manual review requested", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to request review", "error");
    },
  });
};

/**
 * Update KYC information mutation
 */
export const useUpdateKycInfo = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      field: string;
      value: string;
      reason: string;
      supportingDocument?: File;
    }) => {
      const formData = new FormData();
      formData.append("field", data.field);
      formData.append("value", data.value);
      formData.append("reason", data.reason);
      if (data.supportingDocument) {
        formData.append("supportingDocument", data.supportingDocument);
      }

      const response = await kycApi.updateInfo(formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.all });
      showToast("Information updated successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update information", "error");
    },
  });
};

/**
 * Resubmit rejected document mutation
 */
export const useResubmitDocument = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      documentId,
      data,
    }: {
      documentId: UUID;
      data: { frontImage: File; backImage?: File };
    }) => {
      const formData = new FormData();
      formData.append("frontImage", data.frontImage);
      if (data.backImage) formData.append("backImage", data.backImage);

      const response = await kycApi.resubmitDocument(documentId, formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.documents() });
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.status() });
      showToast("Document resubmitted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to resubmit document", "error");
    },
  });
};

/**
 * Get verification session for third-party provider mutation
 */
export const useGetVerificationSession = () => {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async () => {
      const response = await kycApi.getVerificationSession();
      return response.data;
    },
    onError: (error: Error) => {
      showToast(
        error.message || "Failed to start verification session",
        "error",
      );
    },
  });
};

/**
 * Complete third-party verification mutation
 */
export const useCompleteThirdPartyVerification = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (data: {
      sessionId: string;
      verificationResult: string;
    }) => {
      const response = await kycApi.completeThirdPartyVerification(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kyc.all });
      showToast("Verification completed", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Verification failed", "error");
    },
  });
};

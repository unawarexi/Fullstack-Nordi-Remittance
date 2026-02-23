// ============================================================================
// ATTACHMENTS HOOKS - TanStack Query hooks for file management
// ============================================================================


// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

interface AttachmentFilters {
  category?: "document" | "image" | "other";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all attachments
 */
export const useAttachments = (filters?: AttachmentFilters) => {
  return useQuery({
    queryKey: queryKeys.attachments.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await attachmentsApi.getAll(filters);
      return response;
    },
  });
};

/**
 * Get attachment by ID
 */
export const useAttachment = (attachmentId: UUID) => {
  return useQuery({
    queryKey: queryKeys.attachments.detail(attachmentId),
    queryFn: async () => {
      const response = await attachmentsApi.getById(attachmentId);
      return response.data;
    },
    enabled: !!attachmentId,
  });
};

/**
 * Get download URL for attachment
 */
export const useAttachmentDownloadUrl = (attachmentId: UUID) => {
  return useQuery({
    queryKey: [...queryKeys.attachments.detail(attachmentId), "download"],
    queryFn: async () => {
      const response = await attachmentsApi.getDownloadUrl(attachmentId);
      return response.data;
    },
    enabled: !!attachmentId,
  });
};

/**
 * Get storage usage
 */
export const useStorageUsage = () => {
  return useQuery({
    queryKey: queryKeys.attachments.storage(),
    queryFn: async () => {
      const response = await attachmentsApi.getStorageUsage();
      return response.data;
    },
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Upload attachment mutation
 */
export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      file,
      category,
      metadata,
    }: {
      file: File;
      category?: "document" | "image" | "other";
      metadata?: Record<string, unknown>;
    }) => {
      const response = await attachmentsApi.upload(file, category, metadata);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.storage(),
      });
      showToast("File uploaded successfully", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to upload file", "error");
    },
  });
};

/**
 * Upload multiple attachments mutation
 */
export const useUploadMultipleAttachments = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      files,
      category,
    }: {
      files: File[];
      category?: "document" | "image" | "other";
    }) => {
      const response = await attachmentsApi.uploadMultiple(files, category);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.storage(),
      });
      showToast(`${data.length} files uploaded successfully`, "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to upload files", "error");
    },
  });
};

/**
 * Update attachment metadata mutation
 */
export const useUpdateAttachment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async ({
      attachmentId,
      data,
    }: {
      attachmentId: UUID;
      data: { metadata?: Record<string, unknown> };
    }) => {
      const response = await attachmentsApi.update(attachmentId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.detail(variables.attachmentId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.list() });
      showToast("Attachment updated", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to update attachment", "error");
    },
  });
};

/**
 * Delete attachment mutation
 */
export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (attachmentId: UUID) => {
      const response = await attachmentsApi.delete(attachmentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.storage(),
      });
      showToast("Attachment deleted", "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete attachment", "error");
    },
  });
};

/**
 * Delete multiple attachments mutation
 */
export const useDeleteMultipleAttachments = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: async (attachmentIds: UUID[]) => {
      const response = await attachmentsApi.deleteMultiple(attachmentIds);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attachments.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.attachments.storage(),
      });
      showToast(`${data.deleted} attachments deleted`, "success");
    },
    onError: (error: Error) => {
      showToast(error.message || "Failed to delete attachments", "error");
    },
  });
};

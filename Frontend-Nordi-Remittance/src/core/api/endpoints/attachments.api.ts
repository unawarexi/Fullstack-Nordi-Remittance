// ============================================================================
// ATTACHMENTS API - File upload and management endpoints
// ============================================================================

import apiClient, { ApiResponse, PaginatedResponse } from '../client';

const ATTACHMENTS_BASE = '/attachments';

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface AttachmentFilters {
  category?: 'document' | 'image' | 'other';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// ATTACHMENTS API FUNCTIONS
// ============================================================================

export const attachmentsApi = {
  // ==========================================================================
  // UPLOAD
  // ==========================================================================

  /**
   * Upload a file
   */
  upload: async (
    file: File,
    category?: 'document' | 'image' | 'other',
    metadata?: Record<string, unknown>
  ): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);
    if (metadata) formData.append('metadata', JSON.stringify(metadata));

    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      `${ATTACHMENTS_BASE}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Upload multiple files
   */
  uploadMultiple: async (
    files: File[],
    category?: 'document' | 'image' | 'other'
  ): Promise<ApiResponse<UploadResponse[]>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (category) formData.append('category', category);

    const response = await apiClient.post<ApiResponse<UploadResponse[]>>(
      `${ATTACHMENTS_BASE}/upload/multiple`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // ==========================================================================
  // RETRIEVAL
  // ==========================================================================

  /**
   * Get all attachments
   */
  getAll: async (params?: AttachmentFilters): Promise<PaginatedResponse<Attachment>> => {
    const response = await apiClient.get<PaginatedResponse<Attachment>>(
      ATTACHMENTS_BASE,
      { params }
    );
    return response.data;
  },

  /**
   * Get attachment by ID
   */
  getById: async (attachmentId: UUID): Promise<ApiResponse<Attachment>> => {
    const response = await apiClient.get<ApiResponse<Attachment>>(
      `${ATTACHMENTS_BASE}/${attachmentId}`
    );
    return response.data;
  },

  /**
   * Get download URL
   */
  getDownloadUrl: async (attachmentId: UUID): Promise<ApiResponse<{
    url: string;
    expiresAt: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      url: string;
      expiresAt: string;
    }>>(`${ATTACHMENTS_BASE}/${attachmentId}/download`);
    return response.data;
  },

  // ==========================================================================
  // MANAGEMENT
  // ==========================================================================

  /**
   * Update attachment metadata
   */
  update: async (
    attachmentId: UUID,
    data: { metadata?: Record<string, unknown> }
  ): Promise<ApiResponse<Attachment>> => {
    const response = await apiClient.patch<ApiResponse<Attachment>>(
      `${ATTACHMENTS_BASE}/${attachmentId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete attachment
   */
  delete: async (attachmentId: UUID): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `${ATTACHMENTS_BASE}/${attachmentId}`
    );
    return response.data;
  },

  /**
   * Delete multiple attachments
   */
  deleteMultiple: async (attachmentIds: UUID[]): Promise<ApiResponse<{
    deleted: number;
    failed: number;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      deleted: number;
      failed: number;
    }>>(`${ATTACHMENTS_BASE}/delete/multiple`, { ids: attachmentIds });
    return response.data;
  },

  // ==========================================================================
  // STORAGE
  // ==========================================================================

  /**
   * Get storage usage
   */
  getStorageUsage: async (): Promise<ApiResponse<{
    used: number;
    limit: number;
    percentage: number;
    byCategory: Record<string, number>;
    fileCount: number;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      used: number;
      limit: number;
      percentage: number;
      byCategory: Record<string, number>;
      fileCount: number;
    }>>(`${ATTACHMENTS_BASE}/storage`);
    return response.data;
  },
};

export default attachmentsApi;

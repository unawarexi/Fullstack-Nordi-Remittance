// ============================================================================
// ATTACHMENT TYPES — Mirrors AttachmentModel.ts
// ============================================================================

declare global {
  interface Attachment extends Timestamps {
    id: UUID;
    attachmentId: UUID;
    userId: UUID;
    user?: UUID;
    relatedEntity: string;
    relatedEntityId: string;
    filename: string;
    originalFilename: string;
    originalName?: string;
    fileType: string;
    mimeType?: string;
    fileSize: number;
    size?: number;
    fileExtension: string;
    fileUrl: string;
    url?: string;
    storagePath: string;
    storageProvider: 's3' | 'cloudinary' | 'azure_blob' | 'gcs' | 'local';
    category:
      | 'kyc' | 'proof_of_address' | 'income_document' | 'bank_statement'
      | 'dispute_evidence' | 'loan_document' | 'tax_document'
      | 'profile_picture' | 'signature' | 'document' | 'image' | 'other';
    isPublic: boolean;
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: ISO8601Date;
    tags?: string[];
    metadata?: Record<string, unknown>;
    expiresAt?: ISO8601Date;
    deletedAt?: ISO8601Date;
    isDeleted: boolean;
    uploadedBy: string;
    uploadedAt: ISO8601Date;
    lastAccessedAt?: ISO8601Date;
    accessCount: number;
  }

  interface UploadResponse {
    id: UUID;
    url: string;
    filename: string;
  }
}

export {};

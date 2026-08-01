import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../types/index.js";
import Attachments from "./attachments.model.js";
import Users from "../users/users.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../services/cloudinary.service.js";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
} from "../../core/helpers/response.helper.js";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../../core/errors/AppError.js";
import {
  allowedExtensions,
  extensionToMimeType,
} from "../../core/utils/extentions.js";
import * as path from "path";
import { emitToUser } from "../../services/websocket.service.js";
import { WS } from "../../core/constants/ws-events.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed categories matching the model enum
const ALLOWED_CATEGORIES = [
  "kyc",
  "proof_of_address",
  "income_document",
  "bank_statement",
  "dispute_evidence",
  "loan_document",
  "tax_document",
  "profile_picture",
  "signature",
  "other",
];

// ============================================================================
// UPLOAD ATTACHMENT
// ============================================================================

export async function uploadAttachment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const file = req.file;
    if (!file) throw new ValidationError("No file provided");

    const { category, description, entityType, entityId, isPublic } = req.body;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError("File size exceeds 10MB limit");
    }

    // Validate category
    const validCategory = ALLOWED_CATEGORIES.includes(category)
      ? category
      : "other";

    // Get file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Determine file type category based on extension
    let fileType = "other";
    if (allowedExtensions.images.includes(fileExtension)) fileType = "image";
    else if (allowedExtensions.documents.includes(fileExtension))
      fileType = "document";
    else if (allowedExtensions.videos.includes(fileExtension))
      fileType = "video";
    else if (allowedExtensions.audio.includes(fileExtension))
      fileType = "audio";
    else if (allowedExtensions.archives.includes(fileExtension))
      fileType = "archive";

    const extensionWithoutDot = fileExtension.slice(1);

    // Upload to Cloudinary - using file buffer
    const folder = `remit/${validCategory}/${req.user.userId}`;
    const uploadResult = await uploadToCloudinary(
      file.buffer,
      file.originalname,
      folder,
    );

    // Create attachment record matching the model schema
    const attachment = new Attachments({
      user: req.user.userId,
      relatedEntity: entityType || "user",
      relatedEntityId: entityId || req.user.userId,
      filename: file.filename || file.originalname,
      originalFilename: file.originalname,
      fileType,
      fileSize: file.size,
      fileExtension: extensionWithoutDot,
      fileUrl: uploadResult.url,
      storagePath: uploadResult.public_id,
      storageProvider: "cloudinary",
      category: validCategory,
      isPublic: isPublic === "true" || isPublic === true,
      tags: [],
      metadata: description ? { description } : {},
      uploadedBy: req.user.userId,
    });

    await attachment.save();

    emitToUser(req.user!.userId, WS.KYC.DOCUMENT_UPLOADED, {
      attachmentId: attachment.attachmentId || attachment._id,
      filename: attachment.filename,
      fileType: attachment.fileType,
      timestamp: new Date().toISOString(),
    });

    sendCreated(
      res,
      {
        attachment: {
          id: attachment._id,
          attachmentId: attachment.attachmentId,
          filename: attachment.filename,
          fileUrl: attachment.fileUrl,
          fileType: attachment.fileType,
          fileSize: attachment.fileSize,
        },
      },
      "File uploaded successfully",
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET USER ATTACHMENTS
// ============================================================================

export async function getAttachments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const filter: any = { user: req.user.userId, isDeleted: false };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.fileType) filter.fileType = req.query.fileType;
    if (req.query.entityType) filter.relatedEntity = req.query.entityType;
    if (req.query.entityId) filter.relatedEntityId = req.query.entityId;

    const [attachments, total] = await Promise.all([
      Attachments.find(filter)
        .select(
          "fileName fileType fileSize category status relatedEntityType relatedEntityId createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attachments.countDocuments(filter),
    ]);

    sendPaginated(res, attachments, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET ATTACHMENT BY ID
// ============================================================================

export async function getAttachmentById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const attachment = await Attachments.findById(id).lean();
    if (!attachment) throw new NotFoundError("Attachment not found");

    // Check access
    if (
      attachment.user.toString() !== req.user.userId &&
      !attachment.isPublic
    ) {
      throw new ForbiddenError("Access denied");
    }

    sendSuccess(res, { attachment });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DELETE ATTACHMENT
// ============================================================================

export async function deleteAttachment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;

    const attachment = await Attachments.findById(id);
    if (!attachment) throw new NotFoundError("Attachment not found");

    // Check ownership
    if (attachment.user?.toString() !== req.user.userId) {
      throw new ForbiddenError("Access denied");
    }

    // Delete from Cloudinary using storagePath (which stores public_id)
    if (attachment.storagePath) {
      await deleteFromCloudinary(String(attachment.storagePath));
    }

    // Soft delete instead of hard delete
    attachment.isDeleted = true;
    attachment.deletedAt = new Date();
    await attachment.save();

    sendSuccess(res, null, "Attachment deleted successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// UPDATE ATTACHMENT METADATA
// ============================================================================

export async function updateAttachment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { description, category, isPublic } = req.body;

    const attachment: any = await Attachments.findById(id);
    if (!attachment) throw new NotFoundError("Attachment not found");

    if (attachment.user.toString() !== req.user.userId) {
      throw new ForbiddenError("Access denied");
    }

    if (description !== undefined) attachment.description = description;
    if (category !== undefined) attachment.category = category;
    if (isPublic !== undefined) attachment.isPublic = isPublic;

    await attachment.save();

    sendSuccess(res, { attachment }, "Attachment updated");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// UPLOAD KYC DOCUMENT
// ============================================================================

export async function uploadKycDocument(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const file = req.file;
    if (!file) throw new ValidationError("No file provided");

    const { documentType } = req.body; // 'id_front' | 'id_back' | 'selfie' | 'proof_of_address' | 'passport'

    if (!documentType) throw new ValidationError("Document type required");

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError("File size exceeds 10MB limit");
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();

    // Only images and PDFs for KYC
    const isImage = allowedExtensions.images.includes(fileExtension);
    const isPdf = fileExtension === ".pdf";

    if (!isImage && !isPdf) {
      throw new ValidationError(
        "Only images and PDF files are allowed for KYC documents",
      );
    }

    const fileType = isImage ? "image" : "document";
    const extensionWithoutDot = fileExtension.slice(1);

    // Upload to Cloudinary
    const folder = `remit/kyc/${req.user.userId}`;
    const uploadResult = await uploadToCloudinary(
      file.buffer,
      file.originalname,
      folder,
    );

    // Map document type to allowed category
    const categoryMap: Record<string, string> = {
      id_front: "kyc",
      id_back: "kyc",
      selfie: "kyc",
      proof_of_address: "proof_of_address",
      passport: "kyc",
    };
    const category = categoryMap[documentType] || "kyc";

    // Create attachment matching model schema
    const attachment = new Attachments({
      user: req.user.userId,
      relatedEntity: "kyc",
      relatedEntityId: req.user.userId,
      filename: file.filename || file.originalname,
      originalFilename: file.originalname,
      fileType,
      fileSize: file.size,
      fileExtension: extensionWithoutDot,
      fileUrl: uploadResult.url,
      storagePath: uploadResult.public_id,
      storageProvider: "cloudinary",
      category,
      isPublic: false,
      tags: [documentType],
      metadata: {
        documentType,
        uploadedAt: new Date(),
      },
      uploadedBy: req.user.userId,
    });

    await attachment.save();

    // Update user KYC status
    const user = await Users.findById(req.user.userId);
    if (user) {
      // Access kycDocuments with type assertion
      const kycDocs = (user as any).kycDocuments || [];

      // Remove existing document of same type
      const filteredDocs = kycDocs.filter(
        (doc: any) => doc.documentType !== documentType,
      );

      filteredDocs.push({
        documentType,
        attachmentId: attachment._id,
        uploadedAt: new Date(),
        status: "pending",
      });

      (user as any).kycDocuments = filteredDocs;

      // Update KYC status if not already submitted
      if ((user as any).kycStatus === "not_submitted") {
        (user as any).kycStatus = "pending";
        (user as any).kycSubmittedAt = new Date();
      }

      await user.save();
    }

    emitToUser(req.user!.userId, WS.KYC.DOCUMENT_UPLOADED, {
      attachmentId: attachment.attachmentId || attachment._id,
      documentType,
      filename: attachment.filename,
      kycStatus: (user as any)?.kycStatus,
      timestamp: new Date().toISOString(),
    });

    sendCreated(
      res,
      {
        attachment: {
          id: attachment._id,
          attachmentId: attachment.attachmentId,
          documentType,
          filename: attachment.filename,
          uploadedAt: attachment.createdAt,
        },
      },
      "KYC document uploaded successfully",
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET KYC DOCUMENTS
// ============================================================================

export async function getKycDocuments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const documents = await Attachments.find({
      user: req.user.userId,
      category: "kyc",
    })
      .sort({ createdAt: -1 })
      .lean();

    sendSuccess(res, { documents });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GET ALL ATTACHMENTS
// ============================================================================

export async function getAllAttachments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.fileType) filter.fileType = req.query.fileType;

    const [attachments, total] = await Promise.all([
      Attachments.find(filter)
        .select(
          "fileName fileType fileSize category status user relatedEntityType relatedEntityId createdAt",
        )
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Attachments.countDocuments(filter),
    ]);

    sendPaginated(res, attachments, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GET USER KYC DOCUMENTS
// ============================================================================

export async function getUserKycDocuments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { userId } = req.params;

    const documents = await Attachments.find({
      user: userId,
      category: "kyc",
    })
      .select("fileName fileType fileSize category status metadata createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const user = await Users.findById(userId)
      .select("firstName lastName email kycStatus kycDocuments kycSubmittedAt")
      .lean();

    sendSuccess(res, { user, documents });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: REVIEW KYC DOCUMENT
// ============================================================================

export async function reviewKycDocument(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { id } = req.params;
    const { status, notes } = req.body; // status: 'approved' | 'rejected'

    const attachment = await Attachments.findById(id);
    if (!attachment) throw new NotFoundError("Document not found");

    // Update verification status using model fields
    attachment.isVerified = status === "approved";
    attachment.verifiedBy = req.user.userId;
    attachment.verifiedAt = new Date();
    if (attachment.metadata && typeof attachment.metadata === "object") {
      (attachment.metadata as any).reviewNotes = notes;
      (attachment.metadata as any).reviewStatus = status;
    } else {
      attachment.metadata = { reviewNotes: notes, reviewStatus: status };
    }
    await attachment.save();

    // Update user's KYC document status
    const user = await Users.findById(attachment.user);
    if (user) {
      const kycDocs = (user as any).kycDocuments;
      if (kycDocs && Array.isArray(kycDocs)) {
        const docIndex = kycDocs.findIndex(
          (doc: any) => doc.attachmentId?.toString() === id,
        );

        if (docIndex !== -1) {
          kycDocs[docIndex].status = status;
          kycDocs[docIndex].reviewedAt = new Date();
          kycDocs[docIndex].reviewNotes = notes;
        }

        // Check if all documents are reviewed
        const allReviewed = kycDocs.every(
          (doc: any) => doc.status === "approved" || doc.status === "rejected",
        );

        const allApproved = kycDocs.every(
          (doc: any) => doc.status === "approved",
        );

        if (allReviewed) {
          if (allApproved) {
            (user as any).kycStatus = "approved";
            (user as any).kycApprovedAt = new Date();
          } else {
            (user as any).kycStatus = "rejected";
          }
        }

        await user.save();
      }
    }

    sendSuccess(res, { attachment }, `Document ${status}`);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ATTACHMENT CATEGORIES
// ============================================================================

export async function getCategories(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    // Return predefined categories from the model enum
    const categories = ALLOWED_CATEGORIES.map((cat) => ({
      id: cat,
      name: cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      status: "active",
    }));

    sendSuccess(res, { categories });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  uploadAttachment,
  getAttachments,
  getAttachmentById,
  deleteAttachment,
  updateAttachment,
  uploadKycDocument,
  getKycDocuments,
  getAllAttachments,
  getUserKycDocuments,
  reviewKycDocument,
  getCategories,
};

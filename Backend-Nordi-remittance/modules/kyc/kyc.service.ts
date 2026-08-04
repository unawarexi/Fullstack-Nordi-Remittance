import Users from "../users/users.model.js";
import Attachments from "../attachments/attachments.model.js";
import { SecurityEvent } from "../auth/confirm.model.js";
import { AuditLogs, DataAccessLogs } from "../audit/audit.model.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../services/cloudinary.service.js";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../../core/errors/AppError.js";
import { queueTemplatedMail } from "../../services/workers.js";
import EmailContentGenerator from "../../core/mail/Mail-content.js";
import { emitToUser } from "../../services/websocket.service.js";
import { WS } from "../../core/constants/ws-events.js";
import {
  cacheKycStatus,
  getCachedKycStatus,
  invalidateKycCache,
  invalidateUserCache,
} from "../../services/redis.service.js";
import * as path from "path";

const emailGenerator = new EmailContentGenerator();

const DOCUMENT_TYPES = [
  "passport",
  "national_id",
  "drivers_license",
  "proof_of_address",
  "utility_bill",
  "bank_statement",
  "selfie",
  "tax_document",
] as const;

type DocumentType = (typeof DOCUMENT_TYPES)[number];

function computeKycLevel(user: any): "none" | "basic" | "enhanced" | "full" {
  const hasId = !!user.governmentId;
  const hasAddress = !!user.proofOfAddress;
  const hasSelfie = !!user.selfieWithId;
  const hasSignature = !!user.signature;

  if (hasId && hasAddress && hasSelfie && hasSignature) return "full";
  if (hasId && hasAddress && hasSelfie) return "enhanced";
  if (hasId || hasAddress) return "basic";
  return "none";
}

function computeSteps(user: any) {
  const steps = [
    {
      key: "personal_info",
      check: !!user.firstName && !!user.lastName && !!user.dateOfBirth,
    },
    {
      key: "address",
      check: !!user.homeAddress && !!user.city && !!user.country,
    },
    { key: "identity_document", check: !!user.governmentId },
    { key: "proof_of_address", check: !!user.proofOfAddress },
    { key: "selfie", check: !!user.selfieWithId },
    { key: "signature", check: !!user.signature },
  ];

  const completedSteps = steps.filter((s) => s.check).map((s) => s.key);
  const pendingSteps = steps.filter((s) => !s.check).map((s) => s.key);
  return { completedSteps, pendingSteps };
}

function limitsForLevel(level: string) {
  const tiers: Record<
    string,
    { dailyTransaction: number; monthlyTransaction: number; maxBalance: number }
  > = {
    none: { dailyTransaction: 0, monthlyTransaction: 0, maxBalance: 0 },
    basic: {
      dailyTransaction: 1_000,
      monthlyTransaction: 5_000,
      maxBalance: 10_000,
    },
    enhanced: {
      dailyTransaction: 10_000,
      monthlyTransaction: 50_000,
      maxBalance: 100_000,
    },
    full: {
      dailyTransaction: 50_000,
      monthlyTransaction: 250_000,
      maxBalance: 1_000_000,
    },
  };
  return tiers[level] || tiers.none;
}

export class KycService {
  static async getStatus(userId: string) {
    const cached = await getCachedKycStatus(userId);
    if (cached) {
      return { data: cached, cached: true };
    }

    const user = await Users.findById(userId)
      .select(
        "firstName lastName kycStatus governmentId proofOfAddress selfieWithId signature " +
          "homeAddress city country dateOfBirth idType idNumber idExpiryDate addressDocType",
      )
      .lean();

    if (!user) throw new NotFoundError("User not found");

    const level = computeKycLevel(user);
    const { completedSteps, pendingSteps } = computeSteps(user);
    const limits = limitsForLevel(level);

    const rejectedDocs = await Attachments.find({
      user: userId,
      category: "kyc",
      "metadata.reviewStatus": "rejected",
    })
      .select("metadata tags")
      .lean();

    const rejectedSteps = rejectedDocs.map((doc: any) => ({
      step: doc.tags?.[0] || "unknown",
      reason: doc.metadata?.reviewNotes || "Document rejected",
    }));

    const statusPayload = {
      status: (user as any).kycStatus || "pending",
      level,
      completedSteps,
      pendingSteps,
      rejectedSteps,
      limits,
    };

    await cacheKycStatus(userId, statusPayload);

    return { data: statusPayload, cached: false };
  }

  static async getRequirements(userId: string, requestedTarget?: string) {
    const user = await Users.findById(userId)
      .select(
        "kycStatus governmentId proofOfAddress selfieWithId signature " +
          "homeAddress city country firstName lastName dateOfBirth",
      )
      .lean();

    if (!user) throw new NotFoundError("User not found");

    const currentLevel = computeKycLevel(user);

    const levelOrder = ["none", "basic", "enhanced", "full"];
    const currentIdx = levelOrder.indexOf(currentLevel);
    const targetLevel =
      requestedTarget && levelOrder.includes(requestedTarget)
        ? requestedTarget
        : levelOrder[Math.min(currentIdx + 1, levelOrder.length - 1)];

    const allRequirements = [
      {
        step: "personal_info",
        name: "Personal Information",
        description: "Full name, date of birth, nationality",
        required: true,
        minLevel: "basic",
        check: !!user.firstName && !!user.lastName && !!(user as any).dateOfBirth,
      },
      {
        step: "address",
        name: "Residential Address",
        description: "Current home address with city and country",
        required: true,
        minLevel: "basic",
        check: !!(user as any).homeAddress && !!(user as any).city,
      },
      {
        step: "identity_document",
        name: "Government-Issued ID",
        description: "Passport, national ID, or driver's license",
        required: true,
        minLevel: "basic",
        check: !!(user as any).governmentId,
      },
      {
        step: "proof_of_address",
        name: "Proof of Address",
        description: "Utility bill or bank statement (issued within 3 months)",
        required: true,
        minLevel: "enhanced",
        check: !!(user as any).proofOfAddress,
      },
      {
        step: "selfie",
        name: "Selfie with ID",
        description: "A clear selfie holding your government ID",
        required: true,
        minLevel: "enhanced",
        check: !!(user as any).selfieWithId,
      },
      {
        step: "signature",
        name: "Signature Specimen",
        description: "Your signature for document verification",
        required: false,
        minLevel: "full",
        check: !!(user as any).signature,
      },
    ];

    const requirements = allRequirements
      .filter(
        (r) =>
          levelOrder.indexOf(r.minLevel) <= levelOrder.indexOf(targetLevel),
      )
      .map((r) => ({
        step: r.step,
        name: r.name,
        description: r.description,
        required: r.required,
        status: r.check ? ("approved" as const) : ("pending" as const),
      }));

    const benefitMap: Record<string, string[]> = {
      basic: [
        "Send up to $1,000/day",
        "Receive money",
        "Basic account features",
      ],
      enhanced: [
        "Send up to $10,000/day",
        "International transfers",
        "Loan applications",
      ],
      full: [
        "Send up to $50,000/day",
        "Premium features",
        "Investment access",
        "Priority support",
      ],
    };

    return {
      currentLevel,
      targetLevel,
      requirements,
      benefits: benefitMap[targetLevel] || [],
      newLimits: limitsForLevel(targetLevel),
    };
  }

  static async getDocuments(userId: string) {
    const documents = await Attachments.find({
      user: userId,
      category: { $in: ["kyc", "proof_of_address"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    const user = await Users.findById(userId)
      .select(
        "governmentId proofOfAddress selfieWithId signature idType idNumber idExpiryDate addressDocType profilePicture",
      )
      .lean();

    const profileDocuments = [];
    if (user) {
      if ((user as any).governmentId) {
        profileDocuments.push({
          id: "profile_governmentId",
          type: "government_id",
          documentType: (user as any).idType || "government_id",
          documentNumber: (user as any).idNumber,
          expiryDate: (user as any).idExpiryDate,
          frontImageUrl: (user as any).governmentId,
          status: "submitted",
          source: "profile",
        });
      }
      if ((user as any).proofOfAddress) {
        profileDocuments.push({
          id: "profile_proofOfAddress",
          type: "proof_of_address",
          documentType: (user as any).addressDocType || "proof_of_address",
          frontImageUrl: (user as any).proofOfAddress,
          status: "submitted",
          source: "profile",
        });
      }
      if ((user as any).selfieWithId) {
        profileDocuments.push({
          id: "profile_selfieWithId",
          type: "selfie",
          frontImageUrl: (user as any).selfieWithId,
          status: "submitted",
          source: "profile",
        });
      }
      if ((user as any).signature) {
        profileDocuments.push({
          id: "profile_signature",
          type: "signature",
          frontImageUrl: (user as any).signature,
          status: "submitted",
          source: "profile",
        });
      }
    }

    return {
      documents: [
        ...documents.map((doc: any) => ({
          id: doc._id,
          type: doc.tags?.[0] || doc.category,
          documentType: doc.metadata?.documentType || doc.category,
          documentNumber: doc.metadata?.documentNumber,
          expiryDate: doc.metadata?.expiryDate,
          frontImageUrl: doc.fileUrl,
          status: doc.metadata?.reviewStatus || "pending",
          rejectionReason: doc.metadata?.reviewNotes,
          uploadedAt: doc.createdAt,
          source: "attachment",
        })),
        ...profileDocuments,
      ],
    };
  }

  static async getDocumentById(userId: string, documentId: string) {
    const document = await Attachments.findOne({
      _id: documentId,
      user: userId,
      category: { $in: ["kyc", "proof_of_address"] },
    }).lean();

    if (!document) throw new NotFoundError("Document not found");

    return {
      document: {
        id: document._id,
        type: (document as any).tags?.[0] || document.category,
        documentType:
          (document as any).metadata?.documentType || document.category,
        documentNumber: (document as any).metadata?.documentNumber,
        expiryDate: (document as any).metadata?.expiryDate,
        frontImageUrl: document.fileUrl,
        status: (document as any).metadata?.reviewStatus || "pending",
        rejectionReason: (document as any).metadata?.reviewNotes,
        uploadedAt: document.createdAt,
      },
    };
  }

  static async uploadIdentityDocument(
    userId: string,
    frontImage: Express.Multer.File,
    backImage: Express.Multer.File | undefined,
    data: {
      type: string;
      documentNumber?: string;
      expiryDate?: string;
      issuingCountry?: string;
    }
  ) {
    if (!frontImage) throw new ValidationError("Front image is required");

    const { type, documentNumber, expiryDate, issuingCountry } = data;

    const validTypes = ["passport", "national_id", "drivers_license"];
    if (!type || !validTypes.includes(type)) {
      throw new ValidationError(
        "Invalid document type. Must be: passport, national_id, or drivers_license",
      );
    }

    const folder = `remit/kyc/${userId}`;
    const frontResult = await uploadToCloudinary(
      frontImage.buffer,
      frontImage.originalname,
      folder,
    );

    let backResult = null;
    if (backImage) {
      backResult = await uploadToCloudinary(
        backImage.buffer,
        backImage.originalname,
        folder,
      );
    }

    const fileExtension = path
      .extname(frontImage.originalname)
      .toLowerCase()
      .slice(1);
    const attachment = new Attachments({
      user: userId,
      relatedEntity: "kyc",
      relatedEntityId: userId,
      filename: frontImage.originalname,
      originalFilename: frontImage.originalname,
      fileType: "image",
      fileSize: frontImage.size,
      fileExtension,
      fileUrl: frontResult.url,
      storagePath: frontResult.public_id,
      storageProvider: "cloudinary",
      category: "kyc",
      isPublic: false,
      tags: [type],
      metadata: {
        documentType: type,
        documentNumber,
        expiryDate,
        issuingCountry,
        backImageUrl: backResult?.url || null,
        backImagePublicId: backResult?.public_id || null,
        uploadedAt: new Date(),
      },
      uploadedBy: userId,
    });
    await attachment.save();

    const updateFields: any = {
      governmentId: frontResult.url,
      idType: type,
    };
    if (documentNumber) updateFields.idNumber = documentNumber;
    if (expiryDate) updateFields.idExpiryDate = new Date(expiryDate);

    await Users.findByIdAndUpdate(userId, updateFields);

    await Promise.all([
      invalidateKycCache(userId),
      invalidateUserCache(userId),
    ]);

    emitToUser(userId, WS.KYC.DOCUMENT_UPLOADED, {
      documentType: type,
      attachmentId: attachment._id,
      timestamp: new Date().toISOString(),
    });

    return {
      document: {
        id: attachment._id,
        type,
        documentNumber,
        expiryDate,
        frontImageUrl: frontResult.url,
        backImageUrl: backResult?.url || null,
        status: "pending",
        uploadedAt: attachment.createdAt,
      },
    };
  }

  static async uploadProofOfAddress(
    userId: string,
    file: Express.Multer.File,
    data: { type: string; issueDate?: string }
  ) {
    if (!file) throw new ValidationError("Document file is required");

    const { type, issueDate } = data;
    const validTypes = ["utility_bill", "bank_statement"];
    if (!type || !validTypes.includes(type)) {
      throw new ValidationError(
        "Invalid document type. Must be: utility_bill or bank_statement",
      );
    }

    const folder = `remit/kyc/${userId}`;
    const uploadResult = await uploadToCloudinary(
      file.buffer,
      file.originalname,
      folder,
    );

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .slice(1);
    const attachment = new Attachments({
      user: userId,
      relatedEntity: "kyc",
      relatedEntityId: userId,
      filename: file.originalname,
      originalFilename: file.originalname,
      fileType: fileExtension === "pdf" ? "document" : "image",
      fileSize: file.size,
      fileExtension,
      fileUrl: uploadResult.url,
      storagePath: uploadResult.public_id,
      storageProvider: "cloudinary",
      category: "proof_of_address",
      isPublic: false,
      tags: ["proof_of_address", type],
      metadata: {
        documentType: type,
        issueDate,
        uploadedAt: new Date(),
      },
      uploadedBy: userId,
    });
    await attachment.save();

    await Users.findByIdAndUpdate(userId, {
      proofOfAddress: uploadResult.url,
      addressDocType: type,
    });

    await Promise.all([
      invalidateKycCache(userId),
      invalidateUserCache(userId),
    ]);

    emitToUser(userId, WS.KYC.DOCUMENT_UPLOADED, {
      documentType: "proof_of_address",
      attachmentId: attachment._id,
      timestamp: new Date().toISOString(),
    });

    return {
      document: {
        id: attachment._id,
        type: "proof_of_address",
        documentType: type,
        frontImageUrl: uploadResult.url,
        status: "pending",
        uploadedAt: attachment.createdAt,
      },
    };
  }

  static async uploadSelfie(userId: string, file: Express.Multer.File) {
    if (!file) throw new ValidationError("Selfie image is required");

    const folder = `remit/kyc/${userId}`;
    const uploadResult = await uploadToCloudinary(
      file.buffer,
      file.originalname,
      folder,
    );

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .slice(1);
    const attachment = new Attachments({
      user: userId,
      relatedEntity: "kyc",
      relatedEntityId: userId,
      filename: file.originalname,
      originalFilename: file.originalname,
      fileType: "image",
      fileSize: file.size,
      fileExtension,
      fileUrl: uploadResult.url,
      storagePath: uploadResult.public_id,
      storageProvider: "cloudinary",
      category: "kyc",
      isPublic: false,
      tags: ["selfie"],
      metadata: {
        documentType: "selfie",
        uploadedAt: new Date(),
      },
      uploadedBy: userId,
    });
    await attachment.save();

    await Users.findByIdAndUpdate(userId, {
      selfieWithId: uploadResult.url,
    });

    await Promise.all([
      invalidateKycCache(userId),
      invalidateUserCache(userId),
    ]);

    emitToUser(userId, WS.KYC.DOCUMENT_UPLOADED, {
      documentType: "selfie",
      attachmentId: attachment._id,
      timestamp: new Date().toISOString(),
    });

    return {
      document: {
        id: attachment._id,
        type: "selfie",
        frontImageUrl: uploadResult.url,
        status: "pending",
        uploadedAt: attachment.createdAt,
      },
    };
  }

  static async deleteDocument(userId: string, documentId: string) {
    const attachment = await Attachments.findOne({
      _id: documentId,
      user: userId,
      category: { $in: ["kyc", "proof_of_address"] },
    });

    if (!attachment) throw new NotFoundError("Document not found");

    if (
      (attachment as any).metadata?.reviewStatus === "approved" ||
      attachment.isVerified
    ) {
      throw new ForbiddenError("Cannot delete an approved document");
    }

    if (attachment.storagePath) {
      await deleteFromCloudinary(attachment.storagePath as string).catch(
        () => {},
      );
    }
    if ((attachment as any).metadata?.backImagePublicId) {
      await deleteFromCloudinary(
        (attachment as any).metadata.backImagePublicId,
      ).catch(() => {});
    }

    const docType =
      (attachment as any).tags?.[0] ||
      (attachment as any).metadata?.documentType;
    const clearFields: any = {};
    if (["passport", "national_id", "drivers_license"].includes(docType)) {
      clearFields.governmentId = null;
    } else if (
      ["proof_of_address", "utility_bill", "bank_statement"].includes(docType)
    ) {
      clearFields.proofOfAddress = null;
    } else if (docType === "selfie") {
      clearFields.selfieWithId = null;
    }

    if (Object.keys(clearFields).length > 0) {
      await Users.findByIdAndUpdate(userId, clearFields);
    }

    attachment.isDeleted = true;
    (attachment as any).deletedAt = new Date();
    await attachment.save();

    await Promise.all([
      invalidateKycCache(userId),
      invalidateUserCache(userId),
    ]);

    return { documentId };
  }

  static async submitVerification(
    userId: string,
    reqContext: { ip?: string; userAgent?: string; requestId?: string }
  ) {
    const user = await Users.findById(userId)
      .select(
        "firstName lastName email kycStatus governmentId proofOfAddress selfieWithId",
      )
      .lean();

    if (!user) throw new NotFoundError("User not found");

    if (!(user as any).governmentId) {
      throw new ValidationError(
        "You must upload a government ID before submitting for verification",
      );
    }

    const currentStatus = (user as any).kycStatus;
    if (currentStatus === "approved") {
      throw new ValidationError("Your KYC is already approved");
    }

    await Users.findByIdAndUpdate(userId, {
      kycStatus: "in_review",
      kycSubmittedAt: new Date(),
    });

    await Promise.all([
      invalidateKycCache(userId),
      invalidateUserCache(userId),
    ]);

    const emailContent = emailGenerator.kycStatusEmail({
      firstName: user.firstName as string,
      status: "pending",
      notes:
        "Your KYC documents have been submitted for review. We will notify you once the review is complete.",
      userId: userId,
    });
    await queueTemplatedMail(user.email as string, emailContent).catch(() => {});

    emitToUser(userId, WS.KYC.STATUS_UPDATED, {
      status: "in_review",
      message: "Documents submitted for review",
      timestamp: new Date().toISOString(),
    });

    await AuditLogs.create({
      eventType: "compliance",
      action: "kyc_submitted",
      actor: userId,
      actorType: "user",
      resource: "kyc",
      resourceId: userId,
      changes: {
        before: { kycStatus: currentStatus },
        after: { kycStatus: "in_review" },
      },
      ipAddress: reqContext.ip,
      userAgent: reqContext.userAgent,
      severity: "info",
      status: "success",
      metadata: { requestId: reqContext.requestId },
    }).catch(() => {});

    return {
      verificationId: userId,
      status: "in_review",
      message: "Your documents have been submitted for verification",
    };
  }

  static async getVerificationStatus(userId: string) {
    const user = await Users.findById(userId)
      .select(
        "kycStatus governmentId proofOfAddress selfieWithId signature " +
          "firstName lastName kycApprovedAt kycRejectedAt kycRejectionReason",
      )
      .lean();

    if (!user) throw new NotFoundError("User not found");

    const level = computeKycLevel(user);
    const { completedSteps } = computeSteps(user);

    const statusMap: Record<string, string> = {
      pending: "pending",
      in_review: "processing",
      approved: "completed",
      rejected: "failed",
      expired: "failed",
    };

    const steps = [
      {
        name: "Document Upload",
        status: completedSteps.includes("identity_document")
          ? "completed"
          : "pending",
      },
      {
        name: "Document Review",
        status:
          (user as any).kycStatus === "approved"
            ? "completed"
            : (user as any).kycStatus === "in_review"
              ? "processing"
              : "pending",
      },
      {
        name: "Identity Verification",
        status:
          (user as any).kycStatus === "approved"
            ? "completed"
            : (user as any).kycStatus === "rejected"
              ? "failed"
              : "pending",
        message:
          (user as any).kycStatus === "rejected"
            ? (user as any).kycRejectionReason
            : undefined,
      },
    ];

    const result: any = {
      id: userId,
      status: statusMap[(user as any).kycStatus] || "pending",
      steps,
    };

    if ((user as any).kycStatus === "approved") {
      result.completedAt = (user as any).kycApprovedAt;
      result.result = { level, issues: [] };
    } else if ((user as any).kycStatus === "rejected") {
      result.result = {
        level,
        issues: [(user as any).kycRejectionReason || "Verification failed"],
      };
    }

    return result;
  }

  static async requestReverification(
    userId: string,
    reason: string,
    reqContext: { ip?: string; userAgent?: string; requestId?: string }
  ) {
    const user = await Users.findById(userId)
      .select("firstName lastName email kycStatus")
      .lean();

    if (!user) throw new NotFoundError("User not found");

    const kycStatus = (user as any).kycStatus;
    if (kycStatus !== "rejected" && kycStatus !== "expired") {
      throw new ValidationError(
        "Re-verification can only be requested for rejected or expired KYC",
      );
    }

    await Users.findByIdAndUpdate(userId, {
      kycStatus: "pending",
      kycRejectionReason: null,
    });

    await Promise.all([
      invalidateKycCache(userId),
      invalidateUserCache(userId),
    ]);

    const emailContent = emailGenerator.kycStatusEmail({
      firstName: user.firstName as string,
      status: "pending",
      notes:
        "Your re-verification request has been accepted. Please upload updated documents.",
      userId: userId,
    });
    await queueTemplatedMail(user.email as string, emailContent).catch(() => {});

    emitToUser(userId, WS.KYC.STATUS_UPDATED, {
      status: "pending",
      message: "Re-verification request accepted",
      timestamp: new Date().toISOString(),
    });

    await AuditLogs.create({
      eventType: "compliance",
      action: "kyc_reverification_requested",
      actor: userId,
      actorType: "user",
      resource: "kyc",
      resourceId: userId,
      changes: { before: { kycStatus }, after: { kycStatus: "pending" } },
      ipAddress: reqContext.ip,
      userAgent: reqContext.userAgent,
      severity: "info",
      status: "success",
      metadata: { reason, requestId: reqContext.requestId },
    }).catch(() => {});

    return { message: "Re-verification request submitted" };
  }

  static async getAdminPendingReviews(
    page: number,
    limit: number,
    statusFilter: string
  ) {
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (statusFilter === "all") {
      filter.kycStatus = { $in: ["pending", "in_review", "rejected"] };
    } else {
      filter.kycStatus = statusFilter;
    }

    const [users, total] = await Promise.all([
      Users.find(filter)
        .select(
          "firstName lastName email kycStatus profilePicture governmentId proofOfAddress selfieWithId signature createdAt kycSubmittedAt",
        )
        .sort({ kycSubmittedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Users.countDocuments(filter),
    ]);

    const usersWithLevel = users.map((u: any) => ({
      id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      kycStatus: u.kycStatus,
      kycLevel: computeKycLevel(u),
      hasGovernmentId: !!u.governmentId,
      hasProofOfAddress: !!u.proofOfAddress,
      hasSelfie: !!u.selfieWithId,
      hasSignature: !!u.signature,
      submittedAt: u.kycSubmittedAt,
      createdAt: u.createdAt,
    }));

    return { users: usersWithLevel, total };
  }

  static async getAdminUserKyc(
    adminId: string,
    targetUserId: string,
    reqContext: { ip?: string; userAgent?: string }
  ) {
    const user = await Users.findById(targetUserId)
      .select(
        "firstName lastName email kycStatus governmentId proofOfAddress selfieWithId signature " +
          "profilePicture idType idNumber idExpiryDate addressDocType homeAddress city stateProvince " +
          "zipCode country dateOfBirth nationality gender kycNotes kycSubmittedAt kycApprovedAt " +
          "kycRejectedAt kycRejectionReason createdAt",
      )
      .lean();

    if (!user) throw new NotFoundError("User not found");

    const documents = await Attachments.find({
      user: targetUserId,
      category: { $in: ["kyc", "proof_of_address"] },
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();

    const level = computeKycLevel(user);
    const { completedSteps, pendingSteps } = computeSteps(user);

    await DataAccessLogs.create({
      accessor: adminId,
      accessorType: "admin",
      dataOwner: targetUserId,
      dataType: "kyc",
      accessReason: "KYC review",
      accessMethod: "view",
      dataFields: [
        "governmentId",
        "proofOfAddress",
        "selfieWithId",
        "signature",
        "idNumber",
      ],
      ipAddress: reqContext.ip,
      userAgent: reqContext.userAgent,
      consentObtained: true,
    }).catch(() => {});

    return {
      user: {
        id: (user as any)._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: (user as any).dateOfBirth,
        nationality: (user as any).nationality,
        gender: (user as any).gender,
        address: {
          street: (user as any).homeAddress,
          city: (user as any).city,
          state: (user as any).stateProvince,
          postalCode: (user as any).zipCode,
          country: (user as any).country,
        },
      },
      kyc: {
        status: (user as any).kycStatus,
        level,
        completedSteps,
        pendingSteps,
        notes: (user as any).kycNotes,
        submittedAt: (user as any).kycSubmittedAt,
        approvedAt: (user as any).kycApprovedAt,
        rejectedAt: (user as any).kycRejectedAt,
        rejectionReason: (user as any).kycRejectionReason,
      },
      identity: {
        idType: (user as any).idType,
        idNumber: (user as any).idNumber,
        idExpiryDate: (user as any).idExpiryDate,
        governmentIdUrl: (user as any).governmentId,
        addressDocType: (user as any).addressDocType,
        proofOfAddressUrl: (user as any).proofOfAddress,
        selfieUrl: (user as any).selfieWithId,
        signatureUrl: (user as any).signature,
      },
      documents: documents.map((doc: any) => ({
        id: doc._id,
        type: doc.tags?.[0] || doc.category,
        fileUrl: doc.fileUrl,
        status: doc.metadata?.reviewStatus || "pending",
        reviewNotes: doc.metadata?.reviewNotes,
        uploadedAt: doc.createdAt,
        reviewedAt: doc.verifiedAt,
        reviewedBy: doc.verifiedBy,
      })),
    };
  }

  static async adminReviewKyc(
    adminId: string,
    targetUserId: string,
    status: string,
    notes: string,
    reqContext: { ip?: string; userAgent?: string; requestId?: string }
  ) {
    const validStatuses = ["approved", "rejected", "pending"];
    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError(
        "Invalid status. Must be: approved, rejected, or pending",
      );
    }

    const user = await Users.findById(targetUserId)
      .select("firstName lastName email kycStatus")
      .lean();

    if (!user) throw new NotFoundError("User not found");

    const previousStatus = (user as any).kycStatus;

    const updateFields: any = {
      kycStatus: status,
      kycNotes: notes || null,
    };

    if (status === "approved") {
      updateFields.kycApprovedAt = new Date();
      updateFields.kycRejectionReason = null;
    } else if (status === "rejected") {
      updateFields.kycRejectedAt = new Date();
      updateFields.kycRejectionReason = notes || "KYC rejected by admin";
    }

    await Users.findByIdAndUpdate(targetUserId, updateFields);

    if (status === "approved") {
      await Attachments.updateMany(
        {
          user: targetUserId,
          category: { $in: ["kyc", "proof_of_address"] },
          isDeleted: { $ne: true },
        },
        {
          isVerified: true,
          verifiedBy: adminId,
          verifiedAt: new Date(),
          $set: {
            "metadata.reviewStatus": "approved",
            "metadata.reviewNotes": notes || "Approved by admin",
          },
        },
      );
    }

    await Promise.all([
      invalidateKycCache(targetUserId),
      invalidateUserCache(targetUserId),
    ]);

    await SecurityEvent.create({
      userId: targetUserId,
      type: "kyc_status_changed",
      ipAddress: reqContext.ip,
      userAgent: reqContext.userAgent,
      metadata: {
        previousStatus,
        newStatus: status,
        changedBy: adminId,
        notes,
      },
      createdAt: new Date(),
    }).catch(() => {});

    await AuditLogs.create({
      eventType: "compliance",
      action: `kyc_${status}`,
      actor: adminId,
      actorType: "admin",
      resource: "kyc",
      resourceId: targetUserId,
      changes: {
        before: { kycStatus: previousStatus },
        after: { kycStatus: status },
      },
      ipAddress: reqContext.ip,
      userAgent: reqContext.userAgent,
      severity: status === "rejected" ? "warning" : "info",
      status: "success",
      metadata: { notes, requestId: reqContext.requestId },
    }).catch(() => {});

    const kycEmailStatus =
      status === "approved"
        ? "approved"
        : status === "rejected"
          ? "rejected"
          : "pending";
    const emailContent = emailGenerator.kycStatusEmail({
      firstName: user.firstName as string,
      status: kycEmailStatus as "approved" | "rejected" | "pending",
      notes:
        status === "rejected"
          ? notes
          : status === "approved"
            ? "Your identity has been verified. You now have full access."
            : undefined,
      userId: targetUserId,
    });
    await queueTemplatedMail(user.email as string, emailContent).catch(() => {});

    emitToUser(targetUserId, WS.KYC.STATUS_UPDATED, {
      type: "kyc_status_changed",
      data: {
        newStatus: status,
        previousStatus,
        notes,
        reviewedBy: adminId,
      },
      timestamp: new Date().toISOString(),
    });

    emitToUser(targetUserId, WS.KYC.DOCUMENT_REVIEWED, {
      status,
      notes,
      reviewedBy: adminId,
      timestamp: new Date().toISOString(),
    });

    return {
      userId: targetUserId,
      previousStatus,
      newStatus: status,
      notes,
    };
  }

  static async getAdminKycStats() {
    const [statusCounts, recentSubmissions] = await Promise.all([
      Users.aggregate([{ $group: { _id: "$kycStatus", count: { $sum: 1 } } }]),
      Users.find({ kycStatus: "in_review" })
        .select("firstName lastName email kycSubmittedAt")
        .sort({ kycSubmittedAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const stats: Record<string, number> = {
      pending: 0,
      in_review: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
      total: 0,
    };

    statusCounts.forEach((s: any) => {
      if (s._id) {
        stats[s._id] = s.count;
        stats.total += s.count;
      }
    });

    return {
      stats,
      recentSubmissions: recentSubmissions.map((u: any) => ({
        id: u._id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        submittedAt: u.kycSubmittedAt,
      })),
    };
  }
}

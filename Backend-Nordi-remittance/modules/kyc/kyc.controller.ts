// ============================================================================
// KYC CONTROLLER — Know Your Customer verification endpoints
//
// User endpoints:    status, requirements, documents CRUD, submit verification
// Admin endpoints:   review, approve/reject, pending queue, user KYC detail
//
// All admin-only mutations (approve/reject/complete) send email + WS events.
// Document storage delegates to the existing Attachment model + Cloudinary.
// ============================================================================

import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../core/helpers/response.helper.js';
import { UnauthorizedError } from '../../core/errors/AppError.js';
import { KycService } from './kyc.service.js';

// ============================================================================
// USER: GET KYC STATUS
// GET /kyc/status
// ============================================================================

export async function getStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const result = await KycService.getStatus(req.user.userId);
    sendSuccess(
      res,
      result.data,
      result.cached ? 'KYC status retrieved (cached)' : 'KYC status retrieved',
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER: GET KYC REQUIREMENTS
// GET /kyc/requirements?targetLevel=enhanced
// ============================================================================

export async function getRequirements(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const targetLevel = req.query.targetLevel as string | undefined;
    const result = await KycService.getRequirements(req.user.userId, targetLevel);

    sendSuccess(res, result, 'KYC requirements retrieved');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER: GET KYC DOCUMENTS
// GET /kyc/documents
// ============================================================================

export async function getDocuments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const result = await KycService.getDocuments(req.user.userId);
    sendSuccess(res, result, 'KYC documents retrieved');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER: GET DOCUMENT BY ID
// GET /kyc/documents/:documentId
// ============================================================================

export async function getDocumentById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { documentId } = req.params;
    const result = await KycService.getDocumentById(req.user.userId, documentId as string);

    sendSuccess(res, result, 'Document retrieved');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER: UPLOAD IDENTITY DOCUMENT
// POST /kyc/documents/identity
// ============================================================================

export async function uploadIdentityDocument(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const frontImage = files?.frontImage?.[0] || (req.file as Express.Multer.File | undefined);
    const backImage = files?.backImage?.[0];

    const result = await KycService.uploadIdentityDocument(
      req.user.userId,
      frontImage as Express.Multer.File,
      backImage,
      req.body,
    );

    sendCreated(res, result, 'Identity document uploaded successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER: UPLOAD PROOF OF ADDRESS
// POST /kyc/documents/address
// ============================================================================

export async function uploadProofOfAddress(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const result = await KycService.uploadProofOfAddress(
      req.user.userId,
      req.file as Express.Multer.File,
      req.body,
    );

    sendCreated(res, result, 'Proof of address uploaded successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER: UPLOAD SELFIE
// POST /kyc/documents/selfie
// ============================================================================

export async function uploadSelfie(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const result = await KycService.uploadSelfie(req.user.userId, req.file as Express.Multer.File);

    sendCreated(res, result, 'Selfie uploaded successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER: DELETE DOCUMENT
// DELETE /kyc/documents/:documentId
// ============================================================================

export async function deleteDocument(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { documentId } = req.params;
    const result = await KycService.deleteDocument(req.user.userId, documentId as string);

    sendSuccess(res, result, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER: SUBMIT FOR VERIFICATION
// POST /kyc/verify
// ============================================================================

export async function submitVerification(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const result = await KycService.submitVerification(req.user.userId, {
      ip: req.clientIp,
      userAgent: req.headers['user-agent'] as string,
      requestId: req.requestId,
    });

    sendSuccess(res, result, 'Verification submitted');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER: GET VERIFICATION STATUS
// GET /kyc/verify/:verificationId
// ============================================================================

export async function getVerificationStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const result = await KycService.getVerificationStatus(req.user.userId);
    sendSuccess(res, result, 'Verification status retrieved');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER: REQUEST RE-VERIFICATION
// POST /kyc/reverify
// ============================================================================

export async function requestReverification(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { reason } = req.body;
    const result = await KycService.requestReverification(req.user.userId, reason, {
      ip: req.clientIp,
      userAgent: req.headers['user-agent'] as string,
      requestId: req.requestId,
    });

    sendSuccess(res, result, 'Re-verification requested');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GET ALL PENDING KYC REVIEWS
// GET /kyc/admin/pending
// ============================================================================

export async function getAdminPendingReviews(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const statusFilter = (req.query.status as string) || 'in_review';

    const result = await KycService.getAdminPendingReviews(page, limit, statusFilter);

    sendPaginated(
      res,
      result.users,
      { page, limit, total: result.total },
      'Pending KYC reviews retrieved',
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GET USER KYC DETAIL
// GET /kyc/admin/users/:userId
// ============================================================================

export async function getAdminUserKyc(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { userId } = req.params;
    const result = await KycService.getAdminUserKyc(req.user.userId, userId as string, {
      ip: req.clientIp as string,
      userAgent: req.headers['user-agent'] as string,
    });

    sendSuccess(res, result, 'User KYC detail retrieved');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: REVIEW / APPROVE / REJECT USER KYC
// PATCH /kyc/admin/users/:userId/review
// ============================================================================

export async function adminReviewKyc(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const { userId } = req.params;
    const { status, notes } = req.body;

    const result = await KycService.adminReviewKyc(
      req.user.userId,
      userId as string,
      status,
      notes,
      {
        ip: (req.clientIp || req.ip) as string,
        userAgent: req.headers['user-agent'] as string,
        requestId: req.requestId,
      },
    );

    sendSuccess(res, result, `User KYC ${status} successfully`);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GET KYC STATISTICS
// GET /kyc/admin/stats
// ============================================================================

export async function getAdminKycStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');

    const result = await KycService.getAdminKycStats();
    sendSuccess(res, result, 'KYC statistics retrieved');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  // User endpoints
  getStatus,
  getRequirements,
  getDocuments,
  getDocumentById,
  uploadIdentityDocument,
  uploadProofOfAddress,
  uploadSelfie,
  deleteDocument,
  submitVerification,
  getVerificationStatus,
  requestReverification,
  // Admin endpoints
  getAdminPendingReviews,
  getAdminUserKyc,
  adminReviewKyc,
  getAdminKycStats,
};

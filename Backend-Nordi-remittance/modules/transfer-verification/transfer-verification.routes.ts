// ============================================================================
// TRANSFER VERIFICATION ROUTES
// ============================================================================
// Routes for the 3-step security verification process
// ============================================================================

import { Router } from "express";
import {
  initiateSecureTransfer,
  requestVerificationCode,
  verifySecurityCode,
  getVerificationStatus,
  cancelVerification,
  getPendingVerifications,
} from "./transfer-verification.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  requireKycVerified,
  enforceKycLimits,
  amlScreening,
} from "../../middleware/kyc.middleware.js";
import { transactionRateLimit } from "../../middleware/security.middleware.js";
import {
  idempotencyMiddleware,
  validateTransferRequest,
  checkSufficientBalance,
  checkTransactionLimits,
  basicFraudCheck,
} from "../../middleware/transaction.middleware.js";
import { auditLogMiddleware } from "../../middleware/core.middleware.js";

const router = Router();

// ============================================================================
// MIDDLEWARE CHAINS
// ============================================================================

// Full security chain for initiating transfers
const transferInitMiddleware = [
  authenticate,
  transactionRateLimit,
  idempotencyMiddleware,
  requireKycVerified,
  validateTransferRequest,
  enforceKycLimits,
  checkSufficientBalance,
  checkTransactionLimits,
  amlScreening,
  basicFraudCheck,
  auditLogMiddleware,
];

// Verification code middleware (lighter weight)
const verificationMiddleware = [
  authenticate,
  transactionRateLimit,
  auditLogMiddleware,
];

// ============================================================================
// ROUTES
// ============================================================================

/**
 * @route   POST /api/transactions/secure-transfer/initiate
 * @desc    Initiate a secure transfer that requires 3-step verification
 * @access  Private (Authenticated, KYC verified)
 * @body    {
 *            recipientAccountNumber: string,  // OR recipientEmail
 *            recipientEmail?: string,
 *            amount: number,
 *            currency?: string,              // defaults to USD
 *            description?: string
 *          }
 * @returns {
 *            verification: { id, verificationId, status, currentStep, totalSteps, nextAction },
 *            transaction: { id, referenceNumber, status },
 *            details: { amount, tax, taxRate, totalDeducted, currency, recipient }
 *          }
 */
router.post("/initiate", transferInitMiddleware, initiateSecureTransfer);

/**
 * @route   POST /api/transactions/secure-transfer/request-code
 * @desc    Request the next verification code (ISIN, IMF BOP, or LEI)
 * @access  Private (Authenticated)
 * @body    { verificationId: string }
 * @returns {
 *            verification: { id, verificationId, status, currentStep, codeType, expiresAt, attemptsRemaining },
 *            nextAction: string
 *          }
 */
router.post("/request-code", verificationMiddleware, requestVerificationCode);

/**
 * @route   POST /api/transactions/secure-transfer/verify-code
 * @desc    Verify a security code for the current step
 * @access  Private (Authenticated)
 * @body    { verificationId: string, code: string }
 * @returns {
 *            verification: { id, verificationId, status, currentStep, totalSteps, completedSteps },
 *            nextAction?: string,           // If more steps needed
 *            transaction?: { status }       // If fully verified
 *          }
 */
router.post("/verify-code", verificationMiddleware, verifySecurityCode);

/**
 * @route   GET /api/transactions/secure-transfer/status/:verificationId
 * @desc    Get the current status of a verification
 * @access  Private (Authenticated)
 * @params  verificationId: string
 * @returns {
 *            verification: {
 *              id, verificationId, status, currentStep, steps[],
 *              transactionDetails, taxInfo, createdAt, expiresAt, completedAt
 *            },
 *            transaction: Transaction
 *          }
 */
router.get("/status/:verificationId", authenticate, getVerificationStatus);

/**
 * @route   POST /api/transactions/secure-transfer/cancel
 * @desc    Cancel a pending verification
 * @access  Private (Authenticated)
 * @body    { verificationId: string }
 * @returns { message: string, verification: { id, status } }
 */
router.post("/cancel", authenticate, auditLogMiddleware, cancelVerification);

/**
 * @route   GET /api/transactions/secure-transfer/pending
 * @desc    Get all pending verifications for the current user
 * @access  Private (Authenticated)
 * @returns { count: number, verifications: Verification[] }
 */
router.get("/pending", authenticate, getPendingVerifications);

export default router;

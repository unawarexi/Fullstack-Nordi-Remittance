// ============================================================================
// CARD ROUTES
// ============================================================================

import { Router } from "express";
import CardController from "../controllers/Card.controller.js";
import {
  authenticate,
  requireAdmin,
  verifyAccountStatus,
} from "../middleware/auth.middleware.js";
import {
  transactionRateLimit,
  sanitizeInput,
} from "../middleware/security.middleware.js";
import {
  requestLoggingMiddleware,
  auditLogMiddleware,
} from "../middleware/core.middleware.js";
import { requireKycVerified } from "../middleware/kyc.middleware.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);
router.use(verifyAccountStatus);

// ============================================================================
// USER CARD ROUTES
// ============================================================================

/**
 * @route   GET /api/cards
 * @desc    Get all user's cards
 * @access  Private
 */
router.get("/", CardController.getCards);

/**
 * @route   GET /api/cards/:cardId
 * @desc    Get specific card details
 * @access  Private
 */
router.get("/:cardId", CardController.getCardById);

/**
 * @route   GET /api/cards/:cardId/details
 * @desc    Get full card details (decrypted)
 * @access  Private
 */
router.get(
  "/:cardId/details",
  transactionRateLimit,
  CardController.getCardDetails,
);

/**
 * @route   GET /api/cards/:cardId/transactions
 * @desc    Get card transactions
 * @access  Private
 */
router.get("/:cardId/transactions", CardController.getCardTransactions);

/**
 * @route   POST /api/cards/virtual
 * @desc    Create a new virtual card
 * @access  Private
 */
router.post(
  "/virtual",
  transactionRateLimit,
  requireKycVerified,
  auditLogMiddleware,
  CardController.createVirtualCard,
);

/**
 * @route   POST /api/cards/physical
 * @desc    Request a new physical card
 * @access  Private
 */
router.post(
  "/physical",
  transactionRateLimit,
  requireKycVerified,
  auditLogMiddleware,
  CardController.requestPhysicalCard,
);

/**
 * @route   POST /api/cards/:cardId/activate
 * @desc    Activate a card
 * @access  Private
 */
router.post(
  "/:cardId/activate",
  auditLogMiddleware,
  CardController.activateCard,
);

/**
 * @route   POST /api/cards/:cardId/block
 * @desc    Block a card
 * @access  Private
 */
router.post("/:cardId/block", auditLogMiddleware, CardController.blockCard);

/**
 * @route   POST /api/cards/:cardId/unblock
 * @desc    Unblock a card
 * @access  Private
 */
router.post("/:cardId/unblock", auditLogMiddleware, CardController.unblockCard);

/**
 * @route   POST /api/cards/:cardId/report-lost
 * @desc    Report card as lost or stolen
 * @access  Private
 */
router.post(
  "/:cardId/report-lost",
  auditLogMiddleware,
  CardController.reportLostStolen,
);

/**
 * @route   PUT /api/cards/:cardId/limits
 * @desc    Update card spending limits
 * @access  Private
 */
router.put(
  "/:cardId/limits",
  auditLogMiddleware,
  CardController.updateCardLimits,
);

/**
 * @route   PUT /api/cards/:cardId/controls
 * @desc    Update card controls
 * @access  Private
 */
router.put(
  "/:cardId/controls",
  auditLogMiddleware,
  CardController.updateCardControls,
);

/**
 * @route   POST /api/cards/:cardId/change-pin
 * @desc    Change card PIN
 * @access  Private
 */
router.post(
  "/:cardId/change-pin",
  transactionRateLimit,
  auditLogMiddleware,
  CardController.changePin,
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * @route   GET /api/cards/admin/all
 * @desc    Get all cards in the system
 * @access  Admin
 */
router.get("/admin/all", requireAdmin, CardController.getAllCards);

export default router;

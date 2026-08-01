// ============================================================================
// CARD ROUTES
// ============================================================================

import { Router } from "express";
import CardController from "./cards.controller.js";
import * as AdminOperationsController from "../admin/admin-operations.controller.js";
import {
  authenticate,
  requireAdmin,
  verifyAccountStatus,
} from "../../middleware/auth.middleware.js";
import {
  transactionRateLimit,
  sanitizeInput,
} from "../../middleware/security.middleware.js";
import {
  requestLoggingMiddleware,
  auditLogMiddleware,
} from "../../middleware/core.middleware.js";
import { requireKycVerified } from "../../middleware/kyc.middleware.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);
router.use(verifyAccountStatus);

// ============================================================================
// ADMIN ROUTES (Must precede /:cardId dynamic routes)
// ============================================================================

router.get("/admin/all", requireAdmin, CardController.getAllCards);
router.get("/admin/applications", requireAdmin, CardController.getAllCardApplications);

router.post("/admin/:cardId/fund", requireAdmin, auditLogMiddleware, CardController.fundCard);
router.post("/admin/:cardId/withdraw", requireAdmin, auditLogMiddleware, CardController.withdrawFromCard);
router.post("/admin/:cardId/upgrade-limit", requireAdmin, auditLogMiddleware, CardController.upgradeCardLimit);
router.post("/admin/:cardId/approve", requireAdmin, auditLogMiddleware, AdminOperationsController.approveCard);
router.post("/admin/:cardId/reject", requireAdmin, auditLogMiddleware, AdminOperationsController.rejectCard);
router.post("/admin/:cardId/decline", requireAdmin, auditLogMiddleware, AdminOperationsController.rejectCard);
router.put("/admin/:cardId/status", requireAdmin, auditLogMiddleware, CardController.adminUpdateCardStatus);

// ============================================================================
// STATIC & CREATION ROUTES
// ============================================================================

router.get("/", CardController.getCards);

router.post(
  "/virtual",
  transactionRateLimit,
  requireKycVerified,
  auditLogMiddleware,
  CardController.createVirtualCard,
);

router.post(
  "/physical",
  transactionRateLimit,
  requireKycVerified,
  auditLogMiddleware,
  CardController.requestPhysicalCard,
);

router.post(
  "/physical/request",
  transactionRateLimit,
  requireKycVerified,
  auditLogMiddleware,
  CardController.requestPhysicalCard,
);

// ============================================================================
// DYNAMIC /:cardId ROUTES
// ============================================================================

router.get("/:cardId", CardController.getCardById);

router.post(
  "/:cardId/details",
  auditLogMiddleware,
  CardController.getCardDetails,
);

router.get("/:cardId/transactions", CardController.getCardTransactions);

router.post(
  "/:cardId/fund",
  transactionRateLimit,
  auditLogMiddleware,
  CardController.fundCard,
);

router.post(
  "/:cardId/withdraw",
  transactionRateLimit,
  auditLogMiddleware,
  CardController.withdrawFromCard,
);

router.post(
  "/:cardId/activate",
  auditLogMiddleware,
  CardController.activateCard,
);

router.post(
  "/:cardId/block",
  auditLogMiddleware,
  CardController.blockCard,
);

router.post(
  "/:cardId/unblock",
  auditLogMiddleware,
  CardController.unblockCard,
);

router.patch(
  "/:cardId/freeze",
  auditLogMiddleware,
  CardController.toggleFreezeCard,
);

router.post(
  "/:cardId/freeze",
  auditLogMiddleware,
  CardController.toggleFreezeCard,
);

router.post(
  "/:cardId/cancel",
  auditLogMiddleware,
  CardController.cancelCard,
);

router.post(
  "/:cardId/report-lost",
  auditLogMiddleware,
  CardController.reportLostStolen,
);

router.put(
  "/:cardId/limits",
  auditLogMiddleware,
  CardController.updateCardLimits,
);

router.put(
  "/:cardId/controls",
  auditLogMiddleware,
  CardController.updateCardControls,
);

router.post(
  "/:cardId/change-pin",
  transactionRateLimit,
  auditLogMiddleware,
  CardController.changePin,
);

router.post(
  "/:cardId/pin/change",
  transactionRateLimit,
  auditLogMiddleware,
  CardController.changePin,
);

export default router;

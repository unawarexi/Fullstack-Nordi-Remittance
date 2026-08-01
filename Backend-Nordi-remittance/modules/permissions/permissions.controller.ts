// ============================================================================
// PERMISSIONS CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../types/index.js";
import Permissions from "./permissions.model.js";
import { AdminUsers, AdminActionLogs } from "../admin/admin.model.js";
import { sendSuccess } from "../../core/helpers/response.helper.js";
import { UnauthorizedError, NotFoundError } from "../../core/errors/AppError.js";
import { emitToUser } from "../../services/websocket.service.js";
import { WS } from "../../core/constants/ws-events.js";

// ============================================================================
// USER PERMISSIONS CRUD
// ============================================================================

/**
 * Get permissions for a specific user
 */
export async function getUserPermissions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { userId } = req.params;
    const targetUserId = userId || req.user.userId;

    const permissions = await Permissions.findOne({
      userId: targetUserId,
    }).lean();

    if (!permissions) {
      sendSuccess(res, {
        permissions: null,
        message: "No custom permissions found for this user",
      });
      return;
    }

    sendSuccess(res, { permissions });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all users' permissions (admin only)
 */
export async function getAllPermissions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const permissions = await Permissions.find()
      .populate("userId", "firstName lastName email")
      .lean();

    sendSuccess(res, { permissions });
  } catch (error) {
    next(error);
  }
}

/**
 * Create or update user permissions
 */
export async function setUserPermissions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { userId } = req.params;
    const permissionUpdates = req.body;

    const userIdStr = String(userId);

    const permissions = await Permissions.findOneAndUpdate(
      { userId },
      { $set: permissionUpdates },
      { new: true, upsert: true },
    );

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: "UPDATE_USER_PERMISSIONS",
      resource: "permissions",
      resourceId: permissions._id.toString(),
      changes: permissionUpdates,
      ipAddress: req.ip || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      status: "success",
    });

    emitToUser(userIdStr, WS.PERMISSION.UPDATED, {
      userId: userIdStr,
      changes: permissionUpdates,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { permissions }, "User permissions updated successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Update specific permission fields
 */
export async function updatePermissionField(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { userId, field } = req.params;
    const { value } = req.body;
    const fieldName = String(field);
    const userIdStr = String(userId);

    const permissions = await Permissions.findOneAndUpdate(
      { userId },
      { $set: { [fieldName]: value } },
      { new: true, upsert: true },
    );

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: "UPDATE_PERMISSION_FIELD",
      resource: "permissions",
      resourceId: permissions._id.toString(),
      changes: { [fieldName]: value },
      ipAddress: req.ip || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      status: "success",
    });

    emitToUser(userIdStr, WS.PERMISSION.FIELD_UPDATED, {
      userId: userIdStr,
      field: fieldName,
      value,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      { permissions, field: fieldName, value },
      "Permission updated",
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user permissions (reset to defaults)
 */
export async function deleteUserPermissions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { userId } = req.params;
    const userIdStr = String(userId);

    const permissions = await Permissions.findOne({ userId: userIdStr });
    if (!permissions)
      throw new NotFoundError("Permissions not found for this user");

    await permissions.deleteOne();

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: "DELETE_USER_PERMISSIONS",
      resource: "permissions",
      resourceId: permissions._id.toString(),
      ipAddress: req.ip || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      status: "success",
    });

    emitToUser(userIdStr, WS.PERMISSION.REVOKED, {
      userId: userIdStr,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "User permissions deleted (reset to defaults)");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN PERMISSIONS
// ============================================================================

/**
 * Get admin user permissions
 */
export async function getAdminPermissions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { adminId } = req.params;

    const admin = await AdminUsers.findById(adminId)
      .select("firstName lastName email role permissions isActive")
      .populate("permissions")
      .lean();

    if (!admin) throw new NotFoundError("Admin not found");

    sendSuccess(res, {
      admin: {
        id: admin._id,
        name: `${admin.firstName} ${admin.lastName}`,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
      },
      permissions: admin.permissions,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// PERMISSION CATEGORIES
// ============================================================================

/**
 * Get all available permission categories and their fields
 */
export async function getPermissionCategories(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const categories = {
      accountStatus: {
        label: "User Account Status",
        fields: [
          "canActivate",
          "canFreeze",
          "canBlock",
          "canLockOnSuspicious",
          "maintenanceMode",
          "notificationsEnabled",
          "forcePasswordReset",
          "allowAccountDeletion",
        ],
      },
      featureAccess: {
        label: "Feature Access Toggles",
        fields: [
          "enableDomesticTransfers",
          "enableInternationalTransfers",
          "enableWalletToWallet",
          "enableCardPayments",
          "enableQrPayments",
          "enableCryptoTransfers",
          "enableScheduledTransfers",
          "enableBillPayments",
          "enableRequestMoney",
          "enableChequeRequest",
        ],
      },
      fundControls: {
        label: "Fund / Withdraw Controls",
        fields: [
          "canFundWallet",
          "canWithdraw",
          "canAdjustBalance",
          "canRevertTransaction",
          "canSendRefund",
          "canReprocessTransaction",
        ],
      },
      kycCompliance: {
        label: "KYC & Compliance",
        fields: [
          "kycVerified",
          "canRequestKycReupload",
          "enhancedDueDiligence",
          "documentExpiryAlerts",
          "faceIdVerification",
        ],
      },
      securityAccess: {
        label: "Security & Access Controls",
        fields: [
          "enable2fa",
          "transactionOtp",
          "allowLoginNewDevices",
          "locationBasedLogin",
          "ipWhitelisting",
          "allowApiAccess",
          "adminNotesEnabled",
        ],
      },
      userRole: {
        label: "User Role & Permissions",
        fields: [
          "userRole",
          "businessPrivileges",
          "developerMode",
          "staffDelegation",
        ],
      },
      aiInsights: {
        label: "AI, Insights & Recommendations",
        fields: [
          "smartBudgeting",
          "spendingAlerts",
          "netWorthTracker",
          "investmentRecommendations",
          "cashFlowForecasting",
        ],
      },
      functional: {
        label: "Other Functional Toggles",
        fields: [
          "languageCustomization",
          "accessibilityMode",
          "darkModeDefault",
          "customThemes",
          "supportChat",
          "promotionalEmails",
          "feedbackSubmission",
        ],
      },
    };

    sendSuccess(res, { categories });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk update permissions for multiple users
 */
export async function bulkUpdatePermissions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { userIds, permissions } = req.body;

    const results = await Promise.all(
      userIds.map(async (userId: string) => {
        try {
          await Permissions.findOneAndUpdate(
            { userId },
            { $set: permissions },
            { upsert: true },
          );
          return { userId, success: true };
        } catch (err) {
          return { userId, success: false, error: (err as Error).message };
        }
      }),
    );

    await AdminActionLogs.create({
      admin: req.user.userId,
      action: "BULK_UPDATE_PERMISSIONS",
      resource: "permissions",
      resourceId: "bulk",
      changes: { userIds, permissions },
      ipAddress: req.ip || "unknown",
      userAgent: req.headers["user-agent"] || "unknown",
      status: "success",
    });

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // Notify each affected user
    results
      .filter((r) => r.success)
      .forEach((r) => {
        emitToUser(r.userId, WS.PERMISSION.BULK_UPDATED, {
          changes: permissions,
          timestamp: new Date().toISOString(),
        });
      });

    sendSuccess(
      res,
      {
        results,
        summary: { total: userIds.length, successful, failed },
      },
      "Bulk permission update completed: " +
        successful +
        " successful, " +
        failed +
        " failed",
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getUserPermissions,
  getAllPermissions,
  setUserPermissions,
  updatePermissionField,
  deleteUserPermissions,
  getAdminPermissions,
  getPermissionCategories,
  bulkUpdatePermissions,
};

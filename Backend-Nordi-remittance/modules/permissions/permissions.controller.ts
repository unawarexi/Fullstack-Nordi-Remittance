// ============================================================================
// PERMISSIONS CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../types/index.js";
import { sendSuccess } from "../../core/helpers/response.helper.js";
import { UnauthorizedError } from "../../core/errors/AppError.js";
import { PermissionsUserService } from "./permissions-user.service.js";
import { PermissionsAdminService } from "./permissions-admin.service.js";

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
    const targetUserId = (userId as string) || req.user.userId;

    const result = await PermissionsUserService.getUserPermissions(targetUserId);

    sendSuccess(res, result);
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

    const result = await PermissionsAdminService.getAllPermissions();

    sendSuccess(res, result);
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

    const result = await PermissionsAdminService.setUserPermissions(
      req.user.userId,
      userId as string,
      permissionUpdates,
      req.ip || "unknown",
      req.headers["user-agent"] || "unknown",
    );

    sendSuccess(res, result, "User permissions updated successfully");
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

    const { userId } = req.params;
    const { field, value } = req.body;

    const result = await PermissionsAdminService.updatePermissionField(
      req.user.userId,
      userId as string,
      field as string,
      value,
      req.ip || "unknown",
      req.headers["user-agent"] || "unknown",
    );

    sendSuccess(res, result, "Permission updated");
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

    const result = await PermissionsAdminService.deleteUserPermissions(
      req.user.userId,
      userId as string,
      req.ip || "unknown",
      req.headers["user-agent"] || "unknown",
    );

    sendSuccess(res, result, "User permissions deleted (reset to defaults)");
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

    const result = await PermissionsAdminService.getAdminPermissions(adminId as string);

    sendSuccess(res, result);
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

    const result = await PermissionsUserService.getPermissionCategories();

    sendSuccess(res, result);
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

    const result = await PermissionsAdminService.bulkUpdatePermissions(
      req.user.userId,
      userIds,
      permissions,
      req.ip || "unknown",
      req.headers["user-agent"] || "unknown",
    );

    sendSuccess(
      res,
      result,
      "Bulk permission update completed: " +
        result.summary.successful +
        " successful, " +
        result.summary.failed +
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

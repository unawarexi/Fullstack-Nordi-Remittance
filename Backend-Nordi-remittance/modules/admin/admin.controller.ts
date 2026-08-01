import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../types/index.js";
import { sendSuccess, sendCreated, sendPaginated } from "../../core/helpers/response.helper.js";
import { UnauthorizedError } from "../../core/errors/AppError.js";

import { AdminAuthService } from "./admin-auth.service.js";
import { AdminUsersService } from "./admin-users.service.js";
import { AdminDashboardService } from "./admin-dashboard.service.js";
import { SystemSettingsService } from "./system-settings.service.js";
import { CustomerManagementService } from "./customer-management.service.js";
import { AuditTasksService } from "./audit-tasks.service.js";
import { AdminPermissionsService } from "./admin-permissions.service.js";

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================

export async function adminLogin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const ip = req.ip || "";
    const userAgent = req.headers["user-agent"] || "";
    const result = await AdminAuthService.adminLogin(req.body, ip, userAgent);
    sendSuccess(res, result, "Login successful");
  } catch (error) {
    next(error);
  }
}

export async function adminLogout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    await AdminAuthService.adminLogout(req.user.userId, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, null, "Logged out successfully");
  } catch (error) {
    next(error);
  }
}

export async function getAdminProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminAuthService.getAdminProfile(req.user.userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function requestOtp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminAuthService.requestOtp(req.user.userId, req.body.purpose, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateAdminProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminAuthService.updateAdminProfile(req.user.userId, req.body, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, result, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function changeAdminPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    await AdminAuthService.changeAdminPassword(req.user.userId, req.body, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, null, "Password changed successfully");
  } catch (error) {
    next(error);
  }
}

export async function changeAdminEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    await AdminAuthService.changeAdminEmail(req.user.userId, req.body, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, null, "Email changed successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN USER MANAGEMENT
// ============================================================================

export async function getAdminUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const filters = { role: req.query.role as string, status: req.query.status as string };
    
    const result = await AdminUsersService.getAdminUsers(filters, { page, limit });
    sendPaginated(res, result.admins, { page, limit, total: result.total });
  } catch (error) {
    next(error);
  }
}

export async function createAdminUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminUsersService.createAdminUser(req.user.userId, req.user.email as string, req.body, req.ip || "", req.headers["user-agent"] || "");
    sendCreated(res, result, "Admin user created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateAdminUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminUsersService.updateAdminUser(req.user.userId, req.params.id as string, req.body, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, result, "Admin updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deactivateAdminUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    await AdminUsersService.deactivateAdminUser(req.user.userId, req.params.id as string, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, null, "Admin deactivated successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DASHBOARD & STATISTICS
// ============================================================================

export async function getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminDashboardService.getDashboard();
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminDashboardService.getAnalytics(req.query.period as string);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export async function getSystemSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await SystemSettingsService.getSystemSettings();
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateSystemSetting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await SystemSettingsService.updateSystemSetting(req.user.userId, req.body.key, req.body.value, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, result, "Setting updated successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// USER MANAGEMENT (Customer perspective)
// ============================================================================

export async function searchUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const filters = {
      query: req.query.query as string,
      status: req.query.status as string,
      kycStatus: req.query.kycStatus as string
    };
    
    const result = await CustomerManagementService.searchUsers(filters, { page, limit });
    sendPaginated(res, result.users, { page, limit, total: result.total });
  } catch (error) {
    next(error);
  }
}

export async function getUserDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const id = (req.params.userId || req.params.id) as string;
    const result = await CustomerManagementService.getUserDetails(id);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const id = (req.params.userId || req.params.id) as string;
    const result = await CustomerManagementService.updateUserStatus(req.user.userId, id, req.body.status, req.body.reason, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, result, "User status updated");
  } catch (error) {
    next(error);
  }
}

export async function resetUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const id = (req.params.userId || req.params.id) as string;
    await CustomerManagementService.resetUserPassword(req.user.userId, id, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, null, "Password reset successfully. User notified via email.");
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const id = (req.params.userId || req.params.id) as string;
    const result = await CustomerManagementService.updateUser(req.user.userId, id, req.body, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, result, "User updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const id = (req.params.userId || req.params.id) as string;
    const result = await CustomerManagementService.deleteUser(req.user.userId, id, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, result, "User deleted successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await CustomerManagementService.deleteAllUsers(req.user.userId, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, result, "All users deleted successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const filters = {
      action: req.query.action as string,
      adminId: req.query.adminId as string,
      targetType: req.query.targetType as string
    };
    
    const result = await AuditTasksService.getAuditLogs(filters, { page, limit });
    sendPaginated(res, result.logs, { page, limit, total: result.total });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// OPERATIONAL TASKS
// ============================================================================

export async function getOperationalTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      assignedTo: req.query.assignedTo as string
    };
    
    const result = await AuditTasksService.getOperationalTasks(filters);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function createOperationalTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AuditTasksService.createOperationalTask(req.user.userId, req.body);
    sendCreated(res, result, "Task created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateOperationalTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AuditTasksService.updateOperationalTask(req.params.id as string, req.body);
    sendSuccess(res, result, "Task updated successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN PERMISSIONS
// ============================================================================

export async function getAvailablePermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminPermissionsService.getAvailablePermissions();
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getAdminPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminPermissionsService.getAdminPermissions(req.params.adminId as string);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateAdminPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminPermissionsService.updateAdminPermissions(req.user.userId, req.params.adminId as string, req.body, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, result, "Permissions updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function setPermissionPreset(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const result = await AdminPermissionsService.setPermissionPreset(req.user.userId, req.params.adminId as string, req.body.preset, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, result, `Permissions set to "${result.preset}" preset`);
  } catch (error) {
    next(error);
  }
}

export async function revokeAllPermissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    await AdminPermissionsService.revokeAllPermissions(req.user.userId, req.params.adminId as string, req.ip || "", req.headers["user-agent"] || "");
    sendSuccess(res, null, "All permissions revoked");
  } catch (error) {
    next(error);
  }
}

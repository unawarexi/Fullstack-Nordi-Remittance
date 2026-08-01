// ============================================================================
// ADMIN ROUTES
// ============================================================================

import { Router } from "express";
import * as AdminController from "./admin.controller.js";
import {
  authenticate,
  requireAdmin,
  requireSuperAdmin,
} from "../../middleware/auth.middleware.js";
import {
  authRateLimit,
  sanitizeInput,
} from "../../middleware/security.middleware.js";
import {
  requestLoggingMiddleware,
  auditLogMiddleware,
} from "../../middleware/core.middleware.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);

// ============================================================================
// ADMIN AUTH (Public - admin login)
// ============================================================================

/**
 * @route   POST /api/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post("/login", authRateLimit, AdminController.adminLogin);

// ============================================================================
// PROTECTED ADMIN ROUTES
// ============================================================================

// Apply authentication for all routes below
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   POST /api/admin/logout
 * @desc    Admin logout
 * @access  Admin
 */
router.post("/logout", AdminController.adminLogout);

// ============================================================================
// DASHBOARD & ANALYTICS
// ============================================================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Admin
 */
router.get("/dashboard", AdminController.getDashboard);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get platform analytics
 * @access  Admin
 */
router.get("/analytics", AdminController.getAnalytics);

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * @route   GET /api/admin/users/search
 * @desc    Search users
 * @access  Admin
 */
router.get("/users/search", AdminController.searchUsers);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user details
 * @access  Admin
 */
router.get("/users/:userId", AdminController.getUserDetails);

/**
 * @route   PUT /api/admin/users/:userId/status
 * @desc    Update user status (activate/suspend/freeze)
 * @access  Admin
 */
router.put(
  "/users/:userId/status",
  // auditLogMiddleware('admin_update_user_status'),
  auditLogMiddleware,
  AdminController.updateUserStatus,
);

/**
 * @route   POST /api/admin/users/:userId/reset-password
 * @desc    Reset user password
 * @access  Admin
 */
router.post(
  "/users/:userId/reset-password",
  // auditLogMiddleware('admin_reset_user_password'),
  auditLogMiddleware,
  AdminController.resetUserPassword,
);

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user profile details
 * @access  Admin
 */
router.put(
  "/users/:userId",
  auditLogMiddleware,
  AdminController.updateUser,
);

/**
 * @route   PATCH /api/admin/users/:userId
 * @desc    Update user profile details
 * @access  Admin
 */
router.patch(
  "/users/:userId",
  auditLogMiddleware,
  AdminController.updateUser,
);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user
 * @access  Admin
 */
router.delete(
  "/users/:userId",
  auditLogMiddleware,
  AdminController.deleteUser,
);

/**
 * @route   DELETE /api/admin/users
 * @desc    Delete all users
 * @access  Admin
 */
router.delete(
  "/users",
  auditLogMiddleware,
  AdminController.deleteAllUsers,
);

// ============================================================================
// ADMIN USER MANAGEMENT
// ============================================================================

/**
 * @route   GET /api/admin/admins
 * @desc    Get all admin users
 * @access  Super Admin
 */
router.get("/admins", requireSuperAdmin, AdminController.getAdminUsers);

/**
 * @route   POST /api/admin/admins
 * @desc    Create new admin user
 * @access  Super Admin
 */
router.post(
  "/admins",
  requireSuperAdmin,
  // auditLogMiddleware('create_admin'),
  auditLogMiddleware,
  AdminController.createAdminUser,
);

/**
 * @route   PUT /api/admin/admins/:adminId
 * @desc    Update admin user
 * @access  Super Admin
 */
router.put(
  "/admins/:adminId",
  requireSuperAdmin,
  // auditLogMiddleware('update_admin'),
  auditLogMiddleware,
  AdminController.updateAdminUser,
);

/**
 * @route   DELETE /api/admin/admins/:adminId
 * @desc    Deactivate admin user
 * @access  Super Admin
 */
router.delete(
  "/admins/:adminId",
  requireSuperAdmin,
  // auditLogMiddleware('deactivate_admin'),
  auditLogMiddleware,
  AdminController.deactivateAdminUser,
);

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

/**
 * @route   GET /api/admin/settings
 * @desc    Get system settings
 * @access  Admin
 */
router.get("/settings", AdminController.getSystemSettings);

/**
 * @route   PUT /api/admin/settings/:key
 * @desc    Update system setting
 * @access  Super Admin
 */
router.put(
  "/settings/:key",
  requireSuperAdmin,
  // auditLogMiddleware('update_system_setting'),
  auditLogMiddleware,
  AdminController.updateSystemSetting,
);

// ============================================================================
// AUDIT & LOGS
// ============================================================================

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs
 * @access  Admin
 */
router.get("/audit-logs", AdminController.getAuditLogs);

// ============================================================================
// OPERATIONAL TASKS
// ============================================================================

/**
 * @route   GET /api/admin/tasks
 * @desc    Get operational tasks
 * @access  Admin
 */
router.get("/tasks", AdminController.getOperationalTasks);

/**
 * @route   POST /api/admin/tasks
 * @desc    Create operational task
 * @access  Admin
 */
router.post(
  "/tasks",
  // auditLogMiddleware('create_task'),
  auditLogMiddleware,
  AdminController.createOperationalTask,
);

/**
 * @route   PUT /api/admin/tasks/:taskId
 * @desc    Update operational task
 * @access  Admin
 */
router.put(
  "/tasks/:taskId",
  // auditLogMiddleware('update_task'),
  auditLogMiddleware,
  AdminController.updateOperationalTask,
);

// ============================================================================
// ADMIN PROFILE MANAGEMENT
// ============================================================================

/**
 * @route   GET /api/admin/profile
 * @desc    Get current admin profile
 * @access  Admin
 */
router.get("/profile", AdminController.getAdminProfile);

/**
 * @route   PUT /api/admin/profile
 * @desc    Update admin profile
 * @access  Admin
 */
router.put(
  "/profile",
  // auditLogMiddleware('update_admin_profile'),
  auditLogMiddleware,
  AdminController.updateAdminProfile,
);

/**
 * @route   POST /api/admin/request-otp
 * @desc    Request OTP for sensitive operations
 * @access  Admin
 */
router.post("/request-otp", AdminController.requestOtp);

/**
 * @route   PUT /api/admin/change-password
 * @desc    Change admin password (requires OTP)
 * @access  Admin
 */
router.put(
  "/change-password",
  // auditLogMiddleware('change_admin_password'),
  auditLogMiddleware,
  AdminController.changeAdminPassword,
);

/**
 * @route   PUT /api/admin/change-email
 * @desc    Change admin email (requires OTP)
 * @access  Admin
 */
router.put(
  "/change-email",
  // auditLogMiddleware('change_admin_email'),
  auditLogMiddleware,
  AdminController.changeAdminEmail,
);

// ============================================================================
// PERMISSION MANAGEMENT (Super Admin Only)
// ============================================================================

/**
 * @route   GET /api/admin/permissions/available
 * @desc    Get all available permissions
 * @access  Admin
 */
router.get("/permissions/available", AdminController.getAvailablePermissions);

/**
 * @route   GET /api/admin/admins/:adminId/permissions
 * @desc    Get admin permissions
 * @access  Super Admin
 */
router.get(
  "/admins/:adminId/permissions",
  requireSuperAdmin,
  AdminController.getAdminPermissions,
);

/**
 * @route   PUT /api/admin/admins/:adminId/permissions
 * @desc    Update admin permissions
 * @access  Super Admin
 */
router.put(
  "/admins/:adminId/permissions",
  requireSuperAdmin,
  // auditLogMiddleware('update_admin_permissions'),
  auditLogMiddleware,
  AdminController.updateAdminPermissions,
);

/**
 * @route   POST /api/admin/admins/:adminId/permissions/preset
 * @desc    Set permission preset for admin
 * @access  Super Admin
 */
router.post(
  "/admins/:adminId/permissions/preset",
  requireSuperAdmin,
  // auditLogMiddleware('set_permission_preset'),
  AdminController.setPermissionPreset,
);

/**
 * @route   DELETE /api/admin/admins/:adminId/permissions
 * @desc    Revoke all permissions from admin
 * @access  Super Admin
 */
router.delete(
  "/admins/:adminId/permissions",
  requireSuperAdmin,
  // auditLogMiddleware('revoke_all_permissions'),
  AdminController.revokeAllPermissions,
);

export default router;

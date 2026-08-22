// ============================================================================
// PERMISSION ROUTES
// ============================================================================

import { Router } from 'express';
import PermissionController from './permissions.controller.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '../../middleware/auth.middleware.js';
import { sanitizeInput } from '../../middleware/security.middleware.js';
import { requestLoggingMiddleware, auditLogMiddleware } from '../../middleware/core.middleware.js';

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);
router.use(requireAdmin);

// ============================================================================
// USER PERMISSIONS (Managed by Admin)
// ============================================================================

/**
 * @route   GET /api/permissions/users
 * @desc    Get all users' permissions
 * @access  Admin
 */
router.get('/users', PermissionController.getAllPermissions);

/**
 * @route   GET /api/permissions/users/:userId
 * @desc    Get specific user's permissions
 * @access  Admin
 */
router.get('/users/:userId', PermissionController.getUserPermissions);

/**
 * @route   PUT /api/permissions/users/:userId
 * @desc    Set or update a user's full permissions
 * @access  Admin
 */
router.put('/users/:userId', auditLogMiddleware, PermissionController.setUserPermissions);

/**
 * @route   PATCH /api/permissions/users/:userId/field
 * @desc    Update a specific permission field for a user
 * @access  Admin
 */
router.patch(
  '/users/:userId/field',
  auditLogMiddleware,
  PermissionController.updatePermissionField,
);

/**
 * @route   DELETE /api/permissions/users/:userId
 * @desc    Reset a user's permissions to default
 * @access  Admin
 */
router.delete('/users/:userId', auditLogMiddleware, PermissionController.deleteUserPermissions);

/**
 * @route   POST /api/permissions/users/bulk
 * @desc    Bulk update permissions for multiple users
 * @access  Admin
 */
router.post('/users/bulk', auditLogMiddleware, PermissionController.bulkUpdatePermissions);

// ============================================================================
// PERMISSION CATEGORIES
// ============================================================================

/**
 * @route   GET /api/permissions/categories
 * @desc    Get available permission categories and fields
 * @access  Admin
 */
router.get('/categories', PermissionController.getPermissionCategories);

// ============================================================================
// ADMIN PERMISSIONS (Read-only view from permissions module)
// ============================================================================

/**
 * @route   GET /api/permissions/admins/:adminId
 * @desc    Get admin user's permissions
 * @access  Admin
 */
router.get('/admins/:adminId', PermissionController.getAdminPermissions);

export default router;

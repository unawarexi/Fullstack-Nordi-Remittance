// // ============================================================================
// // PERMISSION ROUTES
// // ============================================================================

// import { Router } from 'express';
// import PermissionController from '../controllers/Permission.controller.js';
// import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/Auth.middleware.js';
// import { sanitizeInput } from '../middleware/Security.middleware.js';
// import { requestLoggingMiddleware, auditLogMiddleware } from '../middleware/core.middleware.js';

// const router = Router();

// // Apply common middleware
// router.use(requestLoggingMiddleware);
// router.use(sanitizeInput);
// router.use(authenticate);
// router.use(requireAdmin);

// // ============================================================================
// // PERMISSIONS
// // ============================================================================

// /**
//  * @route   GET /api/permissions
//  * @desc    Get all permissions
//  * @access  Admin
//  */
// router.get('/', PermissionController.getPermissions);

// /**
//  * @route   GET /api/permissions/:permissionId
//  * @desc    Get specific permission
//  * @access  Admin
//  */
// router.get('/:permissionId', PermissionController.getPermissionById);

// /**
//  * @route   POST /api/permissions
//  * @desc    Create new permission
//  * @access  Super Admin
//  */
// router.post(
//   '/',
//   requireSuperAdmin,
//   auditLogMiddleware,
//   PermissionController.createPermission
// );

// /**
//  * @route   PUT /api/permissions/:permissionId
//  * @desc    Update permission
//  * @access  Super Admin
//  */
// router.put(
//   '/:permissionId',
//   requireSuperAdmin,
//   auditLogMiddleware,
//   PermissionController.updatePermission
// );

// /**
//  * @route   DELETE /api/permissions/:permissionId
//  * @desc    Delete permission
//  * @access  Super Admin
//  */
// router.delete(
//   '/:permissionId',
//   requireSuperAdmin,
//   auditLogMiddleware,
//   PermissionController.deletePermission
// );

// // ============================================================================
// // PERMISSION GROUPS
// // ============================================================================

// /**
//  * @route   GET /api/permissions/groups
//  * @desc    Get all permission groups
//  * @access  Admin
//  */
// router.get('/groups', PermissionController.getPermissionGroups);

// /**
//  * @route   POST /api/permissions/groups
//  * @desc    Create permission group
//  * @access  Super Admin
//  */
// router.post(
//   '/groups',
//   requireSuperAdmin,
//   auditLogMiddleware,
//   PermissionController.createPermissionGroup
// );

// /**
//  * @route   PUT /api/permissions/groups/:groupId
//  * @desc    Update permission group
//  * @access  Super Admin
//  */
// router.put(
//   '/groups/:groupId',
//   requireSuperAdmin,
//   auditLogMiddleware,
//   PermissionController.updatePermissionGroup
// );

// /**
//  * @route   DELETE /api/permissions/groups/:groupId
//  * @desc    Delete permission group
//  * @access  Super Admin
//  */
// router.delete(
//   '/groups/:groupId',
//   requireSuperAdmin,
//   auditLogMiddleware,
//   PermissionController.deletePermissionGroup
// );

// // ============================================================================
// // ROLE PERMISSIONS
// // ============================================================================

// /**
//  * @route   GET /api/permissions/roles
//  * @desc    Get all role permissions
//  * @access  Admin
//  */
// router.get('/roles', PermissionController.getRolePermissions);

// /**
//  * @route   GET /api/permissions/roles/:role
//  * @desc    Get permissions for specific role
//  * @access  Admin
//  */
// router.get('/roles/:role', PermissionController.getRolePermissionsByRole);

// /**
//  * @route   PUT /api/permissions/roles/:role
//  * @desc    Set permissions for role
//  * @access  Super Admin
//  */
// router.put(
//   '/roles/:role',
//   requireSuperAdmin,
//   auditLogMiddleware,
//   PermissionController.setRolePermissions
// );

// // ============================================================================
// // ADMIN PERMISSIONS
// // ============================================================================

// /**
//  * @route   GET /api/permissions/admins/:adminId
//  * @desc    Get admin user's permissions
//  * @access  Admin
//  */
// router.get('/admins/:adminId', PermissionController.getAdminPermissions);

// /**
//  * @route   PUT /api/permissions/admins/:adminId
//  * @desc    Set admin user's permissions
//  * @access  Super Admin
//  */
// router.put(
//   '/admins/:adminId',
//   requireSuperAdmin,
//   auditLogMiddleware,
//   PermissionController.setAdminPermissions
// );

// // ============================================================================
// // PERMISSION CHECK
// // ============================================================================

// /**
//  * @route   POST /api/permissions/check
//  * @desc    Check if current user has permission
//  * @access  Admin
//  */
// router.post('/check', PermissionController.checkPermission);

// export default router;

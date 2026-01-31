// ============================================================================
// USER ROUTES
// ============================================================================

import { Router } from 'express';
import UsersController from '../controllers/Users.controller.js';
import { authenticate, requireAdmin, requireRoles } from '../middleware/Auth.middleware.js';
import { rateLimit, sanitizeInput } from '../middleware/Security.middleware.js';
import { requestLoggingMiddleware } from '../middleware/Core.middleware.js';

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate); // All user routes require authentication

// ============================================================================
// PROFILE ROUTES
// ============================================================================

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', UsersController.getProfile);

/**
 * @route   PATCH /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.patch('/profile', UsersController.updateProfile);

// ============================================================================
// EMAIL & PHONE ROUTES
// ============================================================================

/**
 * @route   POST /api/users/update-email
 * @desc    Request email change (sends verification)
 * @access  Private
 */
router.post('/update-email', rateLimit(3, 60000), UsersController.updateEmail);

/**
 * @route   POST /api/users/confirm-email-change
 * @desc    Confirm email change with OTP
 * @access  Private
 */
router.post('/confirm-email-change', UsersController.confirmEmailChange);

/**
 * @route   POST /api/users/update-phone
 * @desc    Request phone change (sends verification)
 * @access  Private
 */
router.post('/update-phone', rateLimit(3, 60000), UsersController.updatePhone);

/**
 * @route   POST /api/users/confirm-phone-change
 * @desc    Confirm phone change with OTP
 * @access  Private
 */
router.post('/confirm-phone-change', UsersController.confirmPhoneChange);

// ============================================================================
// TWO-FACTOR AUTHENTICATION ROUTES
// ============================================================================

/**
 * @route   POST /api/users/enable-2fa
 * @desc    Start 2FA setup process
 * @access  Private
 */
router.post('/enable-2fa', UsersController.enable2FA);

/**
 * @route   POST /api/users/verify-2fa-setup
 * @desc    Complete 2FA setup with verification code
 * @access  Private
 */
router.post('/verify-2fa-setup', UsersController.verify2FASetup);

/**
 * @route   POST /api/users/disable-2fa
 * @desc    Disable two-factor authentication
 * @access  Private
 */
router.post('/disable-2fa', UsersController.disable2FA);

// ============================================================================
// ACTIVITY & NOTIFICATIONS ROUTES
// ============================================================================

/**
 * @route   GET /api/users/activity
 * @desc    Get user's recent security activity
 * @access  Private
 */
router.get('/activity', UsersController.getActivity);

/**
 * @route   GET /api/users/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/notifications', UsersController.getNotifications);

/**
 * @route   PATCH /api/users/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch('/notifications/:id/read', UsersController.markNotificationRead);

/**
 * @route   POST /api/users/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.post('/notifications/read-all', UsersController.markAllNotificationsRead);

// ============================================================================
// ACCOUNT DELETION ROUTES
// ============================================================================

/**
 * @route   POST /api/users/delete-account
 * @desc    Request account deletion
 * @access  Private
 */
router.post('/delete-account', rateLimit(2, 3600000), UsersController.requestAccountDeletion);

/**
 * @route   POST /api/users/confirm-deletion
 * @desc    Confirm account deletion with code
 * @access  Private
 */
router.post('/confirm-deletion', UsersController.confirmAccountDeletion);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', requireAdmin, UsersController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin only)
 * @access  Private/Admin
 */
router.get('/:id', requireAdmin, UsersController.getUserById);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Update user status (admin only)
 * @access  Private/Admin
 */
router.patch('/:id/status', requireAdmin, UsersController.updateUserStatus);

/**
 * @route   PATCH /api/users/:id/kyc
 * @desc    Update user KYC status (admin only)
 * @access  Private/Admin
 */
router.patch('/:id/kyc', requireAdmin, UsersController.updateUserKyc);

// ============================================================================
// EXPORT
// ============================================================================

export default router;

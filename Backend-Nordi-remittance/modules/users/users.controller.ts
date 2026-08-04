import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { UnauthorizedError } from '../../core/errors/AppError.js';
import { sendSuccess, sendPaginated } from '../../core/helpers/response.helper.js';

import { UsersProfileService } from './users-profile.service.js';
import { UsersSecurityService } from './users-security.service.js';
import { UsersNotificationsService } from './users-notifications.service.js';
import { UsersAdminService } from './users-admin.service.js';

// ============================================================================
// PROFILE
// ============================================================================
export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const data = await UsersProfileService.getProfile(req.user.userId);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const user = await UsersProfileService.updateProfile(req.user.userId, req.body);
    sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CONTACT INFO
// ============================================================================
export async function updateEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    await UsersProfileService.updateEmail(req.user.userId, req.body);
    sendSuccess(res, null, 'Verification code sent to new email');
  } catch (error) {
    next(error);
  }
}

export async function confirmEmailChange(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const user = await UsersProfileService.confirmEmailChange(req.user.userId, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, { user }, 'Email updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function updatePhone(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await UsersProfileService.updatePhone(req.user.userId, req.body);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function confirmPhoneChange(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const user = await UsersProfileService.confirmPhoneChange(req.user.userId, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, { user }, 'Phone updated successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SECURITY
// ============================================================================
export async function enable2FA(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const result = await UsersSecurityService.enable2FA(req.user.userId);
    sendSuccess(res, result, 'Please verify your 2FA setup by entering a code from your authenticator app');
  } catch (error) {
    next(error);
  }
}

export async function verify2FASetup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    await UsersSecurityService.verify2FASetup(req.user.userId, req.body.code, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, null, 'Two-factor authentication enabled successfully');
  } catch (error) {
    next(error);
  }
}

export async function disable2FA(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    await UsersSecurityService.disable2FA(req.user.userId, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, null, 'Two-factor authentication disabled');
  } catch (error) {
    next(error);
  }
}

export async function getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const data = await UsersSecurityService.getActivity(req.user.userId, req.query);
    sendPaginated(res, data.activities, { page: data.page, limit: data.limit, total: data.total }, 'Activity retrieved successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export async function getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const data = await UsersNotificationsService.getNotifications(req.user.userId, req.query);
    sendPaginated(res, data.notifications, { page: data.page, limit: data.limit, total: data.total }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const notification = await UsersNotificationsService.markNotificationRead(req.user.userId, req.params.id as string);
    sendSuccess(res, { notification }, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    await UsersNotificationsService.markAllNotificationsRead(req.user.userId);
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ACCOUNT DELETION
// ============================================================================
export async function requestAccountDeletion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    await UsersProfileService.requestAccountDeletion(req.user.userId, req.body);
    sendSuccess(res, null, 'Account deletion confirmation sent to your email');
  } catch (error) {
    next(error);
  }
}

export async function confirmAccountDeletion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    await UsersProfileService.confirmAccountDeletion(req.user.userId, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, null, 'Account deleted successfully');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN ROUTES
// ============================================================================
export async function getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const data = await UsersAdminService.getAllUsers(req.query);
    sendPaginated(res, data.users, { page: data.page, limit: data.limit, total: data.total }, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const data = await UsersAdminService.getUserById(req.params.id as string);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const user = await UsersAdminService.updateUserStatus(req.user.userId, req.params.id as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, { user }, `User status updated to ${req.body.status}`);
  } catch (error) {
    next(error);
  }
}

export async function updateUserKyc(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const user = await UsersAdminService.updateUserKyc(req.user.userId, req.params.id as string, req.body, req.ip || '', req.headers['user-agent'] || '');
    sendSuccess(res, { user }, `User KYC status updated to ${req.body.kycStatus}`);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const user = await UsersAdminService.updateUser(req.params.id as string, req.body);
    sendSuccess(res, { user }, 'User updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    await UsersAdminService.deleteUser(req.params.id as string);
    sendSuccess(res, { deletedId: req.params.id }, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const count = await UsersAdminService.deleteAllUsers();
    sendSuccess(res, { count }, 'All users deleted successfully');
  } catch (error) {
    next(error);
  }
}

export default {
  getProfile, updateProfile, updateEmail, confirmEmailChange, updatePhone, confirmPhoneChange,
  enable2FA, verify2FASetup, disable2FA, getActivity,
  getNotifications, markNotificationRead, markAllNotificationsRead,
  requestAccountDeletion, confirmAccountDeletion,
  getAllUsers, getUserById, updateUserStatus, updateUserKyc, updateUser, deleteUser, deleteAllUsers,
};

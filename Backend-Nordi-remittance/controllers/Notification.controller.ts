// ============================================================================
// NOTIFICATION CONTROLLER
// ============================================================================

import Notifications, { NotificationPreferences, PushNotifications } from '../models/NotificationModel.js';
import { sendSuccess, sendPaginated, sendCreated } from '../core/helpers/response.helper.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../core/errors/AppError.js';
import type { AuthenticatedRequest } from '../types/index.js';
import { Response, NextFunction } from 'express';

// ============================================================================
// GET USER NOTIFICATIONS
// ============================================================================
export async function getUserNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const { type, read } = req.query;
    const filter: Record<string, any> = { user: req.user.userId };
    if (type) filter.type = type;
    if (read !== undefined) filter.read = read === 'true';
    const [notifications, total] = await Promise.all([
      Notifications.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notifications.countDocuments(filter),
    ]);
    sendPaginated(res, notifications, page, limit, total);
  } catch (error) {
    next(error);
  }
}

export async function getUnreadNotificationCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const count = await Notifications.countDocuments({
      user: req.user.userId,
      read: false,
    });
    sendSuccess(res, { count });
  } catch (error) {
    next(error);
  }
}

export async function getNotificationById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const notification = await Notifications.findOne({
      _id: req.params.notificationId,
      user: req.user.userId,
    });
    if (!notification) throw new NotFoundError('Notification not found');
    sendSuccess(res, notification);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// MARK AS READ
// ============================================================================
export async function markNotificationAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const notification = await Notifications.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user.userId },
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) throw new NotFoundError('Notification not found');
    sendSuccess(res, notification);
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    await Notifications.updateMany(
      { user: req.user.userId, read: false },
      { read: true, readAt: new Date() }
    );
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DELETE NOTIFICATIONS
// ============================================================================
export async function deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const notification = await Notifications.findOneAndDelete({
      _id: req.params.notificationId,
      user: req.user.userId,
    });
    if (!notification) throw new NotFoundError('Notification not found');
    sendSuccess(res, null, 'Notification deleted');
  } catch (error) {
    next(error);
  }
}

export async function deleteNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const { read } = req.query;
    const filter: Record<string, any> = { user: req.user.userId };
    if (read !== undefined) filter.read = read === 'true';
    const result = await Notifications.deleteMany(filter);
    sendSuccess(res, { deleted: result.deletedCount }, 'Notifications deleted');
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================
export async function getNotificationSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    let settings = await NotificationPreferences.findOne({ user: req.user.userId });
    if (!settings) {
      settings = await NotificationPreferences.create({
        user: req.user.userId,
        email: {
          enabled: true,
          transactions: true,
          security: true,
          marketing: false,
          accountUpdates: true,
          newsletters: false,
          productUpdates: true,
        },
        push: {
          enabled: true,
          transactions: true,
          security: true,
          marketing: false,
          accountUpdates: true,
        },
        sms: {
          enabled: true,
          transactions: true,
          security: true,
          marketing: false,
          otp: true,
        },
        inApp: {
          enabled: true,
          transactions: true,
          security: true,
          marketing: true,
          accountUpdates: true,
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'UTC',
        },
        frequency: {
          digest: 'realtime',
          summaryTime: '09:00',
        },
      });
    }
    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
}


export async function updateNotificationSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const { email, push, sms, inApp, quietHours, frequency } = req.body;
    const settings = await NotificationPreferences.findOneAndUpdate(
      { user: req.user.userId },
      {
        $set: {
          ...(email && { email }),
          ...(push && { push }),
          ...(sms && { sms }),
          ...(inApp && { inApp }),
          ...(quietHours && { quietHours }),
          ...(frequency && { frequency }),
        },
      },
      { new: true, upsert: true }
    );
    sendSuccess(res, settings, 'Settings updated');
  } catch (error) {
    next(error);
  }
}


// ============================================================================
// PUSH TOKENS
// ============================================================================
export async function registerPushToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    const { deviceTokens, title, body, platform, deviceId } = req.body;
    if (!deviceTokens || !Array.isArray(deviceTokens) || deviceTokens.length === 0 || !platform) {
      throw new ValidationError('deviceTokens (array) and platform are required');
    }
    // Remove any existing push notifications for this user/deviceId
    await PushNotifications.deleteMany({
      user: req.user.userId,
      'deviceTokens': { $in: deviceTokens },
    });
    const pushNotification = await PushNotifications.create({
      user: req.user.userId,
      deviceTokens,
      title: title || 'Push Notification',
      body: body || '',
      platform,
      deviceId,
      provider: platform,
    });
    sendCreated(res, pushNotification, 'Push notification registered');
  } catch (error) {
    next(error);
  }
}


export async function removePushToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new UnauthorizedError('Authentication required');
    await PushNotifications.deleteMany({
      user: req.user.userId,
      deviceId: req.params.deviceId,
    });
    sendSuccess(res, null, 'Push notification removed');
  } catch (error) {
    next(error);
  }
}


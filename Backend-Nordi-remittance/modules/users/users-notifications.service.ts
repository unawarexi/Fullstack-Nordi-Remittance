import { Notifications } from '../notifications/notifications.model.js';
import { NotFoundError } from '../../core/errors/AppError.js';
import { emitToUser } from '../../services/websocket.service.js';
import {
  cacheUserNotifications,
  getCachedUserNotifications,
  invalidateNotificationCache,
  resetUnreadCount,
  getUnreadCount,
} from '../../services/redis.service.js';

const WS_EVENTS = {
  NOTIFICATION_READ: 'notification:read',
};

export class UsersNotificationsService {
  static async getNotifications(userId: string, query: any) {
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const unreadOnly = query.unread === 'true';

    if (page === 1 && !unreadOnly) {
      const cachedNotifications = await getCachedUserNotifications(userId);
      const cachedUnreadCount = await getUnreadCount(userId);

      if (cachedNotifications) {
        return {
          notifications: cachedNotifications,
          page,
          limit,
          total: cachedNotifications.length,
          unreadCount: cachedUnreadCount || 0,
        };
      }
    }

    const filter: Record<string, any> = { userId };
    if (unreadOnly) {
      filter.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notifications.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notifications.countDocuments(filter),
      Notifications.countDocuments({ user: userId, isRead: false }),
    ]);

    if (page === 1 && !unreadOnly) {
      await cacheUserNotifications(userId, notifications);
    }

    return { notifications, page, limit, total, unreadCount };
  }

  static async markNotificationRead(userId: string, notificationId: string) {
    const notification = await Notifications.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    );

    if (!notification) throw new NotFoundError('Notification not found');

    await invalidateNotificationCache(userId);

    emitToUser(userId, WS_EVENTS.NOTIFICATION_READ, {
      type: 'notification_read',
      data: { notificationId },
      timestamp: new Date().toISOString(),
    });

    return notification;
  }

  static async markAllNotificationsRead(userId: string) {
    await Notifications.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    await Promise.all([
      resetUnreadCount(userId),
      invalidateNotificationCache(userId),
    ]);

    emitToUser(userId, WS_EVENTS.NOTIFICATION_READ, {
      type: 'all_notifications_read',
      timestamp: new Date().toISOString(),
    });
  }
}

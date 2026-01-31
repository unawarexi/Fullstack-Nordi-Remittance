
import { Router } from 'express';
import { authenticate, verifyAccountStatus } from '../middleware/Auth.middleware.js';
import { sanitizeInput } from '../middleware/Security.middleware.js';
import { requestLoggingMiddleware } from '../middleware/Core.middleware.js';
import * as NotificationController from '../controllers/Notification.controller.js';

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);
router.use(authenticate);
router.use(verifyAccountStatus);

// Get user's notifications
router.get('/', NotificationController.getUserNotifications);

// Get unread notification count
router.get('/unread-count', NotificationController.getUnreadNotificationCount);

// Get specific notification
router.get('/:notificationId', NotificationController.getNotificationById);

// Mark notification as read
router.put('/:notificationId/read', NotificationController.markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', NotificationController.markAllNotificationsAsRead);

// Delete notification
router.delete('/:notificationId', NotificationController.deleteNotification);

// Delete all notifications (or filtered)
router.delete('/', NotificationController.deleteNotifications);

// Get notification settings
router.get('/settings', NotificationController.getNotificationSettings);

// Update notification settings
router.put('/settings', NotificationController.updateNotificationSettings);

// Register push notification token
router.post('/push-token', NotificationController.registerPushToken);

// Remove push notification token
router.delete('/push-token/:deviceId', NotificationController.removePushToken);

export default router;

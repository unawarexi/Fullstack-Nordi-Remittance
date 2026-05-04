import { Request, Response, NextFunction } from "express";
import type {
  AuthenticatedRequest,
  UserRole,
  AccountStatus,
  KycStatus,
} from "../types/index.js";
import Users from "../models/UserModel.js";
import {
  Wallets,
  AccountBalances,
  AccountLimits,
} from "../models/AccountsModel.js";
import Transactions from "../models/TransactionModel.js";
import { SecurityEvent, ConfirmationToken } from "../models/ConfirmModel.js";
import { Notifications } from "../models/NotificationModel.js";
import Permissions from "../models/PermissionsModel.js";
import {
  hashPassword,
  comparePassword,
  generateOTP,
} from "../core/helpers/crypto.helper.js";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNotFound,
} from "../core/helpers/response.helper.js";
import {
  sanitizeString,
  isValidEmail,
  isValidPhone,
} from "../core/helpers/validation.helper.js";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../core/errors/AppError.js";
import { queueTemplatedMail } from "../services/workers.js";
import EmailContentGenerator from "../core/mail/Mail-content.js";
import { env } from "../config/env.config.js";
import { emitToUser, broadcast } from "../services/websocket.service.js";
import {
  cacheUserProfile,
  getCachedUserProfile,
  invalidateUserCache,
  cacheUserWallets,
  getCachedUserWallets,
  cacheUserNotifications,
  getCachedUserNotifications,
  invalidateNotificationCache,
  resetUnreadCount,
  getUnreadCount,
  store2FACode,
  verify2FACode,
  cacheKycStatus,
  invalidateKycCache,
  CACHE_KEYS,
  CACHE_TTL,
  cacheSet,
  cacheGet,
} from "../services/redis.service.js";
import { onUserWrite } from "../services/query-cache.service.js";

// Initialize email content generator
const emailGenerator = new EmailContentGenerator();

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================
const WS_EVENTS = {
  PROFILE_UPDATED: "profile:updated",
  EMAIL_CHANGED: "profile:email_changed",
  PHONE_CHANGED: "profile:phone_changed",
  TWO_FACTOR_ENABLED: "security:2fa_enabled",
  TWO_FACTOR_DISABLED: "security:2fa_disabled",
  ACCOUNT_DELETED: "account:deleted",
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",
  KYC_STATUS_CHANGED: "kyc:status_changed",
  USER_STATUS_CHANGED: "user:status_changed",
};

// ============================================================================
// GET USER PROFILE
// ============================================================================

/**
 * Get current user's profile
 * GET /users/profile
 */
export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userId = req.user.userId;

    // Try to get from Redis cache first
    const cachedProfile = await getCachedUserProfile(userId);
    const cachedWallets = await getCachedUserWallets(userId);

    if (cachedProfile && cachedWallets) {
      sendSuccess(res, {
        user: cachedProfile,
        wallets: cachedWallets,
        permissions: cachedProfile.permissions || null,
      });
      return;
    }

    const user: any = await Users.findById(userId).select(
      "-password -twoFactorSecret -backupCodes",
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get wallets
    const wallets = await Wallets.find({ user: String(user._id) }).select(
      "walletNumber balances status isPrimary walletType",
    );

    // Get permissions
    const permissions = await Permissions.findOne({ userId: String(user._id) });

    const profileData = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      accountNumber: user.accountNumber,
      mobileNumber: user.mobileNumber,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      country: user.country,
      currency: user.currency,
      kycStatus: user.kycStatus,
      isActive: user.isActive,
      enableTwoFactor: user.enableTwoFactor,
      profilePicture: user.profilePicture,
      homeAddress: user.homeAddress,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      permissions: permissions
        ? {
            enableDomesticTransfers: permissions.enableDomesticTransfers,
            enableInternationalTransfers:
              permissions.enableInternationalTransfers,
            enableCardPayments: permissions.enableCardPayments,
            enableCryptoTransfers: permissions.enableCryptoTransfers,
          }
        : null,
    };

    // Cache profile and wallets in Redis
    await Promise.all([
      cacheUserProfile(userId, profileData),
      cacheUserWallets(userId, wallets),
    ]);

    sendSuccess(res, {
      user: profileData,
      wallets,
      permissions: profileData.permissions,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================

/**
 * Update current user's profile
 * PATCH /users/profile
 */
export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "middleName",
      "dateOfBirth",
      "gender",
      "timezone",
      "language",
      "address",
      "profilePicture",
    ];

    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === "string") {
          updates[field] = sanitizeString(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    // Validate specific fields
    if (updates.firstName && updates.firstName.length < 2) {
      throw new ValidationError("First name must be at least 2 characters");
    }

    if (updates.lastName && updates.lastName.length < 2) {
      throw new ValidationError("Last name must be at least 2 characters");
    }

    const user = await Users.findByIdAndUpdate(
      req.user.userId,
      { $set: updates, updatedAt: new Date() },
      { new: true },
    ).select("-password -twoFactorSecret -backupCodes");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Invalidate Redis cache
    await invalidateUserCache(req.user.userId);

    // Emit WebSocket event for real-time update
    emitToUser(req.user.userId, WS_EVENTS.PROFILE_UPDATED, {
      type: "profile_update",
      data: { updatedFields: Object.keys(updates) },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { user }, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// UPDATE EMAIL
// ============================================================================

/**
 * Update email (requires verification)
 * POST /users/update-email
 */
export async function updateEmail(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { newEmail, password } = req.body;

    if (!newEmail || !isValidEmail(newEmail)) {
      throw new ValidationError("Valid email is required");
    }

    if (!password) {
      throw new ValidationError("Password is required to change email");
    }

    // Check if email is already in use
    const existingUser = await Users.findOne({
      email: newEmail.toLowerCase(),
      _id: { $ne: req.user.userId as string },
    });

    if (existingUser) {
      throw new ValidationError("Email is already in use");
    }

    // Verify password
    const user = await Users.findById(req.user.userId).select("+password");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await comparePassword(
      password,
      user.password as string,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid password");
    }

    // Generate verification OTP
    const otp = generateOTP(6);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await ConfirmationToken.create({
      userId: String(user._id),
      token: otp,
      type: "email_change",
      expiresAt: otpExpiry,
      used: false,
      metadata: { newEmail: newEmail.toLowerCase() },
    });

    // Send OTP to new email using template
    const emailContent = emailGenerator.otpEmail({
      firstName: user.firstName as string,
      email: newEmail.toLowerCase(),
      otpCode: otp,
      purpose: "verify your new email address",
      expiresIn: "15 minutes",
      userId: String(user._id),
    });

    await queueTemplatedMail(newEmail, emailContent);

    sendSuccess(res, null, "Verification code sent to new email");
  } catch (error) {
    next(error);
  }
}

/**
 * Confirm email change with OTP
 * POST /users/confirm-email-change
 */
export async function confirmEmailChange(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { otp } = req.body;

    if (!otp) {
      throw new ValidationError("Verification code is required");
    }

    const tokenDoc = await ConfirmationToken.findOne({
      userId: req.user.userId,
      token: otp,
      type: "email_change",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc || !tokenDoc.metadata?.newEmail) {
      throw new ValidationError("Invalid or expired verification code");
    }

    const newEmail = tokenDoc.metadata.newEmail;

    // Update user email
    const user = await Users.findByIdAndUpdate(
      req.user.userId,
      {
        email: newEmail,
        emailVerified: true,
        updatedAt: new Date(),
      },
      { new: true },
    ).select("-password -twoFactorSecret -backupCodes");

    // Mark token as used
    await ConfirmationToken.updateOne({ _id: tokenDoc._id }, { used: true });

    // Log security event
    await SecurityEvent.create({
      userId: req.user.userId,
      type: "email_changed",
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers["user-agent"],
      metadata: { newEmail },
      createdAt: new Date(),
    });

    // Invalidate Redis cache
    await invalidateUserCache(req.user.userId);

    // Emit WebSocket event
    emitToUser(req.user.userId, WS_EVENTS.EMAIL_CHANGED, {
      type: "email_changed",
      data: { newEmail },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { user }, "Email updated successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// UPDATE PHONE
// ============================================================================

/**
 * Update phone (requires verification)
 * POST /users/update-phone
 */
export async function updatePhone(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { newPhone, password } = req.body;

    if (!newPhone || !isValidPhone(newPhone)) {
      throw new ValidationError("Valid phone number is required");
    }

    if (!password) {
      throw new ValidationError("Password is required to change phone");
    }

    // Check if phone is already in use
    const existingUser = await Users.findOne({
      phone: newPhone,
      _id: { $ne: req.user.userId },
    });

    if (existingUser) {
      throw new ValidationError("Phone number is already in use");
    }

    // Verify password
    const user: any = await Users.findById(req.user.userId).select("+password");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await comparePassword(
      password,
      user.password as string,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid password");
    }

    // Generate OTP
    const otp = generateOTP(6);
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await ConfirmationToken.create({
      userId: String(user._id),
      token: otp,
      type: "phone_change",
      expiresAt: otpExpiry,
      used: false,
      metadata: { newPhone },
    });

    // TODO: Send OTP via SMS
    // For now, return it in response (development only)
    sendSuccess(res, {
      message: "Verification code sent to new phone",
      ...(env.NODE_ENV === "development" && { otp }),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Confirm phone change with OTP
 * POST /users/confirm-phone-change
 */
export async function confirmPhoneChange(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { otp } = req.body;

    if (!otp) {
      throw new ValidationError("Verification code is required");
    }

    const tokenDoc = await ConfirmationToken.findOne({
      userId: req.user.userId,
      token: otp,
      type: "phone_change",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc || !tokenDoc.metadata?.newPhone) {
      throw new ValidationError("Invalid or expired verification code");
    }

    const newPhone = tokenDoc.metadata.newPhone;

    // Update user phone
    const user = await Users.findByIdAndUpdate(
      req.user.userId,
      {
        phone: newPhone,
        phoneVerified: true,
        updatedAt: new Date(),
      },
      { new: true },
    ).select("-password -twoFactorSecret -backupCodes");

    // Mark token as used
    await ConfirmationToken.updateOne({ _id: tokenDoc._id }, { used: true });

    // Log security event
    await SecurityEvent.create({
      userId: req.user.userId,
      type: "phone_changed",
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers["user-agent"],
      metadata: { newPhone },
      createdAt: new Date(),
    });

    // Invalidate Redis cache
    await invalidateUserCache(req.user.userId);

    // Emit WebSocket event
    emitToUser(req.user.userId, WS_EVENTS.PHONE_CHANGED, {
      type: "phone_changed",
      data: { newPhone: newPhone.slice(0, 4) + "****" + newPhone.slice(-2) },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { user }, "Phone updated successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// TWO-FACTOR AUTHENTICATION
// ============================================================================

/**
 * Enable 2FA
 * POST /users/enable-2fa
 */
export async function enable2FA(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await Users.findById(req.user.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.twoFactorEnabled) {
      throw new ValidationError("Two-factor authentication is already enabled");
    }

    // Generate secret (in production, use speakeasy or similar)
    const secret = `SECRET_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Generate backup codes
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(generateOTP(8));
    }

    // Store secret temporarily (user needs to verify before enabling)
    await ConfirmationToken.create({
      userId: user._id as string,
      token: secret,
      type: "two_factor_setup",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      used: false,
      metadata: { backupCodes },
    });

    // In production, generate a proper TOTP URI and QR code
    const otpAuthUrl = `otpauth://totp/Remit:${user.email}?secret=${secret}&issuer=Remit`;

    sendSuccess(
      res,
      {
        secret,
        otpAuthUrl,
        backupCodes,
      },
      "Please verify your 2FA setup by entering a code from your authenticator app",
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Verify and confirm 2FA setup
 * POST /users/verify-2fa-setup
 */
export async function verify2FASetup(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { code } = req.body;

    if (!code) {
      throw new ValidationError("Verification code is required");
    }

    const tokenDoc = await ConfirmationToken.findOne({
      userId: req.user.userId,
      type: "two_factor_setup",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw new ValidationError(
        "2FA setup session expired. Please start again.",
      );
    }

    // In production, verify the TOTP code against the secret
    // For now, accept any 6-digit code for testing
    if (code.length !== 6) {
      throw new ValidationError("Invalid verification code");
    }

    // Enable 2FA
    await Users.updateOne(
      { _id: req.user.userId },
      {
        twoFactorEnabled: true,
        twoFactorSecret: tokenDoc.token,
        twoFactorMethod: "authenticator",
        backupCodes: tokenDoc.metadata?.backupCodes || [],
        updatedAt: new Date(),
      },
    );

    // Mark token as used
    await ConfirmationToken.updateOne({ _id: tokenDoc._id }, { used: true });

    // Log security event
    await SecurityEvent.create({
      userId: req.user.userId,
      type: "two_factor_enabled",
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers["user-agent"],
      createdAt: new Date(),
    });

    // Invalidate Redis cache
    await invalidateUserCache(req.user.userId);

    // Emit WebSocket event for security notification
    emitToUser(req.user.userId, WS_EVENTS.TWO_FACTOR_ENABLED, {
      type: "security_update",
      data: { twoFactorEnabled: true },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "Two-factor authentication enabled successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Disable 2FA
 * POST /users/disable-2fa
 */
export async function disable2FA(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { password, code } = req.body;

    if (!password) {
      throw new ValidationError("Password is required");
    }

    const user: any = await Users.findById(req.user.userId).select(
      "+password +twoFactorSecret",
    );
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.twoFactorEnabled) {
      throw new ValidationError("Two-factor authentication is not enabled");
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      password,
      user.password as string,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid password");
    }

    // Verify 2FA code or backup code
    const backupCodes = user.backupCodes as string[] | undefined;
    const isValidCode = backupCodes?.includes(code) || code === "123456"; // TODO: TOTP verification
    if (!isValidCode) {
      throw new ValidationError("Invalid verification code");
    }

    // Disable 2FA
    await Users.updateOne(
      { _id: req.user.userId },
      {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorMethod: null,
        backupCodes: [],
        updatedAt: new Date(),
      },
    );

    // Log security event
    await SecurityEvent.create({
      userId: req.user.userId,
      type: "two_factor_disabled",
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers["user-agent"],
      createdAt: new Date(),
    });

    // Send notification email using template
    const emailContent = emailGenerator.twoFactorDisabledEmail({
      firstName: user.firstName as string,
      email: user.email as string,
      disabledAt: new Date().toISOString(),
      ipAddress: req.clientIp || req.ip || "Unknown",
      userId: String(user._id),
    });

    await queueTemplatedMail(user.email as string, emailContent);

    // Invalidate Redis cache
    await invalidateUserCache(req.user.userId);

    // Emit WebSocket event for security notification
    emitToUser(req.user.userId, WS_EVENTS.TWO_FACTOR_DISABLED, {
      type: "security_update",
      data: { twoFactorEnabled: false },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "Two-factor authentication disabled");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET USER ACTIVITY
// ============================================================================

/**
 * Get user's recent activity
 * GET /users/activity
 */
export async function getActivity(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      SecurityEvent.find({ userId: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SecurityEvent.countDocuments({ userId: req.user.userId }),
    ]);

    sendPaginated(
      res,
      activities,
      { page, limit, total },
      "Activity retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET USER NOTIFICATIONS
// ============================================================================

/**
 * Get user's notifications
 * GET /users/notifications
 */
export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === "true";

    // Try Redis cache for first page of notifications
    if (page === 1 && !unreadOnly) {
      const cachedNotifications = await getCachedUserNotifications(
        req.user.userId,
      );
      const cachedUnreadCount = await getUnreadCount(req.user.userId);

      if (cachedNotifications) {
        sendPaginated(
          res,
          cachedNotifications,
          {
            page,
            limit,
            total: cachedNotifications.length,
          },
          "Notifications retrieved",
        );
        return;
      }
    }

    const filter: Record<string, any> = { userId: req.user.userId };
    if (unreadOnly) {
      filter.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notifications.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notifications.countDocuments(filter),
      Notifications.countDocuments({ user: req.user.userId, isRead: false }),
    ]);

    // Cache first page of notifications
    if (page === 1 && !unreadOnly) {
      await cacheUserNotifications(req.user.userId, notifications);
    }

    sendPaginated(
      res,
      notifications,
      { page, limit, total },
      "Notifications retrieved",
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Mark notification as read
 * PATCH /users/notifications/:id/read
 */
export async function markNotificationRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;

    const notification = await Notifications.findOneAndUpdate(
      { _id: id, user: req.user.userId },
      { isRead: true, readAt: new Date() },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    // Invalidate notification cache
    await invalidateNotificationCache(req.user.userId);

    // Emit WebSocket event
    emitToUser(req.user.userId, WS_EVENTS.NOTIFICATION_READ, {
      type: "notification_read",
      data: { notificationId: id },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { notification }, "Notification marked as read");
  } catch (error) {
    next(error);
  }
}

/**
 * Mark all notifications as read
 * POST /users/notifications/read-all
 */
export async function markAllNotificationsRead(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    await Notifications.updateMany(
      { user: req.user.userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    // Reset unread count and invalidate cache
    await Promise.all([
      resetUnreadCount(req.user.userId),
      invalidateNotificationCache(req.user.userId),
    ]);

    // Emit WebSocket event
    emitToUser(req.user.userId, WS_EVENTS.NOTIFICATION_READ, {
      type: "all_notifications_read",
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DELETE ACCOUNT
// ============================================================================

/**
 * Request account deletion
 * POST /users/delete-account
 */
export async function requestAccountDeletion(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { password, reason } = req.body;

    if (!password) {
      throw new ValidationError("Password is required");
    }

    const user: any = await Users.findById(req.user.userId).select("+password");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      password,
      user.password as string,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid password");
    }

    // Check for pending transactions or balances
    const wallet: any = await Wallets.findOne({ user: String(user._id) });
    if (wallet && wallet.balances && wallet.balances.size > 0) {
      // Check if any balance is greater than 0
      let hasBalance = false;
      wallet.balances.forEach((balance: number) => {
        if (balance > 0) hasBalance = true;
      });
      if (hasBalance) {
        throw new ValidationError(
          "Please withdraw your remaining balance before deleting your account",
        );
      }
    }

    const pendingTransactions = await Transactions.countDocuments({
      $or: [{ sender: user._id }, { recipient: user._id }],
      status: { $in: ["pending", "processing"] },
    });

    if (pendingTransactions > 0) {
      throw new ValidationError(
        "Please wait for pending transactions to complete before deleting your account",
      );
    }

    // Generate deletion confirmation token
    const deletionToken = generateOTP(6);
    const deletionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await ConfirmationToken.create({
      userId: String(user._id),
      token: deletionToken,
      type: "account_deletion",
      expiresAt: deletionExpiry,
      used: false,
      metadata: { reason },
    });

    // Send confirmation email using template
    const emailContent = emailGenerator.accountDeletionRequestEmail({
      firstName: user.firstName as string,
      email: user.email as string,
      verificationCode: deletionToken,
      expiresIn: "24 hours",
      userId: String(user._id),
    });

    await queueTemplatedMail(user.email as string, emailContent);

    sendSuccess(res, null, "Account deletion confirmation sent to your email");
  } catch (error) {
    next(error);
  }
}

/**
 * Confirm account deletion
 * POST /users/confirm-deletion
 */
export async function confirmAccountDeletion(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { code } = req.body;

    if (!code) {
      throw new ValidationError("Confirmation code is required");
    }

    const tokenDoc = await ConfirmationToken.findOne({
      userId: req.user.userId,
      token: code,
      type: "account_deletion",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw new ValidationError("Invalid or expired confirmation code");
    }

    // Soft delete user
    await Users.updateOne(
      { _id: req.user.userId },
      {
        status: "deactivated",
        deletedAt: new Date(),
        email: `deleted_${req.user.userId}_${Date.now()}@deleted.local`,
        phone: null,
        updatedAt: new Date(),
      },
    );

    // Deactivate wallets
    await Wallets.updateMany({ user: req.user.userId }, { status: "closed" });

    // Mark token as used
    await ConfirmationToken.updateOne({ _id: tokenDoc._id }, { used: true });

    // Log security event
    await SecurityEvent.create({
      userId: req.user.userId,
      type: "account_deleted",
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers["user-agent"],
      metadata: { reason: tokenDoc.metadata?.reason },
      createdAt: new Date(),
    });

    // Invalidate all user caches
    await invalidateUserCache(req.user.userId);

    // Emit WebSocket event (user will be disconnected after this)
    emitToUser(req.user.userId, WS_EVENTS.ACCOUNT_DELETED, {
      type: "account_deleted",
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "Account deleted successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ADMIN: GET ALL USERS
// ============================================================================

/**
 * Get all users (admin only)
 * GET /users
 */
export async function getAllUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, any> = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.kycStatus) {
      filter.kycStatus = req.query.kycStatus;
    }
    if (req.query.search) {
      const search = (req.query.search as string).trim();
      if (search.length >= 3) {
        // Use $text index for performant full-text search
        filter.$text = { $search: search };
      } else {
        // For short queries, use prefix-anchored regex (safe + indexed)
        const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
          { email: new RegExp(`^${sanitized}`, "i") },
          { firstName: new RegExp(`^${sanitized}`, "i") },
          { lastName: new RegExp(`^${sanitized}`, "i") },
        ];
      }
    }

    // Build sort
    const sortField = (req.query.sortBy as string) || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const [users, total] = await Promise.all([
      Users.find(filter)
        .select("-password -twoFactorSecret -backupCodes")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Users.countDocuments(filter),
    ]);

    sendPaginated(
      res,
      users,
      { page, limit, total },
      "Users retrieved successfully",
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get user by ID (admin only)
 * GET /users/:id
 */
export async function getUserById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;

    const user: any = await Users.findById(id).select(
      "-password -twoFactorSecret -backupCodes",
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get wallets
    const wallets = await Wallets.find({ user: String(user._id) });

    // Get recent transactions — with projection
    const recentTransactions = await Transactions.find({
      $or: [{ sender: String(user._id) }, { recipient: String(user._id) }],
    })
      .select(
        "type amount currency status referenceNumber createdAt completedAt",
      )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get permissions
    const permissions = await Permissions.findOne({ userId: String(user._id) });

    sendSuccess(res, {
      user,
      wallets,
      recentTransactions,
      permissions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user status (admin only)
 * PATCH /users/:id/status
 */
export async function updateUserStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ["active", "suspended", "locked", "deactivated"];
    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError("Invalid status");
    }

    const user = await Users.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: new Date(),
        ...(status === "suspended" && {
          suspendedAt: new Date(),
          suspendReason: reason,
        }),
      },
      { new: true },
    ).select("-password -twoFactorSecret -backupCodes");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Log admin action
    await SecurityEvent.create({
      userId: id as string,
      type: "status_changed",
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers["user-agent"],
      metadata: {
        newStatus: status,
        changedBy: req.user.userId,
        reason,
      },
      createdAt: new Date(),
    });

    // Invalidate user cache
    await invalidateUserCache(id as string);

    // Emit WebSocket event to affected user
    emitToUser(id as string, WS_EVENTS.USER_STATUS_CHANGED, {
      type: "status_changed",
      data: { newStatus: status, reason },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { user }, `User status updated to ${status}`);

    // Invalidate dashboard/stats caches
    onUserWrite(id as string).catch(() => {});
  } catch (error) {
    next(error);
  }
}

/**
 * Update user KYC status (admin only)
 * PATCH /users/:id/kyc
 */
export async function updateUserKyc(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.params;
    const { kycStatus, reason } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "expired"];
    if (!kycStatus || !validStatuses.includes(kycStatus)) {
      throw new ValidationError("Invalid KYC status");
    }

    const user = await Users.findByIdAndUpdate(
      id,
      {
        kycStatus,
        updatedAt: new Date(),
        ...(kycStatus === "approved" && { kycApprovedAt: new Date() }),
        ...(kycStatus === "rejected" && {
          kycRejectedAt: new Date(),
          kycRejectionReason: reason,
        }),
      },
      { new: true },
    ).select("-password -twoFactorSecret -backupCodes");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Log admin action
    await SecurityEvent.create({
      userId: id as string,
      type: "kyc_status_changed",
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers["user-agent"],
      metadata: {
        newKycStatus: kycStatus,
        changedBy: req.user.userId,
        reason,
      },
      createdAt: new Date(),
    });

    // Send notification email using template
    const kycEmailStatus =
      kycStatus === "expired"
        ? "pending"
        : (kycStatus as "pending" | "approved" | "rejected");
    const emailContent = emailGenerator.kycStatusEmail({
      firstName: user.firstName as string,
      status: kycEmailStatus,
      notes: kycStatus === "rejected" ? reason : undefined,
      userId: id as string,
    });

    await queueTemplatedMail(user.email as string, emailContent);

    // Invalidate user and KYC cache
    await Promise.all([
      invalidateUserCache(id as string),
      invalidateKycCache(id as string),
    ]);

    // Emit WebSocket event for KYC status change
    emitToUser(id as string, WS_EVENTS.KYC_STATUS_CHANGED, {
      type: "kyc_status_changed",
      data: { newStatus: kycStatus, reason },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { user }, `User KYC status updated to ${kycStatus}`);

    // Invalidate dashboard/stats caches
    onUserWrite(id as string).catch(() => {});
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getProfile,
  updateProfile,
  updateEmail,
  confirmEmailChange,
  updatePhone,
  confirmPhoneChange,
  enable2FA,
  verify2FASetup,
  disable2FA,
  getActivity,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  requestAccountDeletion,
  confirmAccountDeletion,
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserKyc,
};

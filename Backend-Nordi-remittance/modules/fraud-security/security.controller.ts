// ============================================================================
// SECURITY CONTROLLER
// ============================================================================

import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../types/index.js";
import {
  SecurityEvents,
  BehaviorProfiles,
} from "./fraud-security.model.js";
import Users from "../users/users.model.js";
import { sendSuccess, sendPaginated } from "../../core/helpers/response.helper.js";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../../core/errors/AppError.js";
import { queueTemplatedMail } from "../../services/workers.js";
import EmailContentGenerator from "../../core/mail/Mail-content.js";
import { emitToUser } from "../../services/websocket.service.js";
import { WS } from "../../core/constants/ws-events.js";
import { encrypt, decrypt } from "../../core/helpers/crypto.helper.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

// Initialize email content generator
const emailGenerator = new EmailContentGenerator();

// ============================================================================
// LOGIN HISTORY
// ============================================================================

export async function getLoginHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      SecurityEvents.find({
        user: req.user.userId,
        eventType: { $in: ["login", "login_failed", "logout"] },
      })
        .select(
          "eventType severity ipAddress location userAgent timestamp createdAt",
        )
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SecurityEvents.countDocuments({
        user: req.user.userId,
        eventType: { $in: ["login", "login_failed", "logout"] },
      }),
    ]);

    sendPaginated(res, events, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ACTIVE SESSIONS
// ============================================================================

export async function getActiveSessions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    const sessions = (user.activeSessions as any[]) || [];

    // Mark current session
    const currentSessionId = req.headers["x-session-id"] as string;
    const sessionsWithCurrent = sessions.map((session: any) => ({
      ...(session.toObject ? session.toObject() : session),
      isCurrent: session.sessionId === currentSessionId,
    }));

    sendSuccess(res, { sessions: sessionsWithCurrent });
  } catch (error) {
    next(error);
  }
}

export async function revokeSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { sessionId } = req.params;

    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    const activeSessions = (user.activeSessions as any[]) || [];
    if (!activeSessions.length) {
      throw new NotFoundError("Session not found");
    }

    const sessionIndex = activeSessions.findIndex(
      (s: any) => s.sessionId === sessionId,
    );

    if (sessionIndex === -1) {
      throw new NotFoundError("Session not found");
    }

    activeSessions.splice(sessionIndex, 1);
    user.activeSessions = activeSessions as any;
    await user.save();

    // Log security event
    await SecurityEvents.create({
      user: req.user.userId,
      eventType: "session_revoked",
      severity: "info",
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
      metadata: { revokedSessionId: sessionId },
    });

    emitToUser(req.user!.userId, WS.SECURITY.SESSION_REVOKED, {
      sessionId,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "Session revoked successfully");
  } catch (error) {
    next(error);
  }
}

export async function revokeAllSessions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { exceptCurrent } = req.body;

    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    const currentSessionId = req.headers["x-session-id"] as string;
    const activeSessions = (user.activeSessions as any[]) || [];

    if (exceptCurrent && currentSessionId) {
      user.activeSessions = activeSessions.filter(
        (s: any) => s.sessionId === currentSessionId,
      ) as any;
    } else {
      user.activeSessions = [] as any;
    }

    await user.save();

    await SecurityEvents.create({
      user: req.user.userId,
      eventType: "all_sessions_revoked",
      severity: "warning",
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });

    emitToUser(req.user!.userId, WS.SECURITY.ALL_SESSIONS_REVOKED, {
      exceptCurrent: !!exceptCurrent,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "All sessions revoked");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// TWO-FACTOR AUTHENTICATION
// ============================================================================

export async function setup2FA(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.twoFactorEnabled) {
      throw new ValidationError("2FA is already enabled");
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Remit (${user.email})`,
      issuer: "Remit",
    });

    // Store temporarily (encrypted)
    user.twoFactorSecret = encrypt(secret.base32);
    user.twoFactorPending = true;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    emitToUser(req.user!.userId, WS.SECURITY.TWO_FA_ENABLED, {
      step: "setup_initiated",
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message:
        "Scan the QR code with your authenticator app, then verify with a code.",
    });
  } catch (error) {
    next(error);
  }
}

export async function verify2FASetup(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { code } = req.body;

    const user: any = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.twoFactorSecret || !(user as any).twoFactorPending) {
      throw new ValidationError("2FA setup not initiated");
    }

    const secret = decrypt(String(user.twoFactorSecret));
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      throw new ValidationError("Invalid verification code");
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );

    user.twoFactorEnabled = true;
    (user as any).twoFactorPending = false;
    user.backupCodes = backupCodes.map((code) => encrypt(code)) as any;
    (user as any).twoFactorEnabledAt = new Date();
    await user.save();

    // Log security event
    await SecurityEvents.create({
      user: req.user.userId,
      eventType: "2fa_enabled",
      severity: "info",
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });

    // Send confirmation email using template
    const emailContent = emailGenerator.twoFactorEnabledEmail({
      firstName: String(user.firstName),
      email: String(user.email),
      enabledAt: new Date().toISOString(),
      method: "authenticator",
      backupCodes,
      userId: String(user._id),
    });

    queueTemplatedMail(String(user.email), emailContent).catch(console.error);

    emitToUser(req.user!.userId, WS.SECURITY.TWO_FA_ENABLED, {
      step: "confirmed",
      enabled: true,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      {
        enabled: true,
        backupCodes,
        message: "Save your backup codes in a secure location.",
      },
      "2FA enabled successfully",
    );
  } catch (error) {
    next(error);
  }
}

export async function disable2FA(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { code, password } = req.body;

    const user: any = await Users.findById(req.user.userId).select("+password");
    if (!user) throw new NotFoundError("User not found");

    if (!user.twoFactorEnabled) {
      throw new ValidationError("2FA is not enabled");
    }

    // Verify password
    const bcrypt = await import("bcryptjs");
    const isPasswordValid = await bcrypt.compare(
      password,
      String(user.password),
    );
    if (!isPasswordValid) {
      throw new ValidationError("Invalid password");
    }

    // Verify 2FA code
    const secret = decrypt(String(user.twoFactorSecret));
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      throw new ValidationError("Invalid 2FA code");
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = undefined as any;
    (user as any).twoFactorEnabledAt = undefined;
    await user.save();

    await SecurityEvents.create({
      user: req.user.userId,
      eventType: "2fa_disabled",
      severity: "warning",
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });

    // Send notification email using template
    const emailContent = emailGenerator.twoFactorDisabledEmail({
      firstName: String(user.firstName),
      email: String(user.email),
      disabledAt: new Date().toISOString(),
      ipAddress: req.ip || "Unknown",
      userId: String(user._id),
    });

    queueTemplatedMail(String(user.email), emailContent).catch(console.error);

    emitToUser(req.user!.userId, WS.SECURITY.TWO_FA_DISABLED, {
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "2FA disabled successfully");
  } catch (error) {
    next(error);
  }
}

export async function regenerateBackupCodes(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { code } = req.body;

    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.twoFactorEnabled) {
      throw new ValidationError("2FA is not enabled");
    }

    // Verify 2FA code
    const secret = decrypt(String(user.twoFactorSecret));
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      throw new ValidationError("Invalid 2FA code");
    }

    // Generate new backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );

    user.backupCodes = backupCodes.map((code) => encrypt(code)) as any;
    await user.save();

    await SecurityEvents.create({
      user: req.user.userId,
      eventType: "backup_codes_regenerated",
      severity: "info",
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    });

    sendSuccess(res, { backupCodes }, "Backup codes regenerated");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SECURITY ALERTS
// ============================================================================

export async function getSecurityAlerts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const alerts = await SecurityEvents.find({
      user: req.user.userId,
      severity: { $in: ["warning", "critical"] },
    })
      .select(
        "eventType severity status description ipAddress location timestamp createdAt",
      )
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    sendSuccess(res, { alerts });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// TRUSTED DEVICES
// ============================================================================

export async function getTrustedDevices(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    sendSuccess(res, { devices: (user.trustedDevices as any[]) || [] });
  } catch (error) {
    next(error);
  }
}

export async function addTrustedDevice(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { deviceName } = req.body;

    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    const trustedDevices = (user.trustedDevices as any[]) || [];

    // Check limit
    if (trustedDevices.length >= 10) {
      throw new ForbiddenError("Maximum 10 trusted devices allowed");
    }

    const deviceId = require("crypto").randomBytes(16).toString("hex");

    trustedDevices.push({
      deviceId,
      deviceName: deviceName || "Unknown Device",
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      addedAt: new Date(),
      lastUsed: new Date(),
    });

    user.trustedDevices = trustedDevices as any;
    await user.save();

    emitToUser(req.user!.userId, WS.SECURITY.TRUSTED_DEVICE_ADDED, {
      deviceId,
      deviceName: deviceName || "Unknown Device",
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, { deviceId }, "Device added to trusted devices");
  } catch (error) {
    next(error);
  }
}

export async function removeTrustedDevice(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { deviceId } = req.params;

    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    const trustedDevices = (user.trustedDevices as any[]) || [];
    if (!trustedDevices.length) {
      throw new NotFoundError("Device not found");
    }

    const deviceIndex = trustedDevices.findIndex(
      (d: any) => d.deviceId === deviceId,
    );

    if (deviceIndex === -1) {
      throw new NotFoundError("Device not found");
    }

    trustedDevices.splice(deviceIndex, 1);
    user.trustedDevices = trustedDevices as any;
    await user.save();

    emitToUser(req.user!.userId, WS.SECURITY.TRUSTED_DEVICE_REMOVED, {
      deviceId,
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "Device removed from trusted devices");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// SECURITY SETTINGS
// ============================================================================

export async function getSecuritySettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const user = await Users.findById(req.user.userId)
      .select(
        "twoFactorEnabled securitySettings lastPasswordChange email emailVerified phone phoneVerified",
      )
      .lean();

    if (!user) throw new NotFoundError("User not found");

    const securitySettings = (user.securitySettings as any) || {};

    sendSuccess(res, {
      settings: {
        twoFactorEnabled: user.twoFactorEnabled || false,
        emailVerified: (user as any).emailVerified || false,
        phoneVerified: (user as any).phoneVerified || false,
        lastPasswordChange: (user as any).lastPasswordChange,
        loginNotifications: securitySettings.loginNotifications ?? true,
        transactionNotifications:
          securitySettings.transactionNotifications ?? true,
        marketingEmails: securitySettings.marketingEmails ?? false,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSecuritySettings(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const { loginNotifications, transactionNotifications, marketingEmails } =
      req.body;

    const user = await Users.findById(req.user.userId);
    if (!user) throw new NotFoundError("User not found");

    const securitySettings = (user.securitySettings as any) || {};

    if (loginNotifications !== undefined) {
      securitySettings.loginNotifications = loginNotifications;
    }
    if (transactionNotifications !== undefined) {
      securitySettings.transactionNotifications = transactionNotifications;
    }
    if (marketingEmails !== undefined) {
      securitySettings.marketingEmails = marketingEmails;
    }

    user.securitySettings = securitySettings;
    await user.save();

    sendSuccess(
      res,
      { settings: securitySettings },
      "Security settings updated",
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ACCOUNT SECURITY SCORE
// ============================================================================

export async function getSecurityScore(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Authentication required");

    const user = await Users.findById(req.user.userId).lean();
    if (!user) throw new NotFoundError("User not found");

    let score = 0;
    const recommendations: string[] = [];

    // Email verified: +20
    if (user.emailVerified) {
      score += 20;
    } else {
      recommendations.push("Verify your email address");
    }

    // Phone verified: +20
    if (user.phoneVerified) {
      score += 20;
    } else {
      recommendations.push("Verify your phone number");
    }

    // 2FA enabled: +30
    if (user.twoFactorEnabled) {
      score += 30;
    } else {
      recommendations.push("Enable two-factor authentication");
    }

    // KYC approved: +20
    if (user.kycStatus === "approved") {
      score += 20;
    } else {
      recommendations.push("Complete KYC verification");
    }

    // Strong password (changed in last 90 days): +10
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    if (user.lastPasswordChange && user.lastPasswordChange > ninetyDaysAgo) {
      score += 10;
    } else {
      recommendations.push("Update your password regularly");
    }

    sendSuccess(res, {
      score,
      maxScore: 100,
      level:
        score >= 80
          ? "excellent"
          : score >= 60
            ? "good"
            : score >= 40
              ? "fair"
              : "needs_improvement",
      recommendations,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getLoginHistory,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  setup2FA,
  verify2FASetup,
  disable2FA,
  regenerateBackupCodes,
  getSecurityAlerts,
  getTrustedDevices,
  addTrustedDevice,
  removeTrustedDevice,
  getSecuritySettings,
  updateSecuritySettings,
  getSecurityScore,
};

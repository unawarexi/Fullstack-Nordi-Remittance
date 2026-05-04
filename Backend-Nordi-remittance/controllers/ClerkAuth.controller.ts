// CLERK AUTH CONTROLLER — Clerk ↔ Backend sync, OTP step-up, webhook

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import type { AuthenticatedRequest } from "../types/index.js";
import Users from "../models/UserModel.js";
import { Wallets } from "../models/AccountsModel.js";
import { AdminUsers } from "../models/AdminModel.js";
import {
  generateAuthTokens,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../core/helpers/token.helper.js";
import {
  generateSecureToken,
  generateOTP,
} from "../core/helpers/crypto.helper.js";
import {
  sendSuccess,
  sendError,
  sendUnauthorized,
} from "../core/helpers/response.helper.js";
import { UnauthorizedError, ValidationError } from "../core/errors/AppError.js";
import { constants, env } from "../config/env.config.js";
import {
  store2FACode,
  verify2FACode as redisVerify2FACode,
  cacheGet,
} from "../services/redis.service.js";
import { queueTemplatedMail } from "../services/workers.js";
import EmailContentGenerator from "../core/mail/Mail-content.js";
import { createClerkClient } from "@clerk/express";
import { Webhook } from "svix";
import mongoose from "mongoose";

// HELPERS

/** Generate a 6-char alphanumeric OTP */
function generateAlphanumericOTP(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid ambiguous 0/O, 1/I/l
  let otp = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += chars[bytes[i] % chars.length];
  }
  return otp;
}

/** Build a device fingerprint from request headers */
function buildDeviceFingerprint(req: Request): string {
  const ua = req.headers["user-agent"] || "unknown";
  const ip = (req as any).clientIp || req.ip || "unknown";
  // Combine user-agent + ip for a rough fingerprint
  return crypto
    .createHash("sha256")
    .update(`${ua}::${ip}`)
    .digest("hex")
    .slice(0, 32);
}

/** Determine if OTP step-up is required */
function isOtpRequired(user: any, deviceFingerprint: string): boolean {
  // 1. First ever login → always require OTP
  if (!user.lastLogin && !user.lastOtpVerifiedAt) return true;

  // 2. New / unknown device → require OTP
  const knownDevices: string[] = user.knownDeviceFingerprints || [];
  if (!knownDevices.includes(deviceFingerprint)) return true;

  // 3. Prolonged absence (>7 days since last OTP verification)
  if (user.lastOtpVerifiedAt) {
    const daysSinceOtp =
      (Date.now() - new Date(user.lastOtpVerifiedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceOtp > 7) return true;
  } else {
    // If never verified OTP, require it
    return true;
  }

  return false;
}

// POST /auth/clerk-sync
// Called after Clerk sign-in / sign-up succeeds on the frontend.
// 1. Verifies Clerk token (already done by middleware)
// 2. Finds or creates the local user
// 3. Checks if OTP is required
// 4. Returns app JWT tokens or OTP-required flag

export async function clerkSync(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const clerkUserId: string = (req as any).clerkUserId;
    if (!clerkUserId) {
      throw new UnauthorizedError("Clerk authentication required");
    }

    // Fetch full Clerk user profile
    const client = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
    const clerkUser = await client.users.getUser(clerkUserId);

    if (!clerkUser) {
      throw new UnauthorizedError("Clerk user not found");
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      throw new ValidationError("No email associated with your account");
    }

    const firstName = clerkUser.firstName || "User";
    const lastName = clerkUser.lastName || "";
    const avatar = clerkUser.imageUrl || null;

    // Find by clerkUserId first, then by email (link existing accounts)

    let user: any = await Users.findOne({
      $or: [{ clerkUserId }, { email: email.toLowerCase() }],
    });

    if (!user) {
      // User must register first — Clerk login is not for signup
      sendError(
        res,
        "Account not found. Please sign up first before using Google sign-in.",
        "USER_NOT_FOUND",
        404,
      );
      return;
    }

    if (!user.clerkUserId) {
      // EXISTING USER found by email — link Clerk ID

      user.clerkUserId = clerkUserId;
      user.authProvider = clerkUser.externalAccounts?.length
        ? "google"
        : "clerk";
      user.emailVerified = true;
      if (avatar && !user.profilePicture) user.profilePicture = avatar;
      await user.save();
    }

    // Check if account is locked / suspended
    if (user.status === "suspended" || user.status === "banned") {
      sendUnauthorized(
        res,
        "Your account has been suspended. Contact support.",
      );
      return;
    }

    // OTP STEP-UP CHECK

    const deviceFingerprint = buildDeviceFingerprint(req);

    if (isOtpRequired(user, deviceFingerprint)) {
      // Generate OTP
      const otpCode = generateAlphanumericOTP(6);

      // Store in Redis (5 min TTL)
      await store2FACode(user._id.toString(), otpCode);

      // Send OTP email using template
      const emailGenerator = new EmailContentGenerator();
      const otpTemplateData = emailGenerator.otpEmail({
        firstName: user.firstName,
        email: user.email as string,
        otpCode,
        purpose: "Sign-in Verification",
        expiresIn: "5 minutes",
        userId: user._id.toString(),
      });

      queueTemplatedMail(user.email as string, otpTemplateData).catch((err) =>
        console.error("Failed to send OTP email:", err),
      );

      // Generate a temp token for OTP verification
      const otpSessionToken = generateSecureToken(32);
      await store2FACode(`otp_session:${otpSessionToken}`, user._id.toString());

      sendSuccess(
        res,
        {
          requiresOtp: true,
          otpSessionToken,
          email: user.email,
          reason: !(user.knownDeviceFingerprints || []).includes(
            deviceFingerprint,
          )
            ? "new_device"
            : "prolonged_absence",
        },
        "OTP verification required. Check your email.",
      );
      return;
    }

    // No OTP needed — issue JWT tokens

    await issueTokensAndRespond(req, res, user, deviceFingerprint);
  } catch (error) {
    next(error);
  }
}

// POST /auth/clerk-sync/admin
// Admin variant — verifies the Clerk user has an admin record
export async function clerkSyncAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const clerkUserId: string = (req as any).clerkUserId;
    if (!clerkUserId) {
      throw new UnauthorizedError("Clerk authentication required");
    }

    const client = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });
    const clerkUser = await client.users.getUser(clerkUserId);

    if (!clerkUser) {
      throw new UnauthorizedError("Clerk user not found");
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      throw new ValidationError("No email associated with your account");
    }

    // Look for admin by email
    let admin: any = await AdminUsers.findOne({ email: email.toLowerCase() });

    if (!admin) {
      sendUnauthorized(
        res,
        "No admin account found for this email. Access denied.",
      );
      return;
    }

    if (!admin.isActive) {
      sendUnauthorized(res, "Admin account is not active.");
      return;
    }

    // Link Clerk ID if needed
    if (!admin.clerkUserId) {
      admin.clerkUserId = clerkUserId;
      await admin.save();
    }

    // OTP check for admin too
    const deviceFingerprint = buildDeviceFingerprint(req);
    const adminUser: any = await Users.findOne({ email: email.toLowerCase() });

    if (adminUser && isOtpRequired(adminUser, deviceFingerprint)) {
      const otpCode = generateAlphanumericOTP(6);
      const userId = adminUser._id.toString();
      await store2FACode(userId, otpCode);

      const emailGenerator = new EmailContentGenerator();
      const otpTemplateData = emailGenerator.otpEmail({
        firstName: admin.firstName || "Admin",
        email,
        otpCode,
        purpose: "Admin Console Verification",
        expiresIn: "5 minutes",
        userId: userId,
      });

      queueTemplatedMail(email, otpTemplateData).catch((err) =>
        console.error("Failed to send admin OTP email:", err),
      );

      const otpSessionToken = generateSecureToken(32);
      await store2FACode(`otp_session:${otpSessionToken}`, userId);

      sendSuccess(
        res,
        {
          requiresOtp: true,
          otpSessionToken,
          email,
          isAdmin: true,
          reason: "admin_verification",
        },
        "Admin OTP verification required.",
      );
      return;
    }

    // Issue admin tokens
    const sessionId = generateSecureToken(16);
    const tokens = generateAuthTokens(
      admin._id.toString(),
      email,
      "admin",
      sessionId,
    );

    res.cookie(
      "accessToken",
      tokens.accessToken,
      getAccessTokenCookieOptions(),
    );
    res.cookie(
      "refreshToken",
      tokens.refreshToken,
      getRefreshTokenCookieOptions(),
    );

    sendSuccess(
      res,
      {
        admin: {
          id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: "admin",
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: Number(constants.ACCESS_TOKEN_EXPIRY_SECONDS),
        },
      },
      "Admin login successful",
    );
  } catch (error) {
    next(error);
  }
}

// POST /auth/verify-clerk-otp
// Verifies the OTP code and returns JWT tokens on success

export async function verifyClerkOtp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { otpSessionToken, code, isAdmin } = req.body;

    if (!otpSessionToken || !code) {
      throw new ValidationError("OTP session token and code are required");
    }

    // Resolve userId from the OTP session token (stored as { code: userId })
    const sessionData = await cacheGet<{ code: string }>(
      `remit:2fa:otp_session:${otpSessionToken}`,
    );
    const storedUserId = sessionData?.code;
    if (!storedUserId) {
      throw new UnauthorizedError("Invalid or expired OTP session");
    }

    // Now verify the actual OTP code
    const isValid = await redisVerify2FACode(storedUserId, code.toUpperCase());
    if (!isValid) {
      throw new UnauthorizedError("Invalid or expired verification code");
    }

    // Find the user
    const user: any = await Users.findById(storedUserId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Mark OTP as verified and add device fingerprint
    const deviceFingerprint = buildDeviceFingerprint(req);
    const knownDevices: string[] = user.knownDeviceFingerprints || [];
    if (!knownDevices.includes(deviceFingerprint)) {
      knownDevices.push(deviceFingerprint);
    }

    user.lastOtpVerifiedAt = new Date();
    user.knownDeviceFingerprints = knownDevices;
    user.lastLogin = new Date();
    await user.save();

    // If admin flow
    if (isAdmin) {
      const admin: any = await AdminUsers.findOne({ email: user.email });
      if (!admin) {
        throw new UnauthorizedError("Admin account not found");
      }

      const sessionId = generateSecureToken(16);
      const tokens = generateAuthTokens(
        admin._id.toString(),
        user.email,
        "admin",
        sessionId,
      );

      res.cookie(
        "accessToken",
        tokens.accessToken,
        getAccessTokenCookieOptions(),
      );
      res.cookie(
        "refreshToken",
        tokens.refreshToken,
        getRefreshTokenCookieOptions(),
      );

      sendSuccess(
        res,
        {
          admin: {
            id: admin._id,
            email: admin.email,
            firstName: admin.firstName || user.firstName,
            lastName: admin.lastName || user.lastName,
            role: "admin",
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: constants.ACCESS_TOKEN_EXPIRY_SECONDS,
          },
        },
        "Admin verification successful",
      );
      return;
    }

    // Regular user flow
    await issueTokensAndRespond(req, res, user, deviceFingerprint);
  } catch (error) {
    next(error);
  }
}

// POST /auth/resend-clerk-otp
// Resends a new OTP code for a pending OTP session

export async function resendClerkOtp(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { otpSessionToken } = req.body;

    if (!otpSessionToken) {
      throw new ValidationError("OTP session token is required");
    }

    const sessionData2 = await cacheGet<{ code: string }>(
      `remit:2fa:otp_session:${otpSessionToken}`,
    );
    const storedUserId = sessionData2?.code;
    if (!storedUserId) {
      throw new UnauthorizedError("Invalid or expired OTP session");
    }

    const user: any = await Users.findById(storedUserId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Generate new OTP
    const otpCode = generateAlphanumericOTP(6);
    await store2FACode(user._id.toString(), otpCode);

    // Re-store the session token mapping
    await store2FACode(`otp_session:${otpSessionToken}`, user._id.toString());

    // Send email using template
    const emailGenerator = new EmailContentGenerator();
    const otpTemplateData = emailGenerator.otpEmail({
      firstName: user.firstName,
      email: user.email as string,
      otpCode,
      purpose: "Sign-in Verification (Resend)",
      expiresIn: "5 minutes",
      userId: user._id.toString(),
    });

    queueTemplatedMail(user.email as string, otpTemplateData).catch((err) =>
      console.error("Failed to send OTP email:", err),
    );

    sendSuccess(
      res,
      { sent: true },
      "New verification code sent to your email.",
    );
  } catch (error) {
    next(error);
  }
}

// POST /auth/clerk-webhook
// Handles Clerk webhook events (user.created, user.updated, user.deleted, session.created)

export async function clerkWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const webhookSecret = env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET not configured");
      res.status(500).json({ error: "Webhook not configured" });
      return;
    }

    // Verify webhook signature using Svix
    const wh = new Webhook(webhookSecret);
    const headers = req.headers;
    const payload = JSON.stringify(req.body);

    let evt: any;
    try {
      evt = wh.verify(payload, {
        "svix-id": headers["svix-id"] as string,
        "svix-timestamp": headers["svix-timestamp"] as string,
        "svix-signature": headers["svix-signature"] as string,
      });
    } catch {
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }

    const eventType: string = evt.type;
    const data = evt.data;

    switch (eventType) {
      case "user.created": {
        const email = data.email_addresses?.[0]?.email_address;
        if (email) {
          // Check if user already exists (might have been created by clerk-sync)
          const existing = await Users.findOne({
            $or: [{ clerkUserId: data.id }, { email: email.toLowerCase() }],
          });
          if (existing && !existing.clerkUserId) {
            existing.clerkUserId = data.id;
            existing.authProvider = data.external_accounts?.length
              ? "google"
              : "clerk";
            existing.emailVerified = true;
            await existing.save();
          }
        }
        break;
      }

      case "user.updated": {
        const user = await Users.findOne({ clerkUserId: data.id });
        if (user) {
          const updatedEmail = data.email_addresses?.[0]?.email_address;
          if (updatedEmail) user.email = updatedEmail.toLowerCase();
          if (data.first_name) user.firstName = data.first_name;
          if (data.last_name) user.lastName = data.last_name;
          if (data.image_url) user.profilePicture = data.image_url;
          await user.save();
        }
        break;
      }

      case "user.deleted": {
        // Soft-delete: mark user as deactivated
        const user = await Users.findOne({ clerkUserId: data.id });
        if (user) {
          user.status = "inactive";
          user.isActive = false;
          await user.save();
        }
        break;
      }

      case "session.created": {
        // Optional: Log session creation for audit
        break;
      }

      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

// HELPER — Issue JWT tokens and respond

async function issueTokensAndRespond(
  req: Request,
  res: Response,
  user: any,
  deviceFingerprint: string,
): Promise<void> {
  const clientIp = (req as any).clientIp || req.ip || "unknown";

  // Update last login and device fingerprint
  const knownDevices: string[] = user.knownDeviceFingerprints || [];
  if (!knownDevices.includes(deviceFingerprint)) {
    knownDevices.push(deviceFingerprint);
  }

  await Users.updateOne(
    { _id: user._id },
    {
      lastLogin: new Date(),
      lastLoginIp: clientIp,
      knownDeviceFingerprints: knownDevices,
      lockUntil: null,
    },
  );

  // Generate JWT tokens
  const sessionId = generateSecureToken(16);
  const tokens = generateAuthTokens(
    user._id.toString(),
    user.email as string,
    user.role as string,
    sessionId,
  );

  res.cookie("accessToken", tokens.accessToken, getAccessTokenCookieOptions());
  res.cookie(
    "refreshToken",
    tokens.refreshToken,
    getRefreshTokenCookieOptions(),
  );

  // Get wallet
  const wallet = await Wallets.findOne({
    user: String(user._id),
    isPrimary: true,
  }).select("walletNumber balances");

  sendSuccess(
    res,
    {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountNumber: user.accountNumber,
        role: user.role || "user",
        status: user.status,
        kycStatus: user.kycStatus,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        avatar: user.profilePicture,
      },
      wallet: wallet
        ? {
            id: wallet._id,
            walletNumber: wallet.walletNumber,
            balances: wallet.balances,
          }
        : null,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: constants.ACCESS_TOKEN_EXPIRY_SECONDS,
      },
    },
    "Login successful",
  );
}

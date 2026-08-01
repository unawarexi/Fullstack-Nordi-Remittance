// CLERK AUTH CONTROLLER — Clerk ↔ Backend sync, OTP step-up, webhook

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import type { AuthenticatedRequest } from "../../types/index.js";
import Users from "../users/users.model.js";
import { Wallets } from "../accounts/accounts.model.js";
import { AdminUsers } from "../admin/admin.model.js";
import {
  generateAuthTokens,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../../core/helpers/token.helper.js";
import {
  generateSecureToken,
  generateOTP,
} from "../../core/helpers/crypto.helper.js";
import {
  sendSuccess,
  sendError,
  sendUnauthorized,
} from "../../core/helpers/response.helper.js";
import { UnauthorizedError, ValidationError } from "../../core/errors/AppError.js";
import { constants, env } from "../../config/env.config.js";
import {
  store2FACode,
  verify2FACode as redisVerify2FACode,
  cacheGet,
} from "../../services/redis.service.js";
import { queueTemplatedMail } from "../../services/workers.js";
import EmailContentGenerator from "../../core/mail/Mail-content.js";
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
  // Rely primarily on User-Agent to prevent variable IP addresses (mobile carriers, dynamic residential IPs, or local dev localhost/v6 switching) from constantly forcing OTP verification.
  const ua = req.headers["user-agent"] || "unknown-device";
  return crypto
    .createHash("sha256")
    .update(ua)
    .digest("hex")
    .slice(0, 32);
}

/** Determine if OTP step-up is required */
function isOtpRequired(user: any, deviceFingerprint: string): boolean {
  // 1. If user has logged in or verified OTP before, check elapsed time
  const referenceDate = user.lastOtpVerifiedAt || user.lastLogin;
  if (referenceDate) {
    const hoursSinceLastActivity =
      (Date.now() - new Date(referenceDate).getTime()) / (1000 * 60 * 60);

    // If the client logged in or verified OTP recently within 24 hours, no OTP needed upon next login
    if (hoursSinceLastActivity <= 24) {
      return false;
    }
  }

  // 2. If never verified/logged in or more than 24 hours have elapsed, require OTP verification
  return true;
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

    const cleanEmail = email.trim();
    const emailRegex = new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    const firstName = clerkUser.firstName || "User";
    const lastName = clerkUser.lastName || "";
    const avatar = clerkUser.imageUrl || null;

    // 1. Check if user exists in normal database (Users or AdminUsers)
    // Login is STRICTLY for registered users/admins only!
    let admin: any = await AdminUsers.findOne({
      $or: [{ clerkUserId }, { email: emailRegex }],
    });

    if (admin) {
      if (!admin.isActive) {
        sendUnauthorized(res, "Your admin account is disabled or inactive.");
        return;
      }

      // Reconcile our normal database with Clerk ID
      if (!admin.clerkUserId || admin.clerkUserId !== clerkUserId) {
        admin.clerkUserId = clerkUserId;
        await admin.save();
      }

      // Reconcile Clerk user metadata with local normal database ID and role
      try {
        await client.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            localId: admin._id.toString(),
            role: admin.role || "admin",
            kycStatus: "verified",
          },
        });
      } catch (err) {
        console.warn("Notice: Failed to reconcile Clerk user metadata for admin:", err);
      }

      // OTP check for admin
      const deviceFingerprint = buildDeviceFingerprint(req);
      if (isOtpRequired(admin, deviceFingerprint)) {
        const otpCode = generateAlphanumericOTP(6);
        const adminId = admin._id.toString();
        await store2FACode(adminId, otpCode);

        const emailGenerator = new EmailContentGenerator();
        const otpTemplateData = emailGenerator.otpEmail({
          firstName: admin.firstName || "Admin",
          email: cleanEmail,
          otpCode,
          purpose: "Admin Sign-in Verification",
          expiresIn: "5 minutes",
          userId: adminId,
        });

        queueTemplatedMail(cleanEmail, otpTemplateData).catch((err) =>
          console.error("Failed to send admin OTP email:", err),
        );

        const otpSessionToken = generateSecureToken(32);
        await store2FACode(`otp_session:${otpSessionToken}`, adminId);

        sendSuccess(
          res,
          {
            requiresOtp: true,
            otpSessionToken,
            email: cleanEmail,
            isAdmin: true,
            reason: "device_verification",
          },
          "Admin OTP verification required.",
        );
        return;
      }

      // Update admin lastLogin and device fingerprint when OTP is bypassed within 24 hours
      const knownAdminDevices: string[] = admin.knownDeviceFingerprints || [];
      if (!knownAdminDevices.includes(deviceFingerprint)) {
        knownAdminDevices.push(deviceFingerprint);
      }
      await AdminUsers.updateOne(
        { _id: admin._id },
        {
          lastLogin: new Date(),
          knownDeviceFingerprints: knownAdminDevices,
        },
      );

      // Issue admin tokens and respond with both admin & user payload for seamless routing
      const sessionId = generateSecureToken(16);
      const tokens = generateAuthTokens(
        admin._id.toString(),
        cleanEmail,
        admin.role || "admin",
        sessionId,
      );

      res.cookie("accessToken", tokens.accessToken, getAccessTokenCookieOptions());
      res.cookie("refreshToken", tokens.refreshToken, getRefreshTokenCookieOptions());

      sendSuccess(
        res,
        {
          admin: {
            id: admin._id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role || "admin",
          },
          user: {
            id: admin._id,
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role || "admin",
            kycStatus: "verified",
            emailVerified: true,
          },
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: Number(constants.ACCESS_TOKEN_EXPIRY_SECONDS),
          },
        },
        "Admin login successful",
      );
      return;
    }

    // 2. Check regular Users database table
    let user: any = await Users.findOne({
      $or: [{ clerkUserId }, { email: emailRegex }],
    });

    if (!user) {
      // STRICT REQUIREMENT: If the user does not exist in our database, they must manually sign up first!
      // Login via Clerk / Google Auth is strictly restricted to already registered users.
      sendError(
        res,
        "Account not found in our database. Please complete manual registration first before attempting to log in.",
        "ACCOUNT_NOT_FOUND",
        404,
      );
      return;
    }

    // Reconcile our normal database with Clerk OAuth information
    let hasChanges = false;
    if (!user.clerkUserId || user.clerkUserId !== clerkUserId) {
      user.clerkUserId = clerkUserId;
      hasChanges = true;
    }
    if (clerkUser.externalAccounts?.length && user.authProvider !== "google") {
      user.authProvider = "google";
      hasChanges = true;
    } else if (!clerkUser.externalAccounts?.length && user.authProvider === "local") {
      user.authProvider = "clerk";
      hasChanges = true;
    }
    if (!user.emailVerified) {
      user.emailVerified = true;
      hasChanges = true;
    }
    if (avatar && !user.profilePicture) {
      user.profilePicture = avatar;
      hasChanges = true;
    }
    if (hasChanges) {
      await user.save();
    }

    // Reconcile Clerk metadata with local normal DB ID, role, and KYC status
    try {
      await client.users.updateUserMetadata(clerkUserId, {
        publicMetadata: {
          localId: user._id.toString(),
          role: user.role || "user",
          kycStatus: user.kycStatus || "pending",
        },
      });
    } catch (err) {
      console.warn("Notice: Failed to reconcile Clerk user metadata:", err);
    }

    // Check if account is suspended/banned
    if (user.status === "suspended" || user.status === "banned") {
      sendUnauthorized(
        res,
        "Your account has been suspended or banned. Please contact support.",
      );
      return;
    }

    // OTP Step-Up check
    const deviceFingerprint = buildDeviceFingerprint(req);

    if (isOtpRequired(user, deviceFingerprint)) {
      const otpCode = generateAlphanumericOTP(6);
      await store2FACode(user._id.toString(), otpCode);

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

    // No OTP needed — issue JWT tokens and respond
    await issueTokensAndRespond(req, res, user, deviceFingerprint);
  } catch (error) {
    next(error);
  }
}

// POST /auth/clerk-sync/admin
// Admin variant — delegates to our robust unified reconciliation logic
export async function clerkSyncAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Delegate to clerkSync which checks both AdminUsers and Users seamlessly
  return clerkSync(req, res, next);
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

    // Check in AdminUsers or Users collection
    let admin: any = null;
    let user: any = null;

    if (isAdmin) {
      admin = await AdminUsers.findById(storedUserId);
      if (!admin) {
        // Fallback check if email was stored under user ID
        user = await Users.findById(storedUserId);
        if (user) {
          admin = await AdminUsers.findOne({ email: { $regex: new RegExp(`^${user.email}$`, "i") } });
        }
      }
    } else {
      user = await Users.findById(storedUserId);
      if (!user) {
        admin = await AdminUsers.findById(storedUserId);
      }
    }

    const account = admin || user;
    if (!account) {
      throw new UnauthorizedError("User or Admin account not found for this OTP session");
    }

    // Mark OTP as verified and add device fingerprint
    const deviceFingerprint = buildDeviceFingerprint(req);
    const knownDevices: string[] = account.knownDeviceFingerprints || [];
    if (!knownDevices.includes(deviceFingerprint)) {
      knownDevices.push(deviceFingerprint);
    }

    account.lastOtpVerifiedAt = new Date();
    account.knownDeviceFingerprints = knownDevices;
    if ("lastLogin" in account || !admin) {
      account.lastLogin = new Date();
    }
    await account.save();

    // If admin flow
    if (admin) {
      const sessionId = generateSecureToken(16);
      const tokens = generateAuthTokens(
        admin._id.toString(),
        admin.email,
        admin.role || "admin",
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

      const ADMIN_ROLES = ["super_admin", "admin", "compliance_officer", "support_agent", "analyst"];
      const adminRole = ADMIN_ROLES.includes(admin.role || "") ? admin.role : "admin";

      const adminProfile = {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName || "Admin",
        lastName: admin.lastName || "",
        role: adminRole,
        kycStatus: "verified",
        emailVerified: true,
        phoneVerified: true,
      };

      sendSuccess(
        res,
        {
          isAdmin: true,
          admin: adminProfile,
          user: adminProfile,
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

    let account: any = await Users.findById(storedUserId);
    let isResendAdmin = false;
    if (!account) {
      account = await AdminUsers.findById(storedUserId);
      isResendAdmin = true;
    }
    if (!account) {
      throw new UnauthorizedError("User account not found");
    }

    // Generate new OTP
    const otpCode = generateAlphanumericOTP(6);
    await store2FACode(account._id.toString(), otpCode);

    // Re-store the session token mapping
    await store2FACode(`otp_session:${otpSessionToken}`, account._id.toString());

    // Send email using template
    const emailGenerator = new EmailContentGenerator();
    const otpTemplateData = emailGenerator.otpEmail({
      firstName: account.firstName || (isResendAdmin ? "Admin" : "User"),
      email: account.email as string,
      otpCode,
      purpose: isResendAdmin ? "Admin Sign-in Verification (Resend)" : "Sign-in Verification (Resend)",
      expiresIn: "5 minutes",
      userId: account._id.toString(),
    });

    queueTemplatedMail(account.email as string, otpTemplateData).catch((err) =>
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
  const userRole = user.role || "user";
  const tokens = generateAuthTokens(
    user._id.toString(),
    user.email as string,
    userRole,
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

  const isAdminRole = ["super_admin", "admin", "compliance_officer", "support_agent", "analyst"].includes(userRole);

  sendSuccess(
    res,
    {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountNumber: user.accountNumber,
        role: userRole,
        status: user.status,
        kycStatus: user.kycStatus || "pending",
        emailVerified: user.emailVerified ?? true,
        phoneVerified: user.phoneVerified ?? false,
        avatar: user.profilePicture,
      },
      admin: isAdminRole
        ? {
            id: user._id,
            email: user.email,
            firstName: user.firstName || "Admin",
            lastName: user.lastName || "",
            role: userRole,
          }
        : undefined,
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

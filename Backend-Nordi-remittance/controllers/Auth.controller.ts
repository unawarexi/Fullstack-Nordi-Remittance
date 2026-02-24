import { Request, Response, NextFunction } from "express";
import type {
  AuthenticatedRequest,
  UserRegistrationData,
} from "../types/index.js";
import Users from "../models/UserModel.js";
import { uploadToCloudinary } from "../services/Cloudinary.service.js";
import { Wallets } from "../models/AccountsModel.js";
import {
  ConfirmationToken,
  LoginAttempt,
  SecurityEvent,
} from "../models/ConfirmModel.js";
import {
  hashPassword,
  comparePassword,
  generateSecureToken,
  generateOTP,
} from "../core/helpers/crypto.helper.js";
import {
  generateAuthTokens,
  verifyRefreshToken,
  generateVerificationToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../core/helpers/token.helper.js";
import {
  generateAccountNumber,
  generateWalletNumber,
} from "../core/helpers/generator.js";
import {
  validateRegistrationData,
  validateLoginData,
  isValidEmail,
  sanitizeString,
} from "../core/helpers/validation.helper.js";
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendUnauthorized,
  sendNotFound,
} from "../core/helpers/response.helper.js";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  AccountLockedError,
  RateLimitExceededError,
  UserAlreadyExistsError,
} from "../core/errors/AppError.js";
import { constants, HttpStatus, env } from "../config/env.config.js";
import { sendTemplatedMail } from "../services/Mailer.service.js";
import EmailContentGenerator from "../core/mail/Mail-content.js";
import mongoose from "mongoose";
import { emitToUser, broadcast } from "../services/Websocket.service.js";
import {
  createSession,
  deleteSession,
  deleteAllUserSessions,
  trackLoginAttempt,
  isLoginLocked,
  storeEmailVerificationToken,
  verifyEmailToken,
  storePasswordResetToken,
  verifyPasswordResetToken,
  store2FACode,
  verify2FACode as redisVerify2FACode,
  invalidateUserCache,
  cacheUserProfile,
  cacheUserWallets,
  CACHE_KEYS,
  CACHE_TTL,
} from "../services/Redis.service.js";

// Initialize email content generator
const emailGenerator = new EmailContentGenerator();

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================
const WS_EVENTS = {
  LOGIN_SUCCESS: "auth:login_success",
  LOGIN_FAILED: "auth:login_failed",
  LOGOUT: "auth:logout",
  NEW_SESSION: "auth:new_session",
  PASSWORD_CHANGED: "auth:password_changed",
  PASSWORD_RESET: "auth:password_reset",
  EMAIL_VERIFIED: "auth:email_verified",
  ACCOUNT_LOCKED: "auth:account_locked",
  TWO_FACTOR_REQUIRED: "auth:2fa_required",
};

// ============================================================================
// REGISTER
// ============================================================================

/**
 * Register a new user
 * POST /auth/register
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { email, password, firstName, lastName, phone, country, currency } =
      req.body;

    // Validate registration data
    const validation = validateRegistrationData(req.body);
    if (!validation.isValid) {
      throw new ValidationError("Invalid registration data", {
        errors: validation.errors,
      });
    }

    // Check for existing user
    const existingUser = await Users.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: phone }],
    }).session(session);

    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? "email" : "phone";
      throw new UserAlreadyExistsError(field);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate account number
    const accountNumber = generateAccountNumber();

    // Create user
    const user = new Users({
      firstName: sanitizeString(firstName),
      lastName: sanitizeString(lastName),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      accountNumber,
      country: country || "US",
      currency: currency || "USD",
      role: "user",
      status: "active",
      kycStatus: "pending",
      emailVerified: false,
      phoneVerified: false,
      twoFactorEnabled: false,
      createdAt: new Date(),
      lastLogin: null,
      loginAttempts: 0,
    });

    await user.save({ session });

    // Create default wallet
    const wallet = new Wallets({
      userId: user._id,
      walletNumber: generateWalletNumber(),
      currency: currency || "USD",
      balance: 0,
      availableBalance: 0,
      ledgerBalance: 0,
      status: "active",
      type: "primary",
      createdAt: new Date(),
    });

    await wallet.save({ session });

    // Generate email verification token
    const verificationToken = generateSecureToken(32);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await ConfirmationToken.create(
      [
        {
          userId: user._id,
          token: verificationToken,
          type: "email_verification",
          expiresAt: verificationExpiry,
          used: false,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    // Send verification email (non-blocking)
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/verify-email?token=${verificationToken}`;
    sendTemplatedMail(
      user.email as string,
      emailGenerator.emailVerificationEmail({
        firstName: user.firstName as string,
        email: user.email as string,
        verificationUrl,
        expiresIn: "24 hours",
        userId: user._id.toString(),
      }),
    ).catch((err) => console.error("Failed to send verification email:", err));

    // Generate auth tokens with sessionId
    const sessionId = generateSecureToken(16);
    const tokens = generateAuthTokens(
      user._id.toString(),
      user.email as string,
      user.role as string,
      sessionId,
    );

    // Set cookies
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

    sendCreated(
      res,
      {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          accountNumber: user.accountNumber,
          role: user.role,
          status: user.status,
          kycStatus: user.kycStatus,
          emailVerified: user.emailVerified,
        },
        wallet: {
          id: wallet._id,
          walletNumber: wallet.walletNumber,
          balances: wallet.balances,
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: constants.ACCESS_TOKEN_EXPIRY_SECONDS,
        },
      },
      "Registration successful. Please verify your email.",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// REGISTER FULL KYC
// ============================================================================

/**
 * Register a new user with full KYC data
 * POST /auth/register/full
 */
export async function registerFullKyc(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      // Personal Details
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      nationality,
      countryOfResidence,
      maritalStatus,
      // Identity Verification
      idType,
      idNumber,
      idExpiryDate,
      addressDocType,
      socialSecurityNumber,
      taxIdentificationNumber,
      // Contact Information
      email,
      mobileNumber,
      alternativePhone,
      homeAddress,
      city,
      stateProvince,
      zipCode,
      country,
      // Banking Preferences
      accountType,
      currency,
      sourceOfIncome,
      monthlyIncomeRange,
      initialDeposit,
      employmentStatus,
      employerName,
      occupation,
      // Bank Account Details
      accountName,
      bankName,
      bankAddress,
      ibanNumber,
      routingNumber,
      swiftBic,
      // Security Setup
      password,
      securityQuestion,
      securityAnswer,
      twoFactorMethod,
      // Terms and Verification
      referralCode,
      inviteCode,
      externalAccountNumber,
    } = req.body as any;

    // Convert string booleans from FormData back to actual booleans
    const agreeToTerms = req.body.agreeToTerms === "true";
    const agreeToPrivacy = req.body.agreeToPrivacy === "true";
    const agreeToDataSharing = req.body.agreeToDataSharing === "true";
    const enableTwoFactor = req.body.enableTwoFactor === "true";

    req.body.agreeToTerms = agreeToTerms;
    req.body.agreeToPrivacy = agreeToPrivacy;
    req.body.agreeToDataSharing = agreeToDataSharing;
    req.body.enableTwoFactor = enableTwoFactor;

    // Validate registration data
    const validation = validateRegistrationData(req.body);
    if (!validation.isValid) {
      console.log("VALIDATION ERRORS:", validation.errors);
      throw new ValidationError("Invalid registration data", {
        errors: validation.errors,
      });
    }

    // Check for existing user
    const existingUser = await Users.findOne({
      $or: [{ email: email.toLowerCase() }, { mobileNumber: mobileNumber }],
    }).session(session);

    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? "email" : "mobile number";
      throw new UserAlreadyExistsError(field);
    }

    // Hash password and security answer
    const hashedPassword = await hashPassword(password);
    const hashedSecurityAnswer = await hashPassword(
      securityAnswer.toLowerCase(),
    );

    // Generate account number
    const generatedAccountNumber = generateAccountNumber();

    // Handle Cloudinary Uploads for KYC Files
    const files =
      (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};
    let profilePictureUrl: string | undefined;
    let governmentIdUrl: string | undefined;
    let proofOfAddressUrl: string | undefined;
    let selfieWithIdUrl: string | undefined;
    let signatureUrl: string | undefined;

    const uploadFile = async (fileArray?: Express.Multer.File[]) => {
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        const res = await uploadToCloudinary(
          file.buffer,
          file.originalname,
          "projects/nordi-remittance/kyc",
        );
        return res.url;
      }
      return undefined;
    };

    profilePictureUrl = await uploadFile(files["profilePicture"]);
    governmentIdUrl = await uploadFile(files["governmentId"]);
    proofOfAddressUrl = await uploadFile(files["proofOfAddress"]);
    selfieWithIdUrl = await uploadFile(files["selfieWithId"]);
    signatureUrl = await uploadFile(files["signature"]);

    // Create user with all KYC data
    const user = new Users({
      // Personal Details
      firstName: sanitizeString(firstName),
      middleName: middleName ? sanitizeString(middleName) : undefined,
      lastName: sanitizeString(lastName),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      nationality,
      countryOfResidence,
      maritalStatus,
      // Identity Verification
      idType,
      idNumber: sanitizeString(idNumber),
      idExpiryDate: new Date(idExpiryDate),
      addressDocType,
      socialSecurityNumber: socialSecurityNumber
        ? sanitizeString(socialSecurityNumber)
        : undefined,
      taxIdentificationNumber: sanitizeString(taxIdentificationNumber),
      profilePicture: profilePictureUrl,
      governmentId: governmentIdUrl,
      proofOfAddress: proofOfAddressUrl,
      selfieWithId: selfieWithIdUrl,
      signature: signatureUrl,
      // Contact Information
      email: email.toLowerCase().trim(),
      mobileNumber: mobileNumber.trim(),
      alternativePhone: alternativePhone?.trim(),
      homeAddress: sanitizeString(homeAddress),
      city: sanitizeString(city),
      stateProvince: sanitizeString(stateProvince),
      zipCode: sanitizeString(zipCode),
      country,
      // Banking Preferences
      accountType,
      currency: currency || "USD",
      sourceOfIncome,
      monthlyIncomeRange,
      initialDeposit: Number(initialDeposit),
      employmentStatus,
      employerName: employerName ? sanitizeString(employerName) : undefined,
      occupation: sanitizeString(occupation),
      // Bank Account Details
      accountName: sanitizeString(accountName),
      externalAccountNumber: sanitizeString(externalAccountNumber),
      bankName,
      bankAddress: sanitizeString(bankAddress),
      ibanNumber: ibanNumber?.trim(),
      routingNumber: routingNumber?.trim(),
      swiftBic: swiftBic.trim(),
      // Security Setup
      password: hashedPassword,
      securityQuestion,
      securityAnswer: hashedSecurityAnswer,
      enableTwoFactor: enableTwoFactor || false,
      twoFactorMethod: enableTwoFactor ? twoFactorMethod : undefined,
      // Terms and Verification
      agreeToTerms,
      agreeToPrivacy,
      agreeToDataSharing,
      referralCode: referralCode?.trim(),
      inviteCode: inviteCode?.trim(),
      // System fields
      kycStatus: "pending",
      isActive: false,
      createdAt: new Date(),
    });

    await user.save({ session });

    // Create default wallet with initial deposit
    const wallet = new Wallets({
      user: user._id,
      walletNumber: generateWalletNumber(),
      currency: currency || "USD",
      balance: Number(initialDeposit) || 0,
      availableBalance: Number(initialDeposit) || 0,
      ledgerBalance: Number(initialDeposit) || 0,
      status: "active",
      type: "primary",
      createdAt: new Date(),
    });

    await wallet.save({ session });

    // Generate email verification token
    const verificationToken = generateSecureToken(32);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await ConfirmationToken.create(
      [
        {
          userId: user._id,
          token: verificationToken,
          type: "email_verification",
          expiresAt: verificationExpiry,
          used: false,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    // Send verification email (non-blocking)
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;
    sendTemplatedMail(
      user.email as string,
      emailGenerator.accountCreatedEmail({
        firstName: user.firstName as string,
        lastName: user.lastName as string,
        email: user.email as string,
        accountNumber: generatedAccountNumber,
        currency: currency || "USD",
        initialBalance: String(Number(initialDeposit) || 0),
        verificationUrl,
        userId: user._id.toString(),
      }),
    ).catch((err) => console.error("Failed to send verification email:", err));

    sendCreated(
      res,
      {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          accountNumber: generatedAccountNumber,
          accountType: user.accountType,
          kycStatus: user.kycStatus,
        },
        wallet: {
          id: wallet._id,
          walletNumber: wallet.walletNumber,
          balances: wallet.balances,
        },
        message:
          "Registration successful. Please check your email to verify your account.",
      },
      "Registration successful",
    );
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
}

// ============================================================================
// LOGIN
// ============================================================================

/**
 * Login user
 * POST /auth/login
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, deviceInfo, rememberMe } = req.body;
    const clientIp = (req as any).clientIp || req.ip || "unknown";

    // Validate login data
    const validation = validateLoginData(req.body);
    if (!validation.isValid) {
      throw new ValidationError("Invalid login credentials", {
        errors: validation.errors,
      });
    }

    // Check Redis for locked account (rate limiting)
    const isLocked = await isLoginLocked(email);
    if (isLocked) {
      throw new AccountLockedError(
        "Account is temporarily locked due to too many failed attempts. Try again later.",
      );
    }

    // Find user
    const user = await Users.findOne({ email: email.toLowerCase() }).select(
      "+password +loginAttempts +lockUntil +twoFactorSecret",
    );

    if (!user) {
      // Track failed attempt in Redis
      await trackLoginAttempt(email, false);

      // Log failed attempt
      await LoginAttempt.create({
        email: email.toLowerCase(),
        ipAddress: clientIp,
        userAgent: req.headers["user-agent"],
        success: false,
        reason: "user_not_found",
        createdAt: new Date(),
      });
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check if account is locked
    if (user.lockUntil && (user.lockUntil as Date) > new Date()) {
      const remainingTime = Math.ceil(
        ((user.lockUntil as Date).getTime() - Date.now()) / 60000,
      );
      throw new AccountLockedError(
        `Account is locked. Try again in ${remainingTime} minutes.`,
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      password,
      user.password as string,
    );

    if (!isPasswordValid) {
      // Track failed attempt in Redis
      const { attempts, locked } = await trackLoginAttempt(email, false);

      // Increment login attempts
      const dbAttempts = ((user.loginAttempts as number) || 0) + 1;
      const updates: any = { loginAttempts: dbAttempts };

      if (dbAttempts >= constants.MAX_LOGIN_ATTEMPTS || locked) {
        updates.lockUntil = new Date(
          Date.now() + constants.LOCKOUT_DURATION_MINUTES * 60 * 1000,
        );
        updates.status = "locked";

        // Emit WebSocket event for account locked
        emitToUser(user._id.toString(), WS_EVENTS.ACCOUNT_LOCKED, {
          type: "account_locked",
          data: { lockedUntil: updates.lockUntil },
          timestamp: new Date().toISOString(),
        });
      }

      await Users.updateOne({ _id: user._id }, updates);

      // Log failed attempt
      await LoginAttempt.create({
        userId: user._id,
        email: email.toLowerCase(),
        ipAddress: clientIp,
        userAgent: req.headers["user-agent"],
        success: false,
        reason: "invalid_password",
        createdAt: new Date(),
      });

      const remainingAttempts = constants.MAX_LOGIN_ATTEMPTS - dbAttempts;
      if (remainingAttempts > 0) {
        throw new UnauthorizedError(
          `Invalid email or password. ${remainingAttempts} attempts remaining.`,
        );
      } else {
        throw new AccountLockedError(
          "Too many failed attempts. Account has been locked for 30 minutes.",
        );
      }
    }

    // Check account status
    if (user.status === "suspended") {
      throw new UnauthorizedError(
        "Your account has been suspended. Please contact support.",
      );
    }

    if (user.status === "deactivated") {
      throw new UnauthorizedError(
        "Your account has been deactivated. Please contact support to reactivate.",
      );
    }

    // Clear failed login attempts on successful password verification
    await trackLoginAttempt(email, true);

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate 2FA session token and store in Redis
      const twoFactorToken = generateSecureToken(32);
      const twoFactorCode = generateOTP(6);

      // Store 2FA code in Redis
      await store2FACode(user._id.toString(), twoFactorCode);

      await ConfirmationToken.create({
        userId: user._id,
        token: twoFactorToken,
        type: "two_factor",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        used: false,
      });

      // Emit WebSocket event for 2FA required
      emitToUser(user._id.toString(), WS_EVENTS.TWO_FACTOR_REQUIRED, {
        type: "2fa_required",
        data: { method: user.twoFactorMethod || "authenticator" },
        timestamp: new Date().toISOString(),
      });

      sendSuccess(
        res,
        {
          requires2FA: true,
          twoFactorToken,
          method: user.twoFactorMethod || "authenticator",
        },
        "Two-factor authentication required",
      );
      return;
    }

    // Reset login attempts and update last login
    await Users.updateOne(
      { _id: user._id },
      {
        loginAttempts: 0,
        lockUntil: null,
        lastLogin: new Date(),
        lastLoginIp: clientIp,
        $push: {
          loginHistory: {
            $each: [
              {
                ip: clientIp,
                userAgent: req.headers["user-agent"],
                timestamp: new Date(),
                success: true,
              },
            ],
            $slice: -10, // Keep last 10 entries
          },
        },
      },
    );

    // Log successful attempt
    await LoginAttempt.create({
      userId: user._id,
      email: email.toLowerCase(),
      ipAddress: clientIp,
      userAgent: req.headers["user-agent"],
      success: true,
      createdAt: new Date(),
    });

    // Generate auth tokens
    const sessionId2 = generateSecureToken(16);
    const tokens = generateAuthTokens(
      user._id.toString(),
      user.email as string,
      user.role as string,
      sessionId2,
    );

    // Create session in Redis
    await createSession(user._id.toString(), sessionId2, {
      ip: clientIp,
      userAgent: req.headers["user-agent"],
      deviceInfo: deviceInfo || {},
      rememberMe: rememberMe || false,
    });

    // Set cookies
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

    // Get user's primary wallet
    const wallet = await Wallets.findOne({
      user: user._id,
      isPrimary: true,
    }).select("walletNumber balances");

    // Cache user profile and wallets in Redis
    const userProfile = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accountNumber: user.accountNumber,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    await Promise.all([
      cacheUserProfile(user._id.toString(), userProfile),
      wallet
        ? cacheUserWallets(user._id.toString(), [wallet])
        : Promise.resolve(),
    ]);

    // Emit WebSocket event for successful login
    emitToUser(user._id.toString(), WS_EVENTS.LOGIN_SUCCESS, {
      type: "login_success",
      data: {
        sessionId: sessionId2,
        ip: clientIp,
        device: deviceInfo || req.headers["user-agent"],
      },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      {
        user: userProfile,
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
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// VERIFY TWO-FACTOR AUTHENTICATION
// ============================================================================

/**
 * Verify 2FA code
 * POST /auth/verify-2fa
 */
export async function verify2FA(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { twoFactorToken, code } = req.body;
    const clientIp = (req as any).clientIp || req.ip || "unknown";

    if (!twoFactorToken || !code) {
      throw new ValidationError("Two-factor token and code are required");
    }

    // Find the 2FA session
    const tokenDoc = await ConfirmationToken.findOne({
      token: twoFactorToken,
      type: "two_factor",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw new UnauthorizedError("Invalid or expired two-factor session");
    }

    const user = await Users.findById(tokenDoc.userId).select(
      "+twoFactorSecret",
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify the code (simplified - in production use speakeasy or similar)
    // For now, we'll accept a backup code or TOTP
    const backupCodes = user.backupCodes as string[] | undefined;
    const isValidCode = backupCodes?.includes(code) || code === "123456"; // TODO: Implement proper TOTP verification

    if (!isValidCode) {
      throw new UnauthorizedError("Invalid verification code");
    }

    // Mark token as used
    await ConfirmationToken.updateOne(
      { _id: tokenDoc._id as string },
      { used: true },
    );

    // If backup code was used, remove it
    if (backupCodes?.includes(code)) {
      await Users.updateOne(
        { _id: user._id as string },
        { $pull: { backupCodes: code } },
      );
    }

    // Update last login
    await Users.updateOne(
      { _id: user._id },
      {
        loginAttempts: 0,
        lockUntil: null,
        lastLogin: new Date(),
        lastLoginIp: clientIp,
      },
    );

    // Generate auth tokens
    const sessionId = generateSecureToken(16);
    const tokens = generateAuthTokens(
      user._id.toString(),
      user.email as string,
      user.role as string,
      sessionId,
    );

    // Set cookies
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

    // Get user's primary wallet
    const wallet = await Wallets.findOne({
      user: user._id,
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
          role: user.role,
          status: user.status,
          kycStatus: user.kycStatus,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
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
      "Two-factor authentication successful",
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// LOGOUT
// ============================================================================

/**
 * Logout user
 * POST /auth/logout
 */
export async function logout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // If user is authenticated, invalidate their session
    if (req.user) {
      // Delete session from Redis
      await deleteSession(req.user.userId);

      // Invalidate user cache
      await invalidateUserCache(req.user.userId);

      await ConfirmationToken.deleteMany({
        userId: req.user.userId,
        type: "refresh_token",
      });

      // Log security event
      await SecurityEvent.create({
        userId: req.user.userId,
        type: "logout",
        ipAddress: req.clientIp || req.ip,
        userAgent: req.headers["user-agent"],
        createdAt: new Date(),
      });

      // Emit WebSocket event for logout
      emitToUser(req.user.userId, WS_EVENTS.LOGOUT, {
        type: "logout",
        timestamp: new Date().toISOString(),
      });
    }

    sendSuccess(res, null, "Logged out successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// REFRESH TOKEN
// ============================================================================

/**
 * Refresh access token
 * POST /auth/refresh
 */
export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const refreshTokenFromCookie = req.cookies?.refreshToken;
    const refreshTokenFromBody = req.body?.refreshToken;
    const refreshTokenValue = refreshTokenFromCookie || refreshTokenFromBody;

    if (!refreshTokenValue) {
      throw new UnauthorizedError("Refresh token not provided");
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshTokenValue);

    // Check if user still exists and is active
    const user = await Users.findById(payload.userId).select(
      "email role status",
    );

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (user.status !== "active") {
      throw new UnauthorizedError("Account is not active");
    }

    // Generate new tokens
    const sessionId = generateSecureToken(16);
    const tokens = generateAuthTokens(
      user._id.toString(),
      user.email as string,
      user.role as string,
      sessionId,
    );

    // Set cookies
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
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: constants.ACCESS_TOKEN_EXPIRY_SECONDS,
        },
      },
      "Token refreshed successfully",
    );
  } catch (error) {
    // Clear cookies on refresh failure
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    next(error);
  }
}

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

/**
 * Verify email
 * POST /auth/verify-email
 */
export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError("Verification token is required");
    }

    // Find token
    const tokenDoc = await ConfirmationToken.findOne({
      token,
      type: "email_verification",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw new UnauthorizedError("Invalid or expired verification token");
    }

    // Update user
    const user = await Users.findByIdAndUpdate(
      tokenDoc.userId,
      { emailVerified: true },
      { new: true },
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Mark token as used
    await ConfirmationToken.updateOne({ _id: tokenDoc._id }, { used: true });

    // Invalidate user cache after email verification
    await invalidateUserCache(tokenDoc.userId.toString());

    // Emit WebSocket event for email verified
    emitToUser(tokenDoc.userId.toString(), WS_EVENTS.EMAIL_VERIFIED, {
      type: "email_verified",
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      {
        emailVerified: true,
      },
      "Email verified successfully",
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Resend verification email
 * POST /auth/resend-verification
 */
export async function resendVerificationEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      throw new ValidationError("Valid email is required");
    }

    const user = await Users.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists
      sendSuccess(
        res,
        null,
        "If an account exists with this email, a verification link has been sent.",
      );
      return;
    }

    if (user.emailVerified) {
      throw new ValidationError("Email is already verified");
    }

    // Delete old tokens
    await ConfirmationToken.deleteMany({
      userId: user._id,
      type: "email_verification",
    });

    // Generate new token
    const verificationToken = generateSecureToken(32);
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await ConfirmationToken.create({
      userId: user._id,
      token: verificationToken,
      type: "email_verification",
      expiresAt: verificationExpiry,
      used: false,
    });

    // Send email
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${verificationToken}`;
    await sendTemplatedMail(
      user.email as string,
      emailGenerator.emailVerificationEmail({
        firstName: user.firstName as string,
        email: user.email as string,
        verificationUrl,
        expiresIn: "24 hours",
        userId: user._id.toString(),
      }),
    );

    sendSuccess(res, null, "Verification email sent successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

/**
 * Request password reset
 * POST /auth/forgot-password
 */
export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      throw new ValidationError("Valid email is required");
    }

    const user = await Users.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      sendSuccess(
        res,
        null,
        "If an account exists with this email, a password reset link has been sent.",
      );
      return;
    }

    // Delete old tokens
    await ConfirmationToken.deleteMany({
      userId: user._id,
      type: "password_reset",
    });

    // Generate reset token
    const resetToken = generateSecureToken(32);
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await ConfirmationToken.create({
      userId: user._id,
      token: resetToken,
      type: "password_reset",
      expiresAt: resetExpiry,
      used: false,
    });

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/reset-password?token=${resetToken}`;
    await sendTemplatedMail(
      user.email as string,
      emailGenerator.passwordResetEmail({
        firstName: user.firstName as string,
        resetUrl,
        userId: user._id.toString(),
      }),
    );

    // Log security event
    await SecurityEvent.create({
      userId: user._id,
      type: "password_reset_requested",
      ipAddress: (req as any).clientIp || req.ip,
      userAgent: req.headers["user-agent"],
      createdAt: new Date(),
    });

    sendSuccess(
      res,
      null,
      "If an account exists with this email, a password reset link has been sent.",
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Reset password
 * POST /auth/reset-password
 */
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
      throw new ValidationError("Reset token is required");
    }

    if (!password || password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters");
    }

    if (password !== confirmPassword) {
      throw new ValidationError("Passwords do not match");
    }

    // Find token
    const tokenDoc = await ConfirmationToken.findOne({
      token,
      type: "password_reset",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw new UnauthorizedError("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user
    const user = await Users.findByIdAndUpdate(
      tokenDoc.userId,
      {
        password: hashedPassword,
        loginAttempts: 0,
        lockUntil: null,
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Mark token as used
    await ConfirmationToken.updateOne({ _id: tokenDoc._id }, { used: true });

    // Invalidate all refresh tokens
    await ConfirmationToken.deleteMany({
      userId: user._id,
      type: "refresh_token",
    });

    // Log security event
    await SecurityEvent.create({
      userId: user._id,
      type: "password_reset_completed",
      ipAddress: (req as any).clientIp || req.ip,
      userAgent: req.headers["user-agent"],
      createdAt: new Date(),
    });

    // Send confirmation email
    await sendTemplatedMail(
      user.email as string,
      emailGenerator.passwordChangedEmail({
        firstName: user.firstName as string,
        email: user.email as string,
        changedAt: new Date().toLocaleString(),
        ipAddress: (req as any).clientIp || req.ip || "Unknown",
        userAgent: req.headers["user-agent"] || "Unknown",
        userId: user._id.toString(),
      }),
    );

    // Delete all user sessions from Redis (force re-login)
    await deleteAllUserSessions(user._id.toString());

    // Emit WebSocket event for password reset
    emitToUser(user._id.toString(), WS_EVENTS.PASSWORD_RESET, {
      type: "password_reset",
      data: { message: "Your password has been reset. Please login again." },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(
      res,
      null,
      "Password reset successfully. Please login with your new password.",
    );
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// CHANGE PASSWORD
// ============================================================================

/**
 * Change password (authenticated)
 * POST /auth/change-password
 */
export async function changePassword(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError(
        "Current password and new password are required",
      );
    }

    if (newPassword.length < 8) {
      throw new ValidationError("New password must be at least 8 characters");
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError("New passwords do not match");
    }

    if (currentPassword === newPassword) {
      throw new ValidationError(
        "New password must be different from current password",
      );
    }

    const user = await Users.findById(req.user.userId).select("+password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password as string,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await Users.updateOne({ _id: user._id }, { password: hashedPassword });

    // Invalidate all refresh tokens
    await ConfirmationToken.deleteMany({
      userId: user._id,
      type: "refresh_token",
    });

    // Log security event
    await SecurityEvent.create({
      userId: user._id,
      type: "password_changed",
      ipAddress: req.clientIp || req.ip,
      userAgent: req.headers["user-agent"],
      createdAt: new Date(),
    });

    // Send confirmation email
    await sendTemplatedMail(
      user.email as string,
      emailGenerator.passwordChangedEmail({
        firstName: user.firstName as string,
        email: user.email as string,
        changedAt: new Date().toLocaleString(),
        ipAddress: req.clientIp || req.ip || "Unknown",
        userAgent: req.headers["user-agent"] || "Unknown",
        userId: user._id.toString(),
      }),
    );

    // Delete all user sessions from Redis (force re-login on other devices)
    await deleteAllUserSessions(user._id.toString());

    // Emit WebSocket event for password changed
    emitToUser(user._id.toString(), WS_EVENTS.PASSWORD_CHANGED, {
      type: "password_changed",
      data: {
        message:
          "Your password has been changed. Please login again on other devices.",
      },
      timestamp: new Date().toISOString(),
    });

    sendSuccess(res, null, "Password changed successfully");
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET CURRENT USER
// ============================================================================

/**
 * Get current authenticated user
 * GET /auth/me
 */
export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const user = await Users.findById(req.user.userId).select(
      "-password -twoFactorSecret -backupCodes",
    );

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const wallet = await Wallets.findOne({
      user: user._id,
      isPrimary: true,
    }).select("walletNumber balances");

    sendSuccess(res, {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountNumber: user.accountNumber,
        mobileNumber: user.mobileNumber,
        country: user.country,
        currency: user.currency,
        kycStatus: user.kycStatus,
        isActive: user.isActive,
        enableTwoFactor: user.enableTwoFactor,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      wallet: wallet
        ? {
            id: wallet._id,
            walletNumber: wallet.walletNumber,
            balances: wallet.balances,
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  register,
  registerFullKyc,
  login,
  verify2FA,
  logout,
  refreshToken,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
};

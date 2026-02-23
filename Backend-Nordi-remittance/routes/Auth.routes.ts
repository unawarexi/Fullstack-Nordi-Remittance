// ============================================================================
// AUTH ROUTES
// ============================================================================

import { Router } from "express";
import AuthController from "../controllers/Auth.controller.js";
import { authenticate, optionalAuth } from "../middleware/Auth.middleware.js";
import {
  authRateLimit,
  sanitizeInput,
} from "../middleware/Security.middleware.js";
import { requestLoggingMiddleware } from "../middleware/Core.middleware.js";
import { upload } from "../services/Cloudinary.service.js";

const router = Router();

// Apply common middleware
router.use(requestLoggingMiddleware);
router.use(sanitizeInput);

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (basic registration)
 * @access  Public
 */
router.post("/register", authRateLimit, AuthController.register);

/**
 * @route   POST /api/auth/register/full
 * @desc    Register a new user with full KYC data
 * @access  Public
 */
router.post(
  "/register/full",
  authRateLimit,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "governmentId", maxCount: 1 },
    { name: "proofOfAddress", maxCount: 1 },
    { name: "selfieWithId", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  AuthController.registerFullKyc,
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", authRateLimit, AuthController.login);

/**
 * @route   POST /api/auth/verify-2fa
 * @desc    Verify two-factor authentication code
 * @access  Public (with 2FA token)
 */
router.post("/verify-2fa", authRateLimit, AuthController.verify2FA);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (with refresh token)
 */
router.post("/refresh", AuthController.refreshToken);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post("/verify-email", AuthController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post(
  "/resend-verification",
  authRateLimit,
  AuthController.resendVerificationEmail,
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post("/forgot-password", authRateLimit, AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/reset-password", authRateLimit, AuthController.resetPassword);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", optionalAuth, AuthController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/me", authenticate, AuthController.getCurrentUser);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
router.post("/change-password", authenticate, AuthController.changePassword);

// ============================================================================
// EXPORT
// ============================================================================

export default router;

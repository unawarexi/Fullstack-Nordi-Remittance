// ============================================================================
// AUTH ROUTES
// ============================================================================

import { Router } from 'express';
import AuthController from './auth.controller.js';
import * as ClerkAuthController from './clerk-auth.controller.js';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware.js';
import { verifyClerkToken } from '../../middleware/clerk.middleware.js';
import {
  authRateLimit,
  otpVerifyRateLimit,
  otpResendRateLimit,
  sanitizeInput,
} from '../../middleware/security.middleware.js';
import { requestLoggingMiddleware } from '../../middleware/core.middleware.js';
import { upload } from '../../services/cloudinary.service.js';

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
router.post('/register', authRateLimit, AuthController.register);

/**
 * @route   POST /api/auth/register/full
 * @desc    Register a new user with full KYC data
 * @access  Public
 */
router.post(
  '/register/full',
  authRateLimit,
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'selfieWithId', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
  ]),
  AuthController.registerFullKyc,
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimit, AuthController.login);

/**
 * @route   POST /api/auth/verify-2fa
 * @desc    Verify two-factor authentication code
 * @access  Public (with 2FA token)
 */
router.post('/verify-2fa', otpVerifyRateLimit, AuthController.verify2FA);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (with refresh token)
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', AuthController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post('/resend-verification', authRateLimit, AuthController.resendVerificationEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', authRateLimit, AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', authRateLimit, AuthController.resetPassword);

// ============================================================================
// CLERK AUTH ROUTES — Clerk sign-in sync, OTP step-up, webhook
// ============================================================================

/**
 * @route   POST /api/auth/clerk-sync
 * @desc    Sync Clerk user → local DB, check if OTP is required
 * @access  Public (with Clerk session token)
 */
router.post('/clerk-sync', authRateLimit, verifyClerkToken, ClerkAuthController.clerkSync);

/**
 * @route   POST /api/auth/clerk-sync/admin
 * @desc    Admin-specific Clerk sync
 * @access  Public (with Clerk session token)
 */
router.post(
  '/clerk-sync/admin',
  authRateLimit,
  verifyClerkToken,
  ClerkAuthController.clerkSyncAdmin,
);

/**
 * @route   POST /api/auth/verify-clerk-otp
 * @desc    Verify OTP code for Clerk-authenticated users
 * @access  Public
 */
router.post('/verify-clerk-otp', otpVerifyRateLimit, ClerkAuthController.verifyClerkOtp);

/**
 * @route   POST /api/auth/resend-clerk-otp
 * @desc    Resend OTP code for Clerk-authenticated users
 * @access  Public
 */
router.post('/resend-clerk-otp', otpResendRateLimit, ClerkAuthController.resendClerkOtp);

/**
 * @route   POST /api/auth/clerk-webhook
 * @desc    Clerk webhook handler (user lifecycle events)
 * @access  Clerk Webhook (verified by Svix signature)
 */
router.post('/clerk-webhook', ClerkAuthController.clerkWebhook);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', optionalAuth, AuthController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get('/me', authenticate, AuthController.getCurrentUser);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
router.post('/change-password', authenticate, AuthController.changePassword);

// ============================================================================
// EXPORT
// ============================================================================

export default router;

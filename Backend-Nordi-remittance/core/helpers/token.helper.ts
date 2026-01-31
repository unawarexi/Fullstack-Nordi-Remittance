// ============================================================================
// JWT TOKEN MANAGEMENT
// ============================================================================

import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env, constants } from '../../config/env.config.js';
import type { TokenPayload, RefreshTokenPayload, AuthTokens } from '../../types/index.js';
import { TokenExpiredError, TokenInvalidError } from '../errors/AppError.js';

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Generate access token for authenticated user
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
    issuer: env.JWT_ISSUER,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Generate refresh token for session management
 */
export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
    issuer: env.JWT_ISSUER,
    algorithm: 'HS256',
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Generate both access and refresh tokens
 */
export function generateAuthTokens(
  userId: string,
  email: string,
  role: string,
  sessionId: string,
  deviceId?: string,
  tokenVersion: number = 1
): AuthTokens {
  const accessToken = generateAccessToken({
    userId,
    email,
    role: role as any,
    sessionId,
    deviceId,
  });

  const refreshToken = generateRefreshToken({
    userId,
    sessionId,
    tokenVersion,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: constants.ACCESS_TOKEN_EXPIRY_SECONDS,
  };
}

/**
 * Generate a verification token (for email verification, password reset, etc.)
 */
export function generateVerificationToken(
  userId: string,
  type: 'email_verification' | 'password_reset' | 'two_factor',
  expiresIn: string = '24h'
): string {
  const options: SignOptions = {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    issuer: env.JWT_ISSUER,
    algorithm: 'HS256',
  };

  return jwt.sign(
    { userId, type, timestamp: Date.now() },
    env.JWT_SECRET,
    options
  );
}

// ============================================================================
// TOKEN VERIFICATION
// ============================================================================

/**
 * Verify and decode access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      algorithms: ['HS256'],
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TokenInvalidError('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify and decode refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      algorithms: ['HS256'],
    }) as RefreshTokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TokenInvalidError('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Verify verification token (email, password reset, etc.)
 */
export function verifyVerificationToken(
  token: string,
  expectedType: 'email_verification' | 'password_reset' | 'two_factor'
): { userId: string; type: string } {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      algorithms: ['HS256'],
    }) as { userId: string; type: string };

    if (decoded.type !== expectedType) {
      throw new TokenInvalidError(`Invalid token type. Expected ${expectedType}`);
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError('Verification token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new TokenInvalidError('Invalid verification token');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for debugging/logging)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token);
    return typeof decoded === 'object' ? decoded : null;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired without throwing
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Get remaining time until token expires (in seconds)
 */
export function getTokenRemainingTime(token: string): number {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded?.exp) return 0;
    const remaining = decoded.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

// ============================================================================
// COOKIE HELPERS
// ============================================================================

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
  domain?: string;
}

/**
 * Get cookie options for access token
 */
export function getAccessTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: constants.ACCESS_TOKEN_EXPIRY_SECONDS * 1000,
    path: '/',
  };
}

/**
 * Get cookie options for refresh token
 */
export function getRefreshTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: constants.REFRESH_TOKEN_EXPIRY_SECONDS * 1000,
    path: '/api/v1/auth/refresh', // Only sent to refresh endpoint
  };
}

/**
 * Get cookie options for clearing cookies
 */
export function getClearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 0,
    path: '/',
  };
}

export default {
  generateAccessToken,
  generateRefreshToken,
  generateAuthTokens,
  generateVerificationToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyVerificationToken,
  decodeToken,
  isTokenExpired,
  getTokenRemainingTime,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  getClearCookieOptions,
};

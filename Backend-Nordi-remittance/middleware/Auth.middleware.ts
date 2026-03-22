// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

import { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, UserRole } from '../types/index.js';
import { verifyAccessToken } from '../core/helpers/token.helper.js';
import Users from '../models/UserModel.js';
import { AdminUsers } from '../models/AdminModel.js';
import { 
  UnauthorizedError, 
  ForbiddenError, 
  AccountLockedError, 
  AccountSuspendedError,
  TokenExpiredError,
  TokenInvalidError 
} from '../core/errors/AppError.js';
import { constants } from '../config/env.config.js';

// ============================================================================
// TOKEN EXTRACTION
// ============================================================================

/**
 * Extract JWT token from request
 * Priority: Authorization header > Cookie
 */
function extractToken(req: AuthenticatedRequest): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  if (req.cookies && req.cookies[constants.ACCESS_TOKEN_COOKIE]) {
    return req.cookies[constants.ACCESS_TOKEN_COOKIE];
  }

  return null;
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Authenticate user - Required for protected routes
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Authentication token is required');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId,
      deviceId: decoded.deviceId,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError || error instanceof TokenInvalidError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired authentication token'));
    }
  }
}

/**
 * Optional authentication - Attaches user if token is valid, continues otherwise
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        sessionId: decoded.sessionId,
        deviceId: decoded.deviceId,
      };
    }

    next();
  } catch {
    // Continue without authentication
    next();
  }
}

// ============================================================================
// AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Require specific user roles
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions for this action'));
    }

    next();
  };
}

/**
 * Require admin access
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  const adminRoles: UserRole[] = ['admin', 'super_admin', 'compliance_officer', 'support_agent', 'analyst'] as UserRole[];
  
  if (!adminRoles.includes(req.user.role)) {
    return next(new ForbiddenError('Admin access required'));
  }

  next();
}

/**
 * Require super admin access
 */
export function requireSuperAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== 'super_admin') {
    return next(new ForbiddenError('Super admin access required'));
  }

  next();
}

// ============================================================================
// ACCOUNT STATUS VERIFICATION
// ============================================================================

/**
 * Verify user account is active and not locked
 */
export async function verifyAccountStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Check admin roles — skip user-model lookup for admins
    const adminRoles = ['admin', 'super_admin', 'compliance_officer', 'support_agent', 'analyst'];
    if (adminRoles.includes(req.user.role)) {
      return next();
    }

    const user = await Users.findById(req.user.userId)
      .select('status isActive isLocked lockReason')
      .lean() as any;

    if (!user) {
      return next(new UnauthorizedError('User account not found'));
    }

    if (user.isLocked) {
      return next(new AccountLockedError(user.lockReason || 'Account is locked'));
    }

    // Check account status — status field (defaults to 'active') is the source of truth.
    // isActive may be false for newly registered users before email verification,
    // but users with status='active' should still access their data.
    const accountStatus = user.status || 'active';
    if (accountStatus === 'suspended') {
      return next(new AccountSuspendedError('Account is suspended'));
    }
    if (accountStatus === 'banned') {
      return next(new ForbiddenError('Account has been banned'));
    }
    if (accountStatus === 'inactive') {
      return next(new AccountSuspendedError('Account is inactive'));
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Verify admin account is active
 */
export async function verifyAdminStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const admin = await AdminUsers.findById(req.user.userId).select('isActive isLocked').lean();

    if (!admin) {
      return next(new UnauthorizedError('Admin account not found'));
    }

    if (admin.isLocked) {
      return next(new AccountLockedError('Admin account is locked'));
    }

    if (!admin.isActive) {
      return next(new AccountSuspendedError('Admin account is inactive'));
    }

    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// PERMISSION-BASED AUTHORIZATION
// ============================================================================

/**
 * Check specific admin permissions
 */
export function requirePermission(permission: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      // Super admin has all permissions
      if (req.user.role === 'super_admin') {
        return next();
      }

      const admin = await AdminUsers.findById(req.user.userId)
        .populate('permissions')
        .lean();

      if (!admin || !admin.permissions) {
        return next(new ForbiddenError('Permissions not configured'));
      }

      const permissions = admin.permissions as unknown as Record<string, boolean>;
      
      if (!permissions[permission]) {
        return next(new ForbiddenError(`Permission '${permission}' is required for this action`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check multiple permissions (requires all)
 */
export function requirePermissions(...permissions: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      // Super admin has all permissions
      if (req.user.role === 'super_admin') {
        return next();
      }

      const admin = await AdminUsers.findById(req.user.userId)
        .populate('permissions')
        .lean();

      if (!admin || !admin.permissions) {
        return next(new ForbiddenError('Permissions not configured'));
      }

      const adminPermissions = admin.permissions as unknown as Record<string, boolean>;
      const missingPermissions = permissions.filter(p => !adminPermissions[p]);

      if (missingPermissions.length > 0) {
        return next(new ForbiddenError(`Missing permissions: ${missingPermissions.join(', ')}`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ============================================================================
// RESOURCE OWNERSHIP VERIFICATION
// ============================================================================

/**
 * Verify user owns the requested resource or is admin
 */
export function verifyOwnership(userIdParam: string = 'userId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const resourceUserId = req.params[userIdParam];
    
    // Allow if user owns the resource
    if (req.user.userId === resourceUserId) {
      return next();
    }

    // Allow if user is admin
    const adminRoles: UserRole[] = ['admin', 'super_admin'] as UserRole[];
    if (adminRoles.includes(req.user.role)) {
      return next();
    }

    return next(new ForbiddenError('You do not have access to this resource'));
  };
}

// ============================================================================
// SESSION VALIDATION
// ============================================================================

/**
 * Validate session is still active (for sensitive operations)
 */
export async function validateSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.sessionId) {
      return next(new UnauthorizedError('Valid session required'));
    }

    // TODO: Implement session validation with Redis
    // For now, we rely on JWT expiration
    
    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  authenticate,
  optionalAuth,
  requireRoles,
  requireAdmin,
  requireSuperAdmin,
  verifyAccountStatus,
  verifyAdminStatus,
  requirePermission,
  requirePermissions,
  verifyOwnership,
  validateSession,
};
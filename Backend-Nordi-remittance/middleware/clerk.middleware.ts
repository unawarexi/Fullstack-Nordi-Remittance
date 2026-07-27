// ============================================================================
// CLERK AUTHENTICATION MIDDLEWARE
// ============================================================================

import { Response, NextFunction } from "express";
import { verifyToken } from "@clerk/express";
import type { AuthenticatedRequest } from "../types/index.js";
import { UnauthorizedError } from "../core/errors/AppError.js";
import { env } from "../config/env.config.js";

// ============================================================================
// VERIFY CLERK SESSION TOKEN
// ============================================================================

/**
 * Verify Clerk session token from Authorization header.
 * Attaches the Clerk userId and session Id to req without duplicating DB queries.
 */
export async function verifyClerkToken(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Clerk session token is required");
    }

    const sessionToken = authHeader.substring(7);

    // Verify the session token with Clerk's backend SDK
    const verifiedToken = await verifyToken(sessionToken, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    if (!verifiedToken || !verifiedToken.sub) {
      throw new UnauthorizedError("Invalid Clerk session token");
    }

    // Attach Clerk-specific data for downstream controllers to perform DB reconciliation
    (req as any).clerkUserId = verifiedToken.sub;
    (req as any).clerkSessionId = verifiedToken.sid;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    next(new UnauthorizedError("Clerk token verification failed"));
  }
}

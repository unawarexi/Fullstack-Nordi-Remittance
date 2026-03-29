// ============================================================================
// CLERK AUTHENTICATION MIDDLEWARE
// ============================================================================

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/express";
import type { AuthenticatedRequest } from "../types/index.js";
import Users from "../models/UserModel.js";
import { UnauthorizedError } from "../core/errors/AppError.js";
import { env } from "../config/env.config.js";

// ============================================================================
// VERIFY CLERK SESSION TOKEN
// ============================================================================

/**
 * Verify Clerk session token from Authorization header.
 * Attaches the Clerk userId and resolved local user to req.
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

    const clerkUserId = verifiedToken.sub;

    // Look up local user by clerkUserId
    const user: any = await Users.findOne({ clerkUserId }).lean();

    if (user) {
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role || "user",
        sessionId: verifiedToken.sid || "",
      };
    }

    // Attach Clerk-specific data for downstream handlers
    (req as any).clerkUserId = clerkUserId;
    (req as any).clerkSessionId = verifiedToken.sid;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    next(new UnauthorizedError("Clerk token verification failed"));
  }
}

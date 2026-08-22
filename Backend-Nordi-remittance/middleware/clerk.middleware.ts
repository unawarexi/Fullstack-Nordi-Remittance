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

    if (!sessionToken) {
      throw new UnauthorizedError("Empty session token");
    }

    // Pre-validate: Clerk JWTs must have 3 parts and a `kid` in the header.
    // If the frontend accidentally sends a stale app JWT (HS256, no kid)
    // instead of a Clerk session JWT (RSA, with kid), we catch it here with
    // a clear error message rather than a cryptic JWKS kid-mismatch.
    const parts = sessionToken.split(".");
    if (parts.length !== 3) {
      throw new UnauthorizedError(
        "Malformed session token — expected a JWT with 3 parts. Ensure the frontend is sending a Clerk session token, not an app JWT.",
      );
    }

    try {
      const headerJson = Buffer.from(parts[0], "base64url").toString();
      const header = JSON.parse(headerJson);
      if (!header.kid) {
        throw new UnauthorizedError(
          "Session token header is missing 'kid' — this is likely an app JWT being sent instead of a Clerk session token. Clear stale tokens and retry.",
        );
      }
    } catch (parseErr) {
      if (parseErr instanceof UnauthorizedError) throw parseErr;
      // Malformed base64 header — let Clerk SDK produce the full error below
    }

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
    console.error("Clerk token verification error:", error);
    next(new UnauthorizedError("Clerk token verification failed"));
  }
}

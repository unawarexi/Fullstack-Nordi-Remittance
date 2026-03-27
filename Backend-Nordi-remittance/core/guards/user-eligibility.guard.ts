// ============================================================================
// USER ELIGIBILITY GUARD
// Reusable guard that validates a user is eligible for financial operations.
// Checks KYC status, account lock state, and account status.
// ============================================================================

import Users from "../../models/UserModel.js";
import {
  KycNotVerifiedError,
  AccountLockedError,
  AccountSuspendedError,
  ForbiddenError,
  UserNotFoundError,
} from "../errors/AppError.js";

export type EligibilityBlockType =
  | "KYC_PENDING"
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_BANNED"
  | "ACCOUNT_INACTIVE";

/**
 * Validates that a user is eligible for financial operations (transactions,
 * loans, investments, cards, wallet credits/debits).
 *
 * Throws the appropriate AppError with user details in `details` if blocked.
 * The `details` object always includes `userId`, `blockType`, and `userName`
 * so the frontend can show an actionable modal to the admin.
 *
 * @param userId - The MongoDB _id of the target user to check
 * @param operation - Optional label for the operation (for error messages)
 */
export async function validateUserEligibility(
  userId: string,
  operation: string = "this operation",
): Promise<void> {
  const user = await Users.findById(userId)
    .select("status isActive isLocked lockReason kycStatus firstName lastName email")
    .lean<{
      _id: unknown;
      status?: string;
      isActive?: boolean;
      isLocked?: boolean;
      lockReason?: string;
      kycStatus?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    }>();

  if (!user) {
    throw new UserNotFoundError("Target user not found");
  }

  const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "Unknown";
  const baseDetails = {
    userId: String(user._id),
    userName,
    email: user.email,
  };

  // 1. Check account lock
  if (user.isLocked) {
    throw new AccountLockedError(
      `Cannot perform ${operation}: ${userName}'s account is locked`,
      {
        ...baseDetails,
        blockType: "ACCOUNT_LOCKED" as EligibilityBlockType,
        reason: user.lockReason || "Account is locked by admin",
      },
    );
  }

  // 2. Check account status
  const status = user.status || "active";
  if (status === "suspended") {
    throw new AccountSuspendedError(
      `Cannot perform ${operation}: ${userName}'s account is suspended`,
      {
        ...baseDetails,
        blockType: "ACCOUNT_SUSPENDED" as EligibilityBlockType,
      },
    );
  }
  if (status === "banned") {
    throw new ForbiddenError(
      `Cannot perform ${operation}: ${userName}'s account is banned`,
      {
        ...baseDetails,
        blockType: "ACCOUNT_BANNED" as EligibilityBlockType,
      },
    );
  }
  if (status === "inactive") {
    throw new AccountSuspendedError(
      `Cannot perform ${operation}: ${userName}'s account is inactive`,
      {
        ...baseDetails,
        blockType: "ACCOUNT_INACTIVE" as EligibilityBlockType,
      },
    );
  }

  // 3. Check KYC status
  if (user.kycStatus !== "approved") {
    throw new KycNotVerifiedError(
      `Cannot perform ${operation}: ${userName}'s KYC is ${user.kycStatus || "pending"}`,
      {
        ...baseDetails,
        blockType: "KYC_PENDING" as EligibilityBlockType,
        kycStatus: user.kycStatus || "pending",
      },
    );
  }
}

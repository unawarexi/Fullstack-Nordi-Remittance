// ============================================================================
// CLERK SYNC HELPER - Centralizes post-authentication state & routing logic
// ============================================================================

const ADMIN_ROLES = [
  "super_admin",
  "admin",
  "compliance_officer",
  "support_agent",
  "analyst",
];

/**
 * Handles backend sync response after Clerk authentication completes.
 * Eliminates duplicate OTP checks, user formatting, and role navigation across Login, AdminLogin, and Callbacks.
 */
export function processAuthSyncResponse(
  response: any,
  navigate: (path: string, options?: any) => void,
  setAuthenticated: (user: any) => void,
  defaultEmail?: string,
): void {
  // 1. Handle OTP Step-Up verification
  if (response.requiresOtp) {
    navigate("/auth/verify-otp", {
      replace: true,
      state: {
        otpSessionToken: response.otpSessionToken,
        email: response.email || defaultEmail,
        isAdmin: Boolean(response.isAdmin),
      },
    });
    return;
  }

  // 2. Resolve authenticated user or admin account
  const userData: any = response.user || response.admin;
  if (!userData) return;

  const userRole: string = userData.role || "";
  const isAdmin = ADMIN_ROLES.includes(userRole) || Boolean(response.admin);
  const normalizedRole = isAdmin && !userRole ? "admin" : userRole || (isAdmin ? "admin" : "user");

  // 3. Update global authentication store
  setAuthenticated({
    id: userData.id || userData._id,
    email: userData.email,
    firstName: userData.firstName || (isAdmin ? "Admin" : "User"),
    lastName: userData.lastName || "",
    avatar: userData.avatar || userData.profilePicture,
    role: normalizedRole,
    kycStatus: userData.kycStatus || (isAdmin ? "verified" : "pending"),
    isEmailVerified: userData.emailVerified ?? true,
    isPhoneVerified: userData.phoneVerified ?? false,
  });

  // 4. Navigate to correct dashboard based on role classification
  navigate(isAdmin ? "/admin/dashboard" : "/customer/dashboard", {
    replace: true,
  });
}

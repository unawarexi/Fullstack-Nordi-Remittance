// ============================================================================
// CLERK ADMIN CALLBACK - Syncs backend after Clerk OAuth admin sign-in
// ============================================================================

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { PageLoader } from "@components/ui/Spinner";
import { useClerkSyncAdmin } from "@hooks/queries/useAuth";
import { useAuthStore } from "@store/auth.store";

const ClerkAdminCallback = () => {
  const navigate = useNavigate();
  const { getToken, isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const clerkSyncAdminMutation = useClerkSyncAdmin();
  const { setAuthenticated } = useAuthStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasRun.current) return;
    hasRun.current = true;

    const sync = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No token");

        const response = await clerkSyncAdminMutation.mutateAsync(token);

        if (response.requiresOtp) {
          navigate("/auth/verify-otp", {
            replace: true,
            state: {
              otpSessionToken: response.otpSessionToken,
              email:
                response.email ||
                clerkUser?.primaryEmailAddress?.emailAddress,
              isAdmin: true,
            },
          });
          return;
        }

        if (response.user) {
          setAuthenticated({
            id: response.user.id || (response.user as any)._id,
            email: response.user.email,
            firstName: response.user.firstName || "Admin",
            lastName: response.user.lastName || "",
            role: "admin",
            kycStatus: "verified",
            isEmailVerified: true,
            isPhoneVerified: true,
          });
          navigate("/admin/dashboard", { replace: true });
        }
      } catch {
        navigate("/admin", { replace: true });
      }
    };

    sync();
  }, [isLoaded, isSignedIn]);

  return <PageLoader />;
};

export default ClerkAdminCallback;

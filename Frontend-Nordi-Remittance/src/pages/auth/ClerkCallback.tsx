// ============================================================================
// CLERK CALLBACK - Syncs backend after Clerk OAuth sign-in completes
// ============================================================================

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { PageLoader } from "@components/ui/Spinner";
import { useClerkSync } from "@hooks/queries/useAuth";
import { useAuthStore } from "@store/auth.store";

const ClerkCallback = () => {
  const navigate = useNavigate();
  const { getToken, isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const clerkSyncMutation = useClerkSync();
  const { setAuthenticated } = useAuthStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasRun.current) return;
    hasRun.current = true;

    const sync = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No token");

        const response = await clerkSyncMutation.mutateAsync(token);

        if (response.requiresOtp) {
          navigate("/auth/verify-otp", {
            replace: true,
            state: {
              otpSessionToken: response.otpSessionToken,
              email: response.email || clerkUser?.primaryEmailAddress?.emailAddress,
              isAdmin: false,
            },
          });
          return;
        }

        if (response.user) {
          setAuthenticated({
            id: response.user.id || (response.user as any)._id,
            email: response.user.email,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            avatar: response.user.avatar,
            role: response.user.role,
            kycStatus: response.user.kycStatus || "pending",
            isEmailVerified: response.user.emailVerified || false,
            isPhoneVerified: response.user.phoneVerified || false,
          });

          navigate(
            response.user.role === "admin"
              ? "/admin/dashboard"
              : "/customer/dashboard",
            { replace: true },
          );
        }
      } catch {
        navigate("/auth/login", { replace: true });
      }
    };

    sync();
  }, [isLoaded, isSignedIn]);

  return <PageLoader />;
};

export default ClerkCallback;

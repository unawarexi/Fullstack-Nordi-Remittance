// ============================================================================
// CLERK CALLBACK - Syncs backend after Clerk OAuth sign-in completes
// ============================================================================

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { PageLoader } from "@components/ui/Spinner";
import { useClerkSync } from "@hooks/api-queries/useAuth";
import { useAuthStore } from "@store/auth.store";
import { useToast } from "@store/toast.store";
import { processAuthSyncResponse } from "../../core/auth/clerkSync.helper";

const ClerkCallback = () => {
  const navigate = useNavigate();
  const { getToken, isSignedIn, isLoaded, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const clerkSyncMutation = useClerkSync();
  const { setAuthenticated } = useAuthStore();
  const { error: showToastError } = useToast();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasRun.current) return;
    hasRun.current = true;

    // Clean up stored callback path
    sessionStorage.removeItem("clerk_callback_path");

    const sync = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No session token available");

        const response = await clerkSyncMutation.mutateAsync(token);
        processAuthSyncResponse(response, navigate, setAuthenticated, clerkUser?.primaryEmailAddress?.emailAddress);
      } catch (err: any) {
        if (signOut) {
          await signOut().catch(() => {});
        }
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          "Account not found in our database. Please complete registration before attempting to log in.";
        showToastError(errorMsg);
        navigate(`/auth/login?error=${encodeURIComponent(errorMsg)}`, { replace: true });
      }
    };

    sync();
  }, [isLoaded, isSignedIn]);

  return <PageLoader />;
};

export default ClerkCallback;

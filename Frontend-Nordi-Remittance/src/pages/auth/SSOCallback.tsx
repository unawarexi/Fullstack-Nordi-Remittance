// ============================================================================
// CLERK SSO CALLBACK - Handles OAuth redirect back from providers
// ============================================================================

import { useClerk, AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SSOCallback = () => {
  const navigate = useNavigate();
  
  // Read the callback path stored before the OAuth redirect
  const callbackPath =
    sessionStorage.getItem("clerk_callback_path") || "/auth/clerk-callback";

  // Check for error in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error") || params.get("clerk_error");
    
    if (error) {
      console.error("SSO Callback Error:", error);
      // Determine base path to redirect back to (admin vs user)
      const isAdmin = callbackPath.includes("admin");
      const targetPath = isAdmin ? "/auth/admin/login" : "/auth/login";
      
      // Redirect back with error flag
      navigate(`${targetPath}?error=cancelled`);
    }
  }, [callbackPath, navigate]);

  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl={callbackPath}
      signUpForceRedirectUrl={callbackPath}
    />
  );
};

export default SSOCallback;

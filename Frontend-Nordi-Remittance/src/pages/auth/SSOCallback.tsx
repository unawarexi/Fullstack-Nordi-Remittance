// ============================================================================
// CLERK SSO CALLBACK - Handles OAuth redirect back from providers
// ============================================================================

import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

const SSOCallback = () => {
  // Read the callback path stored before the OAuth redirect
  const callbackPath =
    sessionStorage.getItem("clerk_callback_path") || "/auth/clerk-callback";

  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl={callbackPath}
      signUpForceRedirectUrl={callbackPath}
    />
  );
};

export default SSOCallback;
